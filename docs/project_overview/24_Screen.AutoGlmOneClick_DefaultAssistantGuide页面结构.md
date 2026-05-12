# Screen.AutoGlmOneClick & Screen.DefaultAssistantGuide 页面结构

本文档描述工具箱中两个向导类页面：**AutoGLM 一键配置**（AutoGlmOneClickToolScreen）与**默认助手设置引导**（DefaultAssistantGuideScreen）。

## 一、AutoGlmOneClickToolScreen（AutoGLM 一键配置）

**源码规模：** `AutoGlmOneClickToolScreen.kt` 461 行（含 `AutoGlmOneClickScreen` 私有 composable）

### 1.1 定位与背景

4 步向导页面，帮助用户一键配置 ZhipuAI AutoGLM 手机操作功能：
- 绑定模型配置到 `FunctionType.UI_CONTROLLER`
- 交换工具包（`Automatic_ui_base` ↔ `Automatic_ui_subagent`）
- 注入推荐采样参数（temperature=0, top_p=0.85, frequency_penalty=0.2）

### 1.2 组件树

```mermaid
graph TD
    ROOT["CustomScaffold → Column (fillMaxSize, verticalScroll, spacedBy 16dp)"]
    ROOT --> HDR["Row: Icon.AutoMode + Text headlineSmall 标题"]
    ROOT --> STEP1["Card — Step 1: 前往模型配置\nOutlinedButton → onNavigateToModelConfig()"]
    ROOT --> STEP2["Card — Step 2: 获取 API Key\nOutlinedButton → Intent.ACTION_VIEW (open.bigmodel.cn)\nText 提示"]
    ROOT --> STEP3["Card — Step 3: 输入 API Key 并配置"]
    STEP3 --> API_TF["OutlinedTextField (apiKeyInput, singleLine)"]
    STEP3 --> ADV_BTN["TextButton '显示/隐藏高级设置' → isAdvancedExpanded"]
    STEP3 --> ADV_FIELDS["[isAdvancedExpanded] OutlinedTextField 端点 + OutlinedTextField 模型名"]
    STEP3 --> CFG_BTN["Button '一键配置' (fillMaxWidth)\n[isConfiguring] CircularProgressIndicator"]
    ROOT --> STEP4["Card — Step 4: 恢复原始\nOutlinedButton '恢复原始自动化'\n[isConfiguring] 禁用"]
    ROOT --> STATUS_CARD["[statusMessage!=null] Card(primaryContainer)\nIcon.CheckCircle + 状态信息"]
    ROOT --> ERR_CARD["[errorMessage!=null] Card(errorContainer)\nIcon.Error + 错误信息"]
```

### 1.3 一键配置流程（startConfigure）

```
scope.launch {
  isConfiguring = true
  1. modelConfigManager.initializeIfNeeded()
  2. functionalConfigManager.initializeIfNeeded()
  3. 检查是否已存在 "AutoGLM" 配置 → createConfig 或复用
  4. updateModelConfig(
       endpoint = "https://open.bigmodel.cn/api/paas/v4/chat/completions"  (或自定义)
       model    = "autoglm-phone"  (或自定义)
       provider = ZHIPU (高级模式: OPENAI_GENERIC)
     )
  5. updateDirectImageProcessing(configId, true)
  6. setConfigForFunction(FunctionType.UI_CONTROLLER, configId, 0)
  7. EnhancedAIService.refreshServiceForFunction(ctx, FunctionType.UI_CONTROLLER)
  8. updateParameters(configId, temperature=0, top_p=0.85, frequency_penalty=0.2)
  9. packageManager.removePackage("Automatic_ui_base")
 10. packageManager.importPackage("Automatic_ui_subagent")
  → statusMessage = 成功提示
}
```

### 1.4 恢复流程（restoreOriginalAutomation）

```
packageManager.importPackage("Automatic_ui_base")   // 若缺失则重新导入
packageManager.removePackage("Automatic_ui_subagent")
```

### 1.5 状态汇总

| State | 类型 | 说明 |
|-------|------|------|
| `apiKeyInput` | String | API Key 输入框绑定 |
| `isConfiguring` | Boolean | 异步配置中（禁用按钮） |
| `statusMessage` | String? | 成功消息（绿色 Card 内联展示） |
| `errorMessage` | String? | 错误消息（红色 Card 内联展示） |
| `isAdvancedExpanded` | Boolean | 高级设置展开状态 |
| `advancedEndpoint` | String | 自定义 API 端点 |
| `advancedModelName` | String | 自定义模型名 |

**Managers（通过 `remember` 保持）：**
- `modelConfigManager` — `ModelConfigManager(context)`
- `functionalConfigManager` — `FunctionalConfigManager(context)`
- `packageManager` — `PackageManager.getInstance(context, AIToolHandler.getInstance(context))`

---

## 二、DefaultAssistantGuideScreen（默认助手设置引导）

**源码规模：** `DefaultAssistantGuideScreen.kt` 465 行（含 `DefaultAssistantGuideContent`、`HeaderSection`、`IntroductionCard`、`GuideStepCard`、`TroubleshootingCard` 共 5 个私有 composable）

### 2.1 定位与背景

纯信息型向导页面，引导用户将 Operit 设置为系统默认助手，并配置手势唤起方式。无 API 调用，无对话框。

### 2.2 组件树

```mermaid
graph TD
    ROOT["CustomScaffold → Column (verticalScroll, spacedBy 16dp)"]
    ROOT --> HDR_SEC["HeaderSection\nBox 80dp CircleShape (linearGradient primaryContainer→secondaryContainer)\nIcon.Assistant (40dp) + 标题 + 副标题"]
    ROOT --> INTRO_CARD["IntroductionCard\nCard (primaryContainer 30%) — Row: Icon.Info + 介绍文字"]
    ROOT --> STEPS_TITLE["Text titleLarge '步骤'"]
    ROOT --> STEP1["GuideStepCard Step 1 — 设置为默认助手\n点击 Card 切换展开 (accordion)\nAnimatedVisibility: 描述 + 详情 + Button '打开设置'"]
    ROOT --> STEP2["GuideStepCard Step 2 — 配置启动手势\nAnimatedVisibility: 描述 + 详情 + Button '打开手势设置'"]
    ROOT --> STEP3["GuideStepCard Step 3 — 测试助手\nAnimatedVisibility: 描述 + 详情 (无 Button)"]
    ROOT --> TROUBLE["TroubleshootingCard\nCard (tertiaryContainer 30%) — Icon.Help + 故障排除内容"]
```

### 2.3 手风琴展开逻辑

```
expandedStepIndex: Int?  (初始值 = 0，表示第 1 步默认展开)

点击 Card:
  当前已展开 → expandedStepIndex = null  (折叠)
  当前未展开 → expandedStepIndex = stepIndex (展开，其余隐式折叠)

AnimatedVisibility 动画:
  进入: fadeIn() + expandVertically()
  退出: fadeOut() + shrinkVertically()
```

### 2.4 系统 Settings 深链接

| 步骤 | Intent Action | 回退 |
|------|---------------|------|
| Step 1 "打开设置" | `Settings.ACTION_VOICE_INPUT_SETTINGS` | `Settings.ACTION_SETTINGS` |
| Step 2 "打开手势设置" | `"android.settings.GESTURE_NAVIGATION_SETTINGS"` (API >= Q) | `Settings.ACTION_SETTINGS` |
| Step 3 | — | 无按钮 |

### 2.5 Android 版本条件内容

Step 1 展开内容中：
```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    // 显示 Android 12+ 专属提示 (primary 色, Medium 字重)
}
```

### 2.6 GuideStepCard 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `stepNumber` | Int | 步骤编号（圆形背景内显示） |
| `title` | String | 步骤标题 |
| `icon` | ImageVector | 步骤图标 |
| `description` | String | 折叠后不可见，展开后显示 |
| `isExpanded` | Boolean | 当前展开状态 |
| `onToggleExpanded` | () -> Unit | 切换展开 |
| `actionButtonText` | String? | 可选按钮文字（Step 3 为 null） |
| `onActionClick` | (() -> Unit)? | 按钮点击回调 |
| `detailsContent` | (@Composable () -> Unit)? | 额外详情内容插槽 |

### 2.7 状态汇总

| State | 类型 | 说明 |
|-------|------|------|
| `expandedStepIndex` | Int? | 当前展开的步骤索引（手风琴单展开，null=全折叠） |
| `scrollState` | ScrollState | 滚动位置 |
