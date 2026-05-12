registerDetail('skillmarket', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">5</span><span class="stat-label">页面</span></div>
      <div class="stat-item"><span class="stat-num">~3221</span><span class="stat-label">页面行数</span></div>
      <div class="stat-item"><span class="stat-num">922</span><span class="stat-label">ViewModel</span></div>
      <div class="stat-item"><span class="stat-num">8</span><span class="stat-label">对话框</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">导入方式</span></div>
    </div>

    <!-- 导航关系 -->
    <div class="section-head blue">导航关系</div>
    <div class="mermaid">
graph TD
    PKG["Screen.Packages&lt;br/&gt;(SKILLS Tab)"]
    PKG --> CONFIG["SkillConfigScreen&lt;br/&gt;(内嵌本地管理)"]
    CONFIG --> MARKET["Screen.SkillMarket&lt;br/&gt;(市场入口)"]
    MARKET --> PUBLISH["Screen.SkillPublish&lt;br/&gt;(发布)"]
    MARKET --> MANAGE["Screen.SkillManage&lt;br/&gt;(管理我的)"]
    MANAGE --> DETAIL["Screen.SkillDetail(issue)&lt;br/&gt;(详情)"]
    MANAGE --> EDIT["Screen.SkillEdit(issue)&lt;br/&gt;(编辑=SkillPublish)"]
    MARKET --> DETAIL
    </div>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">所有子页面 parentScreen = SkillMarket，返回键回到市场。数据源：GitHub Issues (仓库 AAswordman/OperitSkillMarket，标签 skill-plugin)</p>

    <!-- SkillMarketViewModel -->
    <div class="section-head green">SkillMarketViewModel</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">通过自定义 Factory(context, skillRepository) 创建。浏览通过 GitHubApiService.getRepositoryIssues() 分页 50 条/页，搜索通过 GitHub Search API 350ms 去抖。</p>
    <table class="act-table">
      <tr><th>StateFlow</th><th>类型</th><th>说明</th></tr>
      <tr><td>skillIssues</td><td>List&lt;GitHubIssue&gt;</td><td>派生：浏览或搜索结果</td></tr>
      <tr><td>isLoading / isLoadingMore / hasMore</td><td>Boolean</td><td>加载/分页状态</td></tr>
      <tr><td>searchQuery</td><td>String</td><td>搜索关键词</td></tr>
      <tr><td>installingSkills</td><td>Set&lt;String&gt;</td><td>安装中的 repoUrl 集合</td></tr>
      <tr><td>installedSkillRepoUrls</td><td>Set&lt;String&gt;</td><td>已安装（通过 .operit_repo_url 标记文件）</td></tr>
      <tr><td>userPublishedSkills</td><td>List&lt;GitHubIssue&gt;</td><td>当前用户发布的 Issues</td></tr>
      <tr><td>issueComments / issueReactions</td><td>Map</td><td>评论/反应缓存</td></tr>
    </table>

    <!-- SkillMarketScreen -->
    <div class="section-head purple">SkillMarketScreen（浏览 + 我的）</div>
    <div class="mermaid">
graph TD
    ROOT["SkillMarketScreen&lt;br/&gt;(Column)"]

    ROOT --> HEADER["Surface (header)"]
    HEADER --> LOGIN_BANNER["[!isLoggedIn] Row: 登录提示横幅"]
    HEADER --> TAB_ROW["TabRow"]
    TAB_ROW --> TAB_BROWSE["Tab: Browse"]
    TAB_ROW --> TAB_MY["Tab: My (含头像)"]

    ROOT --> CONTENT["Box (weight=1f)"]
    CONTENT --> BROWSE["SkillBrowseTab"]
    CONTENT --> MY["SkillMyTab"]

    BROWSE --> SEARCH["OutlinedTextField (搜索栏, 圆角 16dp)"]
    BROWSE --> LIST["LazyColumn"]
    LIST --> CARDS["SkillIssueCard (per issue)"]

    MY --> NOT_LOGGED["[未登录] Column: 图标 + 登录按钮"]
    MY --> LOGGED["[已登录] Column: 头像 + 用户名"]
    LOGGED --> BTN_PUBLISH["Button: 发布新技能"]
    LOGGED --> BTN_MANAGE["OutlinedButton: 管理我的技能"]
    </div>

    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);"><strong>SkillIssueCard：</strong>Card(clickable) → Row → Column(标题+描述+作者头像+反应) + Surface(34dp 圆形安装按钮: 安装中/已安装/可用/已关闭)</p>
    <p style="margin:4px 0 0 4px;font-size:12px;color:var(--text-dim);"><strong>无限滚动：</strong>LaunchedEffect 监听 snapshotFlow { lastVisibleIndex }，距离末尾 2 项时触发 loadMoreSkillMarketData()。</p>

    <!-- SkillDetailScreen -->
    <div class="section-head blue">SkillDetailScreen（技能详情）</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">CustomScaffold + FAB(AddComment) + LazyColumn: SkillHeader → SkillActions → SkillDescription → SkillMetadata(FlowRow: 状态/已安装/Stars/日期) → SkillReactions(👍/❤️) → CommentsHeader → CommentCard</p>
    <p style="margin:4px 0 0 4px;font-size:12px;color:var(--text-dim);">反应系统：单向操作，只能添加不能取消。ReactionButton 使用 FilledTonalButton，已反应时容器着色+禁用。</p>

    <!-- SkillManageScreen -->
    <div class="section-head green">SkillManageScreen（管理我的技能）</div>
    <p style="margin:0 0 8px 4px;font-size:13px;color:var(--text-dim);">CustomScaffold + FAB(Add→发布页) + LazyColumn: Surface(per issue) → 标题+描述 + Row(编辑/删除按钮)</p>
    <p style="margin:4px 0 0 4px;font-size:12px;color:var(--text-dim);">删除逻辑 = GitHub API PATCH issue state="closed"（关闭 Issue，非真删除）</p>

    <!-- SkillPublishScreen -->
    <div class="section-head orange">SkillPublishScreen（发布/编辑）</div>
    <table class="act-table">
      <tr><th>模式</th><th>条件</th><th>行为</th></tr>
      <tr><td>发布</td><td>editingIssue == null</td><td>草稿自动保存到 SharedPreferences</td></tr>
      <tr><td>编辑</td><td>editingIssue != null</td><td>从 Issue body 解析预填充</td></tr>
    </table>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">表单字段：技能名称*(必填) + 描述*(3-6行) + 仓库地址*(必填)。发布流程：publishSkill() → 创建 GitHub Issue(POST)，body 含结构化 markdown + 嵌入 JSON 元数据注释。</p>

    <!-- SkillConfigScreen -->
    <div class="section-head purple">SkillConfigScreen（本地技能管理 · 内嵌 Packages SKILLS Tab）</div>
    <table class="act-table">
      <tr><th>导入 Tab</th><th>输入</th><th>调用</th></tr>
      <tr><td>Repo URL</td><td>GitHub 仓库地址</td><td>importSkillFromGitHubRepo(url)</td></tr>
      <tr><td>ZIP File</td><td>本地 zip 文件选择</td><td>importSkillFromZip(tempFile)</td></tr>
      <tr><td>Direct Input</td><td>技能 ID + 描述 + 内容 + 附件</td><td>importSkillFromDirectInput(...)</td></tr>
    </table>
    <p style="margin:8px 0 0 4px;font-size:12px;color:var(--text-dim);">技能列表项：Surface(clickable→详情弹窗) → Row → 3dp 彩色条 + Icon(Build) + Column(名称+描述) + Switch(AI 可见性开关)</p>

    <!-- 对话框清单 -->
    <div class="section-head orange">对话框清单 (8个)</div>
    <table class="act-table">
      <tr><th>对话框</th><th>所在页面</th><th>触发</th></tr>
      <tr><td>GitHubLoginDialog</td><td>SkillMarketScreen</td><td>登录横幅/登录按钮</td></tr>
      <tr><td>CommentInputDialog</td><td>SkillDetailScreen</td><td>FAB 点击</td></tr>
      <tr><td>删除确认</td><td>SkillManageScreen</td><td>删除按钮</td></tr>
      <tr><td>发布确认</td><td>SkillPublishScreen</td><td>发布/更新按钮</td></tr>
      <tr><td>发布成功</td><td>SkillPublishScreen</td><td>发布成功后</td></tr>
      <tr><td>技能详情</td><td>SkillConfigScreen</td><td>列表项点击</td></tr>
      <tr><td>导入对话框 (3 Tab)</td><td>SkillConfigScreen</td><td>FAB 点击</td></tr>
      <tr><td>加载错误</td><td>SkillConfigScreen</td><td>错误 FAB 点击</td></tr>
    </table>

    <!-- 架构要点 -->
    <div class="section-head gray">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🐙</div>
        <div class="kn-title blue">GitHub Issues 即数据库</div>
        <div class="kn-body">所有技能插件元数据存储为 GitHub Issue，安装/删除/搜索均通过 GitHub API。Issue body 内嵌 HTML 注释 JSON 块传递结构化数据。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔍</div>
        <div class="kn-title green">350ms 去抖搜索</div>
        <div class="kn-body">搜索输入通过 searchJob 取消 + delay(350) 实现去抖，使用 GitHub Search API 而非 Issues API。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">✅</div>
        <div class="kn-title orange">双重安装检测</div>
        <div class="kn-body">installedSkillRepoUrls（.operit_repo_url 标记文件）和 installedSkillNames（目录名匹配）并存，兼容旧版安装。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">💾</div>
        <div class="kn-title purple">草稿自动保存</div>
        <div class="kn-body">发布页每次按键触发 saveDraft() 到 SharedPreferences（仅新建模式，编辑模式不保存草稿）。头像缓存仅内存。</div>
      </div>
    </div>

    <!-- 核心文件清单 -->
    <div class="section-head gray">核心文件清单</div>
    <table class="act-table">
      <tr><th>文件</th><th>行数</th><th>职责</th></tr>
      <tr><td>SkillMarketScreen.kt</td><td>800</td><td>市场入口 (Browse + My Tab)</td></tr>
      <tr><td>SkillDetailScreen.kt</td><td>764</td><td>技能详情 + 反应 + 评论</td></tr>
      <tr><td>SkillManageScreen.kt</td><td>307</td><td>管理已发布技能</td></tr>
      <tr><td>SkillPublishScreen.kt</td><td>298</td><td>发布/编辑表单</td></tr>
      <tr><td>SkillConfigScreen.kt</td><td>1052</td><td>本地技能管理 + 导入</td></tr>
      <tr><td>SkillMarketViewModel.kt</td><td>922</td><td>市场 ViewModel</td></tr>
      <tr><td>SkillIssueParser.kt</td><td>183</td><td>Issue body 解析器</td></tr>
    </table>
`);
