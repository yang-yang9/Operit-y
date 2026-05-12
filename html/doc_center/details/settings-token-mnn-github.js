registerDetail('settings-token-mnn-github', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">831</span><span class="stat-label">TokenUsage 行数</span></div>
      <div class="stat-item"><span class="stat-num">648</span><span class="stat-label">MnnModel 行数</span></div>
      <div class="stat-item"><span class="stat-num">197</span><span class="stat-label">GitHubAccount 行数</span></div>
      <div class="stat-item"><span class="stat-num">2</span><span class="stat-label">计费模式</span></div>
      <div class="stat-item"><span class="stat-num">8</span><span class="stat-label">饼图最大模型数</span></div>
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">下载状态数</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">OAuth Scope 数</span></div>
    </div>

    <!-- ===== TokenUsageStatisticsScreen ===== -->
    <div class="section-head blue">TokenUsageStatisticsScreen — Token 用量统计</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">按模型追踪 API Token 消耗、请求次数和估算费用。支持逐模型定价编辑（TOKEN / COUNT 两种计费模式）和汇率设置。源码规模：831 行。</p>

    <!-- Component tree (Mermaid) -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["TokenUsageStatisticsScreen&lt;br/&gt;(CustomScaffold + FAB)"]

    ROOT --> FAB["FAB: 重置所有统计 (RestartAlt)"]

    ROOT --> RATE["ExchangeRateSettingsCard&lt;br/&gt;USD→CNY 汇率输入 + Save"]

    ROOT --> SUMMARY["TokenUsageSummarySection"]
    SUMMARY --> S_TOTAL["Row: 总Token / 总请求 / 总费用"]
    SUMMARY --> S_CHAT["Row: 总聊天数 / 总消息数"]
    SUMMARY --> S_DETAIL["SummaryLine: 输入/输出/缓存Token"]

    ROOT --> PIE["ModelUsagePieChart (Canvas绘制)"]
    PIE --> PIE_CHART["饼图 + 图例 (最多8个模型)"]

    ROOT --> CARDS["items: TokenUsageModelCard"]
    CARDS --> CARD["Card (可点击 → 定价编辑)"]
    CARD --> C_NAME["模型名 + BillingMode徽章"]
    CARD --> C_REQ["请求次数"]
    CARD --> C_TOKEN["输入/输出Token + 单价"]
    CARD --> C_COST["总费用 + 单次费用"]
    CARD --> C_RESET["重置按钮 (单模型)"]

    ROOT --> DLG_PRICE["AlertDialog: 定价编辑"]
    DLG_PRICE --> P_MODE["FilterChip: TOKEN / COUNT"]
    DLG_PRICE --> P_TOKEN["[TOKEN] 输入/缓存/输出 价格/百万"]
    DLG_PRICE --> P_COUNT["[COUNT] 单次请求价格"]

    ROOT --> DLG_RESET["AlertDialog: 重置单模型确认"]
    ROOT --> DLG_RESET_ALL["AlertDialog: 重置所有确认"]
    </div>

    <!-- Billing modes -->
    <div class="section-head green" style="margin-top:16px;">计费模型</div>
    <table class="act-table">
      <tr><th>模式</th><th>计算公式</th></tr>
      <tr><td>TOKEN</td><td><code>(非缓存输入/1M × inputPrice) + (输出/1M × outputPrice) + (缓存/1M × cachedPrice)</code></td></tr>
      <tr><td>COUNT</td><td><code>请求次数 × pricePerRequest</code></td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:6px 0 0 2px;">默认定价来源：<code>DefaultModelPricingCollect</code> — 从 <code>ScrapedModelPricingRowsCollect.rows</code>（编译时管道分隔数据集）按提供商 + 模型名匹配默认价格。USD 模型费用通过汇率转换后统一以 CNY 汇总。</p>

    <!-- Pie chart -->
    <div class="section-head" style="margin-top:14px;background:var(--surface-2);color:var(--text);">饼图（Canvas 绘制）</div>
    <p style="font-size:13px;color:var(--text-dim);margin:6px 0 0 4px;">最多 8 个模型（按总 Token 降序排列）。右侧图例显示颜色色块 + 模型名 + 百分比。</p>

    <!-- State management -->
    <div class="section-head" style="margin-top:14px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <p style="font-size:12px;color:var(--text-dim);margin:6px 0 4px 2px;">无 ViewModel。核心数据通过 4 个 LaunchedEffect 加载：</p>
    <table class="act-table">
      <tr><th>LaunchedEffect</th><th>数据</th></tr>
      <tr><td>allProviderModelTokensFlow</td><td>Token 三元组 (input, output, cached) per model</td></tr>
      <tr><td>providerModelTokenUsage.keys</td><td>加载持久化定价覆盖</td></tr>
      <tr><td>一次性（请求计数）</td><td>getAllProviderModelRequestCounts()</td></tr>
      <tr><td>一次性（聊天统计）</td><td>总聊天数 / 消息数 + 汇率</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:8px 0 2px 2px;"><strong>派生状态（derivedStateOf）：</strong></p>
    <ul style="font-size:12px;color:var(--text-dim);margin:0 0 0 18px;padding:0;">
      <li><code>providerModelCosts</code> — 每模型费用 ModelCost(amount, currency)</li>
      <li><code>modelUsageDistribution</code> — 饼图数据</li>
    </ul>

    <!-- ===== MnnModelDownloadScreen ===== -->
    <div class="section-head orange" style="margin-top:28px;">MnnModelDownloadScreen — MNN 模型下载</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">MNN 本地推理模型的在线目录 + 下载管理器。支持搜索、下载 / 暂停 / 恢复 / 重试 / 删除，带实时进度和多文件支持。源码规模：648 行。</p>

    <!-- Mnn component tree -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">MnnModelDownloadScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">Box</div>
        <div class="tree-children">
          <div class="tree-node">[加载中] CircularProgressIndicator + 文本</div>
          <div class="tree-node">[错误] 错误图标 + 错误信息 + Retry 按钮</div>
          <div class="tree-node">[空列表] 空状态文本</div>
          <div class="tree-node">[有数据] Column</div>
          <div class="tree-children">
            <div class="tree-node">Surface: 搜索栏 (Search 图标 + Clear)</div>
            <div class="tree-node">[无结果] 搜索无结果图标 + 文本</div>
            <div class="tree-node">LazyColumn: ModelCard</div>
            <div class="tree-children">
              <div class="tree-node">Surface</div>
              <div class="tree-children">
                <div class="tree-node">Row: 模型名 + 标签（最多 2 个）</div>
                <div class="tree-node">Text: 大小 (GB)</div>
                <div class="tree-node">Text: 描述（1 行省略）</div>
                <div class="tree-node">[状态区域]</div>
                <div class="tree-children">
                  <div class="tree-node">[Idle / 未下载] Button "Download"</div>
                  <div class="tree-node">[Idle / 已下载] CheckCircle + Delete</div>
                  <div class="tree-node">[Connecting] 进度圈 + "Connecting..."</div>
                  <div class="tree-node">[Downloading] 进度条 + 百分比/速度 + Pause</div>
                  <div class="tree-node">[Paused] 进度条 + Resume + Delete</div>
                  <div class="tree-node">[Completed] CheckCircle + Delete</div>
                  <div class="tree-node">[Failed] 错误信息 + Retry</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tree-node">AlertDialog: 删除模型确认</div>
      </div>
    </div>

    <!-- Download state machine -->
    <div class="section-head green" style="margin-top:16px;">下载状态机</div>
    <div class="kn-code" style="margin:8px 0;">Idle → Connecting → Downloading → Completed
                              ↘              → Failed
                               Downloading → Paused → Connecting → Downloading
                               Failed ────────────→ Connecting → Downloading</div>
    <p style="font-size:12px;color:var(--text-dim);margin:6px 0 2px 2px;">状态字段：</p>
    <ul style="font-size:12px;color:var(--text-dim);margin:0 0 0 18px;padding:0;">
      <li><code>Downloading(progress, speed, downloadedBytes, totalBytes, currentFile, currentFileIndex, totalFiles)</code></li>
      <li><code>Paused(progress, downloadedBytes)</code></li>
      <li><code>Failed(error: String)</code></li>
    </ul>

    <!-- Download mechanism -->
    <div class="section-head" style="margin-top:14px;background:var(--surface-2);color:var(--text);">下载机制</div>
    <table class="act-table">
      <tr><th>特性</th><th>说明</th></tr>
      <tr><td>源优先级</td><td>ModelScope &gt; HuggingFace &gt; 首个可用</td></tr>
      <tr><td>单文件</td><td>HEAD 检查已有大小 → GET with <code>Range: bytes=N-</code> 断点续传</td></tr>
      <tr><td>多文件</td><td>ModelScope API 列目录 → 逐文件下载 + 续传</td></tr>
      <tr><td>临时文件</td><td><code>.tmp</code> 后缀，完成后 rename</td></tr>
      <tr><td>进度更新</td><td>每 500ms 刷新</td></tr>
      <tr><td>暂停</td><td>pauseFlags[modelName] = true，循环检查</td></tr>
      <tr><td>存储目录</td><td>Downloads/Operit/models/mnn/&lt;folderName&gt;/</td></tr>
      <tr><td>持久化</td><td>mnn_download_states.json 存储暂停状态，跨重启恢复</td></tr>
    </table>

    <!-- Model catalog -->
    <div class="section-head" style="margin-top:14px;background:var(--surface-2);color:var(--text);">模型目录</div>
    <p style="font-size:13px;color:var(--text-dim);margin:6px 0 4px 2px;">从 <code>https://meta.alicdn.com/data/mnn/apis/model_market.json</code> 获取，失败回退到本地缓存 <code>mnn_model_market_cache.json</code>。</p>
    <div class="kn-code" style="margin:8px 0;">@Serializable
data class MnnModel(
    val modelName: String,
    val size_gb: Double,
    val tags: List&lt;String&gt; = emptyList(),
    val sources: Map&lt;String, String&gt; = emptyMap(),
    val description: String = ""
)</div>

    <!-- Mnn state management -->
    <div class="section-head" style="margin-top:14px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <p style="font-size:13px;color:var(--text-dim);margin:6px 0 0 4px;">无 ViewModel。模型列表为局部状态。下载状态由 <code>MnnModelDownloadManager</code>（单例）管理，每模型一个 <code>MutableStateFlow&lt;DownloadState&gt;</code>，通过 <code>ConcurrentHashMap</code> 存储，跨页面存活。</p>

    <!-- ===== GitHubAccountScreen ===== -->
    <div class="section-head" style="margin-top:28px;background:linear-gradient(90deg,#238636,#2ea043);color:#fff;">GitHubAccountScreen — GitHub 账户</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">最简 Settings 子页面（197 行），纯响应式 UI。仅显示 2 个 Flow + 1 个登出操作，Login 完全委托外部 OAuth。</p>

    <!-- GitHub component tree -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">GitHubAccountScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">Column</div>
        <div class="tree-children">
          <div class="tree-node">Card (surfaceVariant): 身份信息</div>
          <div class="tree-children">
            <div class="tree-node">[已登录]</div>
            <div class="tree-children">
              <div class="tree-node">Image: 头像 (72dp, 圆形, Coil)</div>
              <div class="tree-node">Text: 显示名 (name ?: login)</div>
              <div class="tree-node">Text: @login</div>
              <div class="tree-node">Text: email（可选）</div>
              <div class="tree-node">Text: bio（可选）</div>
              <div class="tree-node">OutlinedButton: Logout</div>
            </div>
            <div class="tree-node">[未登录]</div>
            <div class="tree-children">
              <div class="tree-node">Icon: Person (72dp)</div>
              <div class="tree-node">Text: "Not logged in"</div>
              <div class="tree-node">Button: "Login with GitHub"</div>
            </div>
          </div>
          <div class="tree-node">Card (surface): 账户统计</div>
          <div class="tree-children">
            <div class="tree-node">Text: "Account Info"</div>
            <div class="tree-node">[已登录]</div>
            <div class="tree-children">
              <div class="tree-node">Row: ID</div>
              <div class="tree-node">Row: Public Repos</div>
              <div class="tree-node">Row: Followers</div>
              <div class="tree-node">Row: Following</div>
            </div>
            <div class="tree-node">[未登录] Text: "Info not available"</div>
          </div>
        </div>
      </div>
    </div>

    <!-- GitHub state management -->
    <div class="section-head" style="margin-top:14px;background:var(--surface-2);color:var(--text);">状态管理（2 个 Flow）</div>
    <table class="act-table">
      <tr><th>Flow</th><th>类型</th><th>说明</th></tr>
      <tr><td>githubAuth.isLoggedInFlow</td><td>Flow&lt;Boolean&gt;</td><td>登录状态</td></tr>
      <tr><td>githubAuth.userInfoFlow</td><td>Flow&lt;GitHubUser?&gt;</td><td>用户信息（JSON 反序列化）</td></tr>
    </table>

    <!-- OAuth config -->
    <div class="section-head green" style="margin-top:16px;">OAuth 配置</div>
    <table class="act-table">
      <tr><th>参数</th><th>值</th></tr>
      <tr><td>Scope</td><td>public_repo, user:email, read:user</td></tr>
      <tr><td>Redirect URI</td><td>operit://github-oauth-callback</td></tr>
      <tr><td>CSRF</td><td>32 字符随机 state 参数</td></tr>
    </table>

    <!-- Operations -->
    <div class="section-head" style="margin-top:14px;background:var(--surface-2);color:var(--text);">操作</div>
    <table class="act-table">
      <tr><th>操作</th><th>触发</th><th>流程</th></tr>
      <tr><td>Login</td><td>Button → onLogin()</td><td>委托给外部（OAuth WebView / Custom Tab）</td></tr>
      <tr><td>Logout</td><td>OutlinedButton</td><td>githubAuth.logout() → DataStore.clear() → Flow 重发</td></tr>
    </table>

    <!-- Data model -->
    <div class="section-head" style="margin-top:14px;background:var(--surface-2);color:var(--text);">数据模型</div>
    <div class="kn-code" style="margin:8px 0;">@Serializable
data class GitHubUser(
    val id: Long,
    val login: String,
    val name: String? = null,
    val email: String? = null,
    @SerialName("avatar_url") val avatarUrl: String,
    val bio: String? = null,
    @SerialName("public_repos") val publicRepos: Int? = null,
    val followers: Int? = null,
    val following: Int? = null
)</div>

    <!-- Architecture highlights -->
    <div class="section-head gray" style="margin-top:24px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">📊</div>
        <div class="kn-title blue">TokenUsage 纯计算 UI</div>
        <div class="kn-body">无写入操作（除定价编辑和重置），费用通过 derivedStateOf 纯函数计算，数据由 4 个 LaunchedEffect 驱动。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">⬇️</div>
        <div class="kn-title orange">MnnModel 单例管理器</div>
        <div class="kn-body">MnnModelDownloadManager 在应用作用域内存活，下载任务跨页面跳转不中断，ConcurrentHashMap 保存每模型状态流。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🐙</div>
        <div class="kn-title green">GitHub 零业务逻辑</div>
        <div class="kn-body">最简页面（197 行），仅显示 2 个 Flow + 1 个登出操作，Login 完全委托外部，无本地可变状态。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🚫</div>
        <div class="kn-title">均无 ViewModel</div>
        <div class="kn-body">三个页面均沿用 Manager 单例 + 局部状态模式，下载持久化通过 mnn_download_states.json 跨重启恢复。</div>
      </div>
    </div>

    <!-- Core files -->
    <div class="section-head" style="margin-top:20px;background:var(--surface-2);color:var(--text);">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径</th><th>行数</th><th>职责</th></tr>
      <tr><td><strong>TokenUsageStatisticsScreen</strong></td><td>ui/features/settings/screens/TokenUsageStatisticsScreen.kt</td><td>831</td><td>用量统计 + 定价编辑</td></tr>
      <tr><td>TokenUsageStatisticsComponents</td><td>ui/features/settings/screens/TokenUsageStatisticsComponents.kt</td><td>~100</td><td>SummarySection + SummaryLine</td></tr>
      <tr><td><strong>MnnModelDownloadScreen</strong></td><td>ui/features/settings/screens/MnnModelDownloadScreen.kt</td><td>648</td><td>模型目录 + 下载管理</td></tr>
      <tr><td>MnnModelDownloadManager</td><td>data/mnn/MnnModelDownloadManager.kt</td><td>~500</td><td>下载状态机 + 持久化</td></tr>
      <tr><td><strong>GitHubAccountScreen</strong></td><td>ui/features/settings/screens/GitHubAccountScreen.kt</td><td>197</td><td>GitHub OAuth 显示</td></tr>
      <tr><td>GitHubAuthPreferences</td><td>data/preferences/GitHubAuthPreferences.kt</td><td>~200</td><td>OAuth DataStore + GitHubUser</td></tr>
    </table>
`);
