registerDetail('settings-language-display', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">205</span><span class="stat-label">LanguageSettings 行数</span></div>
      <div class="stat-item"><span class="stat-num">929</span><span class="stat-label">GlobalDisplay 行数</span></div>
      <div class="stat-item"><span class="stat-num">391</span><span class="stat-label">LayoutAdjustment 行数</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">支持语言数</span></div>
      <div class="stat-item"><span class="stat-num">~20</span><span class="stat-label">显示配置项</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">布局可调参数</span></div>
    </div>

    <!-- LanguageSettingsScreen -->
    <div class="section-head blue">LanguageSettingsScreen — 语言设置</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">源码规模：<code style="color:var(--cyan);">LanguageSettingsScreen.kt</code> 205 行。负责语言选择与切换，切换后通过重启 Activity 生效。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">LanguageSettingsScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">Text (section header)</div>
        <div class="tree-node">[isChangingLanguage] CircularProgressIndicator + Text</div>
        <div class="tree-node">[else] LazyColumn</div>
        <div class="tree-children">
          <div class="tree-node">items(supportedLanguages)</div>
          <div class="tree-children">
            <div class="tree-node">LanguageItem</div>
            <div class="tree-children">
              <div class="tree-node">Row: Language 图标 + Column(displayName + nativeName)</div>
              <div class="tree-node">[isSelected] Check 图标</div>
            </div>
          </div>
        </div>
        <div class="tree-node">Card (surfaceVariant): 语言说明</div>
      </div>
    </div>

    <div class="section-head green" style="margin-top:16px;">支持语言</div>
    <table class="act-table">
      <tr><th>code</th><th>显示名</th><th>原生名</th></tr>
      <tr><td><code>system</code></td><td>Follow system</td><td>跟随系统</td></tr>
      <tr><td><code>zh</code></td><td>Chinese</td><td>中文</td></tr>
      <tr><td><code>en</code></td><td>English</td><td>English</td></tr>
      <tr><td><code>pt-BR</code></td><td>Portuguese (Brazil)</td><td>Português (Brasil)</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">语言切换流程</div>
    <div class="kn-code" style="margin:8px 0;">点击语言行 → isChangingLanguage = true
  → LocaleUtils.setAppLanguage(context, code)
    → preferencesManager.saveAppLanguage() [阻塞 IO]
    → AppCompatDelegate.setApplicationLocales() [API 33+]
    → Resources.updateConfiguration() [旧版]
  → Toast
  → delay(600ms)
  → Intent(MainActivity) + FLAG_ACTIVITY_CLEAR_TASK → 重启应用</div>

    <!-- GlobalDisplaySettingsScreen -->
    <div class="section-head orange" style="margin-top:28px;">GlobalDisplaySettingsScreen — 全局显示设置</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">源码规模：<code style="color:var(--cyan);">GlobalDisplaySettingsScreen.kt</code> 929 行。覆盖消息显示、系统行为、自动化设置三大分区，共约 20 个配置项，包含开关、滑块、芯片选择器、文本输入等多种控件。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["GlobalDisplaySettingsScreen&lt;br/&gt;(CustomScaffold → Column verticalScroll)"]

    ROOT --> SEC_MSG["SectionTitle: 消息显示设置"]
    SEC_MSG --> T1["Switch: 显示模型提供商"]
    SEC_MSG --> T2["Switch: 显示模型名称"]
    SEC_MSG --> T3["Switch: 显示角色名"]
    SEC_MSG --> T4["Switch: 显示用户名"]
    SEC_MSG --> COLLAPSE["Slider: 工具折叠模式&lt;br/&gt;(READ_ONLY / ALL / FULL)"]
    SEC_MSG --> USERNAME["[showUserName] OutlinedTextField&lt;br/&gt;全局用户名 + Save 按钮"]

    ROOT --> SEC_SYS["SectionTitle: 系统显示设置"]
    SEC_SYS --> T5["Switch: FPS 计数器"]
    SEC_SYS --> T6["Switch: 回复通知"]
    SEC_SYS --> T7["Switch: 通知声音"]
    SEC_SYS --> T8["Switch: 通知振动"]
    SEC_SYS --> T9["Switch: 回车发送"]
    SEC_SYS --> T10["Switch: 保持屏幕常亮"]
    SEC_SYS --> WAIT["Slider: Visit-web 等待时间 (0-10s)"]
    SEC_SYS --> ICON["FlowRow FilterChip: 应用图标&lt;br/&gt;(DEFAULT / SIMPLE)"]

    ROOT --> SEC_AUTO["SectionTitle: 自动化行为"]
    SEC_AUTO --> T11["Switch: 无障碍模式"]
    SEC_AUTO --> T12["Switch: 实验性虚拟显示"]
    SEC_AUTO --> T13["Switch: 隐藏运行时任务视图"]
    SEC_AUTO --> BITRATE["FlowRow FilterChip: 虚拟显示码率&lt;br/&gt;(1.5/3/5/10/20 Mbps)"]
    SEC_AUTO --> STATUS["FlowRow FilterChip: 状态指示器样式&lt;br/&gt;(彩虹边框 / 顶部提示)"]
    SEC_AUTO --> SCREENSHOT["截图设置&lt;br/&gt;格式(PNG/JPG) + 质量 + 分辨率"]
    SEC_AUTO --> ROOT_SEC["[ROOT权限] Root执行模式&lt;br/&gt;(AUTO/FORCE_LIBSU/FORCE_EXEC)&lt;br/&gt;+ 自定义su命令"]

    ROOT --> RESET["Button: 重置所有显示设置"]
    </div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <p style="margin:0 0 8px 4px;font-size:12px;color:var(--text-dim);">3 个 Manager + 1 个全局偏好，<strong>滑块防抖</strong>：4 个滑块值通过 <code>LaunchedEffect</code> + <code>delay(300ms)</code> 防抖后写入 DataStore。</p>
    <table class="act-table">
      <tr><th>Manager</th><th>职责</th></tr>
      <tr><td><code>DisplayPreferencesManager</code></td><td>19 个显示偏好 (DataStore)</td></tr>
      <tr><td><code>ApiPreferences</code></td><td>keepScreenOn</td></tr>
      <tr><td><code>UserPreferencesManager</code></td><td>uiAccessibilityMode, hasBackgroundImage</td></tr>
      <tr><td><code>androidPermissionPreferences</code></td><td>ROOT 执行模式</td></tr>
    </table>

    <div class="section-head purple" style="margin-top:16px;">特殊设置</div>
    <table class="act-table">
      <tr><th>设置</th><th>说明</th></tr>
      <tr><td>工具折叠模式</td><td>3 档滑块 (READ_ONLY / ALL / FULL)，底部标签可直接点击跳转</td></tr>
      <tr><td>应用图标</td><td><code>AppIconManager.switchIcon()</code> 通过 PackageManager 别名切换</td></tr>
      <tr><td>状态指示器</td><td>唯一使用 SharedPreferences 而非 DataStore 的设置（与 FloatingWindowManager 同步）</td></tr>
      <tr><td>Root 执行模式</td><td>仅当 <code>preferredPermissionLevel == ROOT</code> 时显示</td></tr>
      <tr><td>截图设置</td><td>格式(PNG/JPG) + 质量(50-100%) + 分辨率缩放(50-100%)</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">壁纸自适应</div>
    <p style="font-size:13px;color:var(--text-dim);margin:8px 0 4px 4px;"><code>componentBackgroundColor</code> 根据 <code>hasBackgroundImage</code> 切换：有壁纸用不透明 <code>surface</code>，无壁纸用半透明 <code>surface(0.5f)</code>。</p>

    <!-- LayoutAdjustmentSettingsScreen -->
    <div class="section-head green" style="margin-top:28px;">LayoutAdjustmentSettingsScreen — 布局调整</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">源码规模：<code style="color:var(--cyan);">LayoutAdjustmentSettingsScreen.kt</code> 391 行。提供 4 个布局参数的精确调节，并通过实时预览 Card 即时呈现效果。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">LayoutAdjustmentSettingsScreen (CustomScaffold)</div>
      <div class="tree-children">
        <div class="tree-node">Column (verticalScroll, spacedBy 12dp)</div>
        <div class="tree-children">
          <div class="tree-node">Text (描述)</div>
          <div class="tree-node">SectionTitle "布局调整设置"</div>
          <div class="tree-node">SettingsSectionCard</div>
          <div class="tree-children">
            <div class="tree-node">CompactEditableFloatSettingItem: 聊天按钮右边距 (dp)</div>
            <div class="tree-node">CompactEditableFloatSettingItem: 聊天区水平内边距 (dp)</div>
            <div class="tree-node">HorizontalDivider</div>
            <div class="tree-node">CompactEditableFloatSettingItem: Markdown 行高倍数 (x)</div>
            <div class="tree-node">CompactEditableFloatSettingItem: Markdown 字间距 (sp)</div>
          </div>
          <div class="tree-node">SectionTitle "实时预览"</div>
          <div class="tree-node">LayoutAdjustmentPreviewCard</div>
          <div class="tree-children">
            <div class="tree-node">ProvideAiMarkdownTextLayoutSettings</div>
            <div class="tree-children">
              <div class="tree-node">MarkdownTextComposable (预览文本)</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">4 个可调参数</div>
    <table class="act-table">
      <tr><th>参数</th><th>默认值</th><th>范围</th><th>单位</th></tr>
      <tr><td>聊天按钮右边距</td><td>2</td><td>0 ~ 50</td><td>dp</td></tr>
      <tr><td>聊天区水平内边距</td><td>16</td><td>0 ~ 50</td><td>dp</td></tr>
      <tr><td>Markdown 行高倍数</td><td>1.0</td><td>0.8 ~ 2.0</td><td>x</td></tr>
      <tr><td>Markdown 字间距</td><td>0</td><td>-1 ~ 8</td><td>sp</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">CompactEditableFloatSettingItem 结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Column (圆角背景)</div>
      <div class="tree-children">
        <div class="tree-node">Row: 标题 + 描述 | BasicTextField(64dp 宽) + 单位标签</div>
        <div class="tree-node">[isError] Text: 无效值范围提示</div>
        <div class="tree-node">Row: Reset to Default + Save</div>
      </div>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0 0 4px;">输入验证：实时检查 Float 解析 + 范围，IME Done 或 Save 按钮触发持久化。</p>

    <div class="section-head pink" style="margin-top:16px;">实时预览联动</div>
    <p style="font-size:13px;color:var(--text-dim);margin:8px 0 4px 4px;"><code>LayoutAdjustmentPreviewCard</code> 通过 <code>ProvideAiMarkdownTextLayoutSettings</code> 注入当前行高和字间距设置到 <code>MarkdownTextComposable</code>。保存后立即反映在预览中（Flow 驱动）。</p>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:28px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">💾</div>
        <div class="kn-title blue">三种持久化策略</div>
        <div class="kn-body">DataStore（大多数设置）、SharedPreferences（状态指示器样式，与 FloatingWindowManager 同步）、PackageManager 别名（应用图标切换）。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔄</div>
        <div class="kn-title orange">语言切换需重启</div>
        <div class="kn-body">通过 Intent + FLAG_ACTIVITY_CLEAR_TASK 重启 Activity，不是就地重组。切换过程显示 CircularProgressIndicator + delay(600ms) 缓冲。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">👁️</div>
        <div class="kn-title green">实时预览联动</div>
        <div class="kn-body">布局调整页面的预览 Card 读取相同的 DataStore Flow，保存即可见，无需重启或额外刷新操作。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🚫</div>
        <div class="kn-title purple">无 ViewModel</div>
        <div class="kn-body">三个页面均通过 Manager 单例 + 局部状态管理，无 ViewModel 层。滑块防抖通过 LaunchedEffect + delay(300ms) 实现。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📝</div>
        <div class="kn-title pink">单一保存函数</div>
        <div class="kn-body">DisplayPreferencesManager.saveDisplaySettings 接受 19 个可空参数，仅写入非 null 字段，避免无关字段被覆盖。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:24px;background:var(--surface-2);color:var(--text);">核心文件</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对 ui/features/settings/screens/）</th><th>行数</th><th>职责</th></tr>
      <tr><td>LanguageSettingsScreen</td><td>LanguageSettingsScreen.kt</td><td>205</td><td>语言选择 + 重启</td></tr>
      <tr><td>GlobalDisplaySettingsScreen</td><td>GlobalDisplaySettingsScreen.kt</td><td>929</td><td>~20 个显示配置项</td></tr>
      <tr><td>LayoutAdjustmentSettingsScreen</td><td>LayoutAdjustmentSettingsScreen.kt</td><td>391</td><td>4 个布局参数 + 实时预览</td></tr>
    </table>
`);
