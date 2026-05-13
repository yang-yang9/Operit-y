registerWalkthroughSection('skill-package', 'Skill包生命周期', `<div style="max-width:960px;margin:0 auto;padding:8px 0 48px;">

<h2 class="section-title">Walkthrough: Skill包安装到调用</h2>

<p>场景：用户在包管理页面导入一个 JavaScript 工具包（<code>translator.js</code>），其中包含一个 <code>translate</code> 翻译工具。AI 在对话中输出 <code>&lt;tool_call name="translator:translate"&gt;</code>，QuickJS 引擎执行 JS 脚本并将翻译结果回注给 AI。</p>

<div class="callout">
  <b>前置知识</b><br/>
  建议先读 <code>tool-execution.md</code>，了解工具调用在整个对话链路中的位置。预计阅读时间：30-40 分钟。
</div>

<hr/>

<h2 class="section-title">全链路总览</h2>

<div class="mermaid">
flowchart TD
    A["用户导入文件"] --> B{"识别文件类型"}

    B -->|".js 文件"| C["JS 工具包\n主线流程 ↓"]
    B -->|".toolpkg 文件"| D["ToolPkg 容器\n(zip 格式，支持 UI 模块)"]
    B -->|"SKILL.md"| E["Skill 包\n(纯 Markdown 系统提示)"]

    C --> C1["Step 1: PackageManagerScreen\n导入入口 UI"]
    C1 --> C2["Step 2: PackageManager.loadAvailablePackages()\n扫描 assets + 外部存储"]
    C2 --> C3["Step 3: parseJsPackage()\n解析顶部 HJSON 元数据"]
    C3 --> C4["Step 4: initializeDefaultPackages()\nenabled_by_default 包自动导入"]
    C4 --> C5["Step 5: usePackage()\n激活包 + 校验环境变量"]
    C5 --> C6["Step 6: registerPackageTools()\n注册 translator:translate 到路由表"]

    C6 --> C7["Step 7: AI 输出 tool_call\ntranslator:translate"]
    C7 --> C8["Step 8: PackageToolExecutor.invoke()\n解析包名:工具名"]
    C8 --> C9["Step 9: JsToolManager.executeScript()\n委托给 JsEngine"]
    C9 --> C10["Step 10: JsEngine.ensureQuickJs()\n懒初始化 QuickJS 引擎"]
    C10 --> C11["Step 11: initJavaScriptEnvironment()\n加载 Bootstrap 模块"]
    C11 --> C12["Step 12: executeScriptFunction()\n创建 ExecutionSession\n调用 JS 侧入口函数\nfuture.get() 阻塞等待"]
    C12 --> C13["结果回注 AI 对话历史"]

    D -.->|"参见文末对比"| Z["三种包对比"]
    E -.->|"参见文末对比"| Z
</div>

<hr/>

<h2 class="section-title">阶段一：导入 — JS 文件进入系统</h2>

<h3>Step 1: 包管理 UI</h3>

<pre><code>📂 ui/features/packages/screens/PackageManagerScreen.kt</code></pre>

<p>用户在包管理页面点击"导入"，选择本地 <code>.js</code> 文件。<code>PackageManagerScreen</code> 是所有包类型（JS 包、ToolPkg、Skill 包）的统一入口 UI，负责展示已导入包列表和触发导入流程。</p>

<hr/>

<h3>Step 2: 扫描可用包</h3>

<pre><code>📂 core/tools/packTool/PackageManager.kt L1107</code></pre>

<pre><code class="language-kotlin">private fun loadAvailablePackages(refreshExternalOnly: Boolean = false) {
    // L1117-1120: 扫描内置资源包（assets/packages/*.js）
    val assetSnapshot = scanAssetPackages()

    // L1123: 扫描外部存储目录的 .js / .toolpkg 文件，合并快照
    val mergedSnapshot = scanExternalPackages(assetSnapshot)

    applyPackageScanSnapshot(mergedSnapshot)
}</code></pre>

<p>两条扫描路径：</p>
<ul>
  <li><code>scanAssetPackages()</code>（L823）：扫描 <code>assets/packages/</code> 目录，这是内置包的位置。</li>
  <li><code>scanExternalPackages()</code>（L838）：扫描外部存储目录，用户手动导入的 <code>.js</code> 文件在这里被发现。</li>
</ul>

<p>两条路径都会调用 <code>parseJsPackage()</code> 把文件内容解析成 <code>ToolPackage</code> 对象。</p>

<hr/>

<h3>Step 3: 解析 JS 文件元数据</h3>

<pre><code>📂 core/tools/packTool/PackageManager.kt L1413</code></pre>

<p>JS 工具包的核心设计：<strong>元数据写在 JS 文件顶部的块注释里，格式是 HJSON（宽松 JSON）</strong>。</p>

<p>一个典型的 <code>translator.js</code> 文件头部长这样：</p>

<pre><code class="language-javascript">/**
 * name: "translator"
 * description: { en: "Translation toolkit", zh: "翻译工具包" }
 * enabledByDefault: false
 * tools: [
 *   {
 *     name: "translate"
 *     description: { en: "Translate text", zh: "翻译文本" }
 *     parameters: [
 *       { name: "text", type: "string", required: true }
 *       { name: "target_lang", type: "string", required: false }
 *     ]
 *   }
 * ]
 */

async function translate(params) {
    const { text, target_lang = "zh" } = params;
    // 实际翻译逻辑...
    return { translated: result };
}</code></pre>

<p><code>parseJsPackage()</code> 的解析流程：</p>

<pre><code class="language-kotlin">// L1419: 提取顶部块注释内容
val metadataString = extractMetadataFromJs(jsContent)

// L1422: 用 org.hjson.JsonValue 解析宽松 JSON
val metadataJson = org.json.JSONObject(
    JsonValue.readHjson(metadataString).toString()
)

// L1459-1460: 反序列化为 Kotlin 数据类
val jsonConfig = Json { ignoreUnknownKeys = true }
val packageMetadata = jsonConfig.decodeFromString&lt;ToolPackage&gt;(jsonString)

// L1471: 关键：每个 PackageTool 的 script 字段被设为【整个 JS 文件内容】
val tools = packageMetadata.tools.map { tool -&gt;
    tool.copy(script = jsContent)   // 不是单个函数，是完整文件
}</code></pre>

<div class="callout">
  <b>设计要点</b><br/>
  <code>PackageTool.script</code> 存的是整个 <code>.js</code> 文件，而不是单个函数体。执行时 QuickJS 会加载完整文件，再按函数名调用目标函数。这样 JS 文件内部可以自由共享工具函数、全局变量等。
</div>

<p>解析结果得到 <code>ToolPackage</code> 数据类：</p>

<pre><code>📂 core/tools/ToolPackage.kt L267-301</code></pre>

<pre><code class="language-kotlin">data class ToolPackage(
    val name: String,                   // "translator"
    val description: LocalizedText,
    val tools: List&lt;PackageTool&gt;,       // [PackageTool(name="translate", script=&lt;全文&gt;)]
    val states: List&lt;ToolPackageState&gt; = emptyList(),
    val env: List&lt;EnvVar&gt; = emptyList(), // 环境变量声明（如 API Key）
    val isBuiltIn: Boolean = false,
    val enabledByDefault: Boolean = false,
    val category: String = "Other"
)</code></pre>

<hr/>

<h2 class="section-title">阶段二：激活 — 让 AI 知道这个工具存在</h2>

<h3>Step 4: 默认包自动导入</h3>

<pre><code>📂 core/tools/packTool/PackageManager.kt L1074</code></pre>

<pre><code class="language-kotlin">private fun initializeDefaultPackages() {
    availablePackages.values.forEach { toolPackage -&gt;
        if (toolPackage.isBuiltIn &amp;&amp;
            toolPackage.enabledByDefault &amp;&amp;   // 只有 enabled_by_default: true 的包
            !disabledPackages.contains(toolPackage.name)
        ) {
            importedPackages.add(toolPackage.name)  // 自动加入已导入列表
        }
    }
}</code></pre>

<p><code>translator.js</code> 如果 <code>enabledByDefault: false</code>，则需要用户手动在 UI 中点击"启用"，或者 AI 在对话中调用 <code>use_package("translator")</code> 来激活。</p>

<hr/>

<h3>Step 5: 激活包并校验环境变量</h3>

<pre><code>📂 core/tools/packTool/PackageManager.kt L2026</code></pre>

<pre><code class="language-kotlin">fun usePackage(packageName: String): String {
    // L2043: 检查是否在已导入列表中
    if (importedPackages.contains(normalizedPackageName)) {

        // L2045-2046: 加载包完整数据
        val toolPackage = getPackageTools(normalizedPackageName)
            ?: return "Failed to load package data for: $normalizedPackageName"

        // L2050-2076: 校验 env 声明的环境变量
        // 如果包声明了 required 环境变量（如 TRANSLATE_API_KEY）但用户没有配置，
        // 这里会返回错误提示，要求用户先设置 env var
        toolPackage.env.forEach { envVar -&gt;
            val value = envPreferences.getEnv(envVar.name)
            if (envVar.required &amp;&amp; value.isNullOrBlank()) {
                missingRequiredEnv.add(envVar.name)
            }
        }

        // 通过校验后，选择合适的状态（State）并注册工具
        val selectedPackage = selectToolPackageState(toolPackage)   // L2121
        registerPackageTools(selectedPackage)                        // L2230
    }
}</code></pre>

<p><code>selectToolPackageState()</code>（L2121）：包可以声明多个 <code>states</code>，每个 state 有一个条件表达式（如 <code>"hasRoot"</code>）。激活时根据当前设备能力选择最合适的 state，不同 state 可以提供不同的工具集合。</p>

<hr/>

<h3>Step 6: 注册工具到路由表</h3>

<pre><code>📂 core/tools/packTool/PackageManager.kt L2230</code></pre>

<pre><code class="language-kotlin">private fun registerPackageTools(toolPackage: ToolPackage) {
    // L2231: 创建执行器，持有 toolPackage 引用
    val packageToolExecutor = PackageToolExecutor(toolPackage, context, this)

    // L2232: advice 类型的"工具"只是提示信息，不可执行
    val executableTools = toolPackage.tools.filter { !it.advice }

    // L2241-2246: 注册每个工具，名称格式：packageName:toolName
    executableTools.forEach { packageTool -&gt;
        val toolName = "\${toolPackage.name}:\${packageTool.name}"  // "translator:translate"
        aiToolHandler.registerTool(toolName) { tool -&gt;
            packageToolExecutor.invoke(tool)
        }
    }
}</code></pre>

<p>注册完成后，<code>translator:translate</code> 作为键存入 <code>AIToolHandler</code> 的路由表。下一次对话时，AI 的 System Prompt 中会出现这个工具的 Schema 描述，AI 就知道可以调用它了。</p>

<hr/>

<h2 class="section-title">阶段三：调用 — AI 触发 JS 执行</h2>

<h3>Step 7: AI 输出工具调用</h3>

<p>AI 在对话中决定翻译一段文字，输出：</p>

<pre><code class="language-xml">&lt;tool_call name="translator:translate"&gt;
  &lt;text&gt;Hello World&lt;/text&gt;
  &lt;target_lang&gt;zh&lt;/target_lang&gt;
&lt;/tool_call&gt;</code></pre>

<p>这个 XML 被 <code>EnhancedAIService</code> 的 <code>extractToolInvocations()</code> 解析，然后进入工具执行管线（见 <code>tool-execution.md</code> Step 2-4 的通用流程）。</p>

<hr/>

<h3>Step 8: PackageToolExecutor 路由</h3>

<pre><code>📂 core/tools/ToolPackage.kt L338</code></pre>

<p><code>AIToolHandler</code> 找到 <code>"translator:translate"</code> 对应的执行器后，调用 <code>PackageToolExecutor.invoke()</code>：</p>

<pre><code class="language-kotlin">override fun invoke(tool: AITool): ToolResult {
    // L348-356: 解析 packageName:toolName 格式
    val parts = tool.name.split(":")
    val packageName = parts[0]   // "translator"
    val toolName = parts[1]      // "translate"

    // L372-378: 在 toolPackage.tools 中查找目标工具
    val packageTool = toolPackage.tools.find { it.name == toolName }
        ?: return ToolResult(error = "Tool '$toolName' not found in package")

    // L382-383: 委托给 JsToolManager 执行，runBlocking 等待结果
    return runBlocking {
        jsToolManager.executeScript(packageTool.script, tool).last()
    }
}</code></pre>

<p>此处 <code>packageTool.script</code> 就是 Step 3 中存入的整个 <code>translator.js</code> 文件内容。</p>

<hr/>

<h3>Step 9: JsToolManager 委托 JsEngine</h3>

<pre><code>📂 core/tools/javascript/JsEngine.kt</code></pre>

<p><code>JsToolManager.executeScript()</code> 最终调用 <code>JsEngine.executeScriptFunction()</code>，传入：</p>
<ul>
  <li><code>script</code>：完整 JS 文件内容</li>
  <li><code>functionName</code>：<code>"translate"</code>（工具名）</li>
  <li><code>params</code>：<code>{"text": "Hello World", "target_lang": "zh"}</code></li>
</ul>

<hr/>

<h3>Step 10: 懒初始化 QuickJS 引擎</h3>

<pre><code>📂 core/tools/javascript/JsEngine.kt L135</code></pre>

<pre><code class="language-kotlin">private fun ensureQuickJs() {
    if (quickJs != null) return  // 已初始化则直接返回
    synchronized(quickJsInitLock) {
        if (quickJs != null) return
        // L144-148: 在专用单线程 Executor 上创建 QuickJS 引擎实例
        val engine = runOnQuickJsThreadBlocking {
            OperitQuickJsEngine().also {
                it.bindNativeInterface(toolCallInterface)  // 绑定 JS↔Android 原生桥
            }
        }
        quickJs = engine
    }
}</code></pre>

<p>QuickJS 引擎运行在专用单线程（线程名 <code>"OperitQuickJsEngine"</code>）上，所有 JS 操作都在这个线程串行执行，避免并发问题。</p>

<hr/>

<h3>Step 11: 加载 Bootstrap 模块</h3>

<pre><code>📂 core/tools/javascript/JsEngine.kt L543
📂 core/tools/javascript/JsLibraries.kt L11</code></pre>

<pre><code class="language-kotlin">private fun initJavaScriptEnvironment() {
    if (jsEnvironmentInitialized) return
    // 按顺序加载所有 Bootstrap 模块
    runtimeBootstrapModules().forEach(::evaluateBootstrapModule)
    jsEnvironmentInitialized = true
}</code></pre>

<p>Bootstrap 模块加载顺序（每个模块只加载一次，后续复用）：</p>

<table class="info-table">
  <thead>
    <tr><th>模块文件</th><th>提供的全局变量</th><th>用途</th></tr>
  </thead>
  <tbody>
    <tr><td><code>execution-runtime.js</code></td><td>—</td><td>执行运行时桥，管理 ExecutionSession</td></tr>
    <tr><td><code>toolpkg-bridge.js</code></td><td><code>ToolPkg</code></td><td>ToolPkg 注册桥</td></tr>
    <tr><td><code>tools.js</code></td><td><code>Tools</code></td><td>JS 侧工具调用 API（让 JS 可以调用 Operit 内置工具）</td></tr>
    <tr><td><code>compose-dsl-bridge.js</code></td><td><code>OperitComposeDslRuntime</code></td><td>Compose UI DSL 桥</td></tr>
    <tr><td><code>java-bridge.js</code></td><td><code>Java</code>, <code>Kotlin</code></td><td>Java 类反射访问桥</td></tr>
    <tr><td><code>third-party-libs.js</code></td><td><code>_</code>, <code>dataUtils</code></td><td>Lodash 等第三方库</td></tr>
    <tr><td><code>CryptoJS.js</code></td><td><code>CryptoJS</code></td><td>加密库</td></tr>
    <tr><td><code>Jimp.js</code></td><td><code>Jimp</code></td><td>图像处理库</td></tr>
  </tbody>
</table>

<p>加载完这些模块后，JS 代码就能使用完整的 Operit JS API 环境了。</p>

<hr/>

<h3>Step 12: 执行脚本函数并等待结果</h3>

<pre><code>📂 core/tools/javascript/JsEngine.kt L571</code></pre>

<pre><code class="language-kotlin">internal fun executeScriptFunction(
    script: String,
    functionName: String,
    params: Map&lt;String, Any?&gt;,
    ...
): Any? {
    ensureQuickJs()
    if (!jsEnvironmentInitialized) {
        initJavaScriptEnvironment()
    }

    // L630-641: 创建 ExecutionSession，持有 CompletableFuture
    val callId = nextExecutionCallId()
    val session = createExecutionSession(callId, script, functionName, params, ...)
    activeExecutionSessions[callId] = session

    // L665-681: 在 QuickJS 线程上调用 JS 侧入口函数
    // JS 侧的 __operit_execute_package_function__ 负责：
    //   1. 动态 eval 用户脚本
    //   2. 调用其中的 functionName
    //   3. 将结果通过 native 回调返回
    launchQuickJsFunctionCall(
        functionName = TOOLPKG_EXECUTION_ENTRY_FUNCTION,  // "__operit_execute_package_function__"
        argsJson = executionArgsJson   // [callId, params, script, functionName, timeoutSec, ...]
    )

    // L700: 阻塞等待 JS 执行完毕（最长 timeoutSec 秒）
    val result = session.future.get(safeTimeoutSec, TimeUnit.SECONDS)
    return result
}</code></pre>

<p>JS 执行完 <code>translate(params)</code> 后，通过 <code>toolCallInterface</code>（原生桥）把返回值写入 <code>session.future</code>，<code>future.get()</code> 解除阻塞，结果返回到 Kotlin 侧，被包装成 <code>ToolResult</code> 回注 AI 对话历史。</p>

<hr/>

<h2 class="section-title">完整调用链回顾</h2>

<pre><code>用户导入 translator.js
  → PackageManager.loadAvailablePackages()                  [L1107]
    → scanExternalPackages() → parseJsPackage()             [L838 / L1413]
      → 提取 HJSON 元数据 + tool.copy(script = jsContent)   [L1471]
  → initializeDefaultPackages()（enabledByDefault 包自动导入）[L1074]

AI 对话中激活包
  → PackageManager.usePackage("translator")                 [L2026]
    → selectToolPackageState() → registerPackageTools()     [L2121 / L2230]
      → aiToolHandler.registerTool("translator:translate")  [L2243]

AI 输出 &lt;tool_call name="translator:translate"&gt;
  → AIToolHandler 路由 → PackageToolExecutor.invoke()       [L346]
    → JsToolManager.executeScript(packageTool.script, tool)
      → JsEngine.executeScriptFunction()                    [L571]
        → ensureQuickJs() + initJavaScriptEnvironment()     [L135 / L543]
        → launchQuickJsFunctionCall("__operit_execute_package_function__")
        → session.future.get() 阻塞等待
        → JS 执行 translate(params) → 回调写入 future
      → 返回 ToolResult → 回注 AI 对话历史</code></pre>

<hr/>

<h2 class="section-title">涉及文件</h2>

<table class="info-table">
  <thead>
    <tr><th>文件路径</th><th>职责</th></tr>
  </thead>
  <tbody>
    <tr><td><code>ui/features/packages/screens/PackageManagerScreen.kt</code></td><td>包管理 UI，导入入口</td></tr>
    <tr><td><code>core/tools/packTool/PackageManager.kt</code></td><td>扫描、解析、激活、注册全流程</td></tr>
    <tr><td><code>core/tools/ToolPackage.kt</code></td><td><code>ToolPackage</code> / <code>PackageTool</code> / <code>PackageToolExecutor</code> 数据模型与执行器</td></tr>
    <tr><td><code>core/tools/javascript/JsEngine.kt</code></td><td>QuickJS 引擎封装，Bootstrap 加载，脚本执行</td></tr>
    <tr><td><code>core/tools/javascript/JsLibraries.kt</code></td><td>Bootstrap 模块列表构建</td></tr>
    <tr><td><code>core/tools/defaultTool/ToolRegistration.kt</code></td><td>系统内置工具注册（与包工具并列在 AIToolHandler 中）</td></tr>
    <tr><td><code>core/tools/skill/SkillManager.kt</code></td><td>Skill 包管理（纯 Markdown，不执行代码）</td></tr>
    <tr><td><code>data/skill/SkillRepository.kt</code></td><td>Skill 市场，从 GitHub 仓库导入 Skill 包</td></tr>
  </tbody>
</table>

<hr/>

<h2 class="section-title">三种"包"的区别</h2>

<p>项目中有三种不同性质的"包"，它们的区别经常让初次阅读代码的人感到困惑：</p>

<table class="info-table">
  <thead>
    <tr><th>特性</th><th>JS 工具包（.js）</th><th>ToolPkg 容器（.toolpkg）</th><th>Skill 包（SKILL.md）</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>文件格式</strong></td><td>单个 <code>.js</code> 文件，顶部 HJSON 块注释</td><td>ZIP 压缩包，含多个模块文件</td><td>单个 Markdown 文件</td></tr>
    <tr><td><strong>是否执行代码</strong></td><td>是，QuickJS 执行 JS</td><td>是，含主注册脚本 + 子模块</td><td>否</td></tr>
    <tr><td><strong>AI 感知方式</strong></td><td>工具 Schema 注入 System Prompt</td><td>工具 Schema 注入 System Prompt</td><td>全文注入 AI 上下文（增强提示）</td></tr>
    <tr><td><strong>支持 UI</strong></td><td>否</td><td>是（<code>OperitComposeDslRuntime</code>）</td><td>否</td></tr>
    <tr><td><strong>管理类</strong></td><td><code>PackageManager</code></td><td><code>PackageManager</code>（toolPkg 分支）</td><td><code>SkillManager</code></td></tr>
    <tr><td><strong>典型用途</strong></td><td>翻译、搜索、API 封装</td><td>复杂工具集，带 UI 界面</td><td>为 AI 注入领域知识、角色设定</td></tr>
  </tbody>
</table>

<div class="callout">
  <b>Skill 包说明</b><br/>
  Skill 包（<code>SKILL.md</code>）不会注册任何工具，它的内容会被 <code>SkillManager</code> 读取后直接注入 AI 的 System Prompt，让 AI 获得特定领域的背景知识或行为规范。
</div>

<hr/>

<h2 class="section-title">动手练习</h2>

<h3>练习 1: 观察 HJSON 解析</h3>

<p>在 <code>PackageManager.kt:1422</code>（<code>JsonValue.readHjson()</code>）加断点。导入一个 <code>.js</code> 包，观察 <code>metadataString</code> 的原始内容和解析后的 <code>metadataJson</code> 结构。</p>

<h3>练习 2: 追踪工具注册</h3>

<p>在 <code>PackageManager.kt:2243</code>（<code>aiToolHandler.registerTool(toolName)</code>）加日志，打印 <code>toolName</code>。启动并激活一个 JS 包，检查 logcat 确认注册的工具全名（格式：<code>packageName:toolName</code>）。</p>

<h3>练习 3: 观察 JS 执行过程</h3>

<p>在 <code>JsEngine.kt:700</code>（<code>session.future.get()</code>）前后加日志，记录调用前时间戳和返回结果类型。让 AI 调用一个 JS 工具，观察 JS 侧执行耗时。</p>

<h3>练习 4: 编写一个最小 JS 工具包</h3>

<p>创建 <code>my_tool.js</code>：</p>

<pre><code class="language-javascript">/**
 * name: "my_tool"
 * description: { en: "My first tool package", zh: "我的第一个工具包" }
 * tools: [
 *   {
 *     name: "greet"
 *     description: { en: "Say hello", zh: "打招呼" }
 *     parameters: [
 *       { name: "name", type: "string", required: true, description: { en: "Name", zh: "姓名" } }
 *     ]
 *   }
 * ]
 */

async function greet(params) {
    return { message: \`Hello, \${params.name}!\` };
}</code></pre>

<p>将文件导入 Operit，在对话中让 AI 调用 <code>my_tool:greet</code>，观察完整执行链路。</p>

<hr/>

<h2 class="section-title">关联文档</h2>

<table class="info-table">
  <thead>
    <tr><th>文档</th><th>关系</th></tr>
  </thead>
  <tbody>
    <tr><td><code>tool-execution.md</code></td><td>工具调用通用管线（Step 7 之后的权限检查、并行执行等）</td></tr>
    <tr><td><code>chat-message-flow.md</code></td><td>工具调用在完整对话链路中的位置</td></tr>
    <tr><td><code>mcp-plugin-lifecycle.md</code></td><td>MCP 插件的类似生命周期（对比学习）</td></tr>
  </tbody>
</table>

</div>`);
