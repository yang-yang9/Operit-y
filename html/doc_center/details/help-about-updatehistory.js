registerDetail('help-about-updatehistory', `    <p style="margin:0 0 16px 4px;font-size:13px;color:var(--text-dim);">三个信息类主导航页面合并文档：Help（帮助）、About（关于）、UpdateHistory（更新历史）</p>

    <!-- ===== Help ===== -->
    <div class="section-head blue" style="font-size:16px;">Screen.Help (帮助)</div>

    <div class="stats" style="margin-bottom:16px;">
      <div class="stat-item"><span class="stat-num">~113</span><span class="stat-label">行代码</span></div>
      <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">对话框</span></div>
      <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">ViewModel</span></div>
    </div>

    <div class="flow">
      <span class="flow-step">NavItem.Help</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.Help.Content()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">HelpScreen()</span>
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">主导航页面，无 parentScreen，无子页面导航</p>

    <div class="comp-tree" style="margin-top:16px;">
      <div class="ct-node">HelpScreen</div>
      <div class="ct-children">
        <div class="ct-node">Box (fillMaxSize)</div>
        <div class="ct-children">
          <div class="ct-node">AndroidView (WebView, 通过 WebViewConfig.createWebView 创建)</div>
          <div class="ct-node dim">[isLoading] Box (白色遮罩 80% alpha, 居中)</div>
          <div class="ct-children">
            <div class="ct-node">CircularProgressIndicator (48dp) + Text (加载提示)</div>
          </div>
        </div>
      </div>
    </div>

    <table class="act-table" style="margin-top:16px;">
      <tr><th>状态</th><th>类型</th><th>说明</th></tr>
      <tr><td>isLoading</td><td>mutableStateOf(true)</td><td>WebView 页面加载状态</td></tr>
      <tr><td>webView</td><td>remember</td><td>跨重组保留的 WebView 实例</td></tr>
      <tr><td>focusRequester</td><td>remember</td><td>确保 WebView 获得焦点处理触摸滚动</td></tr>
    </table>

    <div class="key-nodes-grid" style="grid-template-columns:1fr 1fr;margin-top:16px;">
      <div class="key-node-card">
        <strong>共享 WebView 配置</strong>
        <p>使用 WebViewConfig.createWebView() 统一配置</p>
      </div>
      <div class="key-node-card">
        <strong>双重焦点管理</strong>
        <p>DisposableEffect + LaunchedEffect 防止父容器拦截触摸事件</p>
      </div>
    </div>

    <!-- ===== About ===== -->
    <div class="section-head orange" style="font-size:16px;margin-top:32px;">Screen.About (关于)</div>

    <div class="stats" style="margin-bottom:16px;">
      <div class="stat-item"><span class="stat-num">~1872</span><span class="stat-label">行代码</span></div>
      <div class="stat-item"><span class="stat-num">8</span><span class="stat-label">对话框</span></div>
      <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">ViewModel</span></div>
      <div class="stat-item"><span class="stat-num">10</span><span class="stat-label">阶段更新器</span></div>
    </div>

    <div class="flow">
      <span class="flow-step">NavItem.About</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.About.Content()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">AboutScreen(navigateToUpdateHistory)</span>
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">主导航页面，可导航到 Screen.UpdateHistory</p>

    <!-- About 组件树 Mermaid -->
    <div class="mermaid" style="margin-top:16px;">
graph TD
    ABOUT_ROOT["AboutScreen&lt;br/&gt;(CustomScaffold)"]

    ABOUT_ROOT --> DIALOGS["Dialog Chain (8个弹窗)"]
    ABOUT_ROOT --> CONTENT["LazyColumn (16dp padding, 12dp spacing)"]

    CONTENT --> LOGO["App Logo Header&lt;br/&gt;80dp 圆形图标 + 应用名 + 版本号"]
    CONTENT --> UPDATES_GROUP["SettingsGroup: Updates"]
    UPDATES_GROUP --> CHECK_UPDATE["SettingsRow: Check for Updates&lt;br/&gt;(trailing: Loading/Arrow)"]
    UPDATES_GROUP --> BETA_TOGGLE["SettingsRow: Beta Plan&lt;br/&gt;(trailing: Switch)"]

    CONTENT --> PROJECT_GROUP["SettingsGroup: Project"]
    PROJECT_GROUP --> PROJECT_URL["SettingsRow: Project URL → 浏览器"]
    PROJECT_GROUP --> STAR["SettingsRow: Star on GitHub → 浏览器"]
    PROJECT_GROUP --> UPDATE_LOG["SettingsRow: Update Log → UpdateHistory"]
    PROJECT_GROUP --> LICENSE["SettingsRow: Open Source Licenses → 弹窗"]

    CONTENT --> CONTACT_GROUP["SettingsGroup: Contact"]
    CONTACT_GROUP --> EMAIL["SettingsRow: Email"]
    CONTACT_GROUP --> DEV["SettingsRow: Developer (HtmlText)"]

    CONTENT --> COPYRIGHT["Text: Copyright"]

    DIALOGS --> DLG_UPDATE["UpdateDialog"]
    DIALOGS --> DLG_PATCH_PROG["PatchUpdateProgressDialog"]
    DIALOGS --> DLG_FULL_PROG["FullUpdateProgressDialog"]
    DIALOGS --> DLG_METHOD["FullUpdateMethodDialog"]
    DIALOGS --> DLG_DL_SRC["DownloadSourceDialog (浏览器路径)"]
    DIALOGS --> DLG_DL_SRC_APP["DownloadSourceDialog (应用内路径)"]
    DIALOGS --> DLG_PATCH_SRC["PatchDownloadSourceDialog"]
    DIALOGS --> DLG_LICENSE["LicenseDialog"]
    </div>

    <!-- About 状态 -->
    <div class="section-head" style="background:rgba(255,152,0,0.08);border-left-color:#FFA726;font-size:13px;">状态管理（无 ViewModel，协程 scope）</div>
    <table class="act-table">
      <tr><th>状态</th><th>类型</th><th>说明</th></tr>
      <tr><td>updateStatus</td><td>UpdateStatus (LiveData)</td><td>更新检查结果状态</td></tr>
      <tr><td>showUpdateDialog</td><td>Boolean</td><td>更新弹窗</td></tr>
      <tr><td>patchUpdateStateFlow</td><td>MutableStateFlow</td><td>增量更新进度</td></tr>
      <tr><td>fullUpdateStateFlow</td><td>MutableStateFlow</td><td>全量更新进度</td></tr>
      <tr><td>pendingFullUpdateMethod</td><td>UpdateStatus.Available?</td><td>等待选择更新方式</td></tr>
      <tr><td>showLicenseDialog</td><td>Boolean</td><td>开源许可证弹窗</td></tr>
      <tr><td>betaEnabled</td><td>Boolean (Flow)</td><td>Beta 计划开关</td></tr>
    </table>

    <!-- 更新安装流程 -->
    <div class="section-head" style="background:rgba(255,152,0,0.08);border-left-color:#FFA726;font-size:13px;">更新安装流程</div>
    <div class="comp-tree">
      <div class="ct-node">检查更新 → UpdateDialog</div>
      <div class="ct-children">
        <div class="ct-node" style="border-left:3px solid var(--green);">[PatchAvailable] → PatchDownloadSourceDialog (镜像源选择)</div>
        <div class="ct-children">
          <div class="ct-node">自动/手动选镜像 → startPatchUpdateWithMirror()</div>
          <div class="ct-node">PatchUpdateProgressDialog (7 阶段)</div>
          <div class="ct-children">
            <div class="ct-node dim">SELECTING_MIRROR → DOWNLOADING_META → DOWNLOADING_PATCH → APPLYING_PATCH → VERIFYING_APK → READY_TO_INSTALL → [ERROR]</div>
          </div>
        </div>
        <div class="ct-node" style="border-left:3px solid var(--blue);">[Available] → FullUpdateMethodDialog (更新方式选择)</div>
        <div class="ct-children">
          <div class="ct-node">"In App" → DownloadSourceDialog → FullUpdateProgressDialog (3 阶段)</div>
          <div class="ct-children">
            <div class="ct-node dim">DOWNLOADING_APK → READY_TO_INSTALL → [ERROR]</div>
          </div>
          <div class="ct-node">"Browser" → DownloadSourceDialog → 浏览器打开下载链接</div>
        </div>
      </div>
    </div>

    <!-- 镜像源选择 -->
    <div class="section-head" style="background:rgba(0,150,136,0.08);border-left-color:#26A69A;font-size:13px;">镜像源选择 (并发探测)</div>
    <div class="flow">
      <span class="flow-step">LaunchedEffect</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">GithubReleaseUtil.probeMirrorUrls(urls)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">MirrorProbeSummary (latency, speed, status)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">按速度排序，OK 优先</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">"Auto Select" 选最快</span>
    </div>
    <p style="margin:4px 0 0 4px;font-size:12px;color:var(--text-dim);">每个镜像行实时显示探测结果：延迟 + 速度，探测中显示 16dp 加载指示器</p>

    <!-- About 对话框 -->
    <div class="section-head red">对话框清单 (8个)</div>
    <table class="act-table">
      <tr><th>对话框</th><th>触发</th><th>功能</th></tr>
      <tr><td>UpdateDialog</td><td>检查更新完成</td><td>显示更新状态 + 下载/更新按钮</td></tr>
      <tr><td>PatchUpdateProgressDialog</td><td>开始增量更新</td><td>7 阶段进度（不可关闭，仅 Cancel/Close）</td></tr>
      <tr><td>FullUpdateProgressDialog</td><td>开始全量更新</td><td>3 阶段进度</td></tr>
      <tr><td>FullUpdateMethodDialog</td><td>全量更新可用</td><td>选择"应用内更新"或"浏览器下载"</td></tr>
      <tr><td>DownloadSourceDialog (浏览器)</td><td>选择浏览器路径</td><td>镜像源探测 + 选择</td></tr>
      <tr><td>DownloadSourceDialog (应用内)</td><td>选择应用内路径</td><td>镜像源探测 + 选择</td></tr>
      <tr><td>PatchDownloadSourceDialog</td><td>增量更新选源</td><td>增量镜像源探测 (patchUrl + metaUrl)</td></tr>
      <tr><td>LicenseDialog</td><td>点击"开源许可证"</td><td>~55 个开源库列表 (名称+描述+许可类型+链接)</td></tr>
    </table>

    <!-- About 私有组件 -->
    <div class="section-head" style="background:rgba(33,150,243,0.08);border-left-color:#42A5F5;font-size:13px;">私有组件</div>
    <table class="act-table">
      <tr><th>组件</th><th>说明</th></tr>
      <tr><td>SettingsGroup</td><td>Surface(圆角18dp, surfaceContainerLow) 包裹 Column</td></tr>
      <tr><td>SettingsRow</td><td>可点击行：38dp 圆形图标 + 标题 + 副标题 + trailing 内容</td></tr>
      <tr><td>HtmlText</td><td>AndroidView 包裹 TextView，支持 HTML 渲染 + 可点击链接</td></tr>
    </table>

    <!-- ===== UpdateHistory ===== -->
    <div class="section-head purple" style="font-size:16px;margin-top:32px;">Screen.UpdateHistory (更新历史)</div>

    <div class="stats" style="margin-bottom:16px;">
      <div class="stat-item"><span class="stat-num">~350</span><span class="stat-label">行代码</span></div>
      <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">对话框</span></div>
      <div class="stat-item"><span class="stat-num">1</span><span class="stat-label">ViewModel</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">UI 状态</span></div>
    </div>

    <div class="flow">
      <span class="flow-step">NavItem.UpdateHistory</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.UpdateHistory.Content()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">UpdateScreen()</span>
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">也可从 AboutScreen "Update Log" 导航到达。主导航页面，无子页面导航</p>

    <!-- UpdateHistory 组件树 -->
    <div class="comp-tree" style="margin-top:16px;">
      <div class="ct-node">UpdateScreen</div>
      <div class="ct-children">
        <div class="ct-node dim">[Loading] CircularProgressIndicator (居中)</div>
        <div class="ct-node dim">[Error] ErrorState</div>
        <div class="ct-children">
          <div class="ct-node">Column: Error图标(64dp) + 标题 + 错误信息 + Retry按钮</div>
        </div>
        <div class="ct-node">[Success] UpdateList → LazyColumn</div>
        <div class="ct-children">
          <div class="ct-node">UpdateCard (latest: primaryContainer/4dp, 其他: surfaceVariant/2dp)</div>
          <div class="ct-children">
            <div class="ct-node">Row: 版本标签 Chip + [isLatest] "LATEST" 绿色徽章 + 日期</div>
            <div class="ct-node">Text (标题, titleLarge, Bold)</div>
            <div class="ct-node">Text (描述, 可展开: &gt;5行或&gt;200字符)</div>
            <div class="ct-node dim">[有 releaseUrl] OutlinedButton ("View Release") + Button ("Download")</div>
          </div>
        </div>
      </div>
    </div>

    <!-- UpdateHistory 状态 -->
    <div class="section-head" style="background:rgba(156,39,176,0.08);border-left-color:#AB47BC;font-size:13px;">状态管理 (UpdateViewModel)</div>
    <table class="act-table">
      <tr><th>状态</th><th>类型</th><th>说明</th></tr>
      <tr><td>uiState</td><td>StateFlow&lt;UpdateUiState&gt;</td><td>Loading / Success(updates) / Error(message)</td></tr>
    </table>
    <p style="margin:4px 0 0 4px;font-size:12px;color:var(--text-dim);">
      Init 自动加载：GitHubApiService.getRepositoryReleases → 过滤 draft/prerelease → 解析日期 → 首条标记 isLatest。无分页（仅第 1 页 20 条）
    </p>

    <!-- UpdateHistory 交互 -->
    <div class="section-head" style="background:rgba(156,39,176,0.08);border-left-color:#AB47BC;font-size:13px;">用户交互</div>
    <table class="act-table">
      <tr><th>交互</th><th>执行动作</th></tr>
      <tr><td>Error → Retry</td><td>viewModel.loadUpdates()</td></tr>
      <tr><td>展开/折叠描述</td><td>切换 isDescriptionExpanded（阈值：&gt;5行 或 &gt;200字符）</td></tr>
      <tr><td>View Release</td><td>Intent(ACTION_VIEW, releaseUrl) → 浏览器</td></tr>
      <tr><td>Download</td><td>Intent(ACTION_VIEW, downloadUrl) → 浏览器</td></tr>
    </table>

    <!-- 三页面对比 -->
    <div class="section-head cyan" style="margin-top:24px;">三页面对比总结</div>
    <table class="act-table">
      <tr><th>维度</th><th>Help</th><th>About</th><th>UpdateHistory</th></tr>
      <tr><td>核心功能</td><td>内嵌 Web 帮助</td><td>应用信息 + 更新管理</td><td>Release 历史</td></tr>
      <tr><td>代码量</td><td>~113 行</td><td>~1872 行</td><td>~350 行</td></tr>
      <tr><td>对话框</td><td>0</td><td>8 个</td><td>0</td></tr>
      <tr><td>ViewModel</td><td>无</td><td>无 (协程 scope)</td><td>UpdateViewModel</td></tr>
      <tr><td>外部数据</td><td>远程 URL</td><td>PackageManager + UpdateManager</td><td>GitHub REST API</td></tr>
      <tr><td>导航输出</td><td>无</td><td>→ UpdateHistory</td><td>无</td></tr>
      <tr><td>特殊关注</td><td>WebView 焦点管理</td><td>多阶段更新安装器 + 镜像测速</td><td>Draft/Prerelease 过滤</td></tr>
    </table>

    <!-- 核心文件 -->
    <div class="section-head">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径</th><th>职责</th></tr>
      <tr><td>HelpScreen</td><td>ui/features/help/screens/HelpScreen.kt</td><td>WebView 帮助页</td></tr>
      <tr><td>AboutScreen</td><td>ui/features/about/screens/AboutScreen.kt</td><td>关于页 + 更新管理 + 8 个弹窗</td></tr>
      <tr><td>OpenSourceLicenses</td><td>ui/features/about/screens/OpenSourceLicenses.kt</td><td>LicenseDialog + 许可证数据</td></tr>
      <tr><td>UpdateScreen</td><td>ui/features/update/screens/UpdateScreen.kt</td><td>更新历史列表</td></tr>
      <tr><td>UpdateViewModel</td><td>ui/features/update/screens/UpdateViewModel.kt</td><td>GitHub Release 数据加载</td></tr>
      <tr><td>UpdateInfo</td><td>ui/features/update/screens/UpdateInfo.kt</td><td>UpdateInfo 数据类 + 解析</td></tr>
    </table>`);
