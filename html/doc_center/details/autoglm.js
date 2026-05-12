registerDetail('autoglm', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">461</span><span class="stat-label">OneClick 行数</span></div>
      <div class="stat-item"><span class="stat-num">122</span><span class="stat-label">AutoGlmTool 行数</span></div>
      <div class="stat-item"><span class="stat-num">465</span><span class="stat-label">DefaultAssistant 行数</span></div>
      <div class="stat-item"><span class="stat-num">3</span><span class="stat-label">页面</span></div>
    </div>

    <!-- AutoGLM -->
    <div class="section-head blue">AutoGlmOneClickToolScreen — AutoGLM 一键配置</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">4 步向导，一键将 ZhipuAI AutoGLM 绑定到 FunctionType.UI_CONTROLLER，并交换工具包（Automatic_ui_base ↔ Automatic_ui_subagent）。结果以内联 Card 展示，无弹窗。</p>

    <div class="mermaid">
graph TD
    ROOT["CustomScaffold → Column (verticalScroll, spacedBy 16dp)"]
    ROOT --> STEP1["Card — Step 1: 前往模型配置&lt;br/&gt;OutlinedButton → onNavigateToModelConfig()"]
    ROOT --> STEP2["Card — Step 2: 获取 API Key&lt;br/&gt;OutlinedButton → Intent.ACTION_VIEW (open.bigmodel.cn)"]
    ROOT --> STEP3["Card — Step 3: 输入 API Key"]
    STEP3 --> API_TF["OutlinedTextField (apiKeyInput, singleLine)"]
    STEP3 --> ADV_BTN["TextButton 显示/隐藏高级设置"]
    STEP3 --> ADV_FIELDS["[isAdvancedExpanded] 自定义端点 + 模型名"]
    STEP3 --> CFG_BTN["Button '一键配置' (fillMaxWidth)&lt;br/&gt;[isConfiguring] CircularProgressIndicator"]
    ROOT --> STEP4["Card — Step 4: 恢复原始&lt;br/&gt;OutlinedButton '恢复原始自动化'&lt;br/&gt;[isConfiguring] 禁用"]
    ROOT --> STATUS["[statusMessage] Card(primaryContainer) — CheckCircle + 成功信息"]
    ROOT --> ERR["[errorMessage] Card(errorContainer) — Error + 错误信息"]
    </div>

    <div class="section-head green" style="margin-top:16px;">一键配置流程（startConfigure）</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">1. modelConfigManager.initializeIfNeeded()</div>
      <div class="tree-node">2. functionalConfigManager.initializeIfNeeded()</div>
      <div class="tree-node">3. 检查是否已存在 "AutoGLM" 配置 → createConfig 或复用</div>
      <div class="tree-node">4. updateModelConfig(endpoint, model=autoglm-phone, provider=ZHIPU / OPENAI_GENERIC)</div>
      <div class="tree-node">5. updateDirectImageProcessing(configId, true)</div>
      <div class="tree-node">6. setConfigForFunction(FunctionType.UI_CONTROLLER, configId, 0)</div>
      <div class="tree-node">7. EnhancedAIService.refreshServiceForFunction(ctx, UI_CONTROLLER)</div>
      <div class="tree-node">8. updateParameters(temperature=0, top_p=0.85, frequency_penalty=0.2)</div>
      <div class="tree-node">9. packageManager.removePackage("Automatic_ui_base")</div>
      <div class="tree-node">10. packageManager.importPackage("Automatic_ui_subagent")</div>
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">恢复流程：importPackage("Automatic_ui_base") + removePackage("Automatic_ui_subagent")</p>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">高级模式（advancedEndpoint + advancedModelName 均非空）时 provider 改为 OPENAI_GENERIC，可对接任意 OpenAI 兼容端点。</p>

    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">状态汇总</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>apiKeyInput</td><td>String</td><td>API Key 输入框绑定</td></tr>
      <tr><td>isConfiguring</td><td>Boolean</td><td>异步配置中（禁用所有操作按钮）</td></tr>
      <tr><td>statusMessage</td><td>String?</td><td>成功消息（primaryContainer Card 内联）</td></tr>
      <tr><td>errorMessage</td><td>String?</td><td>错误消息（errorContainer Card 内联）</td></tr>
      <tr><td>isAdvancedExpanded</td><td>Boolean</td><td>高级设置折叠/展开</td></tr>
      <tr><td>advancedEndpoint</td><td>String</td><td>自定义 API 端点</td></tr>
      <tr><td>advancedModelName</td><td>String</td><td>自定义模型名</td></tr>
    </table>

    <!-- AutoGlmTool -->
    <div class="section-head purple" style="margin-top:28px;">AutoGlmToolScreen — AutoGLM UI 自动化执行</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">AutoGLM 的实际执行界面（122 行 + ViewModel）。用户输入自然语言任务描述，可选虚拟屏幕，启动 PhoneAgent 逐步执行 UI 自动化操作，日志面板实时流式展示。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">组件结构</div>
    <div class="tree" style="margin:8px 0;">
      <div class="tree-node">AutoGlmToolScreen → AutoGlmToolContent (stateless)</div>
      <div class="tree-children">
        <div class="tree-node">Column (fillMaxSize)</div>
        <div class="tree-children">
          <div class="tree-node">OutlinedTextField (task, maxLines=5)</div>
          <div class="tree-node">Row: Text "虚拟屏幕" + Switch (执行中禁用)</div>
          <div class="tree-node">Button (双模式: "执行" / "取消", 颜色切换 primary ↔ error)</div>
          <div class="tree-node">Text "Execution Log" (titleMedium)</div>
          <div class="tree-node">Box (weight=1f, surfaceVariant) → Text (uiState.log, verticalScroll, 自动滚到底部)</div>
        </div>
      </div>
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">执行流程（PhoneAgent）</div>
    <div class="flow" style="margin:8px 0;flex-wrap:wrap;gap:4px;">
      <span class="flow-step">executeTask(task)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">[虚拟屏幕] ShowerServerManager.ensureStarted()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">获取 EnhancedAIService (UI_CONTROLLER)</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">PhoneAgent(maxSteps=25).run()</span>
      <span class="flow-arrow">→</span>
      <span class="flow-step">每步回调: 💭思考 + 🎯动作</span>
    </div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">AutoGlmViewModel</div>
    <table class="act-table">
      <tr><th>StateFlow</th><th>类型</th><th>说明</th></tr>
      <tr><td>isLoading</td><td>Boolean</td><td>Agent 协程执行中</td></tr>
      <tr><td>log</td><td>String</td><td>带时间戳的完整执行日志</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">与 AutoGlmOneClick 对比</div>
    <table class="act-table">
      <tr><th>对比</th><th>AutoGlmOneClick</th><th>AutoGlmTool</th></tr>
      <tr><td>用途</td><td>配置向导（设置 API Key + 模型绑定）</td><td>实际任务执行界面</td></tr>
      <tr><td>状态</td><td>纯局部状态，无 ViewModel</td><td>有 AutoGlmViewModel</td></tr>
      <tr><td>复杂度</td><td>461 行，4 步 Card 表单</td><td>122 行，输入 + 日志</td></tr>
      <tr><td>AI 交互</td><td>无（仅配置 Manager）</td><td>PhoneAgent 逐步执行</td></tr>
    </table>

    <!-- DefaultAssistantGuide -->
    <div class="section-head orange" style="margin-top:28px;">DefaultAssistantGuideScreen — 默认助手设置引导</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">纯信息向导页面，引导用户设置 Operit 为系统默认助手并配置手势唤起。无 API 调用，无对话框。</p>

    <div class="mermaid">
graph TD
    ROOT2["CustomScaffold → Column (verticalScroll, spacedBy 16dp)"]
    ROOT2 --> HDR_SEC["HeaderSection&lt;br/&gt;Box 80dp CircleShape (linearGradient primary→secondary)&lt;br/&gt;Icon.Assistant + 标题 + 副标题"]
    ROOT2 --> INTRO_CARD["IntroductionCard&lt;br/&gt;Card (primaryContainer 30%) — Row: Icon.Info + 介绍"]
    ROOT2 --> STEP1["GuideStepCard Step 1 — 设置为默认助手&lt;br/&gt;Button '打开设置' → ACTION_VOICE_INPUT_SETTINGS"]
    ROOT2 --> STEP2["GuideStepCard Step 2 — 配置启动手势&lt;br/&gt;Button '打开手势设置' → GESTURE_NAVIGATION_SETTINGS"]
    ROOT2 --> STEP3["GuideStepCard Step 3 — 测试助手&lt;br/&gt;(无操作按钮)"]
    ROOT2 --> TROUBLE["TroubleshootingCard&lt;br/&gt;Card (tertiaryContainer 30%) — Icon.Help + 故障排除"]
    </div>

    <div class="section-head green" style="margin-top:16px;">手风琴展开逻辑</div>
    <table class="act-table">
      <tr><th>状态</th><th>行为</th></tr>
      <tr><td>expandedStepIndex (Int?, 初始=0)</td><td>控制哪个步骤 Card 展开（null = 全折叠）</td></tr>
      <tr><td>点击已展开 Card</td><td>expandedStepIndex = null（折叠）</td></tr>
      <tr><td>点击其他 Card</td><td>expandedStepIndex = stepIndex（展开，其余隐式折叠）</td></tr>
      <tr><td>进入动画</td><td>fadeIn() + expandVertically()</td></tr>
      <tr><td>退出动画</td><td>fadeOut() + shrinkVertically()</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">Settings 深链接</div>
    <table class="act-table">
      <tr><th>步骤</th><th>Intent Action</th><th>回退</th></tr>
      <tr><td>Step 1</td><td>Settings.ACTION_VOICE_INPUT_SETTINGS</td><td>Settings.ACTION_SETTINGS</td></tr>
      <tr><td>Step 2</td><td>"android.settings.GESTURE_NAVIGATION_SETTINGS" (API >= Q)</td><td>Settings.ACTION_SETTINGS</td></tr>
      <tr><td>Step 3</td><td>— 无按钮</td><td>—</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">Step 1 展开内容中：SDK_INT >= S（Android 12+）时额外显示一条 primary 色专属提示。</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">GuideStepCard 参数</div>
    <table class="act-table">
      <tr><th>参数</th><th>类型</th><th>说明</th></tr>
      <tr><td>stepNumber</td><td>Int</td><td>圆形背景内显示的编号</td></tr>
      <tr><td>title</td><td>String</td><td>步骤标题</td></tr>
      <tr><td>icon</td><td>ImageVector</td><td>步骤图标</td></tr>
      <tr><td>isExpanded / onToggleExpanded</td><td>Boolean / () → Unit</td><td>手风琴状态驱动</td></tr>
      <tr><td>actionButtonText / onActionClick</td><td>String? / (() → Unit)?</td><td>可选操作按钮（Step 3 省略）</td></tr>
      <tr><td>detailsContent</td><td>(@Composable () → Unit)?</td><td>额外内容插槽</td></tr>
    </table>
`);
