registerDetail('tooltester', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">366</span><span class="stat-label">单文件行数</span></div>
      <div class="stat-item"><span class="stat-num">7</span><span class="stat-label">工具分组</span></div>
      <div class="stat-item"><span class="stat-num">28</span><span class="stat-label">测试工具</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">状态颜色</span></div>
    </div>

    <!-- 组件树 -->
    <div class="section-head blue">组件树 — AI 工具可视化测试器</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">单文件实现（366 行），无 ViewModel。~28 个工具按 7 个分组展示为网格卡片，支持单个测试和批量测试，结果通过颜色编码实时反馈。</p>

    <div class="mermaid">
graph TD
    ROOT["ToolTesterScreen&lt;br/&gt;(CustomScaffold)"]
    ROOT --> HEADER["Column (padding 16dp)"]
    HEADER --> TITLE["Text: AI Tools Availability Test"]
    HEADER --> DESC["Text: 工具分组说明"]
    HEADER --> INPUT["OutlinedTextField&lt;br/&gt;(testInputText, testTag)"]
    HEADER --> BTN["Button: Start Comprehensive Test&lt;br/&gt;/ 批量测试中 + CircularProgressIndicator"]
    ROOT --> DIVIDER["HorizontalDivider"]
    ROOT --> GRID["LazyVerticalGrid&lt;br/&gt;(Adaptive 75dp, height=800dp)"]
    GRID --> GH["[每组] Text 组名&lt;br/&gt;(titleMedium, Bold, span=maxLineSpan)"]
    GRID --> CARD["[每工具] ToolTestGridItem&lt;br/&gt;(Card 65dp, 颜色=状态)"]
    CARD --> DLG["[点击] AlertDialog"]
    DLG --> SHEET["ToolDetailsSheet"]
    SHEET --> STATUS_ROW["Row: 状态图标(32dp) + 工具名 + ID"]
    SHEET --> DETAIL_DESC["Text: 工具描述"]
    SHEET --> PARAMS["[有参数] Column: 参数列表&lt;br/&gt;(值截断200字符)"]
    SHEET --> RESULT["[有结果] Text: 详细结果&lt;br/&gt;(截断1000字符, 颜色=成功/失败)"]
    SHEET --> ACTIONS["Row: Close + Retest 按钮"]
    </div>

    <!-- 卡片颜色编码 -->
    <div class="section-head green" style="margin-top:16px;">卡片颜色编码</div>
    <table class="act-table">
      <tr><th>状态</th><th>容器色</th><th>内容色</th></tr>
      <tr><td>未测试 (null)</td><td>surfaceVariant</td><td>onSurfaceVariant</td></tr>
      <tr><td>测试中 (RUNNING)</td><td>tertiaryContainer</td><td>onTertiaryContainer</td></tr>
      <tr><td>成功 (SUCCESS)</td><td>primaryContainer</td><td>onPrimaryContainer</td></tr>
      <tr><td>失败 (FAILED)</td><td>errorContainer</td><td>onErrorContainer</td></tr>
    </table>

    <!-- 工具分组 -->
    <div class="section-head orange" style="margin-top:16px;">工具测试分组 (7 组 · 28 个工具)</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">1. Environment Setup <span style="font-size:11px;color:var(--text-dim);">(顺序执行，有依赖)</span></div>
    <table class="act-table">
      <tr><th>工具 ID</th><th>测试名</th><th>测试参数</th></tr>
      <tr><td>make_directory</td><td>Create Test Directory</td><td>path=.../test, create_parents=true</td></tr>
      <tr><td>download_file</td><td>Download Test Image</td><td>url=picsum.photos/100, destination=.../test_image.png</td></tr>
      <tr><td>write_file</td><td>Create Text File</td><td>path=.../test_file.txt, content=测试文本</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">2. Basic & HTTP <span style="font-size:11px;color:var(--text-dim);">(并行执行)</span></div>
    <table class="act-table">
      <tr><th>工具 ID</th><th>测试名</th><th>测试参数</th></tr>
      <tr><td>sleep</td><td>Delay</td><td>duration_ms=1000</td></tr>
      <tr><td>device_info</td><td>Device Info</td><td>(无)</td></tr>
      <tr><td>http_request</td><td>HTTP GET</td><td>url=httpbin.org/get</td></tr>
      <tr><td>multipart_request</td><td>File Upload</td><td>url=httpbin.org/post, files=...</td></tr>
      <tr><td>manage_cookies</td><td>Manage Cookies</td><td>action=get, domain=google.com</td></tr>
      <tr><td>visit_web</td><td>Visit Web</td><td>url=www.baidu.com</td></tr>
      <tr><td>use_package</td><td>Use Package</td><td>package_name=non_existent_package</td></tr>
      <tr><td>query_memory</td><td>Query Knowledge</td><td>query=test</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">3. File Read-only <span style="font-size:11px;color:var(--text-dim);">(并行执行)</span></div>
    <table class="act-table">
      <tr><th>工具 ID</th><th>测试名</th><th>测试参数</th></tr>
      <tr><td>list_files</td><td>List Files</td><td>path=.../test</td></tr>
      <tr><td>file_exists</td><td>File Exists</td><td>path=.../test_file.txt</td></tr>
      <tr><td>read_file</td><td>OCR Read</td><td>path=.../test_image.png</td></tr>
      <tr><td>read_file_part</td><td>Chunk Read</td><td>path=..., partIndex=0</td></tr>
      <tr><td>file_info</td><td>File Info</td><td>path=.../test_file.txt</td></tr>
      <tr><td>find_files</td><td>Find Files</td><td>path=..., pattern=*.txt</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">4. File Write <span style="font-size:11px;color:var(--text-dim);">(顺序执行，有依赖)</span></div>
    <table class="act-table">
      <tr><th>工具 ID</th><th>测试名</th><th>测试参数</th></tr>
      <tr><td>write_file</td><td>Write Large File</td><td>content=repeat(12000) ≈ 312KB</td></tr>
      <tr><td>copy_file</td><td>Copy File</td><td>source→destination</td></tr>
      <tr><td>move_file</td><td>Move File</td><td>source→destination</td></tr>
      <tr><td>zip_files</td><td>Zip Files</td><td>source=.../test → .../test.zip</td></tr>
      <tr><td>unzip_files</td><td>Unzip Files</td><td>source=.../test.zip → .../unzipped</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">5. System <span style="font-size:11px;color:var(--text-dim);">(并行执行)</span></div>
    <table class="act-table">
      <tr><th>工具 ID</th><th>测试名</th><th>测试参数</th></tr>
      <tr><td>list_installed_apps</td><td>List Apps</td><td>include_system_apps=false</td></tr>
      <tr><td>get_notifications</td><td>Get Notifications</td><td>limit=5</td></tr>
      <tr><td>get_device_location</td><td>Device Location</td><td>high_accuracy=false</td></tr>
      <tr><td>get_system_setting</td><td>Read System Setting</td><td>setting=screen_off_timeout</td></tr>
      <tr><td>modify_system_setting</td><td>Write System Setting</td><td>setting=test_setting, value=1</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">6. UI Automation <span style="font-size:11px;color:var(--text-dim);">(并行执行)</span></div>
    <table class="act-table">
      <tr><th>工具 ID</th><th>测试名</th><th>测试参数</th></tr>
      <tr><td>get_page_info</td><td>Page Info</td><td>(无)</td></tr>
      <tr><td>press_key</td><td>Simulate Key</td><td>key_code=KEYCODE_VOLUME_UP</td></tr>
      <tr><td>set_input_text</td><td>Text Input</td><td>text=Hello from Operit!</td></tr>
      <tr><td>tap</td><td>Simulate Tap</td><td>x=1, y=1</td></tr>
      <tr><td>swipe</td><td>Simulate Swipe</td><td>start→end 坐标</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">7. Cleanup <span style="font-size:11px;color:var(--text-dim);">(手动触发 · 批量测试跳过)</span></div>
    <table class="act-table">
      <tr><th>工具 ID</th><th>测试名</th><th>测试参数</th></tr>
      <tr><td>delete_file</td><td>Cleanup Test Directory</td><td>path=.../test, recursive=true</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin-top:4px;">测试基础路径：/sdcard/Download/Operit/test（OperitPaths.testPathSdcard()）</p>

    <!-- 测试执行流程 -->
    <div class="section-head purple" style="margin-top:16px;">测试执行流程</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">单工具测试</div>
    <div class="flow" style="margin:8px 0;flex-wrap:wrap;gap:4px;">
      <span class="flow-step">runTest(toolTest)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">testResults[id] = RUNNING</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">Dispatchers.IO</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">aiToolHandler.executeTool(AITool(id, params))</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">testResults[id] = SUCCESS / FAILED</span>
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">批量测试 (Start Comprehensive Test)</div>
    <div class="flow" style="margin:8px 0;flex-wrap:wrap;gap:4px;">
      <span class="flow-step">清空 testResults</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">isTestingAll = true</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">按组顺序 (跳过 isManual)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">sequential 组: for 循环</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">parallel 组: launch + join</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">isTestingAll = false</span>
    </div>

    <p style="margin:8px 0 0;font-size:12px;color:var(--text-dim);"><strong>set_input_text 特殊流程</strong>：测试前先关闭对话框 → delay(300) → requestFocus 输入框 → delay(100) → 再执行工具调用</p>

    <!-- 状态管理 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">局部状态</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>testResults</td><td>Map&lt;String, ToolTestResult&gt;</td><td>按工具 ID 存储测试结果</td></tr>
      <tr><td>isTestingAll</td><td>Boolean</td><td>批量测试进行中</td></tr>
      <tr><td>selectedTestForDetails</td><td>ToolTest?</td><td>当前查看详情的工具</td></tr>
      <tr><td>showDialog</td><td>Boolean</td><td>详情对话框显示</td></tr>
      <tr><td>testInputText</td><td>String</td><td>输入框内容（供 set_input_text 使用）</td></tr>
      <tr><td>toolGroups</td><td>List&lt;ToolGroup&gt;</td><td>getFinalToolTestGroups(context) 一次性计算</td></tr>
    </table>

    <!-- 数据模型 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">数据模型</div>
    <div class="kn-code" style="margin:8px 0;">data class ToolTest(id, name, description, parameters: List&lt;ToolParameter&gt;)
data class ToolTestResult(status: TestStatus, result: ToolResult?)
enum class TestStatus { SUCCESS, FAILED, RUNNING }
data class ToolGroup(name, sequential: Boolean, isManual: Boolean, tests: List&lt;ToolTest&gt;)</div>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:16px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">📄</div>
        <div class="kn-title blue">单文件实现</div>
        <div class="kn-body">页面 UI、数据模型、测试逻辑全部在一个 366 行文件中，无 ViewModel。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔀</div>
        <div class="kn-title green">混合执行策略</div>
        <div class="kn-body">通过 ToolGroup.sequential 标志，Environment Setup 和 File Write 组顺序执行（有依赖关系），其余组并行执行。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">⌨️</div>
        <div class="kn-title orange">set_input_text 特殊处理</div>
        <div class="kn-body">测试前先关闭对话框、聚焦输入框、等待 UI 就绪后再执行工具调用，是唯一需要预处理 UI 状态的测试。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🧹</div>
        <div class="kn-title purple">Cleanup 组隔离</div>
        <div class="kn-body">isManual=true 使其不参与批量测试，避免测试过程中删除其他测试的依赖文件。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">核心文件</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径</th><th>行数</th></tr>
      <tr><td>ToolTesterScreen</td><td>ui/features/toolbox/screens/tooltester/ToolTesterScreen.kt</td><td>366</td></tr>
    </table>
`);
