registerWalkthroughSection('autoglm', 'AutoGLM无障碍自动化', `<div style="max-width:960px;margin:0 auto;padding:8px 0 48px;"><h2 class="section-title">Walkthrough: AutoGLM 无障碍自动化</h2><div class="callout"><b>场景</b><br/>AI 需要在设备上操作一个 App（比如打开微信发一条消息）。系统通过无障碍服务获取屏幕 UI 层级树，找到目标元素并执行点击/输入操作。从用户在 AutoGLM 界面输入任务，到操作真正落地设备屏幕，经过了哪些代码。<br/><br/><b>前置知识</b><br/>建议先读 <code>tool-execution.md</code> 了解 AI 工具调用的通用执行流程，本文专注于 UI 自动化这条特殊路径。<br/><br/><b>预计时间</b><br/>35-45 分钟。</div><h2 class="section-title">全链路总览</h2><div class="mermaid">flowchart TD
    A["用户在 AutoGlmToolScreen\n输入任务并点击执行"] --> B["Step 1: AutoGlmViewModel\n.executeTask()"]
    B --> C["Step 2: ToolGetter.getUITools()\n按权限级别选择工具实现"]
    C --> D["Step 3: PhoneAgent.run()\n多步 AI 决策循环"]
    D --> E["Step 4: AI 输出工具调用\n如 click_element / get_page_info"]
    E --> F["Step 5: AccessibilityUITools\n无障碍工具实现层"]
    F --> G["Step 6: UIHierarchyManager\n主进程 AIDL 代理"]
    G --> H["Step 7: IAccessibilityProvider\nAIDL 接口跨进程调用"]
    H --> I["Step 8: Provider 进程\n独立 AccessibilityService 实现"]
    I --> J["真实设备 UI 操作完成\n点击 / 输入 / 滚动 / 全局键"]
    J --> K["操作结果通过 AIDL 返回\n回到 PhoneAgent 决策下一步"]
    K --> D</div><hr/><h2 class="section-title">架构核心问题：为什么不在主进程继承 AccessibilityService？</h2><p>在跟代码之前，先回答这个架构问题。</p><p>查看 AIDL 文件可以发现，无障碍服务不在主 App 进程，而是独立为一个 Provider 进程（包名 <code>com.ai.assistance.operit.provider</code>），通过 AIDL 与主进程通信。</p><div class="callout"><b>架构推断（非代码注释，开发者推理）</b><br/><br/>1. <b>进程隔离 - 最重要的原因：</b><code>AccessibilityService</code> 是系统级服务，若服务崩溃会被系统强制 kill 掉整个进程。独立进程下，无障碍服务崩溃只影响 Provider 进程，主 App 进程仍然存活，可以重新绑定恢复。若合并在主进程，任何 UI 自动化 Bug 都可能导致整个应用崩溃。<br/><br/>2. <b>ANR 监控隔离：</b>Android 系统对前台 App 有 5 秒 ANR 超时监控。无障碍服务在执行截图、遍历 UI 树等耗时操作时，可能触发 ANR。独立进程使这些操作的 ANR 风险不影响主 App 的响应性。<br/><br/>3. <b>独立权限声明周期：</b>系统无障碍设置列表中，<code>AccessibilityService</code> 以独立 App 形式展示给用户授权。独立 APK 可以有独立的图标和描述，也可以独立更新（通过 <code>AccessibilityProviderInstaller</code> 检测版本并推送安装），不需要随主 App 整体更新。</div><hr/><h2 class="section-title">Step 1: UI 入口 — AutoGlmToolScreen</h2><p>文件：<code>ui/features/toolbox/screens/autoglm/AutoGlmToolScreen.kt L18-33</code></p><p>用户在这个界面输入自然语言任务，点击"Execute"按钮后触发执行：</p><pre><code class="language-kotlin">@Composable
fun AutoGlmToolScreen(
    viewModel: AutoGlmViewModel = viewModel(...)
) {
    val uiState by viewModel.uiState.collectAsState()
    var task by remember { mutableStateOf("") }
    var useVirtualScreen by remember { mutableStateOf(false) }

    AutoGlmToolContent(
        // ...
        onExecute = { viewModel.executeTask(it, useVirtualScreen) },
        onCancel  = { viewModel.cancelTask() }
    )
}</code></pre><p>界面有两个关键选项：</p><ul><li><b>任务输入框</b> — 自然语言描述，如"打开微信，发消息给张三，内容是在吗"</li><li><b>Virtual Screen 开关</b> — 开启后使用 Shower 虚拟显示（需要 Debugger/ADB 权限），关闭后直接操作主屏幕</li></ul><hr/><h2 class="section-title">Step 2: ViewModel — 组装 Agent</h2><p>文件：<code>ui/features/toolbox/screens/autoglm/AutoGlmViewModel.kt L45-127</code></p><p><code>executeTask</code> 是整个自动化的入口，它组装了三个关键组件：</p><pre><code class="language-kotlin">fun executeTask(task: String, useVirtualScreen: Boolean = false) {
    executionJob = viewModelScope.launch {

        // 1. 获取 AI 服务（UI 控制专用模型）
        val uiService = EnhancedAIService.getAIServiceForFunction(
            context, FunctionType.UI_CONTROLLER
        )

        // 2. 根据权限级别选择 UI 工具实现（关键！）
        val uiTools = ToolGetter.getUITools(context)

        // 3. 构建 ActionHandler（封装具体操作）
        val actionHandler = ActionHandler(
            context = context,
            screenWidth  = context.resources.displayMetrics.widthPixels,
            screenHeight = context.resources.displayMetrics.heightPixels,
            toolImplementations = uiTools   // 注入无障碍工具实现
        )

        // 4. 创建 PhoneAgent 并运行
        val agent = PhoneAgent(
            context       = context,
            config        = AgentConfig(maxSteps = 25),
            uiService     = uiService,
            actionHandler = actionHandler,
            agentId       = agentIdForRun
        )

        agent.run(task = task, systemPrompt = systemPrompt, onStep = { ... })
    }
}</code></pre><h3>权限级别路由 — ToolGetter</h3><p>文件：<code>core/tools/defaultTool/ToolGetter.kt L45-53</code></p><pre><code class="language-kotlin">fun getUITools(context: Context): StandardUITools {
    return when (androidPermissionPreferences.getPreferredPermissionLevel()) {
        AndroidPermissionLevel.ROOT          -> RootUITools(context)
        AndroidPermissionLevel.ADMIN         -> AdminUITools(context)
        AndroidPermissionLevel.DEBUGGER      -> DebuggerUITools(context)
        AndroidPermissionLevel.ACCESSIBILITY -> AccessibilityUITools(context)  // ← 本文聚焦
        AndroidPermissionLevel.STANDARD      -> StandardUITools(context)
        null -> StandardUITools(context)
    }
}</code></pre><p>当用户选择 <b>ACCESSIBILITY</b> 权限级别时，返回 <code>AccessibilityUITools</code>。这是无障碍服务路径的入口。</p><hr/><h2 class="section-title">Step 3: PhoneAgent — AI 决策循环</h2><p>文件：<code>core/tools/agent/PhoneAgent.kt L119-357</code></p><p><code>PhoneAgent</code> 是整个 UI 自动化的大脑，它实现了一个多步骤的视觉-语言-动作循环：</p><pre><code class="language-kotlin">class PhoneAgent(
    private val context: Context,
    private val config: AgentConfig,       // maxSteps = 25
    private val uiService: AIService,      // 专用 UI 控制 AI
    private val actionHandler: ActionHandler,
    val agentId: String = "default"        // "default" = 主屏幕，其他 = 虚拟屏幕
) {
    // ...

    suspend fun run(
        task: String,
        systemPrompt: String,
        onStep: (suspend (StepResult) -> Unit)? = null,
        isPausedFlow: StateFlow&lt;Boolean&gt;? = null
    ): StepResult {
        // 循环执行，最多 maxSteps 步
        for (step in 0 until config.maxSteps) {
            awaitIfPaused()

            // 1. 截取当前屏幕（发给 AI 看）
            // 2. 获取当前 UI 层级树（可选，辅助 AI 定位元素）
            // 3. 将截图 + UI 树 + 任务发给 AI
            // 4. AI 返回下一步操作（ParsedAgentAction）
            // 5. actionHandler.executeAgentAction(action)
            // 6. 检查是否完成任务
        }
    }
}</code></pre><p><b>Agent 的思路：</b>每步都截一张当前屏幕图，AI 看图决定下一步动作（点哪里、输什么、是否完成）。这模仿了人类操作手机的方式——看屏幕 → 想下一步 → 操作 → 再看。</p><hr/><h2 class="section-title">Step 4: AI 工具调用 — AccessibilityUITools 的工具集</h2><p>AI 在每一步中可以调用的 UI 操作工具，都在 <code>AccessibilityUITools</code> 中实现：</p><table class="info-table"><thead><tr><th>工具名</th><th>方法</th><th>说明</th></tr></thead><tbody><tr><td><code>get_page_info</code></td><td><code>getPageInfo()</code></td><td>获取当前屏幕 UI 层级树</td></tr><tr><td><code>click_element</code></td><td><code>clickElement()</code></td><td>按资源 ID / 描述 / 坐标点击元素</td></tr><tr><td><code>tap</code></td><td><code>tap()</code></td><td>按坐标轻触屏幕</td></tr><tr><td><code>long_press</code></td><td><code>longPress()</code></td><td>长按指定坐标</td></tr><tr><td><code>swipe</code></td><td><code>swipe()</code></td><td>从起点滑动到终点</td></tr><tr><td><code>set_input_text</code></td><td><code>setInputText()</code></td><td>在当前焦点输入框设置文本</td></tr><tr><td><code>press_key</code></td><td><code>pressKey()</code></td><td>按系统键（返回/Home/最近任务）</td></tr><tr><td><code>capture_screenshot</code></td><td><code>captureScreenshot()</code></td><td>截图并编码供 AI 分析</td></tr></tbody></table><hr/><h2 class="section-title">Step 5: AccessibilityUITools — 无障碍工具实现层</h2><p>文件：<code>core/tools/defaultTool/accessbility/AccessibilityUITools.kt</code></p><p>这是从 AI 决策到实际设备操作的中间层，负责：</p><ol><li>检查无障碍服务是否可用</li><li>解析 AI 传入的参数（坐标、资源 ID 等）</li><li>将操作请求委托给 <code>UIHierarchyManager</code></li></ol><h3>前置检查模式</h3><pre><code class="language-kotlin">// L45-50: 所有无障碍工具都用这个包装器做前置检查
private suspend fun &lt;T&gt; withAccessibilityCheck(tool: AITool, block: suspend () -> T): T {
    if (!isAccessibilityServiceEnabled()) {
        throw IllegalStateException(
            "Accessibility Service is not enabled. Please enable it in system settings."
        )
    }
    return block()
}</code></pre><h3>获取 UI 层级树（带重试）</h3><pre><code class="language-kotlin">// L56-75: 网络不稳或服务刚启动时，自动重试 3 次
private suspend fun getUIHierarchyWithRetry(): String {
    var retryCount = 0
    while (retryCount &lt; MAX_RETRY_COUNT) {  // MAX_RETRY_COUNT = 3
        val uiXml = UIHierarchyManager.getUIHierarchy(context)
        if (uiXml.isNotEmpty()) return uiXml

        retryCount++
        if (retryCount &lt; MAX_RETRY_COUNT) {
            delay(RETRY_DELAY_MS)  // RETRY_DELAY_MS = 300ms
        }
    }
    return ""
}</code></pre><h3>点击元素的完整流程</h3><pre><code class="language-kotlin">// L228-315: clickElement — 最复杂的工具，支持多种定位方式
override suspend fun clickElement(tool: AITool): ToolResult {
    return withAccessibilityCheck(tool) {
        val resourceId  = tool.parameters.find { it.name == "resourceId" }?.value
        val className   = tool.parameters.find { it.name == "className" }?.value
        val contentDesc = tool.parameters.find { it.name == "contentDesc" }?.value
        val bounds      = tool.parameters.find { it.name == "bounds" }?.value

        // 优先路径 1：直接提供 bounds，无需遍历 UI 树
        if (bounds != null) return@withAccessibilityCheck handleClickByBounds(tool, bounds)

        // 路径 2：在 UI 树中查找匹配节点
        val uiXml = getUIHierarchyWithRetry()
        val matchedNodes = findNodesInXml(uiXml) { parser ->
            // 按 resourceId / className / contentDesc 匹配
            ...
        }

        // 取 index 指定的匹配节点，解析其 bounds
        val targetBounds = matchedNodes[index].bounds
        handleClickByBounds(tool, targetBounds)
    }
}

// L318-352: 解析 bounds → 计算中心点 → 调用 UIHierarchyManager
private suspend fun handleClickByBounds(tool: AITool, bounds: String): ToolResult {
    val rect    = parseBounds(bounds)           // "[left,top][right,bottom]" 格式
    val centerX = rect.centerX()
    val centerY = rect.centerY()

    operationOverlay.showTap(centerX, centerY) // 在屏幕上显示点击视觉反馈

    val clickSuccess = UIHierarchyManager.performClick(context, centerX, centerY)  // ← Step 6
    // ...
}</code></pre><h3>文本输入流程</h3><pre><code class="language-kotlin">// L378-436: setInputText — 先找焦点节点 ID，再设置文本
override suspend fun setInputText(tool: AITool): ToolResult {
    return withAccessibilityCheck(tool) {
        val text = tool.parameters.find { it.name == "text" }?.value ?: ""

        // 1. 找当前有焦点的可编辑节点
        val focusedNodeId = UIHierarchyManager.findFocusedNodeId(context)

        // 2. 通过节点 ID 直接设置文本（比模拟键盘输入可靠得多）
        val result = UIHierarchyManager.setTextOnNode(context, focusedNodeId, text)
        // ...
    }
}</code></pre><hr/><h2 class="section-title">Step 6: UIHierarchyManager — 主进程 AIDL 代理</h2><p>文件：<code>data/repository/UIHierarchyManager.kt</code></p><p>这是主进程侧的 AIDL 客户端，以 <code>object</code>（单例）形式存在，管理与 Provider 进程的连接生命周期。</p><h3>跨进程连接建立</h3><pre><code class="language-kotlin">// L197-285: bindToService — 协程挂起等待连接建立
suspend fun bindToService(context: Context): Boolean {
    return bindingMutex.withLock {  // 互斥锁防止并发绑定

        // 1. 构造隐式 Intent（Action = "com.ai.assistance.operit.provider.IAccessibilityProvider"）
        val implicitIntent = Intent(PROVIDER_ACTION).setPackage(PROVIDER_PACKAGE_NAME)

        // 2. 解析出具体 Service 组件名（防止隐式 Intent 被 Android 8+ 限制）
        val resolveInfo = context.packageManager.resolveService(implicitIntent, ...)
        val explicitIntent = Intent(PROVIDER_ACTION).apply {
            component = ComponentName(resolveInfo.serviceInfo.packageName,
                                      resolveInfo.serviceInfo.name)
        }

        // 3. 协程挂起等待连接回调（超时 3 秒）
        val result = withTimeoutOrNull(BIND_SERVICE_TIMEOUT_MS) {  // 3000ms
            suspendCancellableCoroutine { continuation ->
                connectionContinuation = { success -> continuation.resume(success) }
                context.applicationContext.bindService(
                    explicitIntent, serviceConnection, Context.BIND_AUTO_CREATE
                )
            }
        }

        result ?: false  // 超时返回 false
    }
}

// L64-80: ServiceConnection 回调
private val serviceConnection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
        // IBinder → 转换为 AIDL Stub 代理对象
        accessibilityProvider = IAccessibilityProvider.Stub.asInterface(service)
        _isBound.value = true
        connectionContinuation?.invoke(true)
    }

    override fun onServiceDisconnected(name: ComponentName?) {
        accessibilityProvider = null
        _isBound.value = false
    }
}</code></pre><h3>自动重连机制</h3><pre><code class="language-kotlin">// L166-178: ensureBound — 调用任何方法前都会先检查连接状态
private suspend fun ensureBound(context: Context): Boolean {
    if (!_isBound.value || accessibilityProvider == null) {
        // 未连接 → 自动重新绑定（覆盖网络抖动、服务重启场景）
        val bound = bindToService(context)
        if (!bound) return false
    }
    return _isBound.value && accessibilityProvider != null
}</code></pre><h3>所有公开操作方法</h3><pre><code class="language-kotlin">// L308-320: 获取 UI 层级树（返回 XML 字符串）
suspend fun getUIHierarchy(context: Context): String {
    if (!ensureBound(context)) return ""
    return accessibilityProvider?.uiHierarchy ?: ""
}

// L363-374: 点击
suspend fun performClick(context: Context, x: Int, y: Int): Boolean {
    if (!ensureBound(context)) return false
    return accessibilityProvider?.performClick(x, y) ?: false
}

// L392-403: 滑动
suspend fun performSwipe(context: Context, startX: Int, startY: Int,
                          endX: Int, endY: Int, duration: Long): Boolean {
    if (!ensureBound(context)) return false
    return accessibilityProvider?.performSwipe(startX, startY, endX, endY, duration) ?: false
}

// L408-419: 全局操作（返回/Home/最近任务）
suspend fun performGlobalAction(context: Context, actionId: Int): Boolean {
    if (!ensureBound(context)) return false
    return accessibilityProvider?.performGlobalAction(actionId) ?: false
}

// L440-454: 在节点上设置文本
suspend fun setTextOnNode(context: Context, nodeId: String, text: String): Boolean {
    if (!ensureBound(context)) return false
    return accessibilityProvider?.setTextOnNode(nodeId, text) ?: false
}</code></pre><hr/><h2 class="section-title">Step 7: AIDL 接口 — 跨进程契约</h2><p>文件：<code>app/src/main/aidl/com/ai/assistance/operit/provider/IAccessibilityProvider.aidl</code></p><p>这是主进程与 Provider 进程之间的完整接口合约：</p><pre><code class="language-aidl">interface IAccessibilityProvider {
    String  getUiHierarchy();                                // 获取 UI 树 XML
    boolean performClick(int x, int y);                      // 坐标点击
    boolean performLongPress(int x, int y);                  // 长按
    boolean performGlobalAction(int actionId);               // 全局键（返回/Home）
    boolean performSwipe(int startX, int startY,
                         int endX, int endY, long duration); // 滑动
    String  findFocusedNodeId();                             // 查找焦点节点 ID
    boolean setTextOnNode(String nodeId, String text);       // 节点设置文本
    boolean takeScreenshot(String path, String format);      // 截图存文件
    boolean isAccessibilityServiceEnabled();                 // 服务是否已启用
    String  getCurrentActivityName();                        // 当前 Activity 名
}</code></pre><p>文件：<code>app/src/main/aidl/com/ai/assistance/operit/provider/IAccessibilityEventCallback.aidl</code></p><pre><code class="language-aidl">// 反向回调：Provider 进程将无障碍事件推送给主进程
oneway interface IAccessibilityEventCallback {
    void onAccessibilityEvent(in AccessibilityEvent event);
}</code></pre><p><b><code>oneway</code> 关键字：</b>事件回调是单向非阻塞的，Provider 进程发完即返回，不等待主进程处理完毕。这避免了反向调用时的死锁风险。</p><hr/><h2 class="section-title">Step 8: Provider 进程 — 独立 AccessibilityService</h2><p>Provider 进程是一个独立安装的 APK（包名 <code>com.ai.assistance.operit.provider</code>），内含真正继承了 <code>AccessibilityService</code> 的实现。</p><h3>Provider APK 的管理</h3><p>文件：<code>core/tools/system/AccessibilityProviderInstaller.kt L15-160</code></p><p>主 App 负责管理 Provider APK 的生命周期：</p><pre><code class="language-kotlin">class AccessibilityProviderInstaller {
    companion object {
        // L81-134: 对比内置 APK 版本和已安装版本，判断是否需要更新
        fun isUpdateNeeded(context: Context): Boolean {
            val installedVersion = getInstalledVersion(context)  // 已安装版本
            val bundledVersion   = getBundledVersion(context)    // assets/ 内置版本

            // 逐节比较版本号（如 1.2.3 → [1, 2, 3]）
            val installed = installedVersion.split(".").map { it.toIntOrNull() ?: 0 }
            val bundled   = bundledVersion.split(".").map { it.toIntOrNull() ?: 0 }
            // ...
        }

        // L139-141: 触发安装
        fun launchInstall(context: Context) {
            UIHierarchyManager.launchProviderInstall(context)
        }
    }
}</code></pre><h3>Provider APK 安装流程</h3><p>文件：<code>data/repository/UIHierarchyManager.kt L107-153</code></p><pre><code class="language-kotlin">fun launchProviderInstall(context: Context) {
    GlobalScope.launch(Dispatchers.IO) {
        // 1. 从 assets/accessibility.apk 提取到缓存目录
        val apkFile = extractProviderApkFromAssets(context)

        // 2. 用 FileProvider 生成临时 URI（Android 7+ 要求）
        val apkUri = FileProvider.getUriForFile(context, "\${context.packageName}.fileprovider", apkFile)

        // 3. 弹出系统安装界面
        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(apkUri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(installIntent)
    }
}</code></pre><h3>Provider 进程内部（概念说明）</h3><p>Provider 进程实现了 <code>IAccessibilityProvider.Stub</code>（AIDL 服务端），在 <code>AccessibilityService</code> 的 <code>onServiceConnected</code> 之后启动 AIDL 服务。当主进程调用 <code>performClick(x, y)</code> 时，Provider 端执行：</p><pre><code class="language-kotlin">// Provider 进程内部（概念示意，源码在独立 APK 中）
override fun performClick(x: Int, y: Int): Boolean {
    // 构造 Path 手势
    val path = Path().apply { moveTo(x.toFloat(), y.toFloat()) }
    val gesture = GestureDescription.Builder()
        .addStroke(GestureDescription.StrokeDescription(path, 0L, 50L))
        .build()
    // 通过 AccessibilityService 的 dispatchGesture 执行
    return dispatchGesture(gesture, null, null)
}

override fun getUiHierarchy(): String {
    // 通过 AccessibilityService 遍历 rootInActiveWindow
    val root = rootInActiveWindow ?: return ""
    return buildXmlFromNode(root)
}</code></pre><hr/><h2 class="section-title">Step 9: 全局键操作 — pressKey 的实现</h2><p>文件：<code>core/tools/defaultTool/accessbility/AccessibilityUITools.kt L655-721</code></p><pre><code class="language-kotlin">override suspend fun pressKey(tool: AITool): ToolResult {
    val keyCode = tool.parameters.find { it.name == "key_code" }?.value

    // 将字符串键名映射到 AccessibilityService 全局动作常量
    val keyAction = when (keyCode) {
        "KEYCODE_BACK"          -> AccessibilityService.GLOBAL_ACTION_BACK
        "KEYCODE_HOME"          -> AccessibilityService.GLOBAL_ACTION_HOME
        "KEYCODE_RECENTS"       -> AccessibilityService.GLOBAL_ACTION_RECENTS
        "KEYCODE_NOTIFICATIONS" -> AccessibilityService.GLOBAL_ACTION_NOTIFICATIONS
        "KEYCODE_QUICK_SETTINGS"-> AccessibilityService.GLOBAL_ACTION_QUICK_SETTINGS
        "KEYCODE_POWER_DIALOG"  -> AccessibilityService.GLOBAL_ACTION_POWER_DIALOG
        else -> null
    }

    // 通过 UIHierarchyManager 跨进程调用 Provider 执行全局动作
    val success = UIHierarchyManager.performGlobalAction(context, keyAction)
    // ...
}</code></pre><div class="callout"><b>注意</b><br/>无障碍服务只能执行系统定义的全局动作，不能像 Root 那样注入任意 KeyEvent。这是 ACCESSIBILITY 权限级别的固有限制。</div><hr/><h2 class="section-title">Step 10: UI 层级树解析 — AI 如何看懂屏幕结构</h2><p>文件：<code>core/tools/defaultTool/accessbility/AccessibilityUITools.kt L166-225</code></p><p>Provider 进程返回的 UI 层级树是原始 XML，<code>AccessibilityUITools</code> 将其简化为结构体供 AI 分析：</p><pre><code class="language-kotlin">fun simplifyLayout(xml: String): SimplifiedUINode {
    val parser = XmlPullParserFactory.newInstance().newPullParser().apply {
        setInput(StringReader(xml))
    }

    val nodeStack = mutableListOf&lt;UINode&gt;()
    var rootNode: UINode? = null

    while (parser.eventType != XmlPullParser.END_DOCUMENT) {
        when (parser.eventType) {
            XmlPullParser.START_TAG -> {
                if (parser.name == "node") {
                    val newNode = createNode(parser)
                    // 构建树结构
                    rootNode?.let { nodeStack.lastOrNull()?.children?.add(newNode) }
                        ?: run { rootNode = newNode }
                    nodeStack.add(newNode)
                }
            }
            XmlPullParser.END_TAG -> {
                if (parser.name == "node") nodeStack.removeLastOrNull()
            }
        }
        parser.next()
    }
    return rootNode?.toUINode() ?: SimplifiedUINode(...)
}

private fun createNode(parser: XmlPullParser): UINode {
    return UINode(
        className   = parser.getAttributeValue(null, "class")?.substringAfterLast('.'),
        text        = parser.getAttributeValue(null, "text"),
        contentDesc = parser.getAttributeValue(null, "content-desc"),
        resourceId  = parser.getAttributeValue(null, "resource-id"),
        bounds      = parser.getAttributeValue(null, "bounds"),   // "[left,top][right,bottom]"
        isClickable = parser.getAttributeValue(null, "clickable") == "true"
    )
}</code></pre><hr/><h2 class="section-title">完整调用链回顾</h2><pre><code>用户输入"打开微信发消息给张三"并点击执行
│
├─ Step 1:  AutoGlmToolScreen                        [AutoGlmToolScreen.kt L31]
│           viewModel.executeTask(task, useVirtualScreen)
│
├─ Step 2:  AutoGlmViewModel.executeTask()           [AutoGlmViewModel.kt L45]
│   ├─ ToolGetter.getUITools() → AccessibilityUITools [ToolGetter.kt L45]
│   ├─ ActionHandler 注入 uiTools
│   └─ PhoneAgent 创建并 run()
│
├─ Step 3:  PhoneAgent.run() 决策循环                [PhoneAgent.kt L355]
│   ├─ 截图 → 发给 AI
│   ├─ AI 返回 "get_page_info" → 获取 UI 树
│   ├─ AI 返回 "click_element resourceId=wechat_icon"
│   ├─ AI 返回 "tap x=540 y=200"（点击联系人）
│   ├─ AI 返回 "set_input_text text=在吗"
│   └─ AI 返回 "click_element resourceId=send_btn"
│
├─ Step 4:  AccessibilityUITools（每次工具调用）     [AccessibilityUITools.kt]
│   ├─ withAccessibilityCheck() 前置检查
│   ├─ getUIHierarchyWithRetry() 重试获取 UI 树（如 get_page_info）
│   └─ UIHierarchyManager.performClick(x, y)（如 tap/click_element）
│
├─ Step 5:  UIHierarchyManager                       [UIHierarchyManager.kt]
│   ├─ ensureBound() → bindToService()（首次建立 AIDL 连接）
│   └─ accessibilityProvider?.performClick(x, y)（AIDL 跨进程调用）
│
├─ Step 6:  IAccessibilityProvider AIDL              [IAccessibilityProvider.aidl]
│           （Binder IPC 传输）
│
└─ Step 7:  Provider 进程 AccessibilityService 实现  [独立 APK]
            dispatchGesture() / rootInActiveWindow 遍历
            → 真实设备 UI 操作完成</code></pre><hr/><h2 class="section-title">涉及文件</h2><table class="info-table"><thead><tr><th>文件</th><th>角色</th></tr></thead><tbody><tr><td><code>app/.../ui/features/toolbox/screens/autoglm/AutoGlmToolScreen.kt</code></td><td>Phone Agent 手动控制界面</td></tr><tr><td><code>app/.../ui/features/toolbox/screens/autoglm/AutoGlmViewModel.kt</code></td><td>Agent 组装与生命周期管理</td></tr><tr><td><code>app/.../core/tools/agent/PhoneAgent.kt</code></td><td>AI 决策循环主体</td></tr><tr><td><code>app/.../core/tools/defaultTool/ToolGetter.kt</code></td><td>权限级别工具路由</td></tr><tr><td><code>app/.../core/tools/defaultTool/accessbility/AccessibilityUITools.kt</code></td><td>无障碍工具实现层</td></tr><tr><td><code>app/.../data/repository/UIHierarchyManager.kt</code></td><td>AIDL 客户端单例 / 连接管理</td></tr><tr><td><code>app/.../core/tools/system/AccessibilityProviderInstaller.kt</code></td><td>Provider APK 版本管理与安装</td></tr><tr><td><code>app/.../core/tools/system/action/AccessibilityActionListener.kt</code></td><td>无障碍事件监听器</td></tr><tr><td><code>app/.../core/tools/system/shell/AccessibilityShellExecutor.kt</code></td><td>无障碍 Shell 适配器（受限，不执行实际命令）</td></tr><tr><td><code>app/src/main/aidl/.../provider/IAccessibilityProvider.aidl</code></td><td>跨进程接口定义</td></tr><tr><td><code>app/src/main/aidl/.../provider/IAccessibilityEventCallback.aidl</code></td><td>事件回调接口定义</td></tr></tbody></table><hr/><h2 class="section-title">动手练习</h2><h3>练习 1: 观察 AIDL 连接建立过程</h3><p>在 <code>UIHierarchyManager.kt:233</code>（<code>bindService</code> 调用处）加断点。在 AutoGLM 界面输入任意任务并执行：</p><ul><li>观察 <code>PROVIDER_PACKAGE_NAME</code> 和 <code>PROVIDER_ACTION</code></li><li>检查 <code>resolveInfo</code> 是否成功解析（如果为 null 说明 Provider APK 未安装）</li><li>观察 <code>BIND_SERVICE_TIMEOUT_MS = 3000</code> 超时逻辑何时触发</li></ul><h3>练习 2: 追踪 UI 树的生成</h3><p>对 AI 发出 "get_page_info" 工具调用触发后，在 <code>AccessibilityUITools.kt:61</code>（<code>getUIHierarchyWithRetry</code>）加断点：</p><ul><li><code>uiXml</code> 是什么结构？复制出来用 XML 格式化工具查看</li><li><code>simplifyLayout</code> 返回的节点树有多少层？</li></ul><h3>练习 3: 对比 ACCESSIBILITY 和 DEBUGGER 权限下的点击差异</h3><ol><li>在设置里切换权限级别为 ACCESSIBILITY，记录 <code>ToolGetter.getUITools()</code> 返回的类名</li><li>切换为 DEBUGGER，再次检查，观察返回了哪个子类</li><li>在 <code>AccessibilityUITools.handleClickByBounds:329</code> 加断点，确认 ACCESSIBILITY 路径下调用了 <code>UIHierarchyManager.performClick</code></li></ol><h3>练习 4: 手动触发 Provider APK 安装</h3><ol><li>在手机上卸载 <code>com.ai.assistance.operit.provider</code></li><li>观察 <code>UIHierarchyManager.isProviderAppInstalled()</code> 返回 <code>false</code></li><li>调用 <code>UIHierarchyManager.launchProviderInstall(context)</code> 触发安装流程</li><li>安装完成后调用 <code>bindToService(context)</code>，观察连接建立时序</li></ol><h3>练习 5: 新增一个全局操作键</h3><p>在 <code>AccessibilityUITools.pressKey()</code> 的 <code>when</code> 块中添加对 <code>KEYCODE_DPAD_UP</code> 的支持（方向键上），对应 <code>GLOBAL_ACTION_ACCESSIBILITY_BUTTON</code>，验证 AI 可以通过工具调用触发此操作。</p><hr/><h2 class="section-title">关联文档</h2><table class="info-table"><thead><tr><th>文档</th><th>关系</th></tr></thead><tbody><tr><td><code>tool-execution.md</code></td><td>前置导读 — AI 工具调用的通用执行管线</td></tr><tr><td><code>shell-permission.md</code></td><td>姊妹文档 — Shell 权限级别的对比（Root/Admin/Standard 路径）</td></tr><tr><td><code>cold-start.md</code></td><td>应用启动时无障碍服务的初始化时机</td></tr><tr><td><code>chat-message-flow.md</code></td><td>PhoneAgent 底层依赖的 AI 对话流程</td></tr></tbody></table></div>`);
