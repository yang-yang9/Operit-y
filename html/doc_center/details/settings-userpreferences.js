registerDetail('settings-userpreferences', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">1256</span><span class="stat-label">Settings 行数</span></div>
      <div class="stat-item"><span class="stat-num">844</span><span class="stat-label">Guide 行数</span></div>
      <div class="stat-item"><span class="stat-num">6</span><span class="stat-label">偏好分类字段</span></div>
      <div class="stat-item"><span class="stat-num">51</span><span class="stat-label">预置标签总数</span></div>
    </div>

    <!-- UserPreferencesSettingsScreen -->
    <div class="section-head blue">UserPreferencesSettingsScreen — 偏好设置管理</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">多档案用户偏好管理页面，支持创建 / 切换 / 重命名 / 删除档案。每个档案包含 6 个分类字段（生日、性别、性格、身份、职业、AI 风格），支持编辑 / 查看模式切换和字段级锁定。源码 1256 行。</p>

    <!-- 组件树 Mermaid -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["UserPreferencesSettingsScreen&lt;br/&gt;(CustomScaffold + FAB)"]

    ROOT --> FAB["FloatingActionButton&lt;br/>Save/Edit 图标切换"]

    ROOT --> SELECTOR["Card: Profile Selector"]
    SELECTOR --> SEL_HEADER["Row: 标题 + New 按钮"]
    SELECTOR --> SEL_CURRENT["Surface: 当前档案名 + 活跃指示点"]
    SELECTOR --> SEL_ACTIONS["TextButton: Set Active / Rename / Delete"]
    SELECTOR --> SEL_DROPDOWN["DropdownMenu: 档案列表&lt;br/&gt;(Check图标=活跃, 圆点=选中)"]

    ROOT --> DETAIL["AnimatedVisibility: Profile Detail Card"]
    DETAIL --> DETAIL_HEADER["Row: 档案名 + Config Wizard按钮"]
    DETAIL --> FIELDS["LazyColumn: 6个 ModernPreferenceCategoryItem"]
    FIELDS --> F1["birthDate (Cake)"]
    FIELDS --> F2["gender (Face)"]
    FIELDS --> F3["personality (Psychology)"]
    FIELDS --> F4["identity (Badge)"]
    FIELDS --> F5["occupation (Work)"]
    FIELDS --> F6["aiStyle (SmartToy)"]

    ROOT --> DLG_ADD["AlertDialog: New Profile"]
    ROOT --> DLG_RENAME["AlertDialog: Rename Profile"]
    ROOT --> DLG_DEL["AlertDialog: Delete Confirm"]
    </div>

    <!-- ModernPreferenceCategoryItem -->
    <div class="section-head green" style="margin-top:16px;">ModernPreferenceCategoryItem — 字段行结构</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">每个字段行的通用可复用结构，支持编辑/查看动画切换与字段锁定。</p>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Surface (animated shadow 0–2dp)</div>
      <div class="tree-children">
        <div class="tree-node">Row: 图标 + 标题 + Lock Switch (缩放 0.8x)</div>
        <div class="tree-node">AnimatedContent (editMode 切换, fade + scale 动画)</div>
        <div class="tree-children">
          <div class="tree-node">[编辑 + 生日] Card: 日期显示 → DatePickerDialog</div>
          <div class="tree-node">[编辑 + 其他] OutlinedTextField（锁定时灰显禁用）</div>
          <div class="tree-node">[查看] Text（值或"未设置"占位）</div>
        </div>
      </div>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">字段锁定通过全局 <code>categoryLockStatusFlow</code> 控制，锁定后输入框灰显禁用，对所有档案生效。</p>

    <!-- 状态管理 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <table class="act-table">
      <tr><th>状态来源</th><th>说明</th></tr>
      <tr><td>profileListFlow</td><td>档案 ID 列表</td></tr>
      <tr><td>activeProfileIdFlow</td><td>当前活跃档案 ID</td></tr>
      <tr><td>categoryLockStatusFlow</td><td>字段锁定状态 Map（全局，非档案级）</td></tr>
      <tr><td>getUserPreferencesFlow(id)</td><td>特定档案的 Flow</td></tr>
      <tr><td>edit* 局部变量（×6）</td><td>编辑缓冲区：editBirthDate / editGender / editPersonality / editIdentity / editOccupation / editAiStyle，切换档案时由 LaunchedEffect 重新填充</td></tr>
    </table>

    <!-- 档案操作流程 -->
    <div class="section-head orange" style="margin-top:16px;">档案操作</div>
    <table class="act-table">
      <tr><th>操作</th><th>流程</th></tr>
      <tr><td>创建</td><td>New 按钮 → AddDialog → <code>createProfile(name)</code> → 自动导航到 Guide</td></tr>
      <tr><td>切换</td><td>Dropdown 选择 → <code>selectedProfileId</code> 更新 → 重置编辑模式</td></tr>
      <tr><td>设为活跃</td><td>"Set Active" → <code>setActiveProfile(id)</code></td></tr>
      <tr><td>重命名</td><td>RenameDialog → <code>updateProfile(profile.copy(name=...))</code></td></tr>
      <tr><td>删除</td><td>DeleteDialog → <code>deleteProfile(id)</code> → 回退到活跃档案 + 清理 ObjectBox 记忆数据库</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">默认档案（<code>id="default"</code>）不可重命名或删除。</p>

    <!-- UserPreferencesGuideScreen -->
    <div class="section-head purple" style="margin-top:28px;">UserPreferencesGuideScreen — 偏好配置向导</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">单页滚动式向导（非分步），6 个字段全部平铺展示。支持预置标签选择和自定义标签添加，所有字段均为可选。源码 844 行。</p>

    <!-- Guide 组件树 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">UserPreferencesGuideScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">AlertDialog: 添加自定义标签（10 字符限制）</div>
        <div class="tree-node">DatePickerDialog（Material3，初始 1990-01-01）</div>
        <div class="tree-node">Column (verticalScroll, spacedBy 16dp)</div>
        <div class="tree-children">
          <div class="tree-node">Header（标题 + 档案 ID 调试标签）</div>
          <div class="tree-node">Info Banner: "所有选项均为可选"</div>
          <div class="tree-node">Gender: FlowRow 3 个 FilterChip（单选）</div>
          <div class="tree-node">Occupation: FlowRow 12 个 FilterChip（单选）</div>
          <div class="tree-node">Birth Date: OutlinedCard → DatePickerDialog</div>
          <div class="tree-node">Personality: FlowRow 16 标准 + N 自定义 FilterChip（多选）</div>
          <div class="tree-children">
            <div class="tree-node">自定义标签带 Close 图标，可点击删除</div>
          </div>
          <div class="tree-node">Identity: FlowRow 12 标准 + N 自定义 FilterChip（多选）</div>
          <div class="tree-node">AI Style: FlowRow 8 标准 + N 自定义 FilterChip（多选）</div>
          <div class="tree-node">Button "Complete"（fillMaxWidth）</div>
        </div>
      </div>
    </div>

    <!-- 预置标签 -->
    <div class="section-head green" style="margin-top:16px;">预置标签</div>
    <table class="act-table">
      <tr><th>分类</th><th>数量</th><th>选择模式</th><th>示例</th></tr>
      <tr><td>性别</td><td>3</td><td>单选</td><td>Male / Female / Other</td></tr>
      <tr><td>职业</td><td>12</td><td>单选</td><td>Student / Teacher / Engineer …</td></tr>
      <tr><td>性格</td><td>16</td><td>多选</td><td>Extroverted / Introverted / Rational …</td></tr>
      <tr><td>身份</td><td>12</td><td>多选</td><td>Student / Parent / Gamer / Traveler …</td></tr>
      <tr><td>AI 风格</td><td>8</td><td>多选</td><td>Professional / Humorous / Direct …</td></tr>
    </table>

    <!-- 自定义标签流程 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">自定义标签流程</div>
    <div class="flow-step">"Add Custom" 按钮触发</div>
    <div class="flow-arrow"></div>
    <div class="flow-step">共享对话框弹出（<code>currentTagCategory</code> 路由至 personality / identity / aiStyle）</div>
    <div class="flow-arrow"></div>
    <div class="flow-step">10 字符限制校验通过</div>
    <div class="flow-arrow"></div>
    <div class="flow-step">同时加入 <code>custom*Tags</code> + <code>selected*</code> Set（不可变 Set 的 <code>+</code> 运算符触发 Compose 重组）</div>
    <div class="flow-arrow"></div>
    <div class="flow-step">FilterChip 附带 <code>trailingIcon: Close</code>，点击可从两个 Set 中移除</div>

    <!-- 默认值注入 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">默认值注入</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">首次打开时，如果 AI Style 和 Personality 都为空，自动预选并立即持久化：</p>
    <div class="kn-code" style="margin:8px 0;">AI Style:    ["Professional", "Direct"]
Personality: ["Rational", "Patient"]</div>

    <!-- 双路径导航 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">双路径导航</div>
    <table class="act-table">
      <tr><th>参数</th><th>来源</th><th>Complete 按钮行为</th></tr>
      <tr><td><code>profileName</code> 非空</td><td>从 Settings 页面启动</td><td><code>onComplete()</code> → 返回 Settings</td></tr>
      <tr><td><code>profileName</code> 为空</td><td>首次启动引导流程</td><td><code>navigateToPermissions()</code> → 继续引导</td></tr>
    </table>

    <!-- 数据模型 -->
    <div class="section-head pink" style="margin-top:28px;">数据模型 — PreferenceProfile</div>
    <div class="kn-code" style="margin:8px 0;">@Serializable
data class PreferenceProfile(
    val id: String,
    val name: String,
    val birthDate: Long = 0L,
    val gender: String = "",
    val personality: String = "",   // 逗号分隔标签
    val identity: String = "",
    val occupation: String = "",
    val aiStyle: String = "",
    val isInitialized: Boolean = false
)</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">DataStore 存储结构</div>
    <table class="act-table">
      <tr><th>Key</th><th>说明</th></tr>
      <tr><td><code>"active_profile_id"</code></td><td>活跃档案 ID</td></tr>
      <tr><td><code>"profile_list"</code></td><td>JSON 数组，所有档案 ID</td></tr>
      <tr><td><code>"profile_&lt;id&gt;"</code></td><td>JSON 序列化的 PreferenceProfile</td></tr>
      <tr><td><code>"&lt;category&gt;_locked"</code></td><td>字段锁定状态（全局）</td></tr>
    </table>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:28px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">📋</div>
        <div class="kn-title blue">编辑缓冲区模式</div>
        <div class="kn-body">Settings 页面用 6 个 <code>edit*</code> 变量做本地缓冲，切换档案时 LaunchedEffect 自动覆写，取消编辑无需显式回滚。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔒</div>
        <div class="kn-title orange">字段锁定全局生效</div>
        <div class="kn-body">锁定状态不是每个档案独立的，而是全局的。锁定某字段后，所有档案的该字段均禁止编辑。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📜</div>
        <div class="kn-title green">向导非分步</div>
        <div class="kn-body">Guide 页面虽名为"向导"，实际是单页滚动，所有 6 个字段同时展示，无分步 / 进度条设计。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔄</div>
        <div class="kn-title purple">不可变 Set 驱动重组</div>
        <div class="kn-body">使用 Kotlin <code>Set&lt;String&gt;</code> 的 <code>+</code> / <code>-</code> 运算符产生新集合，正确触发 Compose 重组，避免可变集合的陷阱。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🗑️</div>
        <div class="kn-title pink">删除档案联动清理</div>
        <div class="kn-body"><code>deleteProfile()</code> 会同时调用 <code>ObjectBoxManager.delete(context, profileId)</code>，清理该档案关联的记忆数据库，防止数据孤儿。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">💀</div>
        <div class="kn-title gray">死代码标注</div>
        <div class="kn-body">Guide 文件中定义了 <code>generatePreferencesDescription()</code>（从选中标签生成 100 字符内自然语言描述），但目前未被调用。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">核心文件</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对 ui/features/settings/screens/）</th><th>行数</th><th>职责</th></tr>
      <tr><td>UserPreferencesSettingsScreen</td><td>UserPreferencesSettingsScreen.kt</td><td>1256</td><td>多档案管理 + 编辑/查看</td></tr>
      <tr><td>UserPreferencesGuideScreen</td><td>UserPreferencesGuideScreen.kt</td><td>844</td><td>标签选择向导</td></tr>
    </table>
`);
