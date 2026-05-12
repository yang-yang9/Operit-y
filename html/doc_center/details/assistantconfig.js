registerDetail('assistantconfig', `    <div class="hero" style="padding: 16px 0 8px;">
      <h1 style="font-size: 24px;">🛠 Screen.AssistantConfig 页面结构</h1>
      <p class="sub">AssistantConfigScreen · Avatar 配置 + 语音唤醒 · 双状态源架构</p>
    </div>

    <div class="stats">
      <div class="stat-card"><div class="num">2</div><div class="label">Tab 页面</div></div>
      <div class="stat-card"><div class="num">2</div><div class="label">状态源</div></div>
      <div class="stat-card"><div class="num">5</div><div class="label">模型格式</div></div>
      <div class="stat-card"><div class="num">7</div><div class="label">对话框</div></div>
      <div class="stat-card"><div class="num">4</div><div class="label">附件类型</div></div>
      <div class="stat-card"><div class="num">6</div><div class="label">核心文件</div></div>
    </div>

    <!-- ===== 入口链路 ===== -->
    <div class="section">
      <div class="section-head blue">🔗 入口链路 <span class="count">从 Activity 到 AssistantConfigScreen</span></div>
      <div class="flow">
        <div class="flow-step"><div class="step-num">L1</div><div class="step-name">MainActivity</div><div class="step-cond">NavItem.AssistantConfig</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L2</div><div class="step-name">OperitApp</div><div class="step-cond">导航状态管理</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step"><div class="step-num">L3</div><div class="step-name">AppContent</div><div class="step-cond">TopAppBar + Crossfade</div></div>
        <div class="flow-arrow">→</div>
        <div class="flow-step final"><div class="step-num">L4</div><div class="step-name">AssistantConfigScreen</div><div class="step-cond">Screen.AssistantConfig.Content()</div></div>
      </div>
      <div class="key-nodes-grid" style="margin-top:16px;">
        <div class="key-node-card">
          <div class="kn-icon">📋</div>
          <div class="kn-title green">导航属性</div>
          <div class="kn-code">路由: "assistant_config"
图标: Icons.Default.Tune
导航组: AI Features
叶子节点: 是（无子页面跳转）
Crossfade: 不参与</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🔧</div>
          <div class="kn-title blue">双状态源架构</div>
          <div class="kn-body">Avatar 相关状态走 <strong>ViewModel/AvatarRepository</strong>，语音唤醒相关状态直接读写 <strong>WakeWordPreferences DataStore</strong>，绕过 ViewModel。</div>
        </div>
      </div>
    </div>

    <!-- ===== 组件树 ===== -->
    <div class="section">
      <div class="section-head green">🌲 组件树 <span class="count">CustomScaffold + TabRow + 双 Tab 内容</span></div>

      <div class="mermaid">
graph TD
    ROOT["AssistantConfigScreen&lt;br/&gt;(CustomScaffold + SnackbarHost)"]

    ROOT --> MAIN_BOX["Box (fillMaxSize)"]
    ROOT --> LOADING_OVERLAY["Box (加载遮罩层)&lt;br/&gt;isLoading || isImporting&lt;br/&gt;surface 70% alpha"]

    MAIN_BOX --> MAIN_COL["Column (fillMaxSize, padding)"]

    MAIN_COL --> TAB_ROW["TabRow (selectedConfigTab)"]
    TAB_ROW --> TAB_0["Tab(0): Avatar Config"]
    TAB_ROW --> TAB_1["Tab(1): Voice Wake-up"]

    MAIN_COL --> TAB_CONTENT{"selectedConfigTab"}
    TAB_CONTENT -->|0| AVATAR_TAB["Avatar 配置区域"]
    TAB_CONTENT -->|1| VOICE_TAB["语音唤醒配置区域"]

    AVATAR_TAB --> PREVIEW_BOX["Box (220dp, 可折叠)&lt;br/&gt;AvatarPreviewSection"]
    AVATAR_TAB --> COLLAPSE_BTN["Row (折叠切换按钮)&lt;br/&gt;ExpandMore / ExpandLess"]
    AVATAR_TAB --> AVATAR_SCROLL["Box (weight=1f, verticalScroll)&lt;br/&gt;AvatarConfigSection"]

    PREVIEW_BOX --> PREVIEW_SURFACE["Surface (圆角12dp, 渐变边框)"]
    PREVIEW_SURFACE --> AVATAR_VIEW["AvatarView&lt;br/&gt;(model + controller)"]

    AVATAR_SCROLL --> VOICE_CALL_TOGGLE["Row: 语音通话显示Avatar开关"]
    AVATAR_SCROLL --> MOOD_SECTION["MoodTriggerMappingSection&lt;br/&gt;(心情触发动画映射)"]
    AVATAR_SCROLL --> MODEL_SELECTOR["Row: ModelSelector + 导入按钮"]
    AVATAR_SCROLL --> SLIDERS["Scale/TranslateX/Y Sliders&lt;br/&gt;+ 类型特定相机参数"]
    AVATAR_SCROLL --> IMPORT_GUIDE["HowToImportSection (可折叠)"]
    AVATAR_SCROLL --> ALL_GUIDE["AllAvatarImportGuideSection (可折叠)"]

    VOICE_TAB --> VOICE_SCROLL["Box (weight=1f, verticalScroll)"]
    VOICE_SCROLL --> VOICE_COL["Column (surfaceVariant bg, 圆角10dp)"]
    VOICE_COL --> WAKE_MODE["ExposedDropdownMenu: 唤醒模式选择"]
    VOICE_COL --> PERSONAL_CFG["PersonalTemplate配置按钮区"]
    VOICE_COL --> LISTEN_SWITCH["CompactSwitchRow: 始终监听"]
    VOICE_COL --> WAKE_PHRASE["OutlinedTextField: 唤醒词"]
    VOICE_COL --> REGEX_SWITCH["CompactSwitchRow: 正则模式"]
    VOICE_COL --> TIMEOUT_INPUT["OutlinedTextField: 超时时间"]
    VOICE_COL --> GREETING_SWITCH["CompactSwitchRow: 问候语开关"]
    VOICE_COL --> GREETING_INPUT["OutlinedTextField: 问候语"]
    VOICE_COL --> NEW_CHAT_SWITCH["CompactSwitchRow: 唤醒创建新聊天"]
    VOICE_COL --> CHAT_GROUP_INPUT["OutlinedTextField: 自动分组"]
    VOICE_COL --> DIVIDER["HorizontalDivider"]
    VOICE_COL --> ATTACH_LABEL["Text: 语音关键词附件"]
    VOICE_COL --> ATTACH_SWITCH["CompactSwitchRow: 附件启用"]
    VOICE_COL --> ATTACH_GRID["VoiceAutoAttachGrid&lt;br/&gt;(LazyVerticalGrid, Adaptive 96dp)"]
      </div>

      <details style="margin-top:12px;">
        <summary style="font-size:12px;color:var(--text-dim);cursor:pointer;user-select:none;">📝 文本版组件树</summary>
        <div class="comp-tree" style="margin-top:8px;">
<span class="ct-root">AssistantConfigScreen (CustomScaffold + SnackbarHost)</span>
<div class="ct-indent">
├─ <span class="ct-branch">Box (fillMaxSize)</span>
│   └─ <span class="ct-branch">Column (fillMaxSize, padding)</span>
│       ├─ <span class="ct-branch">TabRow (selectedConfigTab)</span>
│       │   ├─ Tab(0): Avatar Config
│       │   └─ Tab(1): Voice Wake-up
│       └─ <span class="ct-cond">selectedConfigTab ?</span>
│           ├─ <span class="ct-cond">0 →</span> <span class="ct-branch">Avatar 配置区域</span>
│           │   ├─ <span class="ct-branch">AvatarPreviewSection</span> <span class="ct-dim">(220dp, 可折叠)</span>
│           │   ├─ <span class="ct-dim">折叠切换按钮</span>
│           │   └─ <span class="ct-branch">AvatarConfigSection</span> <span class="ct-dim">(verticalScroll)</span>
│           │       ├─ <span class="ct-dim">语音通话Avatar开关</span>
│           │       ├─ <span class="ct-branch">MoodTriggerMappingSection</span>
│           │       ├─ <span class="ct-branch">ModelSelector + 导入按钮</span>
│           │       ├─ <span class="ct-dim">Scale/位移/相机参数滑块</span>
│           │       └─ <span class="ct-dim">导入指南 (可折叠)</span>
│           └─ <span class="ct-cond">1 →</span> <span class="ct-branch">语音唤醒配置区域</span> <span class="ct-dim">(verticalScroll)</span>
│               ├─ <span class="ct-dim">唤醒模式选择</span>
│               ├─ <span class="ct-dim">始终监听 / 唤醒词 / 正则</span>
│               ├─ <span class="ct-dim">超时 / 问候语 / 新聊天</span>
│               └─ <span class="ct-branch">VoiceAutoAttachGrid</span>
└─ <span class="ct-overlay">Box (加载遮罩层)</span> <span class="ct-dim">isLoading || isImporting · 70% alpha</span>
</div>
        </div>
      </details>
    </div>

    <!-- ===== 状态管理 ===== -->
    <div class="section">
      <div class="section-head orange">🔀 状态管理 <span class="count">ViewModel + DataStore + Local Remember</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🧠</div>
          <div class="kn-title orange">AssistantConfigViewModel</div>
          <div class="kn-body">通过自定义 <code style="color:var(--cyan)">Factory(context)</code> 构建，内部组合 AvatarRepository 的四个 Flow。</div>
          <div class="kn-code">UiState 字段:
isLoading          — 全局加载（删除/重命名）
isImporting        — 导入特有加载
avatarConfigs      — 所有已注册 Avatar 模型
currentAvatarConfig — 当前选中 Avatar 配置
currentAvatarModel  — 当前选中 Avatar 运行时模型
config             — 缩放/位移/自定义设置
isVoiceCallAvatarEnabled — 语音通话显示
emotionAnimationMapping  — 情绪→动画映射
moodAnimationMapping     — 触发键→动画映射
customMoodDefinitions    — 自定义心情类型
errorMessage / operationSuccess — 反馈
scrollPosition — 持久化滚动位置</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">💾</div>
          <div class="kn-title cyan">WakeWordPreferences (DataStore)</div>
          <div class="kn-body">语音唤醒相关状态直接读写 DataStore，绕过 ViewModel。</div>
          <div class="kn-code">wakeListeningEnabled    — always_listening_enabled
wakePhrase             — wake_phrase
wakePhraseRegexEnabled — wake_phrase_regex_enabled
wakeRecognitionMode    — wake_recognition_mode
personalWakeTemplates  — personal_wake_templates_json
inactivityTimeoutSeconds — voice_call_inactivity_timeout
wakeGreetingEnabled    — wake_greeting_enabled
wakeGreetingText       — wake_greeting_text
wakeCreateNewChatOnWakeEnabled — wake_create_new_chat
autoNewChatGroup       — auto_new_chat_group
voiceAutoAttachEnabled — voice_auto_attach_enabled
voiceAutoAttachItems   — voice_auto_attach_items_json</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📌</div>
          <div class="kn-title purple">本地 Remember 状态</div>
          <div class="kn-code">selectedConfigTab (rememberSaveable)
  — Tab 索引 (0=Avatar, 1=Voice)
isAvatarPreviewCollapsed (rememberSaveable)
  — 折叠/展开 Avatar 预览
personalWakeConfigDialogVisible
  — 个人唤醒模板配置弹窗
wakePhraseInput / inactivityTimeoutInput
wakeGreetingTextInput / autoNewChatGroupInput
  — 输入防抖镜像
scrollState — 位置通过 ViewModel 持久化
snackbarHostState — Snackbar 协调</div>
        </div>
      </div>
    </div>

    <!-- ===== Avatar Tab 详解 ===== -->
    <div class="section">
      <div class="section-head purple">🎨 Avatar 配置 Tab 详解 <span class="count">预览 + 模型选择 + 参数调整 + 心情映射</span></div>

      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">👤</div>
          <div class="kn-title blue">AvatarPreviewSection</div>
          <div class="kn-body">Avatar 实时预览区域，高度 220dp，可折叠</div>
          <div class="kn-code">Surface (RoundedCorner=12dp, 渐变边框)
└─ Box (fillMaxSize)
   ├─ [有模型 + 有控制器] AvatarView
   ├─ [有模型 + 无控制器] Text("不支持的模型类型")
   └─ [无模型] Text("暂无模型" / "请选择模型")</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🎯</div>
          <div class="kn-title green">ModelSelector</div>
          <div class="kn-body">模型选择下拉框，内嵌重命名和删除操作</div>
          <div class="kn-code">ExposedDropdownMenuBox
├─ OutlinedTextField (当前模型名, readOnly)
└─ ExposedDropdownMenu
   └─ [forEach model] DropdownMenuItem
       ├─ Text(model.name)
       └─ Row [操作按钮]
           ├─ IconButton(Edit) → 重命名 Dialog
           └─ IconButton(Delete) → 删除确认 Dialog</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">😄</div>
          <div class="kn-title orange">MoodTriggerMappingSection</div>
          <div class="kn-body">心情触发动画映射，包含内置和自定义心情</div>
          <div class="kn-code">内置心情定义列表 → MoodMappingCard
  ├─ 触发键 + 提示词
  ├─ AnimationSelectionField (Dropdown)
  └─ Preview / Clear 按钮

自定义心情类型 → MoodMappingCard
  └─ 编辑 / 删除按钮</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🎚️</div>
          <div class="kn-title cyan">参数滑块组</div>
          <div class="kn-body">通用参数 + 按模型类型的相机参数</div>
          <div class="kn-code">通用:
Scale (0.1~2.0) / TranslateX (-500~500) / TranslateY (-500~500)

按模型类型:
MMD:  cameraPitch, initialRotationY, cameraDistanceScale, cameraTargetHeight
GLTF: cameraPitch, cameraYaw, cameraDistanceScale, cameraTargetHeight
FBX:  cameraPitch, cameraYaw, cameraDistanceScale, cameraTargetHeight</div>
        </div>
      </div>
    </div>

    <!-- ===== 语音唤醒 Tab 详解 ===== -->
    <div class="section">
      <div class="section-head cyan">🎙 语音唤醒 Tab 详解 <span class="count">唤醒模式 + 关键词附件网格</span></div>

      <div class="key-nodes-grid" style="margin-bottom:16px;">
        <div class="key-node-card">
          <div class="kn-icon">📡</div>
          <div class="kn-title blue">唤醒模式</div>
          <div class="kn-code">STT (WakeRecognitionMode.STT)
  — 语音转文字匹配唤醒词

PERSONAL_TEMPLATE
  — 个人声纹模板匹配</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📎</div>
          <div class="kn-title green">VoiceAutoAttachGrid</div>
          <div class="kn-body">LazyVerticalGrid (Adaptive 96dp, maxHeight=200dp)</div>
          <div class="kn-code">forEach item → VoiceAutoAttachTile
  └─ ElevatedCard (clickable → 编辑弹窗)
      ├─ Icon (类型图标, 22dp)
      ├─ Text (标题)
      └─ Text (关键词/描述)

[有缺失类型时] VoiceAutoAttachAddTile
  └─ OutlinedCard → Icon(Add) + Text("Add")</div>
        </div>
      </div>

      <table class="act-table">
        <thead><tr><th>附件类型</th><th>图标</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">SCREEN_OCR</td><td>ScreenshotMonitor</td><td>屏幕OCR内容</td></tr>
          <tr><td class="mono">NOTIFICATIONS</td><td>Notifications</td><td>通知内容</td></tr>
          <tr><td class="mono">LOCATION</td><td>LocationOn</td><td>位置信息</td></tr>
          <tr><td class="mono">TIME</td><td>Schedule</td><td>时间信息</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 对话框清单 ===== -->
    <div class="section">
      <div class="section-head purple">📋 对话框清单 <span class="count">7</span></div>
      <table class="act-table">
        <thead><tr><th>对话框</th><th>触发条件</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="mono">Personal Wake Config</td><td>Tab1 "Configure" 按钮</td><td>3步语音录制注册个人唤醒模板</td></tr>
          <tr><td class="mono">Delete Avatar</td><td>ModelSelector 删除图标</td><td>确认删除 Avatar 模型</td></tr>
          <tr><td class="mono">Rename Avatar</td><td>ModelSelector 编辑图标</td><td>输入新名称重命名 Avatar</td></tr>
          <tr><td class="mono">Create Mood Type</td><td>MoodSection "Add" 按钮</td><td>输入 key + promptHint 创建自定义心情</td></tr>
          <tr><td class="mono">Edit Mood Type</td><td>自定义 MoodCard 编辑图标</td><td>编辑已有心情类型</td></tr>
          <tr><td class="mono">Edit Voice Attach Item</td><td>点击 VoiceAutoAttachTile</td><td>启用/禁用 + 编辑关键词 + 删除</td></tr>
          <tr><td class="mono">Add Voice Attach Type</td><td>点击 AddTile</td><td>从缺失类型中选择添加</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 交互映射 ===== -->
    <div class="section">
      <div class="section-head orange">⚡ 用户交互 → 动作映射</div>
      <table class="act-table">
        <thead><tr><th>交互</th><th>执行动作</th></tr></thead>
        <tbody>
          <tr><td>Tab 切换</td><td class="mono">更新 selectedConfigTab</td></tr>
          <tr><td>折叠/展开预览</td><td class="mono">切换 isAvatarPreviewCollapsed</td></tr>
          <tr><td>ModelSelector 选中</td><td class="mono">viewModel.switchAvatar(modelId)</td></tr>
          <tr><td>导入按钮点击</td><td class="mono">系统文件选择器 → viewModel.importAvatarFromZip(uri)</td></tr>
          <tr><td>Scale/位移滑块</td><td class="mono">viewModel.updateScale/X/Y → repository.updateAvatarSettings()</td></tr>
          <tr><td>相机参数滑块</td><td class="mono">viewModel.updateCustomSetting(key, value)</td></tr>
          <tr><td>语音通话Avatar开关</td><td class="mono">viewModel.updateVoiceCallAvatarEnabled(bool)</td></tr>
          <tr><td>心情动画下拉选择</td><td class="mono">viewModel.updateMoodAnimationMapping(key, name)</td></tr>
          <tr><td>Preview 按钮</td><td class="mono">avatarController.playTrigger() / playAnimation()</td></tr>
          <tr><td>Clear 按钮</td><td class="mono">viewModel.updateMoodAnimationMapping(key, null)</td></tr>
          <tr><td>始终监听开关</td><td class="mono">检查权限 → wakePrefs.saveAlwaysListeningEnabled()</td></tr>
          <tr><td>唤醒词输入</td><td class="mono">每次击键 → wakePrefs.saveWakePhrase()</td></tr>
          <tr><td>超时时间输入</td><td class="mono">纯数字过滤 (1~600) → 实时保存</td></tr>
          <tr><td>录制步骤</td><td class="mono">PersonalWakeEnrollment.recordOneTemplate(context)</td></tr>
          <tr><td>附件 Tile 点击</td><td class="mono">编辑弹窗 → wakePrefs.saveVoiceAutoAttachItems()</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 数据模型 ===== -->
    <div class="section">
      <div class="section-head gray">📦 数据模型 <span class="count">9 个核心模型</span></div>
      <table class="act-table">
        <thead><tr><th>模型</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td class="mono">AvatarConfig</td><td>Avatar 元数据：id, name, type, emotion/mood mapping, custom mood definitions</td></tr>
          <tr><td class="mono">AvatarModel</td><td>运行时模型：id, type (DRAGONBONES/MMD/GLTF/FBX/MP4_LOOP)</td></tr>
          <tr><td class="mono">AvatarInstanceSettings</td><td>显示设置：scale, translateX, translateY, customSettings</td></tr>
          <tr><td class="mono">AvatarCustomMoodDefinition</td><td>自定义心情：key (规范化), promptHint</td></tr>
          <tr><td class="mono">AvatarEmotion</td><td>情绪枚举：IDLE, LISTENING, THINKING, HAPPY, SAD, CONFUSED, SURPRISED</td></tr>
          <tr><td class="mono">WakeRecognitionMode</td><td>唤醒模式枚举：STT, PERSONAL_TEMPLATE</td></tr>
          <tr><td class="mono">PersonalWakeTemplate</td><td>声纹模板：features (Float 列表)</td></tr>
          <tr><td class="mono">VoiceAutoAttachType</td><td>附件类型枚举：SCREEN_OCR, NOTIFICATIONS, LOCATION, TIME</td></tr>
          <tr><td class="mono">VoiceAutoAttachItem</td><td>附件条目：id, type, enabled, keywords, params</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ===== 架构要点 ===== -->
    <div class="section">
      <div class="section-head blue">🏗 架构要点</div>
      <div class="key-nodes-grid">
        <div class="key-node-card">
          <div class="kn-icon">🔄</div>
          <div class="kn-title orange">双状态源</div>
          <div class="kn-body">Avatar 相关状态走 ViewModel/AvatarRepository 流，语音唤醒相关状态直接读写 <code style="color:var(--cyan)">WakeWordPreferences</code> DataStore，绕过 ViewModel。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">🎮</div>
          <div class="kn-title blue">共享 AvatarController</div>
          <div class="kn-body">屏幕根部创建单一 AvatarController 实例，同时供 AvatarPreviewSection（渲染）和 AvatarConfigSection（轮询可用动画、触发预览播放）使用。动画列表通过 300ms 轮询获取。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">📍</div>
          <div class="kn-title green">滚动位置持久化</div>
          <div class="kn-body"><code style="color:var(--cyan)">scrollState</code> 初始值从 <code style="color:var(--cyan)">uiState.scrollPosition</code> 读取，通过 <code style="color:var(--cyan)">snapshotFlow</code> 持续同步回 ViewModel。</div>
        </div>
        <div class="key-node-card">
          <div class="kn-icon">⏳</div>
          <div class="kn-title purple">加载遮罩</div>
          <div class="kn-body">全屏 Box 覆盖层，70% alpha，区分 "导入模型中..." 和 "处理中..." 两种文案。</div>
        </div>
      </div>
    </div>

    <!-- ===== 核心文件 ===== -->
    <div class="section">
      <div class="section-head blue">📁 核心文件清单 <span class="count">6 文件</span></div>
      <table class="act-table">
        <thead><tr><th>文件</th><th>路径 (相对 ui/features/assistant/)</th><th>职责</th></tr></thead>
        <tbody>
          <tr><td><strong>AssistantConfigScreen</strong></td><td class="mono">screens/AssistantConfigScreen.kt</td><td>页面入口，Tab 切换，状态收集</td></tr>
          <tr><td><strong>AvatarConfigSection</strong></td><td class="mono">components/AvatarConfigSection.kt</td><td>Avatar Tab 内容 + 模型选择 + 参数调整</td></tr>
          <tr><td><strong>AvatarPreviewSection</strong></td><td class="mono">components/AvatarPreviewSection.kt</td><td>3D/2D Avatar 实时预览</td></tr>
          <tr><td><strong>HowToImportSection</strong></td><td class="mono">components/HowToImportSection.kt</td><td>可折叠导入帮助指南</td></tr>
          <tr><td><strong>VoiceAutoAttachComponents</strong></td><td class="mono">components/VoiceAutoAttachComponents.kt</td><td>CompactSwitchRow + 语音附件网格</td></tr>
          <tr><td><strong>AssistantConfigViewModel</strong></td><td class="mono">viewmodel/AssistantConfigViewModel.kt</td><td>ViewModel + UiState 数据类</td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      基于 docs/project_overview/04_Screen.AssistantConfig页面结构.md · AssistantConfigScreen 组件结构
    </div>`);
