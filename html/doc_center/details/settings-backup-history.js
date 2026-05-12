registerDetail('settings-backup-history', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">1627</span><span class="stat-label">ChatBackup 行数</span></div>
      <div class="stat-item"><span class="stat-num">1992</span><span class="stat-label">ChatHistory 行数</span></div>
      <div class="stat-item"><span class="stat-num">6</span><span class="stat-label">数据域</span></div>
      <div class="stat-item"><span class="stat-num">4</span><span class="stat-label">导出格式</span></div>
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">导入格式</span></div>
      <div class="stat-item"><span class="stat-num">7+8</span><span class="stat-label">快照进度阶段</span></div>
    </div>

    <!-- ChatBackupSettingsScreen -->
    <div class="section-head blue">ChatBackupSettingsScreen — 数据备份与恢复</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">
      全域数据备份管理中心，覆盖 6 种数据域（聊天记录、角色卡、记忆、模型配置、Room 数据库、原始快照），每个域独立提供导出/导入/删除操作，带进度反馈和多步对话框流程。源码规模：<strong>1627 行</strong>，无 ViewModel，所有业务逻辑内联在 Composable 中。
    </p>

    <!-- 组件树 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["ChatBackupSettingsScreen&lt;br/&gt;(LazyColumn, 8个区块)"]

    ROOT --> OVERVIEW["OverviewCard&lt;br/&gt;FlowRow: 聊天数/角色卡数/记忆数/关联数"]
    ROOT --> STATS["BackupFilesStatisticsCard&lt;br/&gt;FlowRow: 5种备份文件计数 + Refresh"]
    ROOT --> CHAT["DataManagementCard (聊天)&lt;br/&gt;Export / Import / Delete All"]
    ROOT --> CHAR["CharacterCardManagementCard&lt;br/&gt;Export / Import"]
    ROOT --> MEM["MemoryManagementCard&lt;br/&gt;Export / Import (多档案+策略)"]
    ROOT --> MODEL["ModelConfigManagementCard&lt;br/&gt;Export / Import"]
    ROOT --> FAQ["FaqCard (3个常见问题)"]
    ROOT --> ROOMDB["Room DB Backup Card&lt;br/&gt;每日自动备份 + 手动备份/恢复"]
    ROOT --> RAW["Raw Snapshot Card&lt;br/&gt;全量快照备份/恢复"]

    CHAT --> DLG_DEL["DeleteConfirmationDialog"]
    CHAT --> DLG_EXPORT_FMT["ExportFormatDialog&lt;br/&gt;(JSON/MD/HTML/TXT)"]
    CHAT --> DLG_IMPORT_FMT["ImportFormatDialog&lt;br/&gt;(OPERIT/CHATGPT/CHATBOX/MD/JSON)"]
    MEM --> DLG_PROFILE_E["ProfileSelectionDialog (导出)"]
    MEM --> DLG_PROFILE_I["ProfileSelectionDialog (导入)"]
    MEM --> DLG_STRATEGY["MemoryImportStrategyDialog&lt;br/&gt;(SKIP/UPDATE/CREATE_NEW)"]
    MODEL --> DLG_WARNING["ModelConfigExportWarningDialog&lt;br/&gt;(API Key 安全警告)"]
    ROOMDB --> DLG_RESTORE["AlertDialog: 恢复确认"]
    ROOMDB --> DLG_RESTART["AlertDialog: 重启应用"]
    </div>

    <!-- 6 种数据域操作矩阵 -->
    <div class="section-head green" style="margin-top:16px;">6 种数据域操作矩阵</div>
    <table class="act-table">
      <tr><th>数据域</th><th>导出</th><th>导入</th><th>删除</th><th>特殊说明</th></tr>
      <tr>
        <td>聊天记录</td>
        <td>4 格式 (JSON/MD/HTML/TXT)</td>
        <td>5 格式 (OPERIT/CHATGPT/CHATBOX/MD/JSON)</td>
        <td>全部删除（跳过锁定）</td>
        <td>—</td>
      </tr>
      <tr>
        <td>角色卡</td>
        <td>JSON</td>
        <td>JSON</td>
        <td>—</td>
        <td>—</td>
      </tr>
      <tr>
        <td>记忆</td>
        <td>需选档案</td>
        <td>需选档案 + 合并策略</td>
        <td>—</td>
        <td>3 种合并策略</td>
      </tr>
      <tr>
        <td>模型配置</td>
        <td>JSON + 安全警告</td>
        <td>JSON</td>
        <td>—</td>
        <td>导出后警告含 API Key</td>
      </tr>
      <tr>
        <td>Room DB</td>
        <td>手动 / 每日自动</td>
        <td>ZIP 文件</td>
        <td>—</td>
        <td>恢复后需重启</td>
      </tr>
      <tr>
        <td>原始快照</td>
        <td>7 阶段进度</td>
        <td>8 阶段进度</td>
        <td>—</td>
        <td>恢复后需重启</td>
      </tr>
    </table>

    <!-- 状态管理 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">操作状态枚举</div>
    <div class="kn-code" style="margin:8px 0;">enum class ChatHistoryOperation    { IDLE, EXPORTING, EXPORTED, IMPORTING, IMPORTED, DELETING, DELETED, FAILED }
enum class CharacterCardOperation  { IDLE, EXPORTING, EXPORTED, IMPORTING, IMPORTED, FAILED }
enum class MemoryOperation         { IDLE, EXPORTING, EXPORTED, IMPORTING, IMPORTED, FAILED }
enum class ModelConfigOperation    { IDLE, EXPORTING, EXPORTED, IMPORTING, IMPORTED, FAILED }
enum class RoomDatabaseBackupOperation  { IDLE, BACKING_UP, SUCCESS, FAILED }
enum class RoomDatabaseRestoreOperation { IDLE, RESTORING, SUCCESS, FAILED }
enum class RawSnapshotOperation    { IDLE, BACKING_UP, BACKUP_SUCCESS, RESTORING, RESTORE_SUCCESS, FAILED }</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">响应式 Flow</div>
    <table class="act-table">
      <tr><th>Flow</th><th>说明</th></tr>
      <tr><td>activeProfileIdFlow</td><td>当前用户档案</td></tr>
      <tr><td>enableDailyBackupFlow</td><td>Room DB 每日备份开关</td></tr>
      <tr><td>lastSuccessTimeFlow</td><td>上次备份成功时间</td></tr>
      <tr><td>lastErrorFlow</td><td>上次备份错误信息</td></tr>
    </table>

    <!-- 多步对话框流程 -->
    <div class="section-head orange" style="margin-top:16px;">多步对话框流程</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">URI 暂存模式：文件选择器结果存入 <code style="color:var(--accent-blue);">pendingXxxUri</code>，后续对话框消费。</p>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">记忆导入（3 步）</div>
    <div class="kn-code" style="margin:8px 0;">Import 按钮 → 文件选择器 → pendingMemoryImportUri
  → ProfileSelectionDialog (选目标档案)
    → MemoryImportStrategyDialog (选合并策略: SKIP/UPDATE/CREATE_NEW)
      → importMemoriesFromUri()</div>

    <div class="section-head" style="margin-top:8px;background:var(--surface-2);color:var(--text);">聊天导入（2 步）</div>
    <div class="kn-code" style="margin:8px 0;">Import 按钮 → 文件选择器 → pendingImportUri
  → ImportFormatDialog (选格式)
    → chatHistoryManager.importChatHistoriesFromUri()</div>

    <!-- Room DB 备份 -->
    <div class="section-head blue" style="margin-top:16px;">Room DB 备份机制</div>
    <table class="act-table">
      <tr><th>功能</th><th>实现</th></tr>
      <tr><td>每日自动备份</td><td>Switch 控制 + RoomDatabaseBackupScheduler.ensureScheduled()</td></tr>
      <tr><td>最大备份数</td><td>步进器 (1–100)，减小时调用 pruneExcessBackups()</td></tr>
      <tr><td>最近备份列表</td><td>RoomDbBackupListItem 显示文件名 + 单独恢复按钮</td></tr>
      <tr><td>恢复后重启</td><td>FLAG_ACTIVITY_CLEAR_TASK + exitProcess(0)</td></tr>
    </table>

    <!-- Raw Snapshot 进度阶段 -->
    <div class="section-head green" style="margin-top:16px;">Raw Snapshot 进度阶段</div>
    <table class="act-table">
      <tr><th>导出（7 阶段）</th><th>恢复（8 阶段）</th></tr>
      <tr><td>PREPARING</td><td>PREPARING</td></tr>
      <tr><td>SCANNING_FILES</td><td>READING_ZIP</td></tr>
      <tr><td>ZIPPING_FILES</td><td>EXTRACTING</td></tr>
      <tr><td>ZIPPING_SHARED_PREFS</td><td>REPLACING_FILES</td></tr>
      <tr><td>ZIPPING_DATASTORE</td><td>REPLACING_SHARED_PREFS</td></tr>
      <tr><td>ZIPPING_DATABASES</td><td>REPLACING_DATASTORE</td></tr>
      <tr><td>FINALIZING</td><td>REPLACING_DATABASES</td></tr>
      <tr><td>—</td><td>FINALIZING</td></tr>
    </table>

    <!-- ChatHistorySettingsScreen -->
    <div class="section-head orange" style="margin-top:28px;">ChatHistorySettingsScreen — 聊天历史管理</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">
      聊天历史的浏览、统计、批量操作和数据清理工具。提供按角色卡/角色组的使用统计、批量绑定/解绑、缺失引用修复、未绑定工作空间清理。源码规模：<strong>1992 行</strong>，无 ViewModel。
    </p>

    <!-- 组件树 -->
    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件树</div>
    <div class="mermaid">
graph TD
    ROOT["ChatHistorySettingsScreen&lt;br/&gt;(Box → LazyColumn + Loading Overlay)"]

    ROOT --> OVERVIEW["ChatManagementOverviewCard&lt;br/&gt;StatChip: 总聊天数"]
    ROOT --> CARD_STATS["CharacterCardStatsCard&lt;br/&gt;按角色卡统计聊天/消息数"]
    CARD_STATS --> CARD_ROW["CharacterCardStatRow&lt;br/&gt;头像(Coil) + 名称 + 统计&lt;br/&gt;[缺失] 红色提示, 可点击"]

    ROOT --> GROUP_STATS["CharacterGroupStatsCard&lt;br/&gt;按角色组统计"]
    GROUP_STATS --> GROUP_ROW["CharacterGroupStatRow&lt;br/&gt;头像 + 组名 + 统计"]

    ROOT --> BATCH["ChatHistoryBatchSelectorCard"]
    BATCH --> SEARCH["OutlinedTextField (搜索)"]
    BATCH --> LIST["LazyColumn (320dp, checkable)"]
    LIST --> SELECT_ROW["ChatHistorySelectableRow&lt;br/&gt;Checkbox + 标题 + 绑定信息"]
    BATCH --> DELETE_BTN["Button: Delete N selected (error)"]
    BATCH --> ASSIGN["Column: 角色卡/角色组下拉 + 组名输入"]

    ROOT --> UNBOUND["UnboundWorkspaceCard&lt;br/&gt;未关联工作空间扫描 + 清理"]

    ROOT --> DLG_MISSING["AlertDialog: 缺失角色卡处理"]
    ROOT --> DLG_ASSIGN["CharacterCardAssignDialog&lt;br/&gt;重新分配到已有角色卡"]
    ROOT --> DLG_DEL_MISSING["AlertDialog: 删除残留聊天确认"]
    </div>

    <!-- 状态管理 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">响应式 Flow</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">加载闸门：4 个异步标志全部完成后隐藏全屏加载遮罩。</p>
    <table class="act-table">
      <tr><th>Flow</th><th>来源</th><th>说明</th></tr>
      <tr><td>characterCardStatsFlow</td><td>ChatHistoryManager</td><td>按角色卡聊天统计</td></tr>
      <tr><td>characterGroupStatsFlow</td><td>ChatHistoryManager</td><td>按角色组聊天统计</td></tr>
      <tr><td>chatHistoriesFlow</td><td>ChatHistoryManager</td><td>全部聊天记录</td></tr>
      <tr><td>characterCardListFlow</td><td>CharacterCardManager</td><td>已有角色卡列表</td></tr>
      <tr><td>allCharacterGroupCardsFlow</td><td>CharacterGroupCardManager</td><td>已有角色组列表</td></tr>
    </table>

    <!-- 角色卡统计与缺失修复 -->
    <div class="section-head blue" style="margin-top:16px;">角色卡统计与缺失引用修复</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">排序规则：缺失引用排最前（红色高亮），然后按名称字母排序。</p>
    <div class="kn-code" style="margin:8px 0;">点击缺失行 → MissingActionDialog
  ├── "Assign to card" → CharacterCardAssignDialog
  │   └── 选择已有卡 → reassignChatsToCharacterCard(source, target)
  └── "Delete residual chats" → DeleteMissingDialog
      └── 确认 → deleteChatsByCharacterCardBinding(cardName)</div>

    <!-- 批量选择器 -->
    <div class="section-head green" style="margin-top:16px;">批量选择器（ChatHistoryBatchSelectorCard）</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">
      搜索过滤：按标题、组名、角色卡名、角色组名过滤。Apply 按钮标签根据选中的操作组合动态生成。
    </p>
    <table class="act-table">
      <tr><th>批量操作</th><th>实现方式</th></tr>
      <tr><td>角色卡绑定/解绑</td><td>ExposedDropdownMenuBox</td></tr>
      <tr><td>角色组绑定/解绑</td><td>ExposedDropdownMenuBox</td></tr>
      <tr><td>组名修改</td><td>自由文本输入</td></tr>
      <tr><td>批量删除</td><td>跳过锁定聊天</td></tr>
    </table>
    <p style="margin:6px 0 0 4px;font-size:12px;color:var(--text-dim);">多键排序：组绑定 → 组名 → 卡绑定 → 卡名 → 组字段 → 时间倒序。</p>

    <!-- 未绑定工作空间清理 -->
    <div class="section-head orange" style="margin-top:16px;">未绑定工作空间清理（UnboundWorkspaceCard）</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">
      扫描两个目录，过滤掉被任何 <code style="color:var(--accent-blue);">ChatHistory.workspace</code> 引用的路径，剩余显示为可勾选列表。
    </p>
    <table class="act-table">
      <tr><th>存储类型</th><th>路径</th><th>图标</th><th>标签</th></tr>
      <tr><td>内部存储</td><td>context.filesDir/workspace/</td><td>Folder</td><td>internal storage</td></tr>
      <tr><td>外部存储</td><td>Downloads/Operit/workspace/</td><td>FolderOpen</td><td>external storage</td></tr>
    </table>

    <!-- 头像渲染 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">头像渲染策略</div>
    <table class="act-table">
      <tr><th>情形</th><th>渲染方式</th></tr>
      <tr><td>有 URI</td><td>Coil AsyncImagePainter + ContentScale.Crop</td></tr>
      <tr><td>无 URI</td><td>名称首字符 + secondaryContainer 背景</td></tr>
    </table>
    <p style="margin:4px 0 0 4px;font-size:12px;color:var(--text-dim);">每行独立收集 getAiAvatarForCharacterCardFlow(card.id) / getAiAvatarForCharacterGroupFlow(group.id)，各自 collectAsState 维持独立响应式订阅。</p>

    <!-- 数据模型 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">数据模型</div>
    <div class="kn-code" style="margin:8px 0;">data class CharacterCardChatStats(
    val characterCardName: String?,   // null = 未绑定
    val chatCount: Int,
    val messageCount: Int
)

data class CharacterGroupChatStats(
    val characterGroupId: String?,
    val chatCount: Int,
    val messageCount: Int
)

data class UnboundWorkspaceInfo(
    val name: String,
    val fullPath: String,
    val location: String   // 已本地化
)</div>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:20px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🧩</div>
        <div class="kn-title blue">神级 Composable</div>
        <div class="kn-body">ChatBackup 1627 行、ChatHistory 1992 行，全部业务逻辑内联在 Composable 中，无 ViewModel。Manager 通过 getInstance(context) 单例获取。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📌</div>
        <div class="kn-title orange">URI 暂存模式</div>
        <div class="kn-body">多步对话框流程通过 pendingXxxUri 变量在文件选择器和后续对话框之间传递数据，解耦选择器与业务对话框。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔲</div>
        <div class="kn-title green">子组件自治</div>
        <div class="kn-body">ChatHistoryBatchSelectorCard 和 UnboundWorkspaceCard 各自持有独立的对话框状态和删除进度，相当于内嵌的子页面。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📡</div>
        <div class="kn-title blue">每行独立订阅</div>
        <div class="kn-body">CharacterCardStatRow 各自 collectAsState 头像 Flow，每个可见行维持独立的响应式订阅，避免全局重组。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔄</div>
        <div class="kn-title orange">恢复后重启</div>
        <div class="kn-body">Room DB 和 Raw Snapshot 恢复成功后，通过 FLAG_ACTIVITY_CLEAR_TASK + exitProcess(0) 强制重启应用，确保数据一致性。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">📊</div>
        <div class="kn-title green">操作结果反馈</div>
        <div class="kn-body">所有操作通过 OperationProgressView（加载中）和 OperationResultCard（结果）两个共享组件显示反馈，统一交互体验。</div>
      </div>
    </div>

    <!-- 核心文件清单 -->
    <div class="section-head" style="margin-top:20px;background:var(--surface-2);color:var(--text);">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径（相对 ui/features/settings/）</th><th>行数</th><th>职责</th></tr>
      <tr><td>ChatBackupSettingsScreen</td><td>screens/ChatBackupSettingsScreen.kt</td><td>1627</td><td>6 域备份管理</td></tr>
      <tr><td>ChatHistorySettingsScreen</td><td>screens/ChatHistorySettingsScreen.kt</td><td>1992</td><td>聊天历史统计与管理</td></tr>
      <tr><td>BackupCards</td><td>components/BackupCards.kt</td><td>~200</td><td>OverviewCard + StatisticsCard</td></tr>
      <tr><td>BackupManagementCards</td><td>components/BackupManagementCards.kt</td><td>~300</td><td>4 域管理卡 + FAQ + 共享组件</td></tr>
      <tr><td>BackupOperationTypes</td><td>components/BackupOperationTypes.kt</td><td>~50</td><td>操作状态枚举</td></tr>
      <tr><td>RoomDbBackupComponents</td><td>components/RoomDbBackupComponents.kt</td><td>~100</td><td>Room DB 备份列表项</td></tr>
    </table>
`);
