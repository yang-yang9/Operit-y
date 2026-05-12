registerDetail('apppermissions', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">1517</span><span class="stat-label">源码行数</span></div>
      <div class="stat-item"><span class="stat-num">14</span><span class="stat-label">权限分组</span></div>
      <div class="stat-item"><span class="stat-num">2</span><span class="stat-label">视图（双视图切换）</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">pm 命令操作</span></div>
    </div>

    <!-- 双视图架构 -->
    <div class="section-head blue">双视图架构（AnimatedContent 水平滑动切换）</div>
    <div class="mermaid">
graph LR
    LIST["应用列表视图&lt;br/&gt;selectedApp == null"]
    DETAIL["权限详情视图&lt;br/&gt;selectedApp != null"]
    LIST -- "点击 AppItem&lt;br/&gt;loadAppPermissions()" --> DETAIL
    DETAIL -- "返回按钮 → null" --> LIST
    </div>
    <p style="margin:6px 0 0 4px;font-size:12px;color:var(--text-dim);">权限操作通过 AndroidShellExecutor → pm grant/revoke/reset-permissions，需要 Shizuku/ADB 权限</p>

    <!-- 应用列表视图 -->
    <div class="section-head green" style="margin-top:20px;">应用列表视图</div>
    <div class="mermaid">
graph TD
    LIST["Column (fillMaxSize)"]
    LIST --> HEADER["Surface Header (tonalElevation 1dp)"]
    HEADER --> SEARCH_ROW["Row"]
    SEARCH_ROW --> SEARCH_FIELD["OutlinedTextField 胶囊形 (RoundedCornerShape 24dp)&lt;br/&gt;leadingIcon: Search / trailingIcon: Clear"]
    SEARCH_ROW --> SYS_TOGGLE["Row Checkbox + '系统应用' 过滤"]
    HEADER --> COUNT["AnimatedVisibility → 共 N 个应用"]
    LIST --> LOADING["[isLoading] CircularProgressIndicator"]
    LIST --> EMPTY["[空] Icon.SearchOff + 提示文字"]
    LIST --> APP_LIST["LazyColumn → AppItem × N"]
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">AppItem 结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Card (clickable, RoundedCornerShape 12dp, elevation 1dp)</div>
      <div class="tree-children">
        <div class="tree-node">Row (padding 16dp)</div>
        <div class="tree-children">
          <div class="tree-node">Box 52dp CircleShape → Image(app.icon) 或 Icon.Android</div>
          <div class="tree-node">Column (weight=1f): app.name(bold) + packageName + [isSystemApp] 红点+"系统应用"</div>
          <div class="tree-node">FilledIconButton Security 18dp (primaryContainer)</div>
        </div>
      </div>
    </div>

    <!-- 权限详情视图 -->
    <div class="section-head orange" style="margin-top:20px;">权限详情视图</div>
    <div class="mermaid">
graph TD
    DETAIL["Column (fillMaxSize)"]
    DETAIL --> NAV_BAR["Surface Header (tonalElevation 2dp)"]
    NAV_BAR --> BACK["IconButton ArrowBack (primary)"]
    NAV_BAR --> APP_ICON["Image/Icon.Android (40dp)"]
    NAV_BAR --> APP_INFO["Column: name(bold) + packageName"]
    NAV_BAR --> RESET["FilledTonalIconButton RestartAlt&lt;br/&gt;→ pm reset-permissions"]
    DETAIL --> STATS_CARD["AnimatedVisibility Card (primaryContainer 70%)&lt;br/&gt;PermissionStat × 3: 总数 / 已授权 / 危险"]
    DETAIL --> PERM_LOADING["[isPermissionLoading] CircularProgressIndicator"]
    DETAIL --> PERM_EMPTY["[空] Icon.Shield + 提示"]
    DETAIL --> PERM_LIST["LazyColumn → 权限组标题 + PermissionItem × N"]
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">权限组颜色与图标</div>
    <table class="act-table">
      <tr><th>权限组</th><th>颜色</th><th>图标</th></tr>
      <tr><td>ACTIVITY_RECOGNITION</td><td style="color:#8D6E63">■ 棕色</td><td>DirectionsRun</td></tr>
      <tr><td>CALENDAR</td><td style="color:#7986CB">■ 靛蓝</td><td>DateRange</td></tr>
      <tr><td>CAMERA</td><td style="color:#BA68C8">■ 紫色</td><td>PhotoCamera</td></tr>
      <tr><td>CONTACTS</td><td style="color:#4DB6AC">■ 蓝绿</td><td>Contacts</td></tr>
      <tr><td>LOCATION</td><td style="color:#FFB74D">■ 橙色</td><td>LocationOn</td></tr>
      <tr><td>MICROPHONE</td><td style="color:#4FC3F7">■ 天蓝</td><td>Mic</td></tr>
      <tr><td>STORAGE</td><td style="color:#7E57C2">■ 深紫</td><td>Folder</td></tr>
      <tr><td>OTHER_GRANTED</td><td style="color:#66BB6A">■ 绿色</td><td>Check</td></tr>
      <tr><td>OTHER_DENIED</td><td style="color:#78909C">■ 蓝灰</td><td>Block</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">PermissionItem 结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Card (RoundedCornerShape 12dp, elevation 动画: granted=2dp / denied=0dp)</div>
      <div class="tree-children">
        <div class="tree-node">Box (fillMaxWidth, h=4dp) — 彩色顶部条 (granted=0.9f / denied=0.4f)</div>
        <div class="tree-node">Row (padding 16dp)</div>
        <div class="tree-children">
          <div class="tree-node">Box 40dp CircleShape: [dangerous] Icon.Warning(橙色) / [normal] Icon.Check(primary) or Lock(outline)</div>
          <div class="tree-node">Column (weight=1f, horizontal 16dp): name(titleSmall) + description(bodySmall, lineHeight=16sp)</div>
          <div class="tree-node">Switch (granted=Check thumbContent) → onToggle()</div>
        </div>
      </div>
    </div>

    <!-- 权限操作 -->
    <div class="section-head purple" style="margin-top:20px;">权限操作（Shell 命令）</div>
    <table class="act-table">
      <tr><th>操作</th><th>命令</th><th>成功后</th></tr>
      <tr><td>授予权限</td><td>pm grant &lt;package&gt; &lt;permission&gt;</td><td>就地更新单条权限 granted=true</td></tr>
      <tr><td>撤销权限</td><td>pm revoke &lt;package&gt; &lt;permission&gt;</td><td>就地更新单条权限 granted=false</td></tr>
      <tr><td>重置全部</td><td>pm reset-permissions &lt;package&gt;</td><td>重新调用 loadAppPermissions() 刷新</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">失败时弹出 AlertDialog 错误对话框（Icon.Error + 错误信息 + 确认按钮）</p>

    <!-- 状态汇总 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">状态汇总</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>selectedApp</td><td>AppInfo?</td><td>控制双视图切换的核心状态</td></tr>
      <tr><td>searchQuery</td><td>String</td><td>搜索词</td></tr>
      <tr><td>showSystemApps</td><td>Boolean</td><td>是否显示系统应用</td></tr>
      <tr><td>isLoading</td><td>Boolean</td><td>应用列表加载中</td></tr>
      <tr><td>selectedAppPermissions</td><td>List&lt;PermissionInfo&gt;</td><td>当前应用权限列表</td></tr>
      <tr><td>groupedPermissions</td><td>Map&lt;String, List&gt;</td><td>按组分组（derived from above）</td></tr>
      <tr><td>isPermissionLoading</td><td>Boolean</td><td>权限加载中</td></tr>
      <tr><td>showError / errorMessage</td><td>Boolean/String?</td><td>错误对话框状态</td></tr>
    </table>
`);
