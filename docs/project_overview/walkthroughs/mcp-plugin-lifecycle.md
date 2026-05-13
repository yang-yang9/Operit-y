# Walkthrough: MCP 插件从安装到被 AI 调用

> **场景：** 用户在 MCP 市场安装一个插件（比如数据库查询工具），然后在对话中让 AI 使用这个插件的工具。从点击安装到工具执行完毕，经过了哪些代码。
>
> **预计时间：** 25-35 分钟。

---

## 全链路总览

```mermaid
flowchart TD
    subgraph install["阶段一：安装"]
        A["Step 1: MCPMarketScreen\n点击安装按钮"] --> B["Step 2: MCPMarketViewModel\ninstallMCPFromIssue()\n解析插件配置"]
        B --> C["Step 3: MCPRepository\ninstallMCPServerWithObject()\n下载 + 解压 + 保存元数据"]
    end

    subgraph start["阶段二：启动"]
        D["Step 4: MCPStarter\nstartAllDeployedPlugins()"] --> E["Step 5: initBridge()\n部署 + 启动桥接服务器"]
        E --> F["Step 6: registerPlugin()\n注册到桥接层"]
        F --> G["Step 7: processPlugin()\nspawnBlocking() 启动进程"]
        G --> H["Step 8: registerToolsForVerifiedPlugins()\n注册工具到 AIToolHandler"]
    end

    subgraph call["阶段三：AI 调用"]
        I["Step 9: AI 输出\ntool_call pluginId:toolName"] --> J["Step 10: MCPToolExecutor.invoke()\n解析名称 + 查找客户端"]
        J --> K["Step 11: MCPBridgeClient\ncallToolSync()\n通过桥接层执行"]
    end

    install --> start --> call
```

---

## 阶段一：安装

### Step 1: MCP 市场 UI

```
📂 ui/features/packages/screens/MCPMarketScreen.kt L48
```

MCP 市场页面展示可安装的插件列表。每个插件来自 GitHub Issues（社区发布的插件元数据）。

用户点击安装按钮 → `onInstallMCP(issue)` 回调。

### Step 2: 解析插件配置

```
📂 ui/features/packages/screens/mcp/viewmodel/MCPMarketViewModel.kt L405
```

```kotlin
fun installMCPFromIssue(issue: GitHubIssue) {
    viewModelScope.launch {
        // L409: 从 GitHub Issue 正文解析插件配置
        val config = parseInstallConfig(issue.body)

        // L428: 如果是 npx/uvx 类型（不需要下载），直接合并配置
        if (!needsPhysicalInstall(config)) {
            MCPLocalServer.mergeConfigFromJson(config)
            return@launch
        }

        // L459-472: 构建插件元数据
        val server = PluginMetadata(
            id = config.id,
            name = config.name,
            description = config.description,
            githubUrl = config.repository,
            ...
        )

        // L475: 调用仓库层执行安装
        mcpRepository.installMCPServerWithObject(server) { progress ->
            _installProgress.value = progress
        }
    }
}
```

### Step 3: 下载 + 解压 + 保存

```
📂 data/mcp/MCPRepository.kt L337, L443
```

```kotlin
// L337
suspend fun installMCPServerWithObject(server: PluginMetadata, ...) {
    installPluginInternal(server)
    savePluginMetadata(server)
}

// L443: 核心安装逻辑
private suspend fun installPluginInternal(server: PluginMetadata): InstallResult {
    // L459: 从 GitHub URL 提取 owner/repo
    val (owner, repo) = extractGitHubInfo(server.githubUrl)

    // L469: 下载仓库 ZIP
    val zipFile = downloadRepositoryZip(owner, repo)  // 内部调 GitHub API 获取默认分支

    // L474-492: 解压到本地目录
    // 目标路径：Downloads/Operit/mcp_plugins/<pluginId>/
    extractZipFile(zipFile, targetDir)

    return InstallResult.Success(targetDir.path)
}

// L856: 持久化插件元数据
private fun savePluginMetadata(server: PluginMetadata) {
    MCPLocalServer.save(server.toLocalServer().copy(
        installedPath = installDir,
        installedTime = System.currentTimeMillis()
    ))
}
```

**安装完成。** 插件代码在本地磁盘，元数据在数据库里。但插件还没启动，AI 还不知道有这个工具。

---

## 阶段二：启动

### Step 4: 启动所有已启用插件

```
📂 data/mcp/plugins/MCPStarter.kt L395
```

App 启动时（或用户手动启用插件后）调用：

```kotlin
suspend fun startAllDeployedPlugins() {
    // L401: 检查终端服务是否可用
    if (!isTerminalServiceAvailable()) return

    // L412: 初始化桥接层（只执行一次）
    initBridge()

    // L425: 分离已启用和已禁用的插件
    val (enabled, disabled) = allPlugins.partition { it.isEnabled }

    // L442-473: 注销已禁用的插件
    disabled.forEach { unregisterFromBridge(it) }

    // L484: 最多 4 个并发启动
    enabled.chunked(4).forEach { batch ->
        batch.map { plugin -> async { processPlugin(plugin) } }.awaitAll()
    }

    // L858: 注册成功启动的插件的工具
    registerToolsForVerifiedPlugins(successfulPluginIds)
}
```

### Step 5: 桥接服务器初始化

```
📂 data/mcp/plugins/MCPStarter.kt L101
```

```kotlin
private suspend fun initBridge() {
    // L104: 只初始化一次
    if (bridgeInitialized) return

    // L134: 部署桥接层代码
    MCPBridge.deployBridge(context)

    // L140: 启动桥接服务器进程
    MCPBridge.startBridge(context)

    bridgeInitialized = true
}
```

**MCP 桥接层是什么？** MCP 协议需要一个中间进程管理多个 MCP Server 的生命周期和通信。桥接层是一个 Node.js 进程，运行在 Android 的终端环境中。

### Step 6: 注册插件到桥接层

```
📂 data/mcp/plugins/MCPStarter.kt L643
```

```kotlin
private suspend fun registerPlugin(plugin: MCPLocalServer) {
    val config = readMcpConfig(plugin.installedPath)  // 读 mcp.config.json

    when (config.type) {
        "local" -> {
            // L732-739: 本地进程型
            bridge.registerMcpService(
                name = plugin.id,
                command = config.command,    // 比如 "node"
                args = config.args,          // 比如 ["index.js"]
                env = config.env
            )
        }
        "remote" -> {
            // L710-719: 远程服务型
            bridge.registerMcpService(
                name = plugin.id,
                type = "remote",
                endpoint = config.endpoint   // 比如 "http://localhost:3000"
            )
        }
    }
}
```

### Step 7: 实际启动插件进程

```
📂 data/mcp/plugins/MCPStarter.kt L570
```

```kotlin
private suspend fun processPlugin(plugin: MCPLocalServer) {
    // L587: 通过桥接层启动插件进程
    val success = client.spawnBlocking()

    if (success) {
        // L605: 缓存插件的工具列表
        cacheToolsFromService(plugin)
    }
}
```

`cacheToolsFromService`（L776）查询插件提供了哪些工具，缓存到本地。

### Step 8: 注册工具到 AIToolHandler

```
📂 data/mcp/MCPRepository.kt L1060
```

```kotlin
fun registerToolsForLoadedPlugins(pluginIds: List<String>) {
    pluginIds.forEach { pluginId ->
        val tools = getCachedTools(pluginId)
        tools.forEach { tool ->
            // L1103: 工具名格式：pluginId:toolName
            val fullName = "$pluginId:${tool.name}"

            // L1070-1123: 注册到 AIToolHandler
            toolHandler.registerTool(
                name = fullName,
                executor = { aiTool -> MCPToolExecutor(mcpManager).invoke(aiTool) }
            )
        }
    }
}
```

**注册完成后，AI 在下一次对话中就能看到这些工具了。** 工具 Schema 会被注入到 System Prompt 中（通过 `SystemPromptConfig` 的 `ACTIVE_PACKAGES_SECTION`）。

---

## 阶段三：AI 调用

### Step 9: AI 输出工具调用

AI 在对话中输出：
```xml
<tool_call name="db-query:execute_sql">
  <query>SELECT * FROM users LIMIT 10</query>
</tool_call>
```

工具名格式是 `pluginId:toolName`，和 W3 文档（工具调用完整过程）一样的 XML 解析流程。

### Step 10: MCPToolExecutor 处理

```
📂 core/tools/mcp/MCPToolExecutor.kt L219
```

```kotlin
fun invoke(tool: AITool): ToolResult {
    // L222-233: 解析名称
    val parts = tool.name.split(":")
    val serverName = parts[0]          // "db-query"
    val actualToolName = parts[1]      // "execute_sql"

    // L236-249: 查找 MCP 客户端
    val mcpClient = mcpManager.getOrCreateClient(serverName)
    if (mcpClient == null) {
        return ToolResult(success = false,
            error = "MCP server '$serverName' not available: ${getLastConnectionFailureReason()}")
    }

    // L251-261: 检查客户端是否活跃
    if (!mcpClient.isActive()) {
        return ToolResult(success = false,
            error = "MCP server '$serverName' is not active. Call use_package first.")
    }

    // L265-383: 参数类型转换
    val convertedParams = tool.parameters.map { param ->
        MCPToolParameter.smartConvert(param, getToolInfo(actualToolName))
    }

    // L278: 通过桥接层调用工具
    val resultData = mcpClient.callToolSync(actualToolName, convertedParams)

    // L290-302: 提取结果
    val content = extractContentFromResult(resultData)
    return ToolResult(success = true, result = StringResultData(content))
}
```

### Step 11: 桥接层执行

`mcpClient.callToolSync` 通过桥接层（Node.js 进程）向 MCP Server 发送 JSON-RPC 请求。MCP Server 执行工具逻辑，返回结果。

**结果提取（L56-161）：** MCP 协议的结果是 `content[]` 数组，支持 `text`、`image`（base64 → 保存到 ImagePool）、`resource` 等类型。

---

## 完整调用链回顾

```
安装阶段:
MCPMarketScreen → MCPMarketViewModel.installMCPFromIssue()  [L405]
  → MCPRepository.installMCPServerWithObject()               [L337]
    → installPluginInternal() → downloadZip + extract         [L443]
    → savePluginMetadata()                                    [L856]

启动阶段:
MCPStarter.startAllDeployedPlugins()                          [L395]
  → initBridge() → deployBridge + startBridge                 [L101]
  → registerPlugin() → bridge.registerMcpService()            [L643]
  → processPlugin() → client.spawnBlocking()                  [L570]
  → registerToolsForVerifiedPlugins()                         [L858]
    → MCPRepository.registerToolsForLoadedPlugins()           [L1060]
      → AIToolHandler.registerTool("pluginId:toolName")

调用阶段:
AI 输出 <tool_call name="pluginId:toolName">
  → ToolExecutionManager.extractToolInvocations()
    → executeInvocations() → MCPToolExecutor.invoke()         [L219]
      → mcpManager.getOrCreateClient(serverName)
      → mcpClient.callToolSync(toolName, params)              [L278]
      → extractContentFromResult() → ToolResult

涉及文件:
1. ui/features/packages/screens/MCPMarketScreen.kt        — 市场 UI
2. ui/features/packages/screens/mcp/viewmodel/MCPMarketViewModel.kt — 安装逻辑
3. data/mcp/MCPRepository.kt                               — 仓库层（下载/注册）
4. data/mcp/plugins/MCPStarter.kt                          — 启动/桥接管理
5. core/tools/mcp/MCPToolExecutor.kt                       — 工具执行
6. core/config/SystemPromptConfig.kt                       — Schema 注入
```

---

## 动手练习

### 练习 1: 观察插件启动

在 `MCPStarter.kt:570`（`processPlugin`）加断点。重启 App，观察每个插件的启动过程和耗时。

### 练习 2: 追踪工具注册

在 `MCPRepository.kt:1103` 加日志，打印注册的工具全名。启动后检查 logcat，看有多少 MCP 工具被注册。

### 练习 3: 模拟工具调用

在 `MCPToolExecutor.kt:278`（`callToolSync`）加断点。让 AI 调用一个 MCP 工具，观察 `serverName`、`actualToolName`、`convertedParams` 的值。

---

## 关联文档

| 文档 | 关系 |
|------|------|
| `tool-execution.md` | 内置工具的执行流程 |
| `chat-message-flow.md` | 工具调用在对话链路中的位置 |
| `memory-system.md` | 下一篇导读 |
