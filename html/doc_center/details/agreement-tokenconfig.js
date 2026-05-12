registerDetail('agreement-tokenconfig', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">174</span><span class="stat-label">Agreement 行数</span></div>
      <div class="stat-item"><span class="stat-num">285</span><span class="stat-label">TokenConfig 行数</span></div>
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">强制等待秒数</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">WebView 标签页</span></div>
    </div>

    <!-- AgreementScreen -->
    <div class="section-head blue">AgreementScreen — 用户协议</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">首次启动时的用户协议页面。用户必须等待 5 秒后才能点击接受，协议包含"人话版"（Compose Text）和"正式版"（AndroidView HTML 渲染）两部分。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">AgreementScreen(onAgreementAccepted)</div>
      <div class="tree-children">
        <div class="tree-node">Column (fillMaxSize, padding 16dp)</div>
        <div class="tree-children">
          <div class="tree-node">Text (标题, headlineMedium, primary, Bold)</div>
          <div class="tree-node">Text (副标题, bodyLarge)</div>
          <div class="tree-node">Box (weight=1f, surfaceVariant, shapes.medium)</div>
          <div class="tree-children">
            <div class="tree-node">Column (verticalScroll)</div>
            <div class="tree-children">
              <div class="tree-node">Text "人话版" 标题 + 内容 (Compose Text)</div>
              <div class="tree-node">HorizontalDivider</div>
              <div class="tree-node">Text "正式版" 标题</div>
              <div class="tree-node">AndroidView → TextView (HtmlCompat.fromHtml)</div>
              <div class="tree-node">HorizontalDivider</div>
              <div class="tree-node">Text (免责声明, bodySmall, alpha 0.7)</div>
            </div>
          </div>
          <div class="tree-node">Button (fillMaxWidth, 56dp, enabled=isButtonEnabled)</div>
          <div class="tree-children">
            <div class="tree-node">Text: "接受" / "请等待 N 秒..."</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-head green" style="margin-top:16px;">强制阅读计时器</div>
    <div class="kn-code" style="margin:8px 0;">LaunchedEffect(Unit) {
  repeat(5) { delay(1000); remainingSeconds-- }
  isButtonEnabled = true
}</div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">5 秒内按钮禁用且显示倒计时，防止用户未阅读直接跳过。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>scrollState</td><td>ScrollState</td><td>协议内容滚动</td></tr>
      <tr><td>isButtonEnabled</td><td>Boolean</td><td>5 秒后启用</td></tr>
      <tr><td>remainingSeconds</td><td>Int</td><td>倒计时剩余秒数（初始 5）</td></tr>
    </table>

    <div class="section-head gray" style="margin-top:16px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🔀</div>
        <div class="kn-title blue">混合渲染</div>
        <div class="kn-body">人话版用 Compose Text，正式版用 AndroidView + TextView + HtmlCompat.fromHtml() 支持 HTML 标签。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🚪</div>
        <div class="kn-title green">单向门</div>
        <div class="kn-body">无 Scaffold / TopBar。接受后通过 onAgreementAccepted 回调通知调用方，页面不持有导航控制。</div>
      </div>
    </div>

    <!-- TokenConfigWebViewScreen -->
    <div class="section-head orange" style="margin-top:28px;">TokenConfigWebViewScreen — Token 配置</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">内嵌 WebView 的 Token 管理页面，默认加载 DeepSeek 平台登录页。底部 4 标签导航栏切换不同功能（API Keys / Usage / Top-Up / Profile），支持自定义 URL 配置。</p>

    <div class="mermaid">
graph TD
    ROOT["TokenConfigWebViewScreen&lt;br/&gt;(CustomScaffold)"]
    ROOT --> DLG["[showConfigDialog] UrlConfigDialog&lt;br/&gt;AlertDialog: name + signInUrl + 4×(title+url)"]
    ROOT --> SNACKBAR["SnackbarHost"]
    ROOT --> WEBVIEW["Box (fillMaxSize)"]
    WEBVIEW --> WV["AndroidView → WebView"]
    WEBVIEW --> LOADING["[isLoading] LinearProgressIndicator (TopCenter)"]
    ROOT --> BOTTOM_BAR["Surface (elevation 2dp)"]
    BOTTOM_BAR --> TABS["Row: 4 个标签&lt;br/&gt;Column: Icon(24dp) + Text(12sp)&lt;br/&gt;选中=primary / 未选中=Gray"]
    </div>

    <div class="section-head green" style="margin-top:16px;">URL 配置</div>
    <table class="act-table">
      <tr><th>字段</th><th>说明</th></tr>
      <tr><td>UrlConfig</td><td>@Serializable: name + signInUrl + tabs: List&lt;TabConfig&gt;</td></tr>
      <tr><td>TabConfig</td><td>@Serializable: title + url</td></tr>
      <tr><td>UrlConfigManager</td><td>DataStore "url_config" 持久化，默认 DeepSeek 配置</td></tr>
      <tr><td>PRESET_CONFIGS</td><td>预置：DeepSeek / Claude / ChatGPT / Gemini / Poe</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">WebView 配置</div>
    <table class="act-table">
      <tr><th>配置项</th><th>值</th></tr>
      <tr><td>JavaScript</td><td>启用</td></tr>
      <tr><td>DOM Storage</td><td>启用</td></tr>
      <tr><td>User-Agent</td><td>Chrome 124 Mobile</td></tr>
      <tr><td>Cookie</td><td>第三方 Cookie 接受</td></tr>
      <tr><td>混合内容</td><td>允许</td></tr>
      <tr><td>调试</td><td>WebContentsDebuggingEnabled = true</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">URL scheme 拦截</div>
    <table class="act-table">
      <tr><th>Scheme</th><th>目标</th></tr>
      <tr><td>alipays: / alipay:</td><td>跳转支付宝</td></tr>
      <tr><td>weixin: / weixins:</td><td>跳转微信</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">onPageFinished 通过双向 contains 模糊匹配当前 URL 与标签 URL，自动同步选中标签索引。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>isLoading</td><td>Boolean</td><td>WebView 加载中</td></tr>
      <tr><td>selectedTabIndex</td><td>Int</td><td>当前选中标签</td></tr>
      <tr><td>showConfigDialog</td><td>Boolean</td><td>URL 配置对话框</td></tr>
      <tr><td>urlConfigFlow (外部)</td><td>Flow&lt;UrlConfig&gt;</td><td>DataStore 持久化 URL 配置</td></tr>
    </table>

    <div class="section-head gray" style="margin-top:16px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🌐</div>
        <div class="kn-title orange">无 ViewModel</div>
        <div class="kn-body">UrlConfigManager 通过 remember 创建，DataStore 持久化。WebView 通过 remember 创建一次，DisposableEffect 中 stopLoading + destroy。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📌</div>
        <div class="kn-title blue">TopBar 注入</div>
        <div class="kn-body">通过 LocalTopBarActions CompositionLocal 注入 Settings 图标到共享 TopBar，仅当前页面激活时注入。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">核心文件</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径</th><th>行数</th></tr>
      <tr><td>AgreementScreen</td><td>ui/features/agreement/screens/AgreementScreen.kt</td><td>174</td></tr>
      <tr><td>TokenConfigWebViewScreen</td><td>ui/features/token/TokenConfigWebViewScreen.kt</td><td>285</td></tr>
      <tr><td>UrlConfigManager</td><td>ui/features/token/UrlConfigManager.kt</td><td>~100</td></tr>
      <tr><td>WebViewConfig</td><td>ui/features/token/WebViewConfig.kt</td><td>~150</td></tr>
    </table>
`);
