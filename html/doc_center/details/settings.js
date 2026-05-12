registerDetail('settings', `    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">6</span><span class="stat-label">分组</span></div>
      <div class="stat-item"><span class="stat-num">18</span><span class="stat-label">设置项</span></div>
      <div class="stat-item"><span class="stat-num">22</span><span class="stat-label">子页面</span></div>
      <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">对话框</span></div>
    </div>

    <p style="margin:0 0 16px 4px;font-size:13px;color:var(--text-dim);">设置入口页，以分组卡片列表展示所有设置项。各子页面内部结构将在后续文档中逐一梳理。</p>

    <!-- 入口链路 -->
    <div class="section-head blue">入口链路</div>
    <div class="flow">
      <span class="flow-step">MainActivity (NavItem.Settings)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">OperitApp</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">AppContent</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.Settings.Content()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">SettingsScreen(18个导航回调)</span>
    </div>

    <table class="act-table" style="margin-top:16px;">
      <tr><th>属性</th><th>值</th></tr>
      <tr><td>路由</td><td>NavItem.Settings</td></tr>
      <tr><td>图标</td><td>Icons.Default.Settings</td></tr>
      <tr><td>导航组</td><td>System</td></tr>
      <tr><td>是否叶子节点</td><td>否（22 个子页面）</td></tr>
    </table>

    <!-- 状态管理 -->
    <div class="section-head green">状态管理（无 ViewModel）</div>
    <table class="act-table">
      <tr><th>状态</th><th>类型</th><th>说明</th></tr>
      <tr><td>SettingsScreenScrollPosition</td><td>mutableStateOf&lt;Int&gt; (文件级)</td><td>滚动位置持久化，进程存活期间保留</td></tr>
      <tr><td>isGitHubLoggedIn</td><td>Boolean (StateFlow)</td><td>GitHub 登录状态，控制登录/登出项显示</td></tr>
      <tr><td>gitHubUser</td><td>GitHubUserInfo? (StateFlow)</td><td>登录用户信息，显示 @{login}</td></tr>
      <tr><td>hasBackgroundImage</td><td>Boolean (StateFlow)</td><td>控制 Card 颜色：有壁纸用 surface，无壁纸用 surfaceVariant(0.3f)</td></tr>
    </table>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">
      内联操作：登出直接执行 githubAuth.logout()（不导航）；登录通过 OAuth URL 打开浏览器
    </p>

    <!-- 组件树 Mermaid -->
    <div class="section-head purple">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["SettingsScreen&lt;br/&gt;(Column, verticalScroll, 16dp padding)"]

    ROOT --> SEC_ACCOUNT["SettingsSection: Account&lt;br/&gt;(AccountCircle)"]
    ROOT --> SEC_PERSONAL["SettingsSection: Personalization&lt;br/&gt;(Person)"]
    ROOT --> SEC_AI["SettingsSection: AI Model&lt;br/&gt;(Settings)"]
    ROOT --> SEC_PROMPT["SettingsSection: Prompt&lt;br/&gt;(Message)"]
    ROOT --> SEC_CONTEXT["SettingsSection: Context &amp; Summary&lt;br/&gt;(Analytics)"]
    ROOT --> SEC_DATA["SettingsSection: Data &amp; Permissions&lt;br/&gt;(Security)"]

    SEC_ACCOUNT --> ITEM_GITHUB["CompactSettingsItem: GitHub Account"]
    SEC_ACCOUNT --> ITEM_LOGIN["CompactSettingsItem: Login/Logout&lt;br/&gt;(条件渲染)"]

    SEC_PERSONAL --> ITEM_PREFS["CompactSettingsItem: User Preferences"]
    SEC_PERSONAL --> ITEM_LANG["CompactSettingsItem: Language"]
    SEC_PERSONAL --> ITEM_THEME["CompactSettingsItem: Theme"]
    SEC_PERSONAL --> ITEM_DISPLAY["CompactSettingsItem: Global Display"]
    SEC_PERSONAL --> ITEM_LAYOUT["CompactSettingsItem: Layout"]

    SEC_AI --> ITEM_MODEL["CompactSettingsItem: Model Parameters"]
    SEC_AI --> ITEM_FUNC["CompactSettingsItem: Functional Model"]
    SEC_AI --> ITEM_SPEECH["CompactSettingsItem: Speech Services"]

    SEC_PROMPT --> ITEM_PROMPTS["CompactSettingsItem: System Prompts"]
    SEC_PROMPT --> ITEM_PERSONA["CompactSettingsItem: Persona Card"]
    SEC_PROMPT --> ITEM_WAIFU["CompactSettingsItem: Waifu Mode"]

    SEC_CONTEXT --> ITEM_CTX["CompactSettingsItem: Context Summary"]

    SEC_DATA --> ITEM_PERM["CompactSettingsItem: Tool Permissions"]
    SEC_DATA --> ITEM_HTTP["CompactSettingsItem: External HTTP Chat"]
    SEC_DATA --> ITEM_BACKUP["CompactSettingsItem: Data Backup"]
    SEC_DATA --> ITEM_HISTORY["CompactSettingsItem: Chat History"]
    SEC_DATA --> ITEM_TOKEN["CompactSettingsItem: Token Usage"]
    </div>

    <!-- 组件结构文本版 -->
    <div style="margin-top:16px;">
      <strong style="font-size:13px;color:var(--text-sec);">SettingsSection 结构</strong>
      <div class="comp-tree" style="margin-top:8px;">
        <div class="ct-node">Row (Icon + Text(title, Bold)) → 分组标题</div>
        <div class="ct-node">Card (cardContainerColor, 圆角) → 分组容器</div>
        <div class="ct-children">
          <div class="ct-node">Column → 设置项列表</div>
        </div>
      </div>
    </div>
    <div style="margin-top:12px;">
      <strong style="font-size:13px;color:var(--text-sec);">CompactSettingsItem 结构</strong>
      <div class="comp-tree" style="margin-top:8px;">
        <div class="ct-node">Row (clickable, padding 12dp h / 10dp v)</div>
        <div class="ct-children">
          <div class="ct-node">Icon (20dp, 40% alpha)</div>
          <div class="ct-node">Column (weight=1f): title (bodyMedium) + subtitle (bodySmall, 60% alpha, 2行)</div>
          <div class="ct-node">Icon (ChevronRight, 16dp, 30% alpha)</div>
        </div>
      </div>
    </div>

    <!-- 完整设置项列表 -->
    <div class="section-head orange">完整设置项列表</div>

    <div class="section-head" style="background:rgba(33,150,243,0.08);border-left-color:#42A5F5;font-size:13px;">Account (账户)</div>
    <table class="act-table">
      <tr><th>设置项</th><th>图标</th><th>目标页面</th><th>说明</th></tr>
      <tr><td>GitHub Account</td><td>Person</td><td>Screen.GitHubAccount</td><td>显示 @{login} 或"未登录"</td></tr>
      <tr><td>Logout</td><td>Logout</td><td>内联操作</td><td>仅已登录时显示</td></tr>
      <tr><td>Login with GitHub</td><td>Login</td><td>内联操作</td><td>仅未登录时显示</td></tr>
    </table>

    <div class="section-head" style="background:rgba(76,175,80,0.08);border-left-color:#66BB6A;font-size:13px;">Personalization (个性化)</div>
    <table class="act-table">
      <tr><th>设置项</th><th>图标</th><th>目标页面</th></tr>
      <tr><td>User Preferences</td><td>Face</td><td>Screen.UserPreferencesSettings</td></tr>
      <tr><td>Language Settings</td><td>Language</td><td>Screen.LanguageSettings</td></tr>
      <tr><td>Theme &amp; Appearance</td><td>Palette</td><td>Screen.ThemeSettings</td></tr>
      <tr><td>Global Display</td><td>Visibility</td><td>Screen.GlobalDisplaySettings</td></tr>
      <tr><td>Layout Adjustment</td><td>AspectRatio</td><td>Screen.LayoutAdjustmentSettings</td></tr>
    </table>

    <div class="section-head" style="background:rgba(156,39,176,0.08);border-left-color:#AB47BC;font-size:13px;">AI Model Configuration (AI 模型配置)</div>
    <table class="act-table">
      <tr><th>设置项</th><th>图标</th><th>目标页面</th></tr>
      <tr><td>Model Parameters</td><td>Api</td><td>Screen.ModelConfig</td></tr>
      <tr><td>Functional Model</td><td>Tune</td><td>Screen.FunctionalConfig</td></tr>
      <tr><td>Speech Services</td><td>RecordVoiceOver</td><td>Screen.SpeechServicesSettings</td></tr>
    </table>

    <div class="section-head" style="background:rgba(255,152,0,0.08);border-left-color:#FFA726;font-size:13px;">Prompt Configuration (提示词配置)</div>
    <table class="act-table">
      <tr><th>设置项</th><th>图标</th><th>目标页面</th></tr>
      <tr><td>System Prompts</td><td>ChatBubble</td><td>Screen.ModelPromptsSettings</td></tr>
      <tr><td>Persona Card Generation</td><td>Face</td><td>Screen.PersonaCardGeneration</td></tr>
      <tr><td>Waifu Mode Settings</td><td>EmojiEmotions</td><td>Screen.WaifuModeSettings</td></tr>
    </table>

    <div class="section-head" style="background:rgba(0,150,136,0.08);border-left-color:#26A69A;font-size:13px;">Context &amp; Summary Settings (上下文与总结)</div>
    <table class="act-table">
      <tr><th>设置项</th><th>图标</th><th>目标页面</th></tr>
      <tr><td>Context Summary</td><td>Tune</td><td>Screen.ContextSummarySettings</td></tr>
    </table>

    <div class="section-head" style="background:rgba(244,67,54,0.08);border-left-color:#EF5350;font-size:13px;">Data &amp; Permissions (数据与权限)</div>
    <table class="act-table">
      <tr><th>设置项</th><th>图标</th><th>目标页面</th></tr>
      <tr><td>Tool Permissions</td><td>AdminPanelSettings</td><td>Screen.ToolPermission</td></tr>
      <tr><td>External HTTP Chat</td><td>SettingsEthernet</td><td>Screen.ExternalHttpChatSettings</td></tr>
      <tr><td>Data Backup</td><td>CloudUpload</td><td>Screen.ChatBackupSettings</td></tr>
      <tr><td>Chat History Management</td><td>ManageHistory</td><td>Screen.ChatHistorySettings</td></tr>
      <tr><td>Token Usage Statistics</td><td>Analytics</td><td>Screen.TokenUsageStatistics</td></tr>
    </table>

    <!-- 子页面导航关系 -->
    <div class="section-head cyan">子页面导航关系</div>
    <div class="mermaid">
graph TD
    SETTINGS["Screen.Settings&lt;br/&gt;(入口页)"]

    SETTINGS --> GITHUB["Screen.GitHubAccount"]
    SETTINGS --> USER_PREFS["Screen.UserPreferencesSettings"]
    USER_PREFS --> USER_GUIDE["Screen.UserPreferencesGuide&lt;br/&gt;(profileName, profileId)"]
    USER_GUIDE -.-> SHIZUKU["Screen.ShizukuCommands&lt;br/&gt;(跨导航树)"]
    SETTINGS --> LANG["Screen.LanguageSettings"]
    SETTINGS --> THEME["Screen.ThemeSettings"]
    SETTINGS --> GLOBAL_DISP["Screen.GlobalDisplaySettings"]
    SETTINGS --> LAYOUT["Screen.LayoutAdjustmentSettings"]

    SETTINGS --> MODEL_CFG["Screen.ModelConfig"]
    MODEL_CFG --> MNN["Screen.MnnModelDownload"]
    SETTINGS --> FUNC_CFG["Screen.FunctionalConfig"]
    FUNC_CFG -.-> MODEL_CFG
    SETTINGS --> SPEECH["Screen.SpeechServicesSettings"]
    SPEECH -.-> TTS["Screen.TextToSpeech&lt;br/&gt;(parentScreen=Toolbox)"]

    SETTINGS --> PROMPTS["Screen.ModelPromptsSettings"]
    PROMPTS --> TAG_MKT["Screen.TagMarket"]
    PROMPTS -.-> PERSONA["Screen.PersonaCardGeneration"]
    PROMPTS -.-> CHAT_HIST["Screen.ChatHistorySettings"]
    SETTINGS --> PERSONA
    PERSONA -.-> SETTINGS
    PERSONA -.-> USER_PREFS
    PERSONA -.-> MODEL_CFG
    PERSONA -.-> PROMPTS
    SETTINGS --> WAIFU["Screen.WaifuModeSettings"]
    WAIFU --> EMOJI["Screen.CustomEmojiManagement"]

    SETTINGS --> CTX_SUM["Screen.ContextSummarySettings"]
    SETTINGS --> TOOL_PERM["Screen.ToolPermission"]
    SETTINGS --> EXT_HTTP["Screen.ExternalHttpChatSettings"]
    SETTINGS --> BACKUP["Screen.ChatBackupSettings"]
    SETTINGS --> CHAT_HIST
    SETTINGS --> TOKEN_USAGE["Screen.TokenUsageStatistics"]
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">实线 = 标准父子导航 (parentScreen 关系)，虚线 = 交叉导航 (跨分支或跨导航树)</p>

    <!-- 非直达子页面 -->
    <div class="section-head" style="background:rgba(255,152,0,0.08);border-left-color:#FFA726;font-size:13px;">非直达子页面（从入口页无法直接到达）</div>
    <table class="act-table">
      <tr><th>子页面</th><th>需经过</th></tr>
      <tr><td>Screen.UserPreferencesGuide</td><td>UserPreferencesSettings</td></tr>
      <tr><td>Screen.TagMarket</td><td>ModelPromptsSettings</td></tr>
      <tr><td>Screen.MnnModelDownload</td><td>ModelConfig</td></tr>
      <tr><td>Screen.CustomEmojiManagement</td><td>WaifuModeSettings</td></tr>
    </table>

    <!-- 交叉导航 -->
    <div class="section-head" style="background:rgba(244,67,54,0.08);border-left-color:#EF5350;font-size:13px;">交叉导航（跨分支或跨导航树）</div>
    <table class="act-table">
      <tr><th>源页面</th><th>目标页面</th><th>说明</th></tr>
      <tr><td>FunctionalConfig</td><td>ModelConfig</td><td>同级跨链接</td></tr>
      <tr><td>SpeechServicesSettings</td><td>TextToSpeech</td><td>跨到 Toolbox 导航树 (parentScreen=Toolbox)</td></tr>
      <tr><td>PersonaCardGeneration</td><td>Settings / UserPreferences / ModelConfig / ModelPrompts</td><td>多向交叉</td></tr>
      <tr><td>ModelPromptsSettings</td><td>PersonaCardGeneration / ChatHistorySettings</td><td>同级跨链接</td></tr>
      <tr><td>UserPreferencesGuide</td><td>ShizukuCommands</td><td>跨到 ShizukuCommands 导航树</td></tr>
    </table>

    <!-- 返回导航规则 -->
    <div class="section-head" style="background:rgba(0,150,136,0.08);border-left-color:#26A69A;font-size:13px;">返回导航规则</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">大部分子页面 parentScreen = Settings，返回键直接回入口页。例外：</p>
    <table class="act-table">
      <tr><th>子页面</th><th>返回目标</th></tr>
      <tr><td>TagMarket</td><td>ModelPromptsSettings</td></tr>
      <tr><td>CustomEmojiManagement</td><td>WaifuModeSettings</td></tr>
      <tr><td>UserPreferencesGuide</td><td>Settings（跳过 UserPreferencesSettings）</td></tr>
    </table>

    <!-- 架构要点 -->
    <div class="section-head green">架构要点</div>
    <div class="key-nodes-grid" style="grid-template-columns:1fr;">
      <div class="key-node-card" style="border-left:3px solid var(--blue);">
        <strong>无 ViewModel</strong>
        <p>入口页仅作导航枢纽，所有状态为局部 remember 或 DataStore Flow</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--green);">
        <strong>文件级滚动持久化</strong>
        <p>SettingsScreenScrollPosition 定义为文件级 mutableStateOf，在进程存活期间跨导航保留滚动位置（比 rememberSaveable 更持久但不跨进程）</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--purple);">
        <strong>导航解耦</strong>
        <p>SettingsScreen 通过 18 个回调 lambda 导航，不依赖 Screen 或路由系统</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--orange);">
        <strong>Card 透明度自适应</strong>
        <p>根据 hasBackgroundImage 切换 Card 颜色——有壁纸时不透明 (surface)，无壁纸时半透明 (surfaceVariant 0.3f)</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--cyan);">
        <strong>GitHub OAuth 内联</strong>
        <p>登录/登出操作直接在入口页执行（OAuth URL → 浏览器 / githubAuth.logout()），不需要导航到子页面</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--red);">
        <strong>交叉导航网络</strong>
        <p>子页面之间存在大量交叉链接（PersonaCardGeneration 可到 4 个不同页面），导航图不是简单的树形结构而是有向图</p>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径</th><th>职责</th></tr>
      <tr><td>SettingsScreen</td><td>ui/features/settings/screens/SettingsScreen.kt</td><td>入口页 + CompactSettingsItem/SettingsSection 组件</td></tr>
      <tr><td>OperitScreens</td><td>ui/main/screens/OperitScreens.kt</td><td>22 个 Settings 子 Screen 定义 + 导航回调绑定</td></tr>
    </table>

    <!-- 子页面文件索引 -->
    <div class="section-head" style="background:rgba(156,39,176,0.08);border-left-color:#AB47BC;font-size:13px;">22 个子页面文件索引</div>
    <table class="act-table">
      <tr><th>子页面</th><th>文件 (ui/features/settings/screens/)</th></tr>
      <tr><td>GitHubAccountScreen</td><td>GitHubAccountScreen.kt</td></tr>
      <tr><td>UserPreferencesSettingsScreen</td><td>UserPreferencesSettingsScreen.kt</td></tr>
      <tr><td>UserPreferencesGuideScreen</td><td>UserPreferencesGuideScreen.kt</td></tr>
      <tr><td>LanguageSettingsScreen</td><td>LanguageSettingsScreen.kt</td></tr>
      <tr><td>ThemeSettingsScreen</td><td>ThemeSettingsScreen.kt</td></tr>
      <tr><td>GlobalDisplaySettingsScreen</td><td>GlobalDisplaySettingsScreen.kt</td></tr>
      <tr><td>LayoutAdjustmentSettingsScreen</td><td>LayoutAdjustmentSettingsScreen.kt</td></tr>
      <tr><td>ModelConfigScreen</td><td>ModelConfigScreen.kt</td></tr>
      <tr><td>FunctionalConfigScreen</td><td>FunctionalConfigScreen.kt</td></tr>
      <tr><td>SpeechServicesSettingsScreen</td><td>SpeechServicesSettingsScreen.kt</td></tr>
      <tr><td>ModelPromptsSettingsScreen</td><td>ModelPromptsSettingsScreen.kt</td></tr>
      <tr><td>TagMarketScreen</td><td>TagMarketScreen.kt</td></tr>
      <tr><td>PersonaCardGenerationScreen</td><td>PersonaCardGenerationScreen.kt</td></tr>
      <tr><td>WaifuModeSettingsScreen</td><td>WaifuModeSettingsScreen.kt</td></tr>
      <tr><td>CustomEmojiManagementScreen</td><td>CustomEmojiManagementScreen.kt</td></tr>
      <tr><td>ContextSummarySettingsScreen</td><td>ContextSummarySettingsScreen.kt</td></tr>
      <tr><td>ToolPermissionSettingsScreen</td><td>ToolPermissionSettingsScreen.kt</td></tr>
      <tr><td>ExternalHttpChatSettingsScreen</td><td>ExternalHttpChatSettingsScreen.kt</td></tr>
      <tr><td>ChatBackupSettingsScreen</td><td>ChatBackupSettingsScreen.kt</td></tr>
      <tr><td>ChatHistorySettingsScreen</td><td>ChatHistorySettingsScreen.kt</td></tr>
      <tr><td>TokenUsageStatisticsScreen</td><td>TokenUsageStatisticsScreen.kt</td></tr>
      <tr><td>MnnModelDownloadScreen</td><td>MnnModelDownloadScreen.kt</td></tr>
    </table>`);
