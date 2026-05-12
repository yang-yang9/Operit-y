registerDetail('settings-theme', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">~60</span><span class="stat-label">主题偏好项</span></div>
      <div class="stat-item"><span class="stat-num">7</span><span class="stat-label">源文件数</span></div>
      <div class="stat-item"><span class="stat-num">~3500</span><span class="stat-label">总代码行数</span></div>
      <div class="stat-item"><span class="stat-num">11</span><span class="stat-label">ColorPicker 路由模式</span></div>
      <div class="stat-item"><span class="stat-num">2132</span><span class="stat-label">主文件行数</span></div>
    </div>

    <!-- 总体架构 -->
    <div class="section-head blue">总体架构 — 全量主题自定义中心</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">
      ThemeSettingsScreen 覆盖 ~60 个主题偏好项，涵盖配色、状态栏、工具栏、聊天气泡、字体、头像、背景等维度。
      所有设置实时持久化（无显式保存按钮），并可与角色卡 / 角色组绑定，实现"每角色一套主题"。
    </p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">文件分拆</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对 ui/features/settings/）</th><th>职责</th></tr>
      <tr><td>ThemeSettingsScreen</td><td>screens/ThemeSettingsScreen.kt</td><td>顶层组合 + 保存协调 + ColorPickerDialog 宿主</td></tr>
      <tr><td>ThemeSettingsCoreSections</td><td>sections/ThemeSettingsCoreSections.kt</td><td>角色绑定卡、主题模式、聊天风格、显示选项</td></tr>
      <tr><td>ThemeSettingsColorSection</td><td>sections/ThemeSettingsColorSection.kt</td><td>状态栏 / 工具栏 / 输入栏 / 自定义色</td></tr>
      <tr><td>ThemeSettingsBackgroundSection</td><td>sections/ThemeSettingsBackgroundSection.kt</td><td>背景图 / 视频 + 模糊</td></tr>
      <tr><td>ThemeSettingsFontAvatarSections</td><td>sections/ThemeSettingsFontAvatarSections.kt</td><td>全局字体 + 头像</td></tr>
      <tr><td>ThemeSettingsComponents</td><td>components/ThemeSettingsComponents.kt</td><td>ThemeModeOption / ChatStyleOption 等小组件</td></tr>
      <tr><td>ColorPickerDialog</td><td>components/ColorPickerDialog.kt</td><td>HSV 色轮 + HEX/RGB/HSV 手动输入 + 预设/最近颜色</td></tr>
    </table>

    <!-- 组件树 -->
    <div class="section-head green" style="margin-top:28px;">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["ThemeSettingsScreen&lt;br/&gt;(Column verticalScroll)"]

    ROOT --> BIND["ThemeSettingsCharacterBindingInfoCard&lt;br/&gt;角色卡/角色组头像 + 绑定说明"]

    ROOT --> MODE["ThemeSettingsThemeModeSection"]
    MODE --> MODE_SYS["Switch: 跟随系统主题"]
    MODE --> MODE_SEL["[非跟随] ThemeModeOption: Light / Dark"]

    ROOT --> COLOR["ThemeSettingsColorCustomizationSection"]
    COLOR --> C_STATUS["Card: 状态栏&lt;br/&gt;Hidden / Transparent / 自定义色"]
    COLOR --> C_TOOLBAR["Card: 工具栏&lt;br/&gt;Transparent / 自定义色"]
    COLOR --> C_HEADER["Card: 聊天头部&lt;br/&gt;Transparent / OverlayMode"]
    COLOR --> C_INPUT["Card: 聊天输入栏&lt;br/&gt;Transparent / Floating / LiquidGlass / WaterGlass"]
    COLOR --> C_APPBAR["Card: AppBar 内容色&lt;br/&gt;强制 Light/Dark"]
    COLOR --> C_ICONS["Card: 聊天头部图标色&lt;br/&gt;History图标 / PiP图标"]
    COLOR --> C_CUSTOM["Card: 自定义主题色&lt;br/&gt;Primary + Secondary + OnColor模式"]

    ROOT --> STYLE["ThemeSettingsChatStyleSection"]
    STYLE --> S_MODE["ChatStyleOption: Cursor / Bubble"]
    STYLE --> S_INPUT["ChatStyleOption: Classic / Agent 输入风格"]
    STYLE --> S_CURSOR["[Cursor] 跟随主题 / LiquidGlass / WaterGlass / 自定义色"]
    STYLE --> S_BUBBLE_LAYOUT["[Bubble] 头像显示 / 宽布局"]
    STYLE --> S_USER_BUBBLE["[Bubble] 用户气泡: Glass效果 / 颜色 / 文字色 / 圆角 / 内边距 / 字体 / 九宫格图"]
    STYLE --> S_AI_BUBBLE["[Bubble] AI气泡: (同用户气泡结构)"]

    ROOT --> AVATAR["ThemeSettingsAvatarSection"]
    AVATAR --> A_USER["AvatarPicker: 用户头像 (角色绑定)"]
    AVATAR --> A_GLOBAL["AvatarPicker: 全局用户头像"]
    AVATAR --> A_NAME["OutlinedTextField: 全局用户名"]
    AVATAR --> A_SHAPE["FilterChip: Circle / Square"]
    AVATAR --> A_RADIUS["[Square] Slider: 圆角半径"]

    ROOT --> DISPLAY["ThemeSettingsDisplayOptionsSection"]
    DISPLAY --> D1["Switch: 显示思考过程"]
    DISPLAY --> D2["Switch: 显示状态标签"]
    DISPLAY --> D3["Switch: 显示输入处理状态"]
    DISPLAY --> D4["Switch: 显示浮动圆点动画"]

    ROOT --> FONT["ThemeSettingsFontSection"]
    FONT --> F_ENABLE["Switch: 启用自定义字体"]
    FONT --> F_TYPE["[启用] FilterChip: System / File"]
    FONT --> F_SYS["[System] Radio: Default/Serif/Sans-Serif/Monospace/Cursive"]
    FONT --> F_FILE["[File] 选择字体文件 (TTF/OTF/TTC)"]
    FONT --> F_SCALE["Slider: 字体缩放 (0.8x~1.5x)"]

    ROOT --> BG["ThemeSettingsBackgroundSection"]
    BG --> BG_ENABLE["Switch: 启用背景"]
    BG --> BG_TYPE["[启用] MediaTypeOption: Image / Video"]
    BG --> BG_IMG["[Image] 裁剪选择 + 透明度滑块"]
    BG --> BG_VID["[Video] 选择视频 (30MB限制) + ExoPlayer预览 + 静音/循环"]
    BG --> BG_BLUR["[Image] 模糊开关 + 模糊半径滑块"]

    ROOT --> FOOTER["重置所有主题设置 (OutlinedButton)"]
    ROOT --> PICKER["ColorPickerDialog (全局共享)"]
    </div>

    <!-- 状态管理 -->
    <div class="section-head orange" style="margin-top:28px;">状态管理</div>
    <p style="margin:0 0 10px 4px;font-size:13px;color:var(--text-dim);">
      所有偏好通过 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">collectAsState</code> 收集后复制到局部 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">*Input</code> 变量，UI 直接读写局部变量实现即时响应，DataStore 写入通过 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">saveThemeSettingsWithCharacterCard</code> 异步完成。
    </p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">Manager 依赖</div>
    <table class="act-table">
      <tr><th>Manager</th><th>职责</th></tr>
      <tr><td>UserPreferencesManager</td><td>~60 个主题偏好（DataStore）</td></tr>
      <tr><td>DisplayPreferencesManager</td><td>全局用户头像 URI + 用户名</td></tr>
      <tr><td>CharacterCardManager</td><td>活跃角色卡 Flow</td></tr>
      <tr><td>CharacterGroupCardManager</td><td>活跃角色组 Flow</td></tr>
      <tr><td>ActivePromptManager</td><td>当前活跃 Prompt 类型（角色卡 or 角色组）</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">~60 个偏好分组</div>
    <table class="act-table">
      <tr><th>分组</th><th>偏好数量</th><th>关键项</th></tr>
      <tr><td>主题模式</td><td>2</td><td>themeMode (light/dark)、useSystemTheme</td></tr>
      <tr><td>全局配色</td><td>4</td><td>customPrimaryColor、customSecondaryColor、useCustomColors、onColorMode</td></tr>
      <tr><td>状态栏</td><td>4</td><td>useCustomStatusBarColor、statusBarTransparent、statusBarHidden、customStatusBarColor</td></tr>
      <tr><td>工具栏 / AppBar</td><td>5</td><td>toolbarTransparent、useCustomAppBarColor、forceAppBarContentColor、appBarContentColorMode、customAppBarColor</td></tr>
      <tr><td>聊天头部</td><td>4</td><td>chatHeaderTransparent、chatHeaderOverlayMode、chatHeaderHistoryIconColor、chatHeaderPipIconColor</td></tr>
      <tr><td>聊天输入栏</td><td>4</td><td>chatInputTransparent、chatInputFloating、chatInputLiquidGlass、chatInputWaterGlass</td></tr>
      <tr><td>聊天风格</td><td>2</td><td>chatStyle (cursor/bubble)、inputStyle (classic/agent)</td></tr>
      <tr><td>Cursor 气泡</td><td>4</td><td>cursorUserBubbleFollowTheme、cursorUserBubbleLiquidGlass、cursorUserBubbleWaterGlass、cursorUserBubbleColor</td></tr>
      <tr><td>Bubble 布局</td><td>2</td><td>bubbleShowAvatar、bubbleWideLayoutEnabled</td></tr>
      <tr><td>用户气泡</td><td>~12</td><td>glass 效果、颜色、文字色、圆角、内边距、字体、九宫格图</td></tr>
      <tr><td>AI 气泡</td><td>~12</td><td>（同用户气泡结构）</td></tr>
      <tr><td>字体</td><td>5</td><td>useCustomFont、fontType、systemFontName、customFontPath、fontScale</td></tr>
      <tr><td>头像</td><td>5</td><td>customUserAvatarUri、customAiAvatarUri、globalUserAvatarUri、avatarShape、avatarCornerRadius</td></tr>
      <tr><td>背景</td><td>7</td><td>useBackgroundImage、backgroundImageUri、backgroundMediaType、backgroundImageOpacity、videoBackgroundMuted、videoBackgroundLoop、backgroundBlurRadius</td></tr>
      <tr><td>显示选项</td><td>4</td><td>showThinkingProcess、showStatusTags、showInputProcessingStatus、showChatFloatingDotsAnimation</td></tr>
      <tr><td>最近颜色</td><td>1</td><td>recentColors（List&lt;Int&gt;，最多 14 个）</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">角色卡主题绑定</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">每次保存偏好时，通过包装器额外调用角色卡快照保存；切换角色卡时自动加载该角色的主题快照；重置主题时同步删除角色卡主题绑定。</p>
    <div class="kn-code">saveThemeSettings(具体参数)
  → saveCurrentThemeToCharacterCard(cardId)   // 或 saveCurrentThemeToCharacterGroup(groupId)</div>

    <!-- ColorPickerDialog -->
    <div class="section-head purple" style="margin-top:28px;">ColorPickerDialog — 颜色选择器</div>
    <p style="margin:0 0 10px 4px;font-size:13px;color:var(--text-dim);">
      全局共享的颜色选择对话框，通过 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">showColorPicker</code> + <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">currentColorPickerMode</code> 路由到 11 种目标偏好。
      确认时调用 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">handleThemeColorSelected(mode, color)</code>：更新局部变量 → 追加到最近颜色列表 → 保存到 DataStore + 角色卡绑定。
    </p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">11 种路由 mode</div>
    <table class="act-table">
      <tr><th>mode</th><th>目标偏好</th></tr>
      <tr><td>"primary"</td><td>customPrimaryColor</td></tr>
      <tr><td>"secondary"</td><td>customSecondaryColor</td></tr>
      <tr><td>"statusBar"</td><td>customStatusBarColor</td></tr>
      <tr><td>"appBar"</td><td>customAppBarColor</td></tr>
      <tr><td>"historyIcon"</td><td>chatHeaderHistoryIconColor</td></tr>
      <tr><td>"pipIcon"</td><td>chatHeaderPipIconColor</td></tr>
      <tr><td>"cursorUserBubble"</td><td>cursorUserBubbleColor</td></tr>
      <tr><td>"bubbleUserBubble"</td><td>bubbleUserBubbleColor</td></tr>
      <tr><td>"bubbleAiBubble"</td><td>bubbleAiBubbleColor</td></tr>
      <tr><td>"bubbleUserText"</td><td>bubbleUserTextColor</td></tr>
      <tr><td>"bubbleAiText"</td><td>bubbleAiTextColor</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">Dialog 内部结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">ColorPickerDialog (AlertDialog)</div>
      <div class="tree-children">
        <div class="tree-node">实时颜色预览 + 对比度评级（High / Low Contrast）</div>
        <div class="tree-node">手动输入 Card</div>
        <div class="tree-children">
          <div class="tree-node">Tab: HEX（含剪贴板粘贴按钮）/ RGB（3 字段）/ HSV（3 字段）</div>
          <div class="tree-node">Apply 按钮 → 同步到色轮</div>
        </div>
        <div class="tree-node">AlphaTile: 透明度预览条</div>
        <div class="tree-node">HsvColorPicker（220dp，skydoves/colorpicker-compose）</div>
        <div class="tree-node">BrightnessSlider（30dp）</div>
        <div class="tree-node">AlphaSlider（30dp）</div>
        <div class="tree-node">最近使用颜色（最多 14 个，2 行 × 7）</div>
        <div class="tree-node">Material 预设颜色（14 个，2 行 × 7）</div>
        <div class="tree-node">Confirm / Cancel</div>
      </div>
    </div>

    <!-- 特殊机制 -->
    <div class="section-head pink" style="margin-top:28px;">特殊机制</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">5.1 九宫格气泡图（Nine-Patch）</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">用户选择 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">.9.png</code> 文件时跳过裁剪，自动解析拉伸区域；非 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">.9.png</code> 图片走 CropImageContract（canhub）裁剪，PNG 输出保留透明度。</p>
    <div class="kn-code">parseNinePatchBubbleParams()
  → Dispatchers.IO 解码 Bitmap
  → 扫描顶边像素 → repeatXStart/End
  → 扫描左边像素 → repeatYStart/End
  → 计算 cropLeft/Top/Right/Bottom
  → 保存 bubbleImageRenderMode = "nine_patch"</div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">5.2 视频背景（ExoPlayer）</div>
    <div class="kn-code">remember {} 创建 ExoPlayer (maxBuffer 5MB, 10s)
  → DisposableEffect 管理生命周期
  → LaunchedEffect 监听 URI/静音/循环变化
  → AndroidView(StyledPlayerView) 渲染预览
  → 30MB 文件大小限制检查</div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">5.3 背景图迁移</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">首次加载时检测 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">content://</code> 格式的旧 URI，自动复制到内部存储并更新引用；迁移失败则禁用背景。</p>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">5.4 Liquid Glass / Water Glass 互斥</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">同一组件位置的 LiquidGlass 和 WaterGlass 互斥：开启一个时，同一 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">saveThemeSettings()</code> 调用中显式将另一个设为 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">false</code>。影响 3 组：chatInput、cursorUserBubble、bubbleUser/AiBubble。</p>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">5.5 文字色自动推导</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);"><code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">bubbleUserTextColor</code> / <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">bubbleAiTextColor</code> 为 null 时（用户未自定义），通过 <code style="background:var(--surface-2);padding:1px 5px;border-radius:3px;">getTextColorForBackground(bubbleColor)</code> 动态计算。ColorPickerDialog 接收计算后的 effective 值，非原始 null。</p>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">5.6 图片裁剪器</div>
    <table class="act-table">
      <tr><th>Launcher</th><th>用途</th><th>输出格式</th><th>比例</th></tr>
      <tr><td>cropImageLauncher</td><td>背景图</td><td>JPEG</td><td>自由</td></tr>
      <tr><td>bubbleImageCropLauncher</td><td>气泡背景图</td><td>PNG（保留透明）</td><td>自由</td></tr>
      <tr><td>cropAvatarLauncher</td><td>头像</td><td>—</td><td>1:1 强制</td></tr>
    </table>

    <!-- 聊天风格对比 -->
    <div class="section-head blue" style="margin-top:28px;">聊天风格对比</div>
    <table class="act-table">
      <tr><th>维度</th><th>Cursor 风格</th><th>Bubble 风格</th></tr>
      <tr><td>布局</td><td>左对齐连续排列</td><td>左右分列气泡</td></tr>
      <tr><td>用户气泡配色</td><td>跟随主题 or 自定义色</td><td>独立自定义色 + 文字色</td></tr>
      <tr><td>AI 气泡配色</td><td>无独立设置</td><td>独立自定义色 + 文字色</td></tr>
      <tr><td>头像</td><td>无</td><td>可选显示</td></tr>
      <tr><td>宽布局</td><td>无</td><td>可选</td></tr>
      <tr><td>九宫格图</td><td>不支持</td><td>用户 / AI 各可设</td></tr>
      <tr><td>自定义字体</td><td>不支持</td><td>用户 / AI 各可设</td></tr>
      <tr><td>Glass 效果</td><td>Liquid / Water（1 组）</td><td>Liquid / Water（用户 + AI 各 1 组）</td></tr>
    </table>

    <!-- 数据模型 -->
    <div class="section-head gray" style="margin-top:28px;">数据模型</div>
    <div class="kn-code">sealed interface ActivePrompt {
    data class CharacterCard(val id: String) : ActivePrompt
    data class CharacterGroup(val id: String) : ActivePrompt
}

// 九宫格解析结果（文件级 private）
data class NinePatchBubbleAutoParams(
    val cropLeft: Float, val cropTop: Float,
    val cropRight: Float, val cropBottom: Float,
    val repeatXStart: Float, val repeatXEnd: Float,
    val repeatYStart: Float, val repeatYEnd: Float
)</div>

    <!-- 架构要点 -->
    <div class="section-head orange" style="margin-top:28px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🚫</div>
        <div class="kn-title blue">无 ViewModel</div>
        <div class="kn-body">所有 ~60 个偏好直接 collectAsState + 局部 *Input 缓冲变量，Manager 单例通过 remember { getInstance(context) } 获取，无单独 ViewModel 层。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">💾</div>
        <div class="kn-title green">即时持久化</div>
        <div class="kn-body">每个开关 / 滑块 / 颜色选择立即触发 saveThemeSettings()，无整体保存按钮。仅底部有"重置所有"按钮。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🎭</div>
        <div class="kn-title purple">角色卡绑定传播</div>
        <div class="kn-body">每次偏好写入后额外序列化当前主题快照到角色卡 / 角色组，实现"每角色一套主题"。切换角色卡自动加载对应主题。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔄</div>
        <div class="kn-title orange">LaunchedEffect 同步</div>
        <div class="kn-body">~60 个 DataStore 值作为 key 的 LaunchedEffect 确保外部变更（如角色卡切换）能回写到局部 *Input 变量，保持 UI 一致。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📂</div>
        <div class="kn-title blue">Section 文件分拆</div>
        <div class="kn-body">2132 行主文件 + 5 个 Section 文件，避免单文件过大，但状态仍由主文件统一管理并通过参数传入 Section。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">⚙️</div>
        <div class="kn-title gray">大参数 suspend 函数</div>
        <div class="kn-body">单一 saveThemeSettings suspend 函数接受 ~130 个可空参数，仅写入非 null 字段，与 DisplayPreferencesManager.saveDisplaySettings（19 参数）模式相同。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:28px;background:var(--surface-2);color:var(--text);">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对 ui/features/settings/）</th><th>行数</th><th>职责</th></tr>
      <tr><td><strong>ThemeSettingsScreen</strong></td><td>screens/ThemeSettingsScreen.kt</td><td>2132</td><td>顶层组合 + 保存 + Dialog 宿主</td></tr>
      <tr><td>ThemeSettingsCoreSections</td><td>sections/ThemeSettingsCoreSections.kt</td><td>~350</td><td>绑定卡 / 模式 / 风格 / 显示</td></tr>
      <tr><td>ThemeSettingsColorSection</td><td>sections/ThemeSettingsColorSection.kt</td><td>~400</td><td>颜色自定义 7 卡</td></tr>
      <tr><td>ThemeSettingsBackgroundSection</td><td>sections/ThemeSettingsBackgroundSection.kt</td><td>~250</td><td>背景图 / 视频</td></tr>
      <tr><td>ThemeSettingsFontAvatarSections</td><td>sections/ThemeSettingsFontAvatarSections.kt</td><td>~300</td><td>字体 + 头像</td></tr>
      <tr><td>ColorPickerDialog</td><td>components/ColorPickerDialog.kt</td><td>~350</td><td>HSV 色轮 + 手动输入</td></tr>
      <tr><td>ThemeSettingsComponents</td><td>components/ThemeSettingsComponents.kt</td><td>~100</td><td>ThemeModeOption / ChatStyleOption</td></tr>
    </table>
`);
