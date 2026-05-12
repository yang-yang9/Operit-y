registerDetail('settings-prompts', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">3490</span><span class="stat-label">ModelPrompts 行数</span></div>
      <div class="stat-item"><span class="stat-num">221</span><span class="stat-label">TagMarket 行数</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">标签页</span></div>
      <div class="stat-item"><span class="stat-num">14</span><span class="stat-label">预置标签</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">TagType 分类</span></div>
    </div>

    <!-- ModelPromptsSettingsScreen -->
    <div class="section-head blue">ModelPromptsSettingsScreen — 系统提示词管理</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">三标签页管理中心：角色卡（Character Cards）、标签（Tags）、角色组（Character Groups）。支持角色卡的 CRUD、Tavern 格式导入导出、Color QR 编码、标签系统和角色组编排。单文件 3490 行，包含 3 个标签页、6+ 个对话框及全部导入导出逻辑。</p>

    <!-- 组件树 Mermaid -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树（3 标签页）</div>
    <div class="mermaid">
graph TD
    ROOT["ModelPromptsSettingsScreen&lt;br/&gt;(CustomScaffold → Box)"]

    ROOT --> TAB["TabRow (3标签)"]
    TAB --> TAB0["Tab 0: 角色卡 (Person)"]
    TAB --> TAB1["Tab 1: 标签 (Label)"]
    TAB --> TAB2["Tab 2: 角色组 (People)"]

    ROOT --> TOAST["底部 Toast 叠加层&lt;br/&gt;保存/复制/导入成功/导入失败"]

    TAB0 --> CARD_HEADER["Row: Add + AutoAwesome + Import下拉 + Sort下拉"]
    TAB0 --> CARD_LIST["LazyColumn: CharacterCardItem"]
    CARD_LIST --> CARD_ITEM["Card: 头像+名称+活跃标记&lt;br/&gt;+ characterSetting预览&lt;br/&gt;+ 标签Chip(最多3个) + 更多菜单"]

    TAB1 --> TAG_HEADER["Row: Create New + Import + Export + Tag Market"]
    TAB1 --> TAG_LIST["LazyColumn: TagItem"]
    TAG_LIST --> TAG_ITEM["Card: 名称+描述+内容预览 + Edit/Delete"]

    TAB2 --> GROUP_HEADER["Row: 标题 + Add"]
    TAB2 --> GROUP_LIST["LazyColumn: GroupCardItem"]
    GROUP_LIST --> GROUP_ITEM["Card: 头像+名称+活跃标记&lt;br/&gt;+ 描述 + 成员数 + 成员名"]

    ROOT --> DLG_CARD["CharacterCardDialog (全屏编辑)"]
    ROOT --> DLG_TAG["TagDialog (AlertDialog)"]
    ROOT --> DLG_GROUP["GroupCardDialog (全屏编辑)"]
    ROOT --> DLG_DEL["多个删除确认 AlertDialog"]
    ROOT --> DLG_EXPORT["ExportModeDialog + ColorQR生成Dialog"]
    ROOT --> DLG_TAG_EXPORT["标签导出选择Dialog"]
    </div>

    <!-- Tab 0: 角色卡管理 -->
    <div class="section-head green" style="margin-top:20px;">Tab 0 — 角色卡管理操作</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">每张角色卡右侧三点菜单提供以下操作：</p>
    <table class="act-table">
      <tr><th>操作</th><th>条件</th><th>流程</th></tr>
      <tr><td>Set Active</td><td>非当前活跃</td><td><span class="kn-code">activePromptManager.setActivePrompt()</span></td></tr>
      <tr><td>Edit</td><td>始终</td><td>打开 <span class="kn-code">CharacterCardDialog</span></td></tr>
      <tr><td>Duplicate</td><td>始终</td><td><span class="kn-code">createCharacterCard(card.copy(newId))</span> + <span class="kn-code">cloneBindingsFromCharacterCard()</span></td></tr>
      <tr><td>Export</td><td>始终</td><td>→ ExportModeDialog（JSON / PNG / ColorQR）</td></tr>
      <tr><td>Reset</td><td>仅默认卡</td><td>重置为出厂默认值</td></tr>
      <tr><td>Delete</td><td>仅非默认卡</td><td>删除确认 → 触发聊天管理提示 showChatManagementPrompt</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">排序与导入选项</div>
    <table class="act-table">
      <tr><th>类别</th><th>选项</th><th>说明</th></tr>
      <tr><td rowspan="3">排序</td><td>DEFAULT</td><td>原始列表顺序</td></tr>
      <tr><td>NAME_ASC</td><td>按名称字母排序</td></tr>
      <tr><td>CREATED_DESC</td><td>按更新时间倒序</td></tr>
      <tr><td rowspan="3">导入</td><td>Import Tavern Card</td><td>JSON 或 PNG 文件</td></tr>
      <tr><td>Import Color QR</td><td>图片文件解码</td></tr>
      <tr><td>Scan Color QR</td><td>摄像头实时扫描</td></tr>
    </table>

    <!-- CharacterCardDialog -->
    <div class="section-head orange" style="margin-top:20px;">CharacterCardDialog — 角色卡编辑</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">95% 宽度全屏 Dialog，所有文本字段使用 <strong>CompactTextFieldWithExpand</strong>（点击展开图标进入全屏编辑）。</p>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">CharacterCardDialog</div>
      <div class="tree-children">
        <div class="tree-node">Header: CompactAvatarPicker(40dp) + Name + Description</div>
        <div class="tree-node">Character Setting（主系统提示词）</div>
        <div class="tree-node">Opening Statement（开场白，含翻译按钮）</div>
        <div class="tree-node">Other Content (Chat)（聊天模式注入）</div>
        <div class="tree-node">Other Content (Voice)（语音模式注入）</div>
        <div class="tree-node">Tags（FlowRow FilterChip，多选附加）</div>
        <div class="tree-node">Advanced Options（可折叠）</div>
        <div class="tree-children">
          <div class="tree-node">Chat Model Binding（FOLLOW_GLOBAL / FIXED_CONFIG）</div>
          <div class="tree-children">
            <div class="tree-node">[FIXED] CharacterCardFixedModelPickerDialog</div>
          </div>
          <div class="tree-node">Tool Access（白名单配置）</div>
          <div class="tree-children">
            <div class="tree-node">CharacterCardToolAccessDialog</div>
          </div>
          <div class="tree-node">Advanced Custom Prompt（自由提示词）</div>
          <div class="tree-node">Marks / Notes（内部笔记，不注入提示词）</div>
        </div>
      </div>
    </div>

    <!-- Tab 1: 标签系统 -->
    <div class="section-head blue" style="margin-top:20px;">Tab 1 — 标签系统</div>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">PromptTag 数据模型</div>
    <div class="kn-code" style="margin:8px 0;">data class PromptTag(
    val id: String,
    val name: String,
    val description: String = "",
    val promptContent: String = "",    // 注入系统提示词的内容
    val tagType: TagType = TagType.CUSTOM,
    val createdAt: Long,
    val updatedAt: Long
)

enum class TagType { TONE, CHARACTER, FUNCTION, CUSTOM }</div>

    <p style="font-size:13px;color:var(--text-dim);margin:4px 0 12px;">标签通过 <strong>CharacterCard.attachedTagIds</strong> 绑定到角色卡。活跃角色卡所有附加标签的 <strong>promptContent</strong> 拼接后注入系统提示词。</p>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">导入/导出格式</div>
    <div class="kn-code" style="margin:8px 0;">{
  "format": "operit_prompt_tags",
  "version": 1,
  "exportedAt": 1234567890,
  "tags": [{ "name": "...", "promptContent": "...", "tagType": "TONE" }]
}</div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">导入按名称去重：已存在则更新，不存在则创建。</p>

    <!-- Tab 2: 角色组 -->
    <div class="section-head green" style="margin-top:20px;">Tab 2 — 角色组</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">GroupCardDialog</div>
      <div class="tree-children">
        <div class="tree-node">Header: CompactAvatarPicker + Name + Description</div>
        <div class="tree-node">成员管理：下拉添加角色卡 + 拖排列表 + 单独删除</div>
        <div class="tree-node">成员存储为 List&lt;GroupMemberConfig&gt;（characterCardId + orderIndex）</div>
      </div>
    </div>

    <!-- 导出流程 -->
    <div class="section-head orange" style="margin-top:20px;">导出流程</div>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">Tavern PNG 导出</div>
    <div class="kn-code" style="margin:8px 0;">Export → ExportModeDialog → 选择 PNG
  → exportCharacterCardToTavernJson(id)
  → insertTavernTextChunk() 嵌入 tEXt chunk
  → 保存到 Downloads/Operit/</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">Color QR 导出</div>
    <div class="kn-code" style="margin:8px 0;">Export → ExportModeDialog → 选择 Color QR
  → showExportDialog 打开
  → 颜色数选择器 (2 / 4 / 8 / 16)
  → ColorQrCodeUtil.generate()
  → 显示生成的 QR 图片 + 保存按钮</div>

    <!-- 状态管理 -->
    <div class="section-head" style="margin-top:20px;background:var(--surface-2);color:var(--text);">Manager 状态管理</div>
    <table class="act-table">
      <tr><th>Manager</th><th>职责</th></tr>
      <tr><td>CharacterCardManager</td><td>角色卡 CRUD + Tavern 导入导出</td></tr>
      <tr><td>CharacterGroupCardManager</td><td>角色组 CRUD</td></tr>
      <tr><td>ActivePromptManager</td><td>活跃 Prompt 追踪</td></tr>
      <tr><td>PromptTagManager</td><td>标签 CRUD</td></tr>
      <tr><td>UserPreferencesManager</td><td>头像 URI + 自定义聊天标题</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">无 ViewModel。排序选项通过 <strong>rememberLocal</strong>（keyed rememberSaveable）持久化。</p>

    <!-- TagMarketScreen -->
    <div class="section-head blue" style="margin-top:28px;">TagMarketScreen — 标签市场</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">纯静态预置标签展示页面，无网络请求。提供 14 个预置标签，分 4 个分类，支持一键安装到用户标签库。双语支持通过 <strong>Locale.language == "zh"</strong> 运行时切换。</p>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">组件结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">TagMarketScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">LazyColumn</div>
        <div class="tree-children">
          <div class="tree-node">[按分类分组]</div>
          <div class="tree-children">
            <div class="tree-node">Text: 分类标题</div>
            <div class="tree-node">PresetTagCard（每个标签）</div>
            <div class="tree-children">
              <div class="tree-node">Row: 图标 + 名称 + TagType 徽章</div>
              <div class="tree-node">Text: 描述</div>
              <div class="tree-node">HorizontalDivider</div>
              <div class="tree-node">Text: 标签内容预览（最多 6 行）</div>
              <div class="tree-node">Button "Add" → 打开安装对话框</div>
            </div>
          </div>
        </div>
        <div class="tree-node">AlertDialog（安装确认）</div>
        <div class="tree-children">
          <div class="tree-node">确认提示文本</div>
          <div class="tree-node">OutlinedTextField: 可编辑标签名（预填预置名）</div>
          <div class="tree-node">Add / Cancel 按钮</div>
        </div>
        <div class="tree-node">底部成功提示（1.5 秒自动消失）</div>
      </div>
    </div>

    <!-- 预置标签目录 -->
    <div class="section-head green" style="margin-top:16px;">预置标签目录（14 个）</div>
    <table class="act-table">
      <tr><th>分类</th><th>标签数</th><th>TagType</th><th>标签名</th></tr>
      <tr><td>破甲限制</td><td>3</td><td>TONE</td><td>Armor Break, Unrestricted Mode, Super Priority</td></tr>
      <tr><td>语气风格</td><td>4</td><td>TONE</td><td>Sharp Tone, Gentle Tone, Sunny Cheerful, Natural Dialogue</td></tr>
      <tr><td>角色设定</td><td>4</td><td>CHARACTER</td><td>Obey Master, Feminine, Guardian, Caring Sister</td></tr>
      <tr><td>特殊功能</td><td>3+</td><td>FUNCTION</td><td>Psychological Analysis, Emotional Support, Action Oriented, AI Status Card, HTML Wrapper, Word Count Control, Story Creation</td></tr>
    </table>

    <!-- 安装流程 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">安装流程</div>
    <div class="kn-code" style="margin:8px 0;">点击 "Add" → selectedPreset + newTagName 预填
  → AlertDialog 打开 → 用户可改名
  → 确认 → promptTagManager.createPromptTag(name, desc, content, type)
  → 关闭对话框 → 显示成功提示</div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">安装后标签出现在 ModelPromptsSettingsScreen 的 Tag 标签页中。</p>

    <!-- 数据模型 -->
    <div class="section-head orange" style="margin-top:24px;">数据模型</div>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">CharacterCard（角色卡）</div>
    <div class="kn-code" style="margin:8px 0;">data class CharacterCard(
    val id: String,
    val name: String,
    val description: String = "",
    val characterSetting: String = "",     // 主系统提示词
    val openingStatement: String = "",     // 开场白
    val otherContentChat: String = "",     // 聊天模式注入
    val otherContentVoice: String = "",    // 语音模式注入
    val advancedCustomPrompt: String = "", // 高级自定义提示词
    val marks: String = "",               // 笔记（不注入）
    val attachedTagIds: List&lt;String&gt; = emptyList(),
    val chatModelBinding: ChatModelBinding = FOLLOW_GLOBAL,
    val fixedModelConfigId: String? = null,
    val fixedModelIndex: Int = 0,
    val toolAccessEnabled: Boolean = false,
    val allowedTools: List&lt;String&gt; = emptyList(),
    val updatedAt: Long = 0L
)</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">CharacterGroupCard（角色组）</div>
    <div class="kn-code" style="margin:8px 0;">data class CharacterGroupCard(
    val id: String,
    val name: String,
    val description: String = "",
    val members: List&lt;GroupMemberConfig&gt; = emptyList(),
    val updatedAt: Long = 0L
)

data class GroupMemberConfig(
    val characterCardId: String,
    val orderIndex: Int
)</div>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:24px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">📄</div>
        <div class="kn-title blue">3490 行单文件</div>
        <div class="kn-body">ModelPromptsSettingsScreen 包含 3 个标签页、6+ 个对话框、导入/导出逻辑、Color QR 生成，全部内联在 Composable 中。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🃏</div>
        <div class="kn-title green">Tavern 格式兼容</div>
        <div class="kn-body">支持 V1/V2 Tavern 角色卡 JSON，PNG 通过 tEXt chunk 嵌入。Operit 特有字段存入 extensions.operit 块。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🌈</div>
        <div class="kn-title orange">Color QR 编码</div>
        <div class="kn-body">ColorQrCodeUtil 将角色卡 JSON 编码为彩色像素矩阵（2/4/8/16 色），支持图片文件或摄像头扫描解码。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🏷️</div>
        <div class="kn-title blue">标签注入机制</div>
        <div class="kn-body">活跃角色卡的 attachedTagIds 对应标签的 promptContent 在 AI 请求时拼接到系统提示词中。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📦</div>
        <div class="kn-title green">TagMarket 纯静态</div>
        <div class="kn-body">14 个预置标签编译时写死在 TagMarketBilingualData.kt，无网络依赖。双语通过 PresetTagBilingual 持有两版文本。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔗</div>
        <div class="kn-title orange">删除联动提示</div>
        <div class="kn-body">删除角色卡后弹出 showChatManagementPrompt，引导用户跳转到 ChatHistorySettings 清理残留聊天记录。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:20px;background:var(--surface-2);color:var(--text);">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对 ui/features/settings/）</th><th>行数</th><th>职责</th></tr>
      <tr><td><strong>ModelPromptsSettingsScreen</strong></td><td>screens/ModelPromptsSettingsScreen.kt</td><td>3490</td><td>三标签页管理 + 导入导出</td></tr>
      <tr><td><strong>TagMarketScreen</strong></td><td>screens/TagMarketScreen.kt</td><td>221</td><td>预置标签展示 + 安装</td></tr>
      <tr><td>TagMarketBilingualData</td><td>screens/TagMarketBilingualData.kt</td><td>~300</td><td>14 个预置标签双语数据</td></tr>
      <tr><td>CharacterCardDialog</td><td>components/CharacterCardDialog.kt</td><td>~500</td><td>角色卡编辑全屏 Dialog</td></tr>
    </table>
`);
