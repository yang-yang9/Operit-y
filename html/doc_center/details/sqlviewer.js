registerDetail('sqlviewer', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">443</span><span class="stat-label">SqlViewer 源码行数</span></div>
      <div class="stat-item"><span class="stat-num">354</span><span class="stat-label">HtmlPackager 源码行数</span></div>
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">预设 SQL 查询</span></div>
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">打包对话框阶段</span></div>
    </div>

    <!-- SqlViewer -->
    <div class="section-head blue">SqlViewerScreen — Canvas 渲染 SQL 查看器</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">直接访问 App 的 Room 数据库（AppDatabase），通过 SupportSQLiteDatabase 执行任意 SQL，以可缩放 Canvas 表格渲染结果。</p>

    <div class="mermaid">
graph TD
    ROOT["Box (fillMaxSize)"]
    ROOT --> EMPTY["[result==null] Column centered — 空状态提示"]
    ROOT --> TABLE["[result!=null] AndroidView → SqlTableView (Canvas 渲染)"]
    ROOT --> BOTTOM_BAR["[result!=null] Row BottomCenter&lt;br/&gt;行/列计数 + TextButton '加载更多'"]
    ROOT --> TUNE_BTN["IconButton Tune (TopEnd) → ModalBottomSheet"]
    ROOT --> SHEET["ModalBottomSheet (skipPartiallyExpanded=true)"]
    SHEET --> CHIPS["FlowRow — SuggestionChip × 5 (预设查询)"]
    SHEET --> SQL_TF["OutlinedTextField (SQL, monospace, maxLines=6)"]
    SHEET --> RUN_ROW["Row: FilledTonalButton '运行' + OutlinedButton '清除'"]
    SHEET --> PAGE_ROW["Row: Text + OutlinedTextField (页面大小, 数字 80dp)"]
    SHEET --> PAGING_ROW["Switch 分页"]
    SHEET --> FEEDBACK["[error] AssistChip(errorContainer) / [message] AssistChip"]
    </div>

    <div class="section-head green" style="margin-top:16px;">SqlResultTable — 自定义 Canvas 渲染</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">通过 AndroidView 包装自定义 SqlTableView（android.view.View），完全手动绘制：</p>
    <table class="act-table">
      <tr><th>功能</th><th>实现</th></tr>
      <tr><td>虚拟化渲染</td><td>onDraw 仅绘制可视列/行范围（clampedX/Y 计算偏移）</td></tr>
      <tr><td>缩放</td><td>ScaleGestureDetector 捏合，范围 0.6× ~ 2.2×，锚点为捏合焦点</td></tr>
      <tr><td>滚动/惯性</td><td>GestureDetector + OverScroller.fling() 驱动动画</td></tr>
      <tr><td>触摸拦截</td><td>ACTION_DOWN 时 parent.requestDisallowInterceptTouchEvent(true)</td></tr>
      <tr><td>主题桥接</td><td>每次重组将 Material3 颜色/字体 token 以 ARGB Int 传入 updateStyle()</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">数据库访问逻辑</div>
    <table class="act-table">
      <tr><th>SQL 类型</th><th>执行方式</th><th>结果</th></tr>
      <tr><td>SELECT / WITH / PRAGMA</td><td>database.query(sql) → Cursor</td><td>QueryResult (列名 + 行数据)</td></tr>
      <tr><td>INSERT / UPDATE / DELETE 等</td><td>database.execSQL(sql) + SELECT changes()</td><td>affectedRows 计数</td></tr>
      <tr><td>分页（enablePaging）</td><td>追加 LIMIT $pageSize OFFSET $offset</td><td>append=true 时新行追加</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">预设 SuggestionChip</div>
    <table class="act-table">
      <tr><th>标签</th><th>SQL</th></tr>
      <tr><td>chats</td><td>SELECT * FROM chats</td></tr>
      <tr><td>messages</td><td>SELECT * FROM messages</td></tr>
      <tr><td>problem_records</td><td>SELECT * FROM problem_records</td></tr>
      <tr><td>Show Tables</td><td>SELECT name FROM sqlite_master WHERE type='table'</td></tr>
      <tr><td>Schema / PRAGMA</td><td>PRAGMA table_info('...')</td></tr>
    </table>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">状态汇总</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>showControlsSheet</td><td>Boolean</td><td>ModalBottomSheet 显隐</td></tr>
      <tr><td>sqlText</td><td>String</td><td>SQL 输入框绑定</td></tr>
      <tr><td>pageSizeText</td><td>String</td><td>页面大小输入框绑定</td></tr>
      <tr><td>enablePaging</td><td>Boolean</td><td>分页开关</td></tr>
      <tr><td>lastExecutedSql</td><td>String</td><td>最后执行的 SQL（"加载更多"基准）</td></tr>
      <tr><td>result (VM)</td><td>QueryResult?</td><td>查询结果（列名 + 行数据）</td></tr>
      <tr><td>isRunning (VM)</td><td>Boolean</td><td>执行中</td></tr>
      <tr><td>error / message / affectedRows (VM)</td><td>String? / Int?</td><td>执行反馈</td></tr>
    </table>

    <!-- HtmlPackager -->
    <div class="section-head orange" style="margin-top:28px;">HtmlPackagerScreen — HTML 应用打包器</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">将本地 Web 项目（SAF 文件夹选择）打包为 Android APK 或 Windows 应用，分 5 个对话框阶段完成。</p>

    <div class="mermaid">
graph TD
    ROOT2["CustomScaffold → Column (padding 16dp)"]
    ROOT2 --> STEP1["Card — Step 1: 选择文件夹&lt;br/&gt;Button '选择文件夹' (OpenDocumentTree SAF)&lt;br/&gt;[已选] Text 文件夹名 (primary 色)"]
    ROOT2 --> STEP2["Card — Step 2: 选择入口文件&lt;br/&gt;ExposedDropdownMenuBox → DropdownMenuItem×N (.html 文件)"]
    ROOT2 --> GEN_BTN["Button '生成包' (Build图标, 56dp)&lt;br/&gt;仅 selectedIndexFile!=null 时启用"]
    ROOT2 --> D1["ExportPlatformDialog"]
    ROOT2 --> D2["AndroidExportDialog / WindowsExportDialog"]
    ROOT2 --> D3["ExportProgressDialog (exportProgress + exportStatus)"]
    ROOT2 --> D4["ExportCompleteDialog (exportResult)"]
    </div>

    <div class="section-head green" style="margin-top:16px;">导出流程（5 阶段）</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">1. ExportPlatformDialog — 选择目标平台 (Android / Windows)</div>
      <div class="tree-node">2. AndroidExportDialog / WindowsExportDialog — 填写应用名/包名/图标等</div>
      <div class="tree-node">3. ExportProgressDialog — 实时显示进度 (0.0–1.0)</div>
      <div class="tree-children">
        <div class="tree-node">a. SAF 遍历 → copyDocumentTreeTo() 复制到临时目录（ContentResolver.openInputStream + FileOutputStream）</div>
        <div class="tree-node">b. 若入口文件名 ≠ index.html → renameTo(index.html)</div>
        <div class="tree-node">c. exportAndroidApp() / exportWindowsApp()  [Dispatchers.IO]</div>
        <div class="tree-node">d. finally: tempWorkDir.deleteRecursively()（无论成败）</div>
      </div>
      <div class="tree-node">4. ExportCompleteDialog — 成功显示输出路径 / 失败显示错误</div>
      <div class="tree-node">5. "打开文件" → AIToolHandler.executeTool("open_file", path)</div>
    </div>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">状态汇总</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>webProjectUri</td><td>Uri?</td><td>SAF 选择的文件夹 URI</td></tr>
      <tr><td>htmlFiles</td><td>List&lt;DocumentFile&gt;</td><td>文件夹中的 .html 文件列表</td></tr>
      <tr><td>selectedIndexFile</td><td>DocumentFile?</td><td>选定的入口文件（决定按钮是否启用）</td></tr>
      <tr><td>showExportPlatformDialog</td><td>Boolean</td><td>平台选择对话框</td></tr>
      <tr><td>showExportDialog</td><td>Boolean</td><td>Android 配置对话框</td></tr>
      <tr><td>showWindowsExportDialog</td><td>Boolean</td><td>Windows 配置对话框</td></tr>
      <tr><td>showProgressDialog</td><td>Boolean</td><td>进度对话框</td></tr>
      <tr><td>showCompleteDialog</td><td>Boolean</td><td>完成对话框</td></tr>
      <tr><td>exportProgress</td><td>Float</td><td>导出进度（0.0–1.0）</td></tr>
      <tr><td>exportStatus</td><td>String</td><td>实时状态文字</td></tr>
      <tr><td>exportResult</td><td>Result&lt;String&gt;?</td><td>最终结果（输出路径或异常）</td></tr>
    </table>
`);
