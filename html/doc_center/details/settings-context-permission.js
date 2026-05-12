registerDetail('settings-context-permission', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">419</span><span class="stat-label">ContextSummary 行数</span></div>
      <div class="stat-item"><span class="stat-num">388</span><span class="stat-label">ToolPermission 行数</span></div>
      <div class="stat-item"><span class="stat-num">493</span><span class="stat-label">ExternalHttpChat 行数</span></div>
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">截断配置参数</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">权限级别</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">HTTP API 端点</span></div>
    </div>

    <!-- ContextSummarySettingsScreen -->
    <div class="section-head blue">ContextSummarySettingsScreen — 上下文截断设置</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">管理 AI 运行时上下文窗口的截断行为，通过 5 个数值参数控制文件大小、分片行数、图片/媒体历史轮数等上限。是 Settings 中唯一使用显式 Save 按钮的子页面。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">ContextSummarySettingsScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">Column (verticalScroll)</div>
        <div class="tree-children">
          <div class="tree-node">Text: 说明文字</div>
          <div class="tree-node">SectionTitle: "Truncation Settings" (ContentCut 图标)</div>
          <div class="tree-node">SettingsInputField: Max File Size (KB)</div>
          <div class="tree-node">SettingsInputField: Part Size (行)</div>
          <div class="tree-node">SettingsInputField: Max Text Result Length (KB)</div>
          <div class="tree-node">SettingsInputField: Max Image History User Turns (轮)</div>
          <div class="tree-node">SettingsInputField: Max Media History User Turns (轮)</div>
          <div class="tree-node">Button: Reset All (RestartAlt 图标)</div>
          <div class="tree-node">Button: Save (Save 图标)</div>
        </div>
        <div class="tree-node">AlertDialog: 校验错误提示</div>
        <div class="tree-node">Snackbar: 保存成功（1.5 秒自动消失）</div>
      </div>
    </div>

    <div class="section-head green" style="margin-top:16px;">5 个截断配置参数</div>
    <table class="act-table">
      <tr><th>参数</th><th>显示单位</th><th>存储单位</th><th>默认值</th><th>约束</th></tr>
      <tr><td>Max File Size</td><td>KB</td><td>bytes (×1000)</td><td>32 KB</td><td>&gt; 0</td></tr>
      <tr><td>Part Size</td><td>行</td><td>lines</td><td>200</td><td>&gt; 0</td></tr>
      <tr><td>Max Text Result Length</td><td>KB</td><td>bytes (×1000)</td><td>5 KB</td><td>&gt; 0</td></tr>
      <tr><td>Max Image History User Turns</td><td>轮</td><td>int</td><td>2</td><td>≥ 0</td></tr>
      <tr><td>Max Media History User Turns</td><td>轮</td><td>int</td><td>1</td><td>≥ 0</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">SettingsInputField 组件结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Card (带背景色)</div>
      <div class="tree-children">
        <div class="tree-node">Row</div>
        <div class="tree-children">
          <div class="tree-node">Column: 标题 + 副标题</div>
          <div class="tree-node">BasicTextField (50dp 宽，纯数字 + 点过滤) + 单位标签</div>
        </div>
      </div>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">IME Done 键清除焦点；输入字符实时过滤为 <code style="background:var(--surface-2);padding:1px 4px;border-radius:3px;">digits + '.'</code>。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <p style="font-size:13px;color:var(--text-dim);margin:4px 0 8px 0;">无 ViewModel。通过 <strong>ApiPreferences</strong>（DataStore）管理。<code style="background:var(--surface-2);padding:1px 4px;border-radius:3px;">LaunchedEffect(Unit)</code> 一次性加载初始值（<code style="background:var(--surface-2);padding:1px 4px;border-radius:3px;">flow.first()</code>）。Save 按钮校验全部 5 个字段后统一持久化；Reset 按钮调用 <code style="background:var(--surface-2);padding:1px 4px;border-radius:3px;">resetTruncationSettings()</code> 后重新加载。</p>

    <!-- ToolPermissionSettingsScreen -->
    <div class="section-head orange" style="margin-top:28px;">ToolPermissionSettingsScreen — 工具权限管理</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">管理所有注册工具的执行权限。支持全局主开关（ALLOW / ASK / FORBID）与工具级覆盖（ALLOW / FORBID）两层配置，Chip 采用 toggle 模式，点击已在目标级别的工具会移除覆盖，回到隐式 ASK。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">ToolPermissionSettingsScreen</div>
      <div class="tree-children">
        <div class="tree-node">LazyColumn (surfaceVariant 背景)</div>
        <div class="tree-children">
          <div class="tree-node">Header: 标题 + 描述</div>
          <div class="tree-node">Card: 全局权限开关</div>
          <div class="tree-children">
            <div class="tree-node">CompactPermissionLevelSelector [ALLOW | ASK | FORBID]</div>
          </div>
          <div class="tree-node">Card: 说明 / 图例</div>
          <div class="tree-node">PermissionGroup (ALLOW)</div>
          <div class="tree-children">
            <div class="tree-node">彩色圆点 + 标题 + Add 按钮</div>
            <div class="tree-node">FlowRow: ToolChip（名称 + Close）</div>
          </div>
          <div class="tree-node">PermissionGroup (FORBID)</div>
          <div class="tree-children">
            <div class="tree-node">彩色圆点 + 标题 + Add 按钮</div>
            <div class="tree-node">FlowRow: ToolChip（名称 + Close）</div>
          </div>
        </div>
        <div class="tree-node">ToolSelectorDialog (Dialog)</div>
        <div class="tree-children">
          <div class="tree-node">Text: 标题</div>
          <div class="tree-node">OutlinedTextField: 搜索</div>
          <div class="tree-node">LazyColumn: Checkbox + 工具名</div>
          <div class="tree-node">Button: Done</div>
        </div>
      </div>
    </div>

    <div class="section-head green" style="margin-top:16px;">权限模型 — 三层优先级</div>
    <div class="kn-code" style="margin:8px 0;">enum class PermissionLevel {
    ALLOW,   // 自动执行，不询问
    ASK,     // 运行时询问（默认）
    FORBID   // 始终禁止
}</div>
    <table class="act-table" style="margin-top:8px;">
      <tr><th>优先级</th><th>级别</th><th>说明</th></tr>
      <tr><td>1（最高）</td><td>工具级覆盖</td><td>ALLOW / FORBID 覆盖，存在覆盖时直接生效</td></tr>
      <tr><td>2</td><td>全局主开关</td><td>ALLOW / ASK / FORBID，无工具覆盖时生效</td></tr>
      <tr><td>3（兜底）</td><td>隐式 ASK</td><td>DataStore 无记录时默认行为</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">Toggle 切换逻辑（handlePermissionChange）</div>
    <p style="font-size:13px;color:var(--text-dim);margin:4px 0 8px 0;">点击已在目标级别的工具 → <strong>移除覆盖</strong>（回到 ASK）；点击不在目标级别的工具 → <strong>设置覆盖</strong>。每个 Chip 均为 toggle 行为，而非单选。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态数据源</div>
    <table class="act-table">
      <tr><th>数据源</th><th>说明</th></tr>
      <tr><td>AIToolHandler.getAllToolNames()</td><td>所有注册工具名（排除 package_proxy）</td></tr>
      <tr><td>ToolPermissionSystem.masterSwitchFlow</td><td>全局主开关 Flow</td></tr>
      <tr><td>ToolPermissionSystem.getToolPermissionOverride()</td><td>逐工具查询当前覆盖级别</td></tr>
      <tr><td>toolPermissions: MutableStateMap</td><td>本地缓存，有覆盖的工具名 → 级别映射</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">ToolSelectorDialog</div>
    <p style="font-size:13px;color:var(--text-dim);margin:4px 0;">搜索框实时过滤（不区分大小写）。Checkbox 列表中勾选 / 取消工具时触发 <code style="background:var(--surface-2);padding:1px 4px;border-radius:3px;">handlePermissionChange</code>。Done 按钮关闭对话框。</p>

    <!-- ExternalHttpChatSettingsScreen -->
    <div class="section-head" style="margin-top:28px;background:var(--accent-purple,#7c5cbf);color:#fff;">ExternalHttpChatSettingsScreen — 外部 HTTP 聊天接口</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">在设备上启动内嵌 HTTP 服务器，对外暴露聊天接口，支持同步与异步回调两种模式。同时提供 Android Intent API，允许其他应用通过系统广播触发聊天。局域网 IP 实时显示，内置 curl 示例方便调试。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">ExternalHttpChatSettingsScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">Column (verticalScroll)</div>
        <div class="tree-children">
          <div class="tree-node">SettingsCard "Enable Service": 状态文本 + Switch</div>
          <div class="tree-node">SettingsCard "Port": OutlinedTextField + Save / Restart 按钮</div>
          <div class="tree-node">SettingsCard "Token": 只读显示 + Copy / Reset 按钮</div>
          <div class="tree-node">SettingsCard "Service Status": 动态状态文本</div>
          <div class="tree-node">SettingsCard "Access URLs": LAN IP 列表（可选中复制）</div>
          <div class="tree-node">SettingsCard "Sync Example": curl 命令 + Copy</div>
          <div class="tree-node">SettingsCard "Async Example": curl 命令</div>
          <div class="tree-node">SettingsCard "Health Check Example": curl 命令</div>
          <div class="tree-node">SettingsCard "Android Intent Integration": Intent 说明 + ADB 示例</div>
        </div>
      </div>
    </div>

    <div class="section-head green" style="margin-top:16px;">配置项</div>
    <table class="act-table">
      <tr><th>设置</th><th>默认值</th><th>说明</th></tr>
      <tr><td>服务开关</td><td>false</td><td>启动 / 停止 HTTP 服务器</td></tr>
      <tr><td>端口</td><td>8094</td><td>范围 1~65535，纯数字，最多 5 字符</td></tr>
      <tr><td>Bearer Token</td><td>自动生成</td><td>UUID（去连字符），只读显示，可复制 / 重置</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">HTTP API 接口</div>
    <table class="act-table">
      <tr><th>端点</th><th>方法</th><th>用途</th></tr>
      <tr><td>/api/external-chat</td><td>POST</td><td>同步 / 异步聊天请求（Bearer Token 鉴权）</td></tr>
      <tr><td>/api/health</td><td>GET</td><td>健康检查，无需鉴权</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">请求参数（/api/external-chat）</div>
    <table class="act-table">
      <tr><th>参数</th><th>说明</th></tr>
      <tr><td>message</td><td>用户消息内容</td></tr>
      <tr><td>response_mode</td><td>"sync" 或 "async_callback"</td></tr>
      <tr><td>show_floating</td><td>是否显示浮动窗口</td></tr>
      <tr><td>initial_mode</td><td>初始模式</td></tr>
      <tr><td>return_tool_status</td><td>是否在响应中包含工具状态</td></tr>
      <tr><td>callback_url</td><td>异步模式下的回调 URL</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">Android Intent API</div>
    <table class="act-table">
      <tr><th>字段</th><th>值</th></tr>
      <tr><td>触发 Action</td><td>com.ai.assistance.operit.EXTERNAL_CHAT</td></tr>
      <tr><td>结果 Action</td><td>com.ai.assistance.operit.EXTERNAL_CHAT_RESULT</td></tr>
    </table>

    <div class="section-head green" style="margin-top:16px;">服务控制流程</div>
    <div class="kn-code" style="margin:8px 0;">// 启用服务
ensureBearerToken() → setEnabled(true)
  → AIForegroundService.ensureRunningForExternalHttp()
  → Toast

// 禁用服务
setEnabled(false)
  → AIForegroundService.stopExternalHttp()
  → Toast

// 保存端口
校验 1~65535 → setPort()
  → [已启用] ensureRunningForExternalHttp() 重启
  → Toast

// 重置 Token
resetBearerToken()（新 UUID）
  → 复制到剪贴板 → Toast</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <p style="font-size:13px;color:var(--text-dim);margin:4px 0 8px 0;">无 ViewModel。通过 <strong>ExternalHttpApiPreferences</strong>（DataStore）管理 3 个 Flow（enabled、port、token）。服务状态通过 <code style="background:var(--surface-2);padding:1px 4px;border-radius:3px;">AIForegroundService.externalHttpState</code>（StateFlow）实时监听。LAN IP 通过 <code style="background:var(--surface-2);padding:1px 4px;border-radius:3px;">ExternalChatHttpNetworkInfo.getLocalIpv4Addresses()</code> 获取（查询 NetworkInterface），curl 示例按 <code style="background:var(--surface-2);padding:1px 4px;border-radius:3px;">remember(key)</code> 缓存。</p>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:28px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">💾</div>
        <div class="kn-title blue">显式保存</div>
        <div class="kn-body">ContextSummarySettingsScreen 是 Settings 中唯一使用 Save 按钮的页面；其他页面通常为即时保存或防抖自动保存。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔀</div>
        <div class="kn-title orange">Toggle 权限</div>
        <div class="kn-body">ToolPermission 的 Chip 采用 toggle 模式：点击已在目标级别的工具会移除覆盖（回到隐式 ASK），而非无操作，行为直觉与普通单选不同。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔗</div>
        <div class="kn-title green">前台服务耦合</div>
        <div class="kn-body">ExternalHttp 的服务开关直接调用 AIForegroundService 的静态方法；服务状态通过全局 StateFlow 回报到 UI，无 ViewModel 中间层。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🧩</div>
        <div class="kn-title blue">均无 ViewModel</div>
        <div class="kn-body">三个页面全部通过 Manager 单例（ApiPreferences / ToolPermissionSystem / ExternalHttpApiPreferences）+ 局部 remember 状态管理，无 ViewModel。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对 ui/features/settings/screens/）</th><th>行数</th><th>职责</th></tr>
      <tr><td>ContextSummarySettingsScreen</td><td>ContextSummarySettingsScreen.kt</td><td>419</td><td>5 个截断参数配置</td></tr>
      <tr><td>ToolPermissionSettingsScreen</td><td>ToolPermissionSettingsScreen.kt</td><td>388</td><td>全局 / 工具级权限管理</td></tr>
      <tr><td>ExternalHttpChatSettingsScreen</td><td>ExternalHttpChatSettingsScreen.kt</td><td>493</td><td>HTTP / Intent 聊天接口配置</td></tr>
    </table>
`);
