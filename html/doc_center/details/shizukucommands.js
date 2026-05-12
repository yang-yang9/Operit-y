registerDetail('shizukucommands', `    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">权限等级</span></div>
      <div class="stat-item"><span class="stat-num">12</span><span class="stat-label">权限状态字段</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">设置向导</span></div>
      <div class="stat-item"><span class="stat-num">1</span><span class="stat-label">对话框</span></div>
    </div>

    <!-- 入口链路 -->
    <div class="section-head blue">入口链路</div>
    <div class="flow">
      <span class="flow-step">MainActivity (NavItem.ShizukuCommands)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">OperitApp</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">AppContent</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.ShizukuCommands.Content()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">ShizukuDemoScreen(navigateTo)</span>
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">也可从 UserPreferencesGuide 引导页面跳入</p>

    <!-- 导航属性 -->
    <table class="act-table" style="margin-top:16px;">
      <tr><th>属性</th><th>值</th></tr>
      <tr><td>路由</td><td>NavItem.ShizukuCommands</td></tr>
      <tr><td>图标</td><td>Icons.Default.AdminPanelSettings</td></tr>
      <tr><td>导航组</td><td>Tools</td></tr>
      <tr><td>是否叶子节点</td><td>否（可导航到 TerminalSetup）</td></tr>
    </table>

    <!-- 状态管理 -->
    <div class="section-head green">状态管理 (ShizukuDemoViewModel)</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">AndroidViewModel，持有 DemoStateManager(application, viewModelScope)，暴露 StateFlow&lt;DemoScreenState&gt;</p>

    <div class="section-head" style="background:rgba(76,175,80,0.08);border-left-color:#66BB6A;font-size:13px;">权限状态（12 个布尔值）</div>
    <table class="act-table">
      <tr><th>字段</th><th>说明</th></tr>
      <tr><td>isShizukuInstalled</td><td>Shizuku 是否已安装</td></tr>
      <tr><td>isShizukuRunning</td><td>Shizuku 服务是否运行</td></tr>
      <tr><td>hasShizukuPermission</td><td>应用是否获得 Shizuku 权限</td></tr>
      <tr><td>isOperitTerminalInstalled</td><td>NodeJS+Python 环境是否就绪</td></tr>
      <tr><td>hasStoragePermission</td><td>存储权限</td></tr>
      <tr><td>hasOverlayPermission</td><td>悬浮窗权限</td></tr>
      <tr><td>hasBatteryOptimizationExemption</td><td>电池优化豁免</td></tr>
      <tr><td>hasAccessibilityServiceEnabled</td><td>无障碍服务启用</td></tr>
      <tr><td>isAccessibilityProviderInstalled</td><td>无障碍 Provider APK 安装</td></tr>
      <tr><td>hasLocationPermission</td><td>位置权限</td></tr>
      <tr><td>isDeviceRooted</td><td>设备是否 Root</td></tr>
      <tr><td>hasRootAccess</td><td>应用是否获得 Root 权限</td></tr>
    </table>

    <div class="section-head" style="background:rgba(76,175,80,0.08);border-left-color:#66BB6A;font-size:13px;">UI 控制状态</div>
    <table class="act-table">
      <tr><th>字段</th><th>说明</th></tr>
      <tr><td>isLoading</td><td>初始化加载</td></tr>
      <tr><td>isRefreshing</td><td>刷新中（旋转图标）</td></tr>
      <tr><td>showShizukuWizard</td><td>Shizuku 向导展开</td></tr>
      <tr><td>showAccessibilityWizard</td><td>无障碍向导展开</td></tr>
      <tr><td>showRootWizard</td><td>Root 向导展开</td></tr>
      <tr><td>showOperitTerminalWizard</td><td>终端向导展开</td></tr>
    </table>

    <p style="margin:12px 0 0 4px;font-size:12px;color:var(--text-dim);">
      本地状态：currentDisplayedPermissionLevel (浏览等级 Tab)、isInitialized、refreshRotation (刷新图标旋转角度)<br/>
      响应式监听：DisposableEffect 注册 ShizukuAuthorizer.stateChangeListener + DemoStateManager.init 内部监听（双层监听）
    </p>

    <!-- 组件树 Mermaid -->
    <div class="section-head purple">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["ShizukuDemoScreen&lt;br/&gt;(Column, verticalScroll, 16dp padding)"]

    ROOT --> LOADING["CircularProgressIndicator&lt;br/&gt;(isLoading 时显示)"]
    ROOT --> PLC["PermissionLevelCard&lt;br/&gt;(权限等级选择与状态)"]
    ROOT --> WIZARD_AREA["Setup Wizard Area&lt;br/&gt;(条件显示)"]

    PLC --> TAB_ROW["ScrollableTabRow (5 个等级)"]
    TAB_ROW --> TAB_STD["STANDARD"]
    TAB_ROW --> TAB_A11Y["ACCESSIBILITY"]
    TAB_ROW --> TAB_DBG["DEBUGGER"]
    TAB_ROW --> TAB_ADM["ADMIN"]
    TAB_ROW --> TAB_ROOT["ROOT"]

    PLC --> LEVEL_DESC["AnimatedContent: PermissionLevelVisualDescription"]
    LEVEL_DESC --> FEATURE_GRID["FeatureGrid (3列9项功能矩阵)"]

    PLC --> STATUS_ROW["Box: 状态行"]
    STATUS_ROW --> SET_BTN["Button: '设为当前等级'&lt;br/&gt;(浏览≠活跃时)"]
    STATUS_ROW --> CURRENT["CheckCircle: '当前使用等级'&lt;br/&gt;(浏览==活跃时)"]
    STATUS_ROW --> REFRESH["IconButton: 刷新 (旋转动画)"]

    PLC --> PERM_SECTION["AnimatedContent: 权限状态区"]
    PERM_SECTION --> SEC_STD["StandardPermissionSection"]
    PERM_SECTION --> SEC_A11Y["AccessibilityPermissionSection"]
    PERM_SECTION --> SEC_DBG["DebuggerPermissionSection&lt;br/&gt;(含 Shizuku 状态行)"]
    PERM_SECTION --> SEC_ADM["AdminPermissionSection&lt;br/&gt;(含'版本不支持'横幅)"]
    PERM_SECTION --> SEC_ROOT["RootPermissionSection&lt;br/&gt;(含 Root 状态行 + 信息横幅)"]

    WIZARD_AREA --> A11Y_WIZ["AccessibilityWizardCard&lt;br/&gt;(步骤: 安装Provider → 启用服务)"]
    WIZARD_AREA --> ROOT_WIZ["RootWizardCard&lt;br/&gt;(分支: 已Root/未授权/未Root)"]
    WIZARD_AREA --> SHIZUKU_WIZ["ShizukuWizardCard&lt;br/&gt;(3步: 安装 → 启动 → 授权)"]
    WIZARD_AREA --> TERM_WIZ["OperitTerminalWizardCard&lt;br/&gt;(pnpm+pip 状态 → 终端配置)"]
    </div>

    <!-- 组件树 文本版 -->
    <div class="comp-tree" style="margin-top:16px;">
      <div class="ct-node">ShizukuDemoScreen (Column, verticalScroll)</div>
      <div class="ct-children">
        <div class="ct-node dim">[isLoading] CircularProgressIndicator</div>
        <div class="ct-node">PermissionLevelCard</div>
        <div class="ct-children">
          <div class="ct-node">ScrollableTabRow (5 个等级 Tab)</div>
          <div class="ct-node">AnimatedContent → PermissionLevelVisualDescription → FeatureGrid (3列9项)</div>
          <div class="ct-node">状态行: "设为当前等级" 按钮 / "当前使用等级" 标签 + 刷新按钮</div>
          <div class="ct-node">AnimatedContent → PermissionSection (按等级切换)</div>
          <div class="ct-children">
            <div class="ct-node">StandardPermissionSection (存储/悬浮窗/电池/位置/终端)</div>
            <div class="ct-node">AccessibilityPermissionSection (+ 无障碍服务状态)</div>
            <div class="ct-node">DebuggerPermissionSection (+ Shizuku 状态行)</div>
            <div class="ct-node dim">AdminPermissionSection (显示"版本不支持"横幅)</div>
            <div class="ct-node">RootPermissionSection (+ Root 状态行 + 信息横幅)</div>
          </div>
        </div>
        <div class="ct-node">Setup Wizard Area (needSetupGuide 时显示)</div>
        <div class="ct-children">
          <div class="ct-node">AccessibilityWizardCard (安装Provider → 启用服务)</div>
          <div class="ct-node">RootWizardCard (分支式：已授权/未授权/未Root)</div>
          <div class="ct-node">ShizukuWizardCard (3步线性：安装→启动→授权)</div>
          <div class="ct-node">OperitTerminalWizardCard (pnpm+pip → 终端配置)</div>
        </div>
      </div>
    </div>

    <!-- 权限等级系统 -->
    <div class="section-head orange">权限等级系统</div>
    <table class="act-table">
      <tr><th>等级</th><th>说明</th><th>特有权限</th></tr>
      <tr><td><strong>STANDARD</strong></td><td>基础权限</td><td>存储、悬浮窗、电池优化、位置、OperitTerminal</td></tr>
      <tr><td><strong>ACCESSIBILITY</strong></td><td>无障碍</td><td>+ 无障碍服务</td></tr>
      <tr><td><strong>DEBUGGER</strong></td><td>调试级</td><td>+ Shizuku 服务</td></tr>
      <tr><td style="color:var(--text-dim);">ADMIN</td><td style="color:var(--text-dim);">管理级</td><td style="color:var(--text-dim);">当前版本不支持（占位）</td></tr>
      <tr><td><strong>ROOT</strong></td><td>Root 级</td><td>+ Root 访问权限</td></tr>
    </table>

    <div style="margin:16px 0;">
      <strong style="font-size:13px;color:var(--text-sec);">FeatureGrid (3列9项)</strong>
      <p style="font-size:12px;color:var(--text-dim);margin:4px 0 0 0;">支持: CheckCircle (primary) + 功能名 ｜ 不支持: Cancel (onSurfaceVariant 38%) + 淡色功能名</p>
    </div>

    <div style="margin:16px 0;">
      <strong style="font-size:13px;color:var(--text-sec);">权限状态行 (PermissionStatusItem)</strong>
      <div class="comp-tree" style="margin-top:8px;">
        <div class="ct-node">Row (clickable)</div>
        <div class="ct-children">
          <div class="ct-node">状态点 (12dp 圆形): 已授权 Green / 未授权 Red / 需更新 Amber</div>
          <div class="ct-node">Column: 权限名 + 描述</div>
          <div class="ct-node">ChevronRight Icon</div>
        </div>
      </div>
    </div>

    <p style="font-size:12px;color:var(--text-dim);margin:8px 0 0 4px;">
      <strong>切换等级副作用：</strong>持久化到 androidPermissionPreferences → 触发 AIToolHandler.reset() + registerDefaultTools() 重新注册所有 AI 工具
    </p>

    <!-- 设置向导详解 -->
    <div class="section-head cyan">设置向导详解</div>
    <p style="margin:0 0 12px 4px;font-size:12px;color:var(--text-dim);">向导区域仅在 needSetupGuide 为 true 时显示，每个向导仅在对应条件下渲染</p>

    <!-- Shizuku 向导 -->
    <div class="section-head" style="background:rgba(33,150,243,0.08);border-left-color:#42A5F5;font-size:13px;">ShizukuWizardCard — 线性 3 步</div>
    <table class="act-table">
      <tr><th>步骤</th><th>条件</th><th>UI</th><th>操作</th></tr>
      <tr>
        <td>1. 安装</td><td>!isShizukuInstalled</td>
        <td>"Install Bundled" 按钮</td>
        <td>从 assets 提取 APK → FileProvider URI → ACTION_VIEW 安装</td>
      </tr>
      <tr>
        <td>2. 启动</td><td>!isShizukuRunning</td>
        <td>方法1/2 说明 + "Open Docs" + "Open Shizuku"</td>
        <td>打开文档/Shizuku 应用</td>
      </tr>
      <tr>
        <td>3. 授权</td><td>!hasShizukuPermission</td>
        <td>"Grant Permission" 按钮</td>
        <td>ShizukuAuthorizer.requestShizukuPermission()</td>
      </tr>
      <tr>
        <td>完成</td><td>全部就绪</td>
        <td>成功提示 + [可选]更新区域</td>
        <td>版本对比 + Update 按钮</td>
      </tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0 0 4px;">进度条值：0 → 0.33 → 0.66 → 1.0</p>

    <!-- Accessibility 向导 -->
    <div class="section-head" style="background:rgba(76,175,80,0.08);border-left-color:#66BB6A;font-size:13px;">AccessibilityWizardCard — 2 步</div>
    <table class="act-table">
      <tr><th>步骤</th><th>条件</th><th>UI</th><th>操作</th></tr>
      <tr>
        <td>1. 安装 Provider</td><td>!isProviderInstalled</td>
        <td>"Install" 按钮 → 风险确认弹窗</td>
        <td>输入确认文字 → UIHierarchyManager.launchProviderInstall()</td>
      </tr>
      <tr>
        <td>2. 启用服务</td><td>!isServiceEnabled</td>
        <td>"Open Settings" 按钮</td>
        <td>跳转无障碍设置</td>
      </tr>
    </table>

    <!-- Root 向导 -->
    <div class="section-head" style="background:rgba(244,67,54,0.08);border-left-color:#EF5350;font-size:13px;">RootWizardCard — 分支式</div>
    <table class="act-table">
      <tr><th>状态</th><th>UI</th></tr>
      <tr><td>已授权 Root</td><td>成功提示 + "Test Command" 按钮</td></tr>
      <tr><td>设备已 Root 但未授权</td><td>说明 + "Request" 按钮 + "Tutorial" 按钮</td></tr>
      <tr><td>设备未 Root</td><td>风险警告 (errorContainer) + "View Tutorial" → Magisk 网站</td></tr>
    </table>

    <!-- Terminal 向导 -->
    <div class="section-head" style="background:rgba(156,39,176,0.08);border-left-color:#AB47BC;font-size:13px;">OperitTerminalWizardCard</div>
    <table class="act-table">
      <tr><th>状态</th><th>UI</th></tr>
      <tr><td>未就绪</td><td>描述 + "Go to Terminal Config" 按钮 → Screen.TerminalSetup</td></tr>
      <tr><td>已就绪</td><td>确认文字 + "Open Terminal" 按钮</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0 0 4px;">状态行显示 pnpm 和 pip 各自的安装状态（独立检查）</p>

    <!-- 向导显示条件 -->
    <div class="section-head" style="background:rgba(255,152,0,0.08);border-left-color:#FFA726;font-size:13px;">向导显示条件</div>
    <table class="act-table">
      <tr><th>向导</th><th>显示条件</th></tr>
      <tr><td>Shizuku</td><td>浏览 DEBUGGER 等级 + (未安装/未运行/未授权/需更新)</td></tr>
      <tr><td>Accessibility</td><td>浏览 ACCESSIBILITY 等级 + (未安装 Provider/未启用服务)</td></tr>
      <tr><td>Root</td><td>浏览 ROOT 等级 + (未授权 Root)</td></tr>
      <tr><td>OperitTerminal</td><td>浏览任意等级 + (终端未就绪)</td></tr>
    </table>

    <!-- 对话框 -->
    <div class="section-head red">对话框</div>
    <table class="act-table">
      <tr><th>对话框</th><th>触发条件</th><th>功能</th></tr>
      <tr><td>风险确认 AlertDialog</td><td>无障碍向导 "Install" 按钮</td><td>用户必须输入精确确认文字才能安装 Provider APK，输入错误显示错误状态</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0 0 4px;">注：CommandResultDialog、SampleCommandsCard 等组件已定义但未使用</p>

    <!-- 交互映射 -->
    <div class="section-head blue">用户交互 → 动作映射</div>
    <table class="act-table">
      <tr><th>交互</th><th>执行动作</th></tr>
      <tr><td>等级 Tab 切换</td><td>更新 displayedPermissionLevel，AnimatedContent 滑动过渡</td></tr>
      <tr><td>"Set as current level"</td><td>持久化等级 → AIToolHandler.reset() + 重新注册工具</td></tr>
      <tr><td>刷新按钮</td><td>清除版本缓存 → viewModel.refreshStatus() + 旋转动画</td></tr>
      <tr><td>存储权限行点击</td><td>跳转 ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION (API 30+)</td></tr>
      <tr><td>悬浮窗权限行点击</td><td>跳转 ACTION_MANAGE_OVERLAY_PERMISSION</td></tr>
      <tr><td>电池优化行点击</td><td>跳转 ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS</td></tr>
      <tr><td>位置权限行点击</td><td>系统权限弹窗 (FINE + COARSE)</td></tr>
      <tr><td>Shizuku Install Bundled</td><td>从 assets 提取 APK → FileProvider → 系统安装</td></tr>
      <tr><td>Shizuku Grant Permission</td><td>ShizukuAuthorizer.requestShizukuPermission()</td></tr>
      <tr><td>Accessibility Install</td><td>风险确认弹窗 → UIHierarchyManager.launchProviderInstall()</td></tr>
      <tr><td>Root Request</td><td>RootAuthorizer.requestRootPermission()</td></tr>
      <tr><td>Terminal Config</td><td>导航到 Screen.TerminalSetup</td></tr>
    </table>

    <!-- 数据模型 -->
    <div class="section-head purple">数据模型</div>
    <table class="act-table">
      <tr><th>模型</th><th>说明</th></tr>
      <tr><td>AndroidPermissionLevel</td><td>枚举：STANDARD, ACCESSIBILITY, DEBUGGER, ADMIN, ROOT</td></tr>
      <tr><td>DemoScreenState</td><td>20+ 个 MutableState 字段的数据类（权限布尔值 + UI 控制）</td></tr>
      <tr><td>ShizukuAuthorizer</td><td>Shizuku 集成层：安装检测、服务运行检测、权限请求、状态监听</td></tr>
      <tr><td>ShizukuInstaller</td><td>APK 提取与版本对比</td></tr>
      <tr><td>UIHierarchyManager</td><td>无障碍 Provider 安装与版本管理</td></tr>
      <tr><td>RootAuthorizer</td><td>Root 权限请求与检测</td></tr>
    </table>

    <!-- 架构要点 -->
    <div class="section-head green">架构要点</div>
    <div class="key-nodes-grid" style="grid-template-columns:1fr;">
      <div class="key-node-card" style="border-left:3px solid var(--orange);">
        <strong>双层状态监听</strong>
        <p>ShizukuAuthorizer 的状态变化同时被 DemoStateManager.init 和 ShizukuDemoScreen 的 DisposableEffect 监听，存在冗余但保证了响应性</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--red);">
        <strong>MutableState 嵌套反模式</strong>
        <p>DemoScreenState 内部字段使用 MutableState&lt;T&gt; 包装，同时外层使用 StateFlow&lt;DemoScreenState&gt;。部分代码直接修改内部 MutableState.value，绕过 StateFlow.update {}，造成不一致但功能正常</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--blue);">
        <strong>权限等级切换副作用</strong>
        <p>切换等级不仅是 UI 变更，还会触发 AIToolHandler.reset() + registerDefaultTools() 重新注册所有 AI 工具，改变应用的工具能力集</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--green);">
        <strong>风险确认门控</strong>
        <p>无障碍 Provider 安装通过输入精确文字确认来门控，防止用户误操作</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--purple);">
        <strong>ADMIN 等级占位</strong>
        <p>在 Tab 中可见但显示"当前版本不支持"横幅，为未来预留</p>
      </div>
      <div class="key-node-card" style="border-left:3px solid var(--text-dim);">
        <strong>未使用的脚手架代码</strong>
        <p>showAdbCommandExecutor、showSampleCommands、CommandResultDialog 等在状态和 ViewModel 中定义但未在当前 UI 中渲染，疑似早期版本残留</p>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径</th><th>职责</th></tr>
      <tr><td>ShizukuDemoScreen</td><td>ui/features/demo/screens/ShizukuDemoScreen.kt</td><td>页面入口，权限行点击处理</td></tr>
      <tr><td>ShizukuDemoViewModel</td><td>ui/features/demo/viewmodel/ShizukuDemoViewModel.kt</td><td>ViewModel 代理层</td></tr>
      <tr><td>DemoStateManager</td><td>ui/features/demo/state/DemoStateManager.kt</td><td>状态管理 + 业务逻辑</td></tr>
      <tr><td>PermissionLevelCard</td><td>ui/features/demo/components/PermissionLevelCard.kt</td><td>权限等级选择器 + 状态展示</td></tr>
      <tr><td>DialogComponents</td><td>ui/features/demo/components/DialogComponents.kt</td><td>共享组件（部分未使用）</td></tr>
      <tr><td>ShizukuWizardCard</td><td>ui/features/demo/wizards/ShizukuWizardCard.kt</td><td>Shizuku 设置向导</td></tr>
      <tr><td>AccessibilityWizardCard</td><td>ui/features/demo/wizards/AccessibilityWizardCard.kt</td><td>无障碍设置向导</td></tr>
      <tr><td>RootWizardCard</td><td>ui/features/demo/wizards/RootWizardCard.kt</td><td>Root 设置向导</td></tr>
      <tr><td>OperitTerminalWizardCard</td><td>ui/features/demo/wizards/OperitTerminalWizardCard.kt</td><td>终端环境向导</td></tr>
    </table>`);
