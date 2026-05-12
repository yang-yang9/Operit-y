registerDetail('terminal', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">~4500</span><span class="stat-label">UI 层行数</span></div>
      <div class="stat-item"><span class="stat-num">~1250</span><span class="stat-label">TerminalManager</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">内置路由</span></div>
      <div class="stat-item"><span class="stat-num">14</span><span class="stat-label">对话框</span></div>
      <div class="stat-item"><span class="stat-num">2</span><span class="stat-label">输入模式</span></div>
    </div>

    <!-- 入口链路 -->
    <div class="section-head blue">入口链路</div>
    <div class="flow">
      <span class="flow-step">NavItem.Toolbox</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.Toolbox</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">onTerminalSelected</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Screen.Terminal</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">TerminalToolScreen</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">TerminalScreen(env) [内置 NavHost]</span>
    </div>

    <!-- 导航属性 -->
    <table class="act-table" style="margin-top:16px;">
      <tr><th>Screen</th><th>parentScreen</th><th>说明</th></tr>
      <tr><td>Screen.Terminal</td><td>Toolbox</td><td>正常入口</td></tr>
      <tr><td>Screen.TerminalSetup</td><td>Toolbox</td><td>强制显示 Setup (forceShowSetup=true)</td></tr>
      <tr><td>Screen.TerminalAutoConfig</td><td>Toolbox</td><td>占位（TODO，显示"施工中"文字）</td></tr>
    </table>

    <div class="section-head" style="background:rgba(31,111,235,0.08);border-left-color:#58A6FF;font-size:13px;">内置路由系统（独立 NavHost）</div>
    <table class="act-table">
      <tr><th>路由</th><th>Composable</th><th>进入条件</th></tr>
      <tr><td>terminal_home</td><td>TerminalHome</td><td>非首次启动</td></tr>
      <tr><td>setup</td><td>SetupScreen</td><td>首次启动 或 forceShowSetup</td></tr>
      <tr><td>settings</td><td>SettingsScreen</td><td>工具栏齿轮图标</td></tr>
    </table>

    <!-- TerminalHome 组件树 -->
    <div class="section-head purple">TerminalHome 组件树（主终端界面）</div>
    <div class="mermaid">
graph TD
    HOME["TerminalHome&lt;br/&gt;(Column, background=Black)"]

    HOME --> FULLSCREEN{"isFullscreen?"}

    FULLSCREEN -->|是| FS_COL["Column"]
    FS_COL --> FS_CANVAS["CanvasTerminalScreen (weight=1f)&lt;br/&gt;全屏 PTY 输入"]
    FS_COL --> FS_VK["VirtualKeyboard&lt;br/&gt;(translationY 跟随 IME)"]

    FULLSCREEN -->|否| STD_COL["Column (navigationBarsPadding)"]
    STD_COL --> MODE{"isDirectInputMode?"}
    MODE -->|是| DIRECT_CANVAS["CanvasTerminalScreen (weight=1f)&lt;br/&gt;点击唤起 IME"]
    MODE -->|否| OUTPUT_CANVAS["CanvasTerminalOutput (weight=1f)&lt;br/&gt;点击聚焦输入栏"]
    STD_COL --> BOTTOM["Column (translationY 跟随 IME)"]
    BOTTOM --> TOOLBAR["TerminalToolbar"]
    BOTTOM --> INPUT_ROW["Row (命令输入栏)"]
    INPUT_ROW --> PROMPT["Surface (DarkGreen 提示符)"]
    INPUT_ROW --> INPUT["BasicTextField (monospace)"]
    INPUT_ROW --> KB_TOGGLE["Surface ⌨ (键盘开关)"]
    INPUT_ROW --> MODE_TOGGLE["Surface ⇄ (输入模式切换)"]
    BOTTOM --> VK["VirtualKeyboard (可选)"]
    </div>

    <!-- 双输入模式 -->
    <div class="section-head green">双输入模式</div>
    <table class="act-table">
      <tr><th>模式</th><th>渲染组件</th><th>交互方式</th></tr>
      <tr><td>命令栏模式 (默认)</td><td>CanvasTerminalOutput + 底部 BasicTextField</td><td>输入栏编辑 → 发送完整命令</td></tr>
      <tr><td>直接输入模式</td><td>CanvasTerminalScreen</td><td>点击画布唤起 IME → 字符直接写入 PTY</td></tr>
    </table>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">切换时隐藏系统键盘、清空命令缓冲区。虚拟键盘支持转义序列解码：\\e(ESC)、\\t(Tab)、\\n(LF)、\\r(CR)</p>

    <!-- SetupScreen -->
    <div class="section-head orange">SetupScreen（环境安装向导）</div>
    <table class="act-table">
      <tr><th>分类</th><th>包列表</th><th>备注</th></tr>
      <tr><td>NodeJS</td><td>nodejs (v24), pnpm</td><td>Operit required</td></tr>
      <tr><td>Python</td><td>python-is-python3, venv, pip, uv</td><td>Operit required</td></tr>
      <tr><td>SSH</td><td>ssh, sshpass, openssh-server</td><td>—</td></tr>
      <tr><td>Java</td><td>openjdk-17, gradle</td><td>—</td></tr>
      <tr><td>Rust</td><td>rust/rustup</td><td>—</td></tr>
      <tr><td>Go</td><td>golang-go</td><td>—</td></tr>
    </table>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">安装检测：通过临时 setup-check 终端会话并发执行检测命令（每个 15s 超时）。点击"开始配置"后按顺序生成命令列表，所有命令通过 && 连接后发送到终端执行。</p>

    <!-- SettingsScreen 组件树 -->
    <div class="section-head purple">SettingsScreen 组件树（终端设置）</div>
    <div class="mermaid">
graph TD
    SETTINGS["SettingsScreen&lt;br/&gt;(Scaffold + 滚动 Column)"]

    SETTINGS --> FTP["Card: FTP 服务器管理&lt;br/&gt;状态文字 + 启动/停止按钮"]
    SETTINGS --> STORAGE["Card: 存储管理&lt;br/&gt;Ubuntu 环境大小 + 刷新 + 重置(红色)"]
    SETTINGS --> UPDATE["Card: 项目与更新&lt;br/&gt;更新状态 + 访问项目/检查更新"]
    SETTINGS --> SSH["Card: SSH 配置&lt;br/&gt;启用开关 + SSHConfigScreen(内嵌)"]
    SETTINGS --> TMP["Card: 共享 /tmp&lt;br/&gt;Switch 开关"]
    SETTINGS --> CHROOT["Card: Chroot 模式&lt;br/&gt;Switch + 检查挂载/卸载按钮 + 详情"]
    SETTINGS --> VK_SETTINGS["Card: 虚拟键盘设置&lt;br/&gt;→ VirtualKeyboardCustomizationDialog"]
    SETTINGS --> FONT["Card: 字体设置&lt;br/&gt;字号/FPS/字体路径/字体名称"]
    SETTINGS --> SOURCES["Card: 源管理&lt;br/&gt;APT/Pip/NPM/Rust 各一行"]
    </div>

    <!-- TerminalEnv 桥接层 -->
    <div class="section-head blue">TerminalEnv（状态桥接层）</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">@Stable 类，桥接 TerminalManager 到 Compose。暴露 sessions, currentSessionId, currentDirectory, isFullscreen, terminalEmulator（均通过 StateFlow → collectAsState）。</p>

    <!-- TerminalManager -->
    <div class="section-head green">TerminalManager（核心管理器 · 单例 · 1249行）</div>
    <div class="flow" style="margin-bottom:12px;">
      <span class="flow-step">initializeEnvironment()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">创建目录 + 链接 .so 库</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">解压 Ubuntu rootfs</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">生成 common.sh</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">login_ubuntu()</span>
    </div>
    <table class="act-table">
      <tr><th>提供者</th><th>条件</th><th>说明</th></tr>
      <tr><td>LocalTerminalProvider</td><td>默认</td><td>本地 PRoot + Ubuntu rootfs</td></tr>
      <tr><td>SSHTerminalProvider</td><td>SSHConfigManager 有配置</td><td>通过 SSH 连接远程 shell</td></tr>
    </table>

    <!-- 对话框清单 -->
    <div class="section-head orange">对话框清单 (14个)</div>
    <table class="act-table">
      <tr><th>对话框</th><th>所在页面</th><th>触发</th></tr>
      <tr><td>关闭会话确认</td><td>TerminalHome</td><td>Tab 关闭按钮 (>1 会话)</td></tr>
      <tr><td>环境配置确认</td><td>SetupScreen</td><td>"开始配置"按钮</td></tr>
      <tr><td>SSH 工具缺失</td><td>SettingsScreen</td><td>启用 SSH 但工具不存在</td></tr>
      <tr><td>OpenSSH 缺失</td><td>SettingsScreen</td><td>SSH 反向隧道但缺 sshd</td></tr>
      <tr><td>字体大小</td><td>SettingsScreen</td><td>字号设置项 (12~100)</td></tr>
      <tr><td>目标 FPS</td><td>SettingsScreen</td><td>FPS 设置项 (15~120)</td></tr>
      <tr><td>字体路径</td><td>SettingsScreen</td><td>字体路径设置项</td></tr>
      <tr><td>字体名称</td><td>SettingsScreen</td><td>字体名称设置项</td></tr>
      <tr><td>重置环境</td><td>SettingsScreen</td><td>"重置环境"红色按钮</td></tr>
      <tr><td>虚拟键盘自定义</td><td>SettingsScreen</td><td>虚拟键盘设置项</td></tr>
      <tr><td>镜像源选择</td><td>SettingsScreen</td><td>源管理各行</td></tr>
      <tr><td>添加自定义源</td><td>SettingsScreen</td><td>源选择对话框 "Add"</td></tr>
      <tr><td>SSH 配置编辑</td><td>SSHConfigScreen</td><td>编辑按钮</td></tr>
      <tr><td>SSH 配置删除</td><td>SSHConfigScreen</td><td>删除按钮</td></tr>
    </table>

    <!-- 架构要点 -->
    <div class="section-head gray">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">📦</div>
        <div class="kn-title blue">独立 Gradle 模块</div>
        <div class="kn-body">Terminal 是 terminal/ 模块，有自己的 NavHost 路由系统，不使用外层 OperitRouter。通过 TerminalEnv 桥接层与 Compose 集成。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🐧</div>
        <div class="kn-title green">PRoot + Ubuntu rootfs</div>
        <div class="kn-body">从 assets 解压 Ubuntu Noble rootfs，通过 PRoot 模拟 Linux 环境。native .so 库通过符号链接部署。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">⌨️</div>
        <div class="kn-title orange">双输入模式</div>
        <div class="kn-body">命令栏模式适合编辑长命令，直接输入模式适合交互式程序（vim、top 等），通过 ⇄ 按钮切换。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔌</div>
        <div class="kn-title purple">SSH 终端提供者</div>
        <div class="kn-body">TerminalProvider 接口实现本地和 SSH 两种后端。SSH 启用前校验工具链存在性。虚拟键盘完全可自定义。</div>
      </div>
    </div>

    <!-- 核心文件清单 -->
    <div class="section-head gray">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>行数</th><th>职责</th></tr>
      <tr><td>TerminalScreen.kt</td><td>171</td><td>NavHost 路由入口</td></tr>
      <tr><td>TerminalHome.kt</td><td>811</td><td>主终端界面 + 虚拟键盘</td></tr>
      <tr><td>SetupScreen.kt</td><td>708</td><td>环境安装向导</td></tr>
      <tr><td>SettingsScreen.kt</td><td>1385</td><td>终端设置页</td></tr>
      <tr><td>SSHConfigScreen.kt</td><td>674</td><td>SSH 配置组件</td></tr>
      <tr><td>SettingsViewModel.kt</td><td>519</td><td>设置状态管理</td></tr>
      <tr><td>TerminalEnv.kt</td><td>100</td><td>Compose 状态桥接层</td></tr>
      <tr><td>TerminalManager.kt</td><td>1249</td><td>单例会话管理器</td></tr>
    </table>
`);
