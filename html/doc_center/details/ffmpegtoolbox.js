registerDetail('ffmpegtoolbox', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">419</span><span class="stat-label">FFmpegToolbox 行数</span></div>
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">命令模板</span></div>
      <div class="stat-item"><span class="stat-num">476</span><span class="stat-label">Logcat 总行数</span></div>
      <div class="stat-item"><span class="stat-num">2</span><span class="stat-label">页面</span></div>
    </div>

    <!-- FFmpegToolboxScreen -->
    <div class="section-head blue">FFmpegToolboxScreen — FFmpeg 命令工具箱</div>
    <p style="margin:8px 0;font-size:13px;">底层通过 <code>AIToolHandler.executeTool("ffmpeg_execute")</code> 执行命令，支持 5 个内置模板快速填充。</p>

    <div class="mermaid">
graph TD
    ROOT["FFmpegToolboxScreen&lt;br/&gt;(Column + verticalScroll)"]
    ROOT --> CMD_INPUT["命令输入区域"]
    CMD_INPUT --> FIELD["OutlinedTextField&lt;br/&gt;(min 100dp, maxLines=5)"]
    CMD_INPUT --> BTN_ROW["Row 两个按钮"]
    BTN_ROW --> BTN_TMPL["Button '常用命令模板'&lt;br/&gt;toggle showCommandTemplates"]
    BTN_ROW --> BTN_EXEC["Button '执行命令'&lt;br/&gt;(disabled 中 or 空)"]
    ROOT --> TEMPLATE_CARD["[showCommandTemplates] Card&lt;br/&gt;TemplateItem × 5"]
    ROOT --> INFO_CARD["FFmpeg 帮助卡片&lt;br/&gt;参数说明 + '查看更多信息'按钮"]
    ROOT --> PROGRESS["[isProcessing] LinearProgressIndicator"]
    ROOT --> RESULT["[commandResult] Card&lt;br/&gt;成功=primaryContainer / 失败=errorContainer"]
    </div>

    <div class="section-head green" style="margin-top:16px;">命令模板</div>
    <table class="act-table">
      <tr><th>模板</th><th>命令示例</th></tr>
      <tr><td>视频格式转换</td><td>-i input.mp4 -c:v h264 -c:a aac output.mp4</td></tr>
      <tr><td>视频压缩</td><td>-i input.mp4 -vf scale=1280:-1 -c:v h264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4</td></tr>
      <tr><td>视频裁剪</td><td>-i input.mp4 -ss 00:00:30 -t 00:00:10 -c:v copy -c:a copy output.mp4</td></tr>
      <tr><td>提取音频</td><td>-i input.mp4 -vn -acodec copy output.aac</td></tr>
      <tr><td>创建 GIF</td><td>-i input.mp4 -vf "fps=10,scale=320:-1:flags=lanczos" -c:v gif output.gif</td></tr>
    </table>

    <div class="section-head orange" style="margin-top:16px;">执行流程</div>
    <div class="flow" style="margin:8px 0;flex-wrap:wrap;gap:4px;">
      <span class="flow-step">Button '执行命令'</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">isProcessing = true</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">AITool("ffmpeg_execute", command)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">aiToolHandler.executeTool()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">commandResult = result</span>
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">结果展示（commandResult Card）</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">Card (圆角 12dp)</div>
      <div class="tree-children">
        <div class="tree-node">Row: Icon(CheckCircle/Error 28dp) + 成功/失败标题</div>
        <div class="tree-node">[失败] Text (result.error)</div>
        <div class="tree-node">[成功 FFmpegResultData] 命令 + 返回码 + 处理时间 + [output非空] Monospace 输出</div>
      </div>
    </div>

    <!-- LogcatScreen -->
    <div class="section-head purple" style="margin-top:24px;">LogcatScreen — 日志导出工具</div>
    <p style="margin:8px 0;font-size:13px;">应用日志导出工具，读写 AppLogger 写入的本地日志文件。UI 设计极简，居中单卡片。</p>

    <div class="mermaid">
graph TD
    ROOT["LogcatScreen&lt;br/&gt;(CustomScaffold)"]
    ROOT --> TOP_BAR["TopAppBar: 日志管理"]
    ROOT --> SNACK["SnackbarHost → saveResult (3s 后自动清除)"]
    ROOT --> BODY["Box (Center)"]
    BODY --> CARD["Card (horizontal padding 32dp, elevation 4dp)"]
    CARD --> ICON["Icon.Description (48dp, primary)"]
    CARD --> TITLE["Text: 日志管理 titleLarge"]
    CARD --> DESC["Text: 功能说明 bodyMedium Center"]
    CARD --> BTN_SAVE["Button '保存日志到文件'&lt;br/&gt;[isSaving] CircularProgressIndicator"]
    CARD --> BTN_CLEAR["OutlinedButton '清除所有日志'&lt;br/&gt;(error 色)"]
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">LogcatViewModel 核心</div>
    <table class="act-table">
      <tr><th>方法/State</th><th>说明</th></tr>
      <tr><td>isSaving: StateFlow&lt;Boolean&gt;</td><td>保存中状态</td></tr>
      <tr><td>saveResult: StateFlow&lt;String?&gt;</td><td>操作结果消息，3s 后清除</td></tr>
      <tr><td>saveLogsToFile()</td><td>→ LogcatExportHelper.exportLogs(context)</td></tr>
      <tr><td>clearLogs()</td><td>→ AppLogger.resetLogFile() 清空日志文件</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">LogcatComponents（预留扩展组件）</div>
    <table class="act-table">
      <tr><th>组件</th><th>说明</th></tr>
      <tr><td>LogRecordItem</td><td>日志条目卡片：级别圆点 + tag 彩色背景（字符串哈希→色相）+ HH:mm:ss 时间戳 + Monospace 内容</td></tr>
      <tr><td>CompactSearchField</td><td>36dp 高胶囊形搜索框，BasicTextField 实现，支持前置/后置图标</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);">注：这两个组件当前未在 LogcatScreen 主界面使用，预留供日志列表视图功能扩展。</p>
    <p style="font-size:12px;color:var(--text-dim);">generateColorFromString 算法：哈希取色相(0-360)，固定饱和度 0.75 + 亮度 0.65 → HSL颜色</p>
`);
