registerDetail('shellexecutor', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">725</span><span class="stat-label">Screen 行数</span></div>
      <div class="stat-item"><span class="stat-num">239</span><span class="stat-label">Manager 行数</span></div>
      <div class="stat-item"><span class="stat-num">16</span><span class="stat-label">预设命令</span></div>
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">权限等级</span></div>
      <div class="stat-item"><span class="stat-num">1</span><span class="stat-label">对话框</span></div>
    </div>

    <!-- 导航属性 -->
    <div class="section-head blue">导航属性</div>
    <table class="act-table">
      <tr><th>属性</th><th>值</th></tr>
      <tr><td>parentScreen</td><td>Toolbox</td></tr>
      <tr><td>navItem</td><td>NavItem.Toolbox</td></tr>
      <tr><td>子页面</td><td>无</td></tr>
    </table>

    <!-- 组件树 -->
    <div class="section-head purple">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["ShellExecutorScreen&lt;br/&gt;(Column fillMaxSize)"]

    ROOT --> HEADER["Surface (tonalElevation=2dp)"]
    HEADER --> TITLE["Text: 命令执行器"]
    HEADER --> INPUT_ROW["Row: 命令输入行"]
    INPUT_ROW --> INPUT_BOX["Box"]
    INPUT_BOX --> FIELD["OutlinedTextField&lt;br/&gt;(圆角24dp, Terminal图标)"]
    INPUT_BOX --> AUTOCOMPLETE["[showSuggestions] Surface&lt;br/&gt;(自动补全下拉)"]
    INPUT_ROW --> EXEC_BTN["FilledTonalButton (圆形)&lt;br/&gt;Send图标 / 加载中"]
    HEADER --> TOOLBAR_ROW["Row: 清除历史 + 预设命令开关"]
    HEADER --> EXEC_STATUS["[isExecuting] Row: 加载指示器"]

    ROOT --> PRESETS["AnimatedVisibility: 预设命令面板"]
    PRESETS --> CATEGORIES["Column (220dp, 可滚动)"]
    CATEGORIES --> CHIPS["FlowRow: PresetCommandChip"]

    ROOT --> RESULTS["Box (weight=1f)"]
    RESULTS --> EMPTY["[空] Column: 代码图标 + 提示"]
    RESULTS --> LIST["LazyColumn"]
    LIST --> CARDS["CommandResultCard (per record)"]
    </div>

    <!-- 状态管理 -->
    <div class="section-head green">状态管理</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">无 ViewModel，全部局部状态：</p>
    <table class="act-table">
      <tr><th>状态</th><th>类型</th><th>说明</th></tr>
      <tr><td>commandInput</td><td>String</td><td>命令输入框</td></tr>
      <tr><td>isExecuting</td><td>Boolean</td><td>执行中标记</td></tr>
      <tr><td>commandHistory</td><td>List&lt;CommandRecord&gt;</td><td>内存中的执行历史</td></tr>
      <tr><td>showPresets</td><td>Boolean</td><td>预设命令面板显示</td></tr>
      <tr><td>showSuggestions / suggestionsList</td><td>Boolean / List</td><td>自动补全下拉</td></tr>
      <tr><td>errorMessage / showError</td><td>String? / Boolean</td><td>错误对话框</td></tr>
    </table>

    <!-- 命令执行流程 -->
    <div class="section-head orange">命令执行流程</div>
    <div class="flow" style="margin-bottom:8px;">
      <span class="flow-step">executeCommand(cmd)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">ShellCommandManager</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">AndroidShellExecutor</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">读取权限等级</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">ShellExecutorFactory 选择执行器</span>
    </div>
    <table class="act-table" style="margin-top:8px;">
      <tr><th>权限等级</th><th>执行器</th></tr>
      <tr><td>STANDARD</td><td>标准 Shell</td></tr>
      <tr><td>DEBUGGER</td><td>Shizuku Shell</td></tr>
      <tr><td>ROOT</td><td>Root Shell</td></tr>
      <tr><td>其他等级</td><td>对应执行器</td></tr>
    </table>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">权限不足时不降级，直接返回失败结果。返回 CommandResult(success, stdout, stderr, exitCode)。</p>

    <!-- 预设命令 -->
    <div class="section-head blue">预设命令 (16个)</div>
    <table class="act-table">
      <tr><th>分类</th><th>命令</th></tr>
      <tr><td>系统 (SYSTEM)</td><td>echo 测试、uname -a、df -h、ps、getprop</td></tr>
      <tr><td>硬件 (HARDWARE)</td><td>/proc/meminfo、/proc/cpuinfo</td></tr>
      <tr><td>网络 (NETWORK)</td><td>ip addr、ip route、/proc/net/tcp</td></tr>
      <tr><td>应用 (PACKAGE)</td><td>pm list packages、-s 系统应用、-3 第三方</td></tr>
      <tr><td>文件 (FILE)</td><td>ls -la、ls -la /、ls -lh /sdcard</td></tr>
    </table>

    <!-- CommandResultCard -->
    <div class="section-head purple">CommandResultCard</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">Card(圆角16dp, elevation 2dp) 展示执行结果：</p>
    <div class="kn-code" style="margin:0 0 12px 0;">Header Row (primaryContainer 0.7f 背景)
  ├─ Box(40dp 圆形) → Terminal 图标
  ├─ Column: 命令(monospace, 1行) + 时间戳
  ├─ Box(10dp 圆点): 绿=成功, 红=失败
  └─ IconButton: 展开/收起
AnimatedVisibility (expanded)
  ├─ [有 stdout] Text "标准输出:" + Surface(monospace 12sp)
  ├─ [有 stderr] Text "标准错误:" + Surface(errorContainer, monospace)
  └─ Row: 退出代码(红色 if ≠0) + "重新执行"按钮</div>

    <!-- 架构要点 -->
    <div class="section-head gray">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">💾</div>
        <div class="kn-title orange">无持久化</div>
        <div class="kn-body">ShellCommandManager.saveCommandToHistory() 和 getCommandHistory() 的 JSON 序列化代码被注释掉，始终返回 emptyList()。历史仅内存保留。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔀</div>
        <div class="kn-title blue">权限等级路由</div>
        <div class="kn-body">通过 androidPermissionPreferences 读取当前等级，ShellExecutorFactory 自动选择 Shell 执行后端，不需要用户手动选择。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">⌨️</div>
        <div class="kn-title green">自动补全</div>
        <div class="kn-body">LaunchedEffect(commandInput) 每次输入变化时从历史记录中匹配建议，下拉显示在输入框正下方。</div>
      </div>
    </div>

    <!-- 核心文件清单 -->
    <div class="section-head gray">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>行数</th><th>职责</th></tr>
      <tr><td>ShellExecutorScreen.kt</td><td>725</td><td>页面 UI + 命令执行</td></tr>
      <tr><td>ShellCommandManager.kt</td><td>239</td><td>预设命令 + 历史管理</td></tr>
      <tr><td>AndroidShellExecutor.kt</td><td>123</td><td>权限路由 + Shell 调用</td></tr>
    </table>
`);
