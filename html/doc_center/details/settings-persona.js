registerDetail('settings-persona', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">1062</span><span class="stat-label">PersonaCard 行数</span></div>
      <div class="stat-item"><span class="stat-num">627</span><span class="stat-label">WaifuMode 行数</span></div>
      <div class="stat-item"><span class="stat-num">556</span><span class="stat-label">CustomEmoji 行数</span></div>
      <div class="stat-item"><span class="stat-num">8</span><span class="stat-label">角色卡字段数</span></div>
      <div class="stat-item"><span class="stat-num">40</span><span class="stat-label">消息上限</span></div>
      <div class="stat-item"><span class="stat-num">7</span><span class="stat-label">Waifu 设置项</span></div>
      <div class="stat-item"><span class="stat-num">9</span><span class="stat-label">内置表情分类</span></div>
    </div>

    <!-- PersonaCardGenerationScreen -->
    <div class="section-head blue">PersonaCardGenerationScreen — 角色卡生成</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">AI 对话式角色卡生成器。左侧抽屉管理角色卡字段，主区域为聊天界面，AI 通过工具调用自动填充角色卡字段。无 ViewModel，聊天历史通过 PersonaCardChatHistoryManager（DataStore + Gson）按角色卡 ID 独立持久化。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["PersonaCardGenerationScreen&lt;br/&gt;(ModalNavigationDrawer)"]

    ROOT --> DRAWER["ModalDrawerSheet (抽屉)"]
    DRAWER --> D_CLOSE["IconButton: 关闭"]
    DRAWER --> D_DROP["ExposedDropdownMenuBox: 角色卡选择"]
    DRAWER --> D_DEL["TextButton: 删除当前卡 (非默认)"]
    DRAWER --> D_FIELDS["8个 OutlinedTextField"]

    ROOT --> MAIN["Column (主区域)"]
    MAIN --> M_TOP["Row: 标题 + 清空历史 + 打开抽屉"]
    MAIN --> M_CHAT["LazyColumn: 聊天消息列表"]
    M_CHAT --> M_MSG_USER["Card: 用户气泡 (右对齐, primaryContainer)"]
    M_CHAT --> M_MSG_AI["Card: AI气泡 (左对齐, surfaceVariant)"]
    MAIN --> M_INPUT["Surface: 输入栏"]
    M_INPUT --> M_FIELD["OutlinedTextField + 消息计数器"]
    M_INPUT --> M_SEND["FilledIconButton: Send/HourglassBottom"]

    ROOT --> DLG_CREATE["AlertDialog: 创建新角色卡"]
    ROOT --> DLG_DEL["AlertDialog: 删除确认"]
    ROOT --> DLG_LIMIT["AlertDialog: 消息上限警告"]
    ROOT --> DLG_CLEAR["AlertDialog: 清空历史确认"]
    </div>

    <div class="section-head green" style="margin-top:16px;">AI 对话流程</div>
    <div class="kn-code" style="margin:8px 0;">用户输入 → sendMessage()
  → 追加用户气泡 + 保存历史
  → isGenerating = true
  → 检查 isCharacterCardComplete() (8字段全非空 → 短路回复)
  → requestFromDefaultService()
    → EnhancedAIService.getAIServiceForFunction(CHAT)
    → 发送完整历史 + personaCardGenerationSystemPrompt
    → 流式接收 → 清理工具标签/状态标签
  → processToolInvocations()
    → 解析 &lt;tool name="save_character_info"&gt; XML
    → LocalCharacterToolExecutor 更新 CharacterCard
  → 更新 token 统计
  → 保存聊天历史</div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0 12px;">消息上限 40 条，达到后弹出警告对话框，引导用户清空历史。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">抽屉编辑器 — 8 个角色卡字段</div>
    <table class="act-table">
      <tr><th>字段</th><th>绑定变量</th></tr>
      <tr><td>Name</td><td>editName</td></tr>
      <tr><td>Description</td><td>editDescription</td></tr>
      <tr><td>Character Setting</td><td>editCharacterSetting</td></tr>
      <tr><td>Opening Statement</td><td>editOpeningStatement</td></tr>
      <tr><td>Other Content (Chat)</td><td>editOtherContentChat</td></tr>
      <tr><td>Other Content (Voice)</td><td>editOtherContentVoice</td></tr>
      <tr><td>Advanced Custom Prompt</td><td>editAdvancedCustomPrompt</td></tr>
      <tr><td>Marks/Notes</td><td>editMarks</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0 12px;">每个字段的 onValueChange 立即调用 characterCardManager.updateCharacterCard(card.copy(...))，无独立保存按钮。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <table class="act-table">
      <tr><th>状态</th><th>说明</th></tr>
      <tr><td>chatMessages</td><td>SnapshotStateList&lt;CharacterChatMessage&gt;</td></tr>
      <tr><td>isGenerating</td><td>发送中锁定</td></tr>
      <tr><td>activeCardId</td><td>当前编辑的角色卡 ID</td></tr>
      <tr><td>activeCard</td><td>当前角色卡对象</td></tr>
      <tr><td>drawerState</td><td>抽屉开关</td></tr>
      <tr><td>MESSAGE_LIMIT</td><td>40（常量）</td></tr>
    </table>

    <!-- WaifuModeSettingsScreen -->
    <div class="section-head orange" style="margin-top:28px;">WaifuModeSettingsScreen — Waifu 模式设置</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">Waifu 模式全量配置，覆盖打字速度、标点清理、自定义提示词、表情、自拍功能。所有设置与当前活跃角色卡/角色组绑定，无 ViewModel，通过 WaifuPreferences（DataStore waifu_settings）管理。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">WaifuModeSettingsScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">Column (verticalScroll, spacing 24dp)</div>
        <div class="tree-children">
          <div class="tree-node">Card (secondaryContainer): 页面标题 + 描述</div>
          <div class="tree-node">Card (primaryContainer): 角色卡绑定信息</div>
          <div class="tree-node">Card: 启用开关 (Switch)</div>
          <div class="tree-node">[启用后显示]</div>
          <div class="tree-children">
            <div class="tree-node">Card: 打字速度</div>
            <div class="tree-children">
              <div class="tree-node">Text: 当前速度 (chars/sec = 1000/delay)</div>
              <div class="tree-node">Slider: charDelay (200~1000ms, 步进20ms)</div>
            </div>
            <div class="tree-node">Card: 移除标点 (Switch)</div>
            <div class="tree-node">Card: 自定义 Waifu 提示词</div>
            <div class="tree-children">
              <div class="tree-node">OutlinedTextField (4~8行)</div>
            </div>
            <div class="tree-node">Card: 启用表情 (Switch)</div>
            <div class="tree-node">Card: 管理自定义表情 (→ CustomEmojiManagement)</div>
            <div class="tree-node">Card: 启用自拍功能 (Switch)</div>
            <div class="tree-children">
              <div class="tree-node">[启用后] OutlinedTextField: 外貌描述提示词</div>
            </div>
          </div>
          <div class="tree-node">Card (tertiaryContainer): 功能说明</div>
          <div class="tree-node">[保存成功] Card: 绿色成功提示 (2秒自动消失)</div>
        </div>
      </div>
    </div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">7 个 WaifuPreferences 设置项</div>
    <table class="act-table">
      <tr><th>设置项</th><th>默认值</th><th>说明</th></tr>
      <tr><td>enableWaifuMode</td><td>false</td><td>主开关</td></tr>
      <tr><td>waifuCharDelay</td><td>500ms</td><td>打字延迟</td></tr>
      <tr><td>waifuRemovePunctuation</td><td>false</td><td>移除标点</td></tr>
      <tr><td>waifuEnableEmoticons</td><td>false</td><td>启用表情</td></tr>
      <tr><td>waifuEnableSelfie</td><td>false</td><td>启用自拍</td></tr>
      <tr><td>waifuCustomPrompt</td><td>DEFAULT_CUSTOM_PROMPT</td><td>自定义提示词</td></tr>
      <tr><td>waifuSelfiePrompt</td><td>DEFAULT_SELFIE_PROMPT</td><td>外貌描述</td></tr>
    </table>

    <div class="section-head green" style="margin-top:16px;">保存与角色绑定机制</div>
    <div class="kn-code" style="margin:8px 0;">saveSettings { waifuPreferences.saveXxx(...) }
  → 执行保存
  → saveCurrentWaifuSettingsToCharacterCard(id)
     或 saveCurrentWaifuSettingsToCharacterGroup(id)
  → showSaveSuccess = true (2秒后自动消失)</div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0 12px;">切换角色卡时，switchToCharacterCardWaifuSettings() 从角色特定前缀键复制到扁平命名空间。双层 DataStore：扁平命名空间（当前生效值）+ 角色前缀命名空间（快照）。</p>

    <!-- CustomEmojiManagementScreen -->
    <div class="section-head" style="margin-top:28px;background:linear-gradient(90deg,var(--accent-purple,#a855f7),var(--accent-pink,#ec4899));color:#fff;">CustomEmojiManagementScreen — 自定义表情管理</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">按分类管理自定义表情图片。支持创建/删除分类、批量添加/单独删除表情、预览大图。所有数据按活跃角色卡/角色组独立存储。<strong style="color:var(--accent,#7c9ef8);">Settings 22 个子页面中唯一使用 ViewModel 的页面</strong>（通过 remember {} 创建，非标准 viewModel() 工厂）。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">CustomEmojiManagementScreen (Scaffold + FAB)</div>
      <div class="tree-children">
        <div class="tree-node">FAB: 添加表情图片 (多选)</div>
        <div class="tree-node">Card: 角色卡绑定信息</div>
        <div class="tree-node">CategorySelector (ExposedDropdownMenuBox)</div>
        <div class="tree-children">
          <div class="tree-node">DropdownMenuItem: 分类列表 (自定义分类带★标记)</div>
        </div>
        <div class="tree-node">Row: Create Group / Delete Group / Reset to Default</div>
        <div class="tree-node">[空] 添加提示文本</div>
        <div class="tree-node">[非空] EmojiGrid</div>
        <div class="tree-children">
          <div class="tree-node">LazyVerticalGrid (3列)</div>
          <div class="tree-children">
            <div class="tree-node">EmojiCard</div>
            <div class="tree-children">
              <div class="tree-node">AsyncImage (Coil, Crop)</div>
              <div class="tree-node">Delete图标覆盖 (右上)</div>
            </div>
          </div>
        </div>
        <div class="tree-node">[加载中] LinearProgressIndicator</div>
        <div class="tree-node">AlertDialog: 创建分类 (名称校验: a-z0-9_)</div>
        <div class="tree-node">AlertDialog: 删除分类确认</div>
        <div class="tree-node">AlertDialog: 删除表情确认</div>
        <div class="tree-node">AlertDialog: 重置确认</div>
        <div class="tree-node">Dialog: 表情大图预览</div>
        <div class="tree-node">Snackbar: 错误/成功消息</div>
      </div>
    </div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">CustomEmojiViewModel StateFlow</div>
    <table class="act-table">
      <tr><th>StateFlow</th><th>说明</th></tr>
      <tr><td>activePrompt</td><td>活跃角色卡/组</td></tr>
      <tr><td>activeTargetName</td><td>绑定目标显示名</td></tr>
      <tr><td>selectedCategory</td><td>当前选中分类</td></tr>
      <tr><td>categories</td><td>所有分类列表</td></tr>
      <tr><td>emojisInCategory</td><td>当前分类的表情列表</td></tr>
      <tr><td>isLoading</td><td>加载状态</td></tr>
      <tr><td>errorMessage / successMessage</td><td>反馈消息</td></tr>
    </table>

    <div class="section-head green" style="margin-top:16px;">9 个内置情绪分类</div>
    <p style="margin:4px 0 8px 4px;font-size:13px;color:var(--text-dim);">happy · sad · angry · surprised · confused · crying · like_you · miss_you · speechless</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">文件存储结构</div>
    <div class="kn-code" style="margin:8px 0;">filesDir/custom_emoji/&lt;target-prefix&gt;/&lt;category&gt;/&lt;uuid&gt;.jpg

元数据：DataStore "custom_emoji_settings"
键格式：character_card_custom_emoji_&lt;id&gt;_*</div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">交互流程</div>
    <table class="act-table">
      <tr><th>操作</th><th>流程</th></tr>
      <tr><td>添加表情</td><td>FAB → imagePickerLauncher (多选) → repository.addCustomEmoji() 复制文件 + 写元数据</td></tr>
      <tr><td>查看表情</td><td>点击 → Dialog 大图预览</td></tr>
      <tr><td>删除表情</td><td>长按 → 确认 → viewModel.deleteEmoji()</td></tr>
      <tr><td>创建分类</td><td>按钮 → Dialog → 名称校验 (a-z0-9_) → 自动切换</td></tr>
      <tr><td>删除分类</td><td>按钮 → 确认 → 删除文件+元数据 → 自动切换到首个分类</td></tr>
      <tr><td>重置</td><td>按钮 → 确认 → 删除所有自定义数据 → 重初始化内置表情</td></tr>
    </table>

    <!-- 导航关系 -->
    <div class="section-head" style="margin-top:28px;background:var(--surface-2);color:var(--text);">导航关系</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Settings</div>
      <div class="tree-children">
        <div class="tree-node">PersonaCardGeneration (parentScreen = Settings)</div>
        <div class="tree-children">
          <div class="tree-node">抽屉内可创建/切换/删除角色卡</div>
        </div>
        <div class="tree-node">WaifuModeSettings (parentScreen = Settings)</div>
        <div class="tree-children">
          <div class="tree-node">CustomEmojiManagement (parentScreen = WaifuModeSettings)</div>
        </div>
      </div>
    </div>
    <table class="act-table" style="margin-top:8px;">
      <tr><th>方向</th><th>说明</th></tr>
      <tr><td>Settings → PersonaCardGeneration</td><td>入口页 "Persona Card Generation" 项</td></tr>
      <tr><td>Settings → WaifuModeSettings</td><td>入口页 "Waifu Mode Settings" 项</td></tr>
      <tr><td>WaifuModeSettings → CustomEmojiManagement</td><td>"管理自定义表情" 卡片</td></tr>
      <tr><td>ModelPromptsSettings → PersonaCardGeneration</td><td>Tab 0 头部 AutoAwesome 按钮</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0 12px;">PersonaCardGeneration 声明了 4 个交叉导航回调（Settings / UserPreferences / ModelConfig / ModelPrompts），但当前 UI 中无对应按钮。</p>

    <!-- 共享实体矩阵 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">共享实体矩阵</div>
    <table class="act-table">
      <tr><th>实体</th><th>PersonaCard</th><th>WaifuMode</th><th>CustomEmoji</th></tr>
      <tr><td>ActivePromptManager</td><td>读+写</td><td>只读</td><td>只读 (ViewModel内)</td></tr>
      <tr><td>CharacterCardManager</td><td>CRUD</td><td>只读 (名称)</td><td>只读 (ViewModel内)</td></tr>
      <tr><td>ActivePrompt 绑定</td><td>创建/切换角色卡</td><td>按卡保存设置</td><td>按卡存储表情</td></tr>
    </table>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:20px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🤖</div>
        <div class="kn-title blue">PersonaCard 内嵌 AI 服务</div>
        <div class="kn-body">直接通过 EnhancedAIService.getAIServiceForFunction(CHAT) 创建临时 AI 服务，流式处理响应并解析 XML 工具调用，无需独立服务层。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔧</div>
        <div class="kn-title green">LocalCharacterToolExecutor</div>
        <div class="kn-body">private object，屏幕内处理 save_character_info 工具调用，直接更新 CharacterCard，工具执行器与 UI 紧耦合。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📦</div>
        <div class="kn-title orange">WaifuMode 双层 DataStore</div>
        <div class="kn-body">扁平命名空间保存当前生效值，角色前缀命名空间保存快照。角色切换时 switchToCharacterCardWaifuSettings() 复制快照到扁平层。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🎭</div>
        <div class="kn-title" style="color:var(--accent-purple,#a855f7);">CustomEmoji 唯一 ViewModel</div>
        <div class="kn-body">22 个 Settings 子页面中唯一使用 ViewModel 的页面。通过 remember { CustomEmojiViewModel(context) } 创建，不走标准 viewModel() 工厂，不跨进程存活。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">👁</div>
        <div class="kn-title blue">渐进式展示</div>
        <div class="kn-body">WaifuMode 的 6 张配置卡仅在主开关启用后渲染，自拍描述仅在自拍开关启用后渲染，减少界面认知负担。</div>
      </div>
    </div>

    <!-- 核心文件清单 -->
    <div class="section-head" style="margin-top:20px;background:var(--surface-2);color:var(--text);">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对 ui/features/settings/）</th><th>行数</th><th>职责</th></tr>
      <tr><td>PersonaCardGenerationScreen</td><td>screens/PersonaCardGenerationScreen.kt</td><td>1062</td><td>AI 对话式角色卡生成</td></tr>
      <tr><td>WaifuModeSettingsScreen</td><td>screens/WaifuModeSettingsScreen.kt</td><td>627</td><td>Waifu 模式配置</td></tr>
      <tr><td>CustomEmojiManagementScreen</td><td>screens/CustomEmojiManagementScreen.kt</td><td>556</td><td>表情分类管理</td></tr>
    </table>
`);
