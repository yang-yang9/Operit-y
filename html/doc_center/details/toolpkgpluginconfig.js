registerDetail('toolpkgpluginconfig', `
    <!-- Hero Stats -->
    <div class="stats" style="margin-bottom:24px;">
      <div class="stat-item"><span class="stat-num">1375</span><span class="stat-label">主屏幕行数</span></div>
      <div class="stat-item"><span class="stat-num">~2000</span><span class="stat-label">自动生成注册表</span></div>
      <div class="stat-item"><span class="stat-num">50+</span><span class="stat-label">组件类型</span></div>
      <div class="stat-item"><span class="stat-num">7</span><span class="stat-label">核心文件</span></div>
    </div>

    <!-- 总体架构 -->
    <div class="section-head blue">ToolPkgComposeDslScreen — Compose DSL 动态渲染引擎</div>
    <p style="margin:0 0 12px 4px;font-size:13px;color:var(--text-dim);">与其他静态页面不同，此页面没有固定组件树——从插件包加载 JS 脚本，在独立 JS 引擎中执行生成 UI 树描述（JSON），递归映射为 Compose 组件。Screen 类型为 data class（非 data object），携带 containerPackageName、uiModuleId、title 三个参数。</p>

    <!-- 渲染流程 Mermaid -->
    <div class="section-head green" style="margin-top:16px;">渲染流程</div>
    <div class="mermaid">
graph TD
    ENTRY["ToolPkgComposeDslToolScreen&lt;br/&gt;(containerPackageName, uiModuleId, title)"]
    ENTRY --> LOAD["LaunchedEffect: 加载 JS 脚本&lt;br/&gt;PackageManager.getToolPkgComposeDslScript()"]
    LOAD --> EXEC["JsEngine.executeComposeDslScript()&lt;br/&gt;JS 运行时包装 + 执行入口函数"]
    EXEC --> PARSE["ToolPkgComposeDslParser.parseRenderResult()&lt;br/&gt;JSON → ToolPkgComposeDslRenderResult"]
    PARSE --> RENDER["renderComposeDslNode() 递归渲染&lt;br/&gt;normalizeToken → 注册表查找 → Compose 组件"]
    RENDER --> ACTION["用户交互 → onAction(actionId, payload)"]
    ACTION --> DISPATCH["dispatchComposeDslActionAsync()&lt;br/&gt;JS 处理 → sendIntermediateResult() 流式更新"]
    DISPATCH --> RERENDER["更新 renderResult → 重新渲染"]
    </div>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">每个 (containerPackageName, uiModuleId) 对获得独立 JS 引擎实例，contextKey = "toolpkg_compose_dsl:&lt;pkg&gt;:&lt;module&gt;"</p>

    <!-- DSL JSON Schema -->
    <div class="section-head orange" style="margin-top:16px;">DSL JSON Schema</div>
    <div class="kn-code" style="margin:8px 0;">{
  "tree": {
    "type": "Column",
    "props": {
      "spacing": 8,
      "fillMaxWidth": true,
      "padding": 16,
      "onLoad": { "__actionId": "onLoad" }
    },
    "children": [
      { "type": "Text", "props": { "text": "Hello", "style": "titleMedium" } },
      { "type": "Button", "props": { "text": "Click", "onClick": { "__actionId": "handleClick" } } }
    ]
  },
  "state": { "counter": 0 },
  "memo": {}
}</div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">节点结构</div>
    <table class="act-table">
      <tr><th>字段</th><th>类型</th><th>说明</th></tr>
      <tr><td>type</td><td>String</td><td>组件类型名（大小写不敏感，忽略 -/_）</td></tr>
      <tr><td>props</td><td>Map&lt;String, Any?&gt;</td><td>属性包</td></tr>
      <tr><td>children</td><td>List&lt;Node&gt;</td><td>子节点列表</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">事件处理器格式</div>
    <table class="act-table">
      <tr><th>格式</th><th>示例</th></tr>
      <tr><td>对象格式</td><td>{ "__actionId": "handleClick" }</td></tr>
      <tr><td>前缀格式</td><td>"__action:handleClick"</td></tr>
      <tr><td>纯字符串</td><td>直接作为 action name</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">特殊 Props: <code>onLoad</code> — 首次渲染后自动触发; <code>__no_render</code> — 跳过重新渲染（高频手势事件优化）</p>

    <!-- 组件类型清单 -->
    <div class="section-head purple" style="margin-top:16px;">支持的组件类型清单 <span style="font-size:11px;color:var(--text-dim);">由 generate_compose_dsl_artifacts.py 自动生成</span></div>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">布局容器</div>
    <table class="act-table">
      <tr><th>类型</th><th>说明</th></tr>
      <tr><td>Column</td><td>垂直布局</td></tr>
      <tr><td>Row</td><td>水平布局</td></tr>
      <tr><td>Box</td><td>自由叠加</td></tr>
      <tr><td>Spacer</td><td>间距</td></tr>
      <tr><td>BoxWithConstraints</td><td>约束感知布局</td></tr>
      <tr><td>LazyColumn</td><td>懒加载列表（reverseLayout, autoScrollToEnd）</td></tr>
      <tr><td>LazyRow</td><td>水平懒加载列表</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">文本 & 输入</div>
    <table class="act-table">
      <tr><th>类型</th><th>说明</th></tr>
      <tr><td>Text / BasicText</td><td>文本（style 对应 MaterialTheme.typography）</td></tr>
      <tr><td>SelectionContainer</td><td>可选择文本容器</td></tr>
      <tr><td>TextField</td><td>输入框（label, placeholder, isPassword, onValueChange）</td></tr>
      <tr><td>Switch / Checkbox</td><td>开关 / 复选框</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">按钮（16 种变体）</div>
    <p style="margin:4px 0;font-size:12px;color:var(--text-dim);">Button, ElevatedButton, FilledTonalButton, OutlinedButton, TextButton, IconButton, FilledIconButton, FilledTonalIconButton, OutlinedIconButton, IconToggleButton, FilledIconToggleButton, FilledTonalIconToggleButton, OutlinedIconToggleButton, FloatingActionButton, ExtendedFloatingActionButton, LargeFloatingActionButton, SmallFloatingActionButton</p>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">卡片 & 导航 & 指示器 & 媒体</div>
    <table class="act-table">
      <tr><th>类别</th><th>组件</th></tr>
      <tr><td>卡片/表面</td><td>Card, ElevatedCard, OutlinedCard, Surface, Scaffold</td></tr>
      <tr><td>导航</td><td>NavigationBar, NavigationRail, WideNavigationRail, Tab</td></tr>
      <tr><td>指示器</td><td>LinearProgressIndicator, CircularProgressIndicator, Badge, Snackbar</td></tr>
      <tr><td>分隔线</td><td>Divider, HorizontalDivider, VerticalDivider, VerticalDragHandle</td></tr>
      <tr><td>媒体</td><td>Icon, Image（名称反射加载 Icons.Filled.*）</td></tr>
      <tr><td>自定义绘制</td><td>Canvas（draw commands 数组）</td></tr>
    </table>

    <!-- Modifier 系统 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">通用 Modifier 系统</div>
    <table class="act-table">
      <tr><th>Prop</th><th>效果</th></tr>
      <tr><td>width / height</td><td>固定尺寸 (dp)</td></tr>
      <tr><td>fillMaxSize / fillMaxWidth</td><td>填满父容器</td></tr>
      <tr><td>padding</td><td>Float 或 {horizontal, vertical}</td></tr>
      <tr><td>backgroundBrush</td><td>背景画刷</td></tr>
    </table>

    <div class="section-head" style="margin-top:12px;background:var(--surface-2);color:var(--text);">Proxy Modifier Ops</div>
    <div class="kn-code" style="margin:8px 0;">"modifier": {
  "__modifierOps": [
    { "name": "fillMaxWidth" },
    { "name": "padding", "args": [{ "horizontal": 16, "vertical": 8 }] },
    { "name": "background", "args": ["primary", { "cornerRadius": 8 }] },
    { "name": "border", "args": [1, "outline", { "cornerRadius": 8 }] },
    { "name": "clip", "args": [{ "cornerRadius": 8 }] },
    { "name": "alpha", "args": [0.5] },
    { "name": "rotate", "args": [45] },
    { "name": "scale", "args": [1.2] },
    { "name": "offset", "args": [{ "x": 10, "y": 20 }] }
  ]
}</div>

    <!-- 样式解析 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">样式和颜色解析（反射驱动）</div>
    <table class="act-table">
      <tr><th>输入格式</th><th>解析方式</th></tr>
      <tr><td>Color 实例</td><td>直接使用</td></tr>
      <tr><td>数字</td><td>作为 ARGB Long</td></tr>
      <tr><td>{ "__colorToken": "primary", "alpha": 0.8 }</td><td>MaterialTheme.colorScheme 反射 + alpha</td></tr>
      <tr><td>字符串</td><td>先查 colorScheme 字段，再 Color.parseColor()</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">文本样式 token（如 "titleMedium"）通过反射映射到 MaterialTheme.typography。图标名称转 PascalCase 反射加载 Icons.Filled.*。</p>

    <!-- Canvas 绘制 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">Canvas 绘制系统</div>
    <table class="act-table">
      <tr><th>命令类型</th><th>说明</th></tr>
      <tr><td>rect / roundrect</td><td>矩形 / 圆角矩形</td></tr>
      <tr><td>circle</td><td>圆形</td></tr>
      <tr><td>line</td><td>线段</td></tr>
      <tr><td>text / drawtext</td><td>文本</td></tr>
      <tr><td>drawpath</td><td>路径（moveTo/lineTo/cubicTo/quadTo/close）</td></tr>
    </table>
    <table class="act-table" style="margin-top:8px;">
      <tr><th>坐标 unit</th><th>说明</th></tr>
      <tr><td>"fraction"</td><td>0~1 相对于 Canvas 尺寸</td></tr>
      <tr><td>"dp"</td><td>密度无关像素</td></tr>
      <tr><td>(默认)</td><td>原始像素</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">Canvas 支持 transform prop（scale, offset, pivot）和 onTransform 手势事件。</p>

    <!-- 状态管理 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">状态管理</div>
    <table class="act-table">
      <tr><th>State</th><th>类型</th><th>说明</th></tr>
      <tr><td>script</td><td>String?</td><td>缓存的 JS 脚本文本</td></tr>
      <tr><td>renderResult</td><td>ToolPkgComposeDslRenderResult?</td><td>解析后的 UI 树 + state + memo</td></tr>
      <tr><td>errorMessage</td><td>String?</td><td>错误信息（显示 Retry 按钮）</td></tr>
      <tr><td>isLoading</td><td>Boolean</td><td>初始脚本执行中</td></tr>
      <tr><td>dispatchingCount</td><td>Int</td><td>并发异步动作引用计数</td></tr>
    </table>
    <p style="font-size:12px;color:var(--text-dim);margin:4px 0;">JS 侧通过 state + memo 维护自己的状态，每次渲染返回快照，下次调用时回传。异步动作可调用 sendIntermediateResult() 发送中间结果实现流式 UI 刷新。</p>

    <!-- 架构要点 -->
    <div class="section-head gray" style="margin-top:16px;">架构要点</div>
    <div class="key-nodes-grid">
      <div class="key-node-card">
        <div class="kn-icon">🔄</div>
        <div class="kn-title blue">动态 DSL</div>
        <div class="kn-body">组件树由 JS 脚本运行时生成，不是编译时确定的 Composable 结构。同一渲染引擎服务所有插件 UI。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🤖</div>
        <div class="kn-title green">自动生成注册表</div>
        <div class="kn-body">GeneratedRenderers.kt + GeneratedRegistry.kt 由 Python 脚本自动生成，确保组件类型覆盖完整。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🪞</div>
        <div class="kn-title orange">反射驱动样式</div>
        <div class="kn-body">颜色、字体、对齐方式全部通过反射从 MaterialTheme 获取，JSON 可直接引用 Material Design token 名。</div>
      </div>
      <div class="key-node-card">
        <div class="kn-icon">🔒</div>
        <div class="kn-title purple">JS 引擎隔离</div>
        <div class="kn-body">每个 (packageName, moduleId) 对获得独立 JS VM 实例，插件间状态不互通。</div>
      </div>
    </div>

    <!-- 核心文件 -->
    <div class="section-head" style="margin-top:16px;background:var(--surface-2);color:var(--text);">核心文件</div>
    <table class="act-table">
      <tr><th>文件</th><th>路径</th><th>行数</th></tr>
      <tr><td>ToolPkgComposeDslScreen</td><td>ui/common/composedsl/ToolPkgComposeDslScreen.kt</td><td>1375</td></tr>
      <tr><td>GeneratedRenderers</td><td>ui/common/composedsl/ToolPkgComposeDslGeneratedRenderers.kt</td><td>~1500</td></tr>
      <tr><td>GeneratedRegistry</td><td>ui/common/composedsl/ToolPkgComposeDslGeneratedRegistry.kt</td><td>~500</td></tr>
      <tr><td>DslParser</td><td>core/tools/packTool/ToolPkgComposeDslParser.kt</td><td>~200</td></tr>
      <tr><td>JsComposeDslRuntimeScript</td><td>core/tools/javascript/JsComposeDslRuntimeScript.kt</td><td>~300</td></tr>
      <tr><td>JsEngine (部分)</td><td>core/tools/javascript/JsEngine.kt</td><td>~100</td></tr>
      <tr><td>PackageManagerFacade (部分)</td><td>core/tools/packTool/PackageManagerToolPkgFacade.kt</td><td>~110</td></tr>
    </table>
`);
