registerWalkthroughSection('workflow-execution', '工作流创建到定时执行', `<div style="max-width:960px;margin:0 auto;padding:8px 0 48px;">

<h2 class="section-title">Walkthrough: 工作流创建到定时执行</h2>

<h2 class="section-title">全流程概览</h2>

<p>工作流（Workflow）从用户创建到被 WorkManager 定时触发，经历三个阶段：创建、调度、执行。</p>

<div class="mermaid">
flowchart TD
    subgraph create["阶段一：创建"]
        A["Step 1: WorkflowListScreen<br/>点击 + 创建工作流"] --> B["Step 2: WorkflowRepository<br/>createWorkflow()<br/>写入 JSON 到磁盘"]
    end
    subgraph schedule["阶段二：调度"]
        C["Step 3: WorkflowDetailScreen<br/>配置 TriggerNode<br/>选择 schedule 类型"] --> D["Step 4: ScheduleConfigDialog<br/>设置间隔/定时/Cron"]
        D --> E["Step 5: WorkflowScheduler<br/>scheduleWorkflow()"]
        E --> F["Step 6: WorkManager<br/>enqueueUniquePeriodicWork()"]
    end
    subgraph execute["阶段三：执行"]
        G["Step 7: WorkflowWorker.doWork()<br/>WorkManager 触发"] --> H["Step 8: WorkflowRepository<br/>triggerWorkflowInternal()"]
        H --> I["Step 9: WorkflowExecutor<br/>executeWorkflow()"]
        I --> J["Step 10: buildDependencyGraph()<br/>构建依赖图 + 环检测"]
        J --> K["Step 11: executeTopologicalOrder()<br/>BFS 队列执行节点"]
        K --> L["Step 12: executeNode()<br/>按类型分发执行"]
        L --> L1["ExecuteNode<br/>→ AIToolHandler.executeTool()"]
        L --> L2["ConditionNode<br/>→ compareValues()"]
        L --> L3["ExtractNode<br/>→ regex/json/concat"]
    end
    create --> schedule --> execute
</div>

<hr/>

<h2 class="section-title">阶段一：创建</h2>

<h3>Step 1 — WorkflowListScreen</h3>
<p>用户在工作流列表页点击"+"按钮，弹出创建对话框，输入工作流名称后确认创建。</p>

<h3>Step 2 — WorkflowRepository.createWorkflow()</h3>
<p>调用此方法生成一个初始工作流对象并持久化到磁盘。</p>

<table class="info-table">
  <thead>
    <tr><th>字段</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>id</code></td><td>UUID，全局唯一标识</td></tr>
    <tr><td><code>name</code></td><td>用户填写的工作流名称</td></tr>
    <tr><td><code>nodes</code></td><td>节点列表，初始包含一个 TriggerNode</td></tr>
    <tr><td><code>connections</code></td><td>节点连接关系（有向边）</td></tr>
    <tr><td><code>enabled</code></td><td>是否启用调度，默认 false</td></tr>
  </tbody>
</table>

<div class="callout">
  <b>存储格式</b><br/>
  每个工作流以 JSON 文件形式保存在 <code>Downloads/Operit/workflow/&lt;id&gt;.json</code>。选择文件存储而非数据库，方便用户直接导入导出工作流文件。
</div>

<p>节点类型是一个 sealed class，共 5 种：</p>

<table class="info-table">
  <thead>
    <tr><th>节点类型</th><th>用途</th></tr>
  </thead>
  <tbody>
    <tr><td><code>TriggerNode</code></td><td>触发器，定义何时启动工作流（手动 / 定时 / Cron）</td></tr>
    <tr><td><code>ExecuteNode</code></td><td>执行节点，调用 AI 工具</td></tr>
    <tr><td><code>ConditionNode</code></td><td>条件分支，根据比较结果走不同路径</td></tr>
    <tr><td><code>ExtractNode</code></td><td>数据提取，从上游结果中提取子集</td></tr>
    <tr><td><code>LogicNode</code></td><td>逻辑聚合，AND / OR 门控</td></tr>
  </tbody>
</table>

<hr/>

<h2 class="section-title">阶段二：调度</h2>

<h3>Step 3 — WorkflowDetailScreen 配置 TriggerNode</h3>
<p>在工作流详情页，用户点击 TriggerNode 进入配置。选择触发类型为 <code>schedule</code> 后进入调度配置。</p>

<h3>Step 4 — ScheduleConfigDialog</h3>
<p>弹出调度配置对话框，支持 3 种调度模式：</p>

<table class="info-table">
  <thead>
    <tr><th>模式</th><th>说明</th><th>限制</th></tr>
  </thead>
  <tbody>
    <tr><td><code>interval</code></td><td>按固定间隔重复执行</td><td>最短 15 分钟（WorkManager 系统限制）</td></tr>
    <tr><td><code>specific_time</code></td><td>在指定时刻执行一次</td><td>单次触发，执行后不再重复</td></tr>
    <tr><td><code>cron</code></td><td>Cron 表达式调度</td><td>提供 10 个预设 + 支持自定义表达式</td></tr>
  </tbody>
</table>

<h3>Step 5 — WorkflowScheduler.scheduleWorkflow()</h3>
<p>用户保存调度配置后，调用此方法构建 WorkManager 任务请求。根据调度模式选择对应的 <code>WorkRequest</code> 类型，并设置初始延迟和输入数据（workflowId + triggerNodeId）。</p>

<h3>Step 6 — WorkManager.enqueueUniquePeriodicWork()</h3>
<p>将任务以<strong>唯一名称</strong>（通常为 <code>workflow_&lt;id&gt;</code>）注册到 WorkManager，使用 <code>REPLACE</code> 策略——如果同名任务已存在则取消旧的、注册新的。这保证每个工作流最多只有一个调度任务在运行。</p>

<div class="callout">
  <b>WorkflowSchedulerInitializer</b><br/>
  App 启动时，<code>WorkflowSchedulerInitializer</code> 会遍历所有 <code>enabled=true</code> 的工作流并重新注册调度。这是因为 WorkManager 的周期任务在系统重启或 App 被杀后可能失效，必须在启动时恢复。
</div>

<hr/>

<h2 class="section-title">阶段三：执行</h2>

<h3>Step 7 — WorkflowWorker.doWork()</h3>
<p><code>WorkflowWorker</code> 是一个 <code>CoroutineWorker</code>。WorkManager 在调度时间到达时回调 <code>doWork()</code>，从 inputData 中取出 <code>workflowId</code> 和 <code>triggerNodeId</code>，然后转交给 Repository。</p>

<h3>Step 8 — WorkflowRepository.triggerWorkflowInternal()</h3>
<p>此方法负责并发保护：</p>
<ul>
  <li>检查工作流当前状态，如果已是 <code>RUNNING</code>，直接返回（防止重入）</li>
  <li>将状态更新为 <code>RUNNING</code></li>
  <li>调用 <code>WorkflowExecutor.executeWorkflow()</code></li>
  <li>执行完成后（无论成功或失败）将状态重置为 <code>IDLE</code></li>
</ul>

<h3>Step 9 — WorkflowExecutor.executeWorkflow()</h3>
<p>执行器的入口，接收工作流对象和触发节点 ID，开始 DAG（有向无环图）执行。</p>

<h3>Step 10 — buildDependencyGraph()</h3>
<p>在执行前先构建依赖图：</p>

<pre><code>adjacency map：每个节点 → 它的后继节点列表
in-degree map：每个节点 → 有多少个前驱节点</code></pre>

<p>同时通过 <strong>DFS 进行环检测</strong>——如果图中存在循环依赖，立即报错中止，不进入执行阶段。</p>

<h3>Step 11 — executeTopologicalOrder()</h3>
<p>使用 <strong>BFS（广度优先搜索）</strong> 按拓扑序执行节点：</p>
<ul>
  <li>初始队列：从触发节点出发，将所有可达节点加入 BFS 队列</li>
  <li>每执行完一个节点，检查其后继节点的 in-degree 是否降为 0</li>
  <li>降为 0 的后继节点入队，等待执行</li>
  <li>对于 <code>ConditionNode</code>，额外调用 <code>checkIncomingConditions()</code>，只有满足条件的分支路径才会继续传播</li>
</ul>

<h3>Step 12 — executeNode() 按类型分发</h3>
<p>每个节点到达队列头部时，<code>executeNode()</code> 按类型分发执行：</p>

<table class="info-table">
  <thead>
    <tr><th>节点类型</th><th>执行方式</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>ExecuteNode</code></td><td><code>AIToolHandler.executeTool()</code></td><td>复用与 AI 对话相同的工具执行路径</td></tr>
    <tr><td><code>ConditionNode</code></td><td><code>compareValues()</code></td><td>支持等于、不等于、包含、大于、小于等比较算子</td></tr>
    <tr><td><code>ExtractNode</code></td><td>内置提取器</td><td>支持 regex、json path、substring、concat、random 等模式</td></tr>
    <tr><td><code>LogicNode</code></td><td>AND / OR 门</td><td>聚合多个上游节点的结果，决定是否继续下游</td></tr>
  </tbody>
</table>

<div class="callout">
  <b>ExecuteNode 复用 AI 工具路径</b><br/>
  <code>ExecuteNode</code> 调用的是 <code>AIToolHandler.executeTool()</code>——和 AI 在对话中使用工具走的是完全相同的代码路径。这意味着工作流中可以使用所有 AI 可用的工具（文件操作、Shell、网络请求等），且权限检查机制一致。
</div>

<hr/>

<h2 class="section-title">关键设计小结</h2>

<table class="info-table">
  <thead>
    <tr><th>设计点</th><th>实现方式</th><th>作用</th></tr>
  </thead>
  <tbody>
    <tr><td>文件存储</td><td>JSON 文件，路径含 id</td><td>便于导入导出，无需数据库迁移</td></tr>
    <tr><td>唯一调度注册</td><td><code>enqueueUniquePeriodicWork(REPLACE)</code></td><td>防止同一工作流多个调度并行</td></tr>
    <tr><td>启动恢复</td><td><code>WorkflowSchedulerInitializer</code></td><td>重启或杀进程后自动恢复调度</td></tr>
    <tr><td>并发保护</td><td><code>RUNNING</code> 状态检查</td><td>防止同一工作流重入执行</td></tr>
    <tr><td>DAG 执行</td><td>DFS 环检测 + BFS 拓扑序</td><td>正确处理任意复杂度的节点依赖</td></tr>
    <tr><td>工具复用</td><td><code>AIToolHandler.executeTool()</code></td><td>工作流与 AI 对话共享工具能力和权限体系</td></tr>
  </tbody>
</table>

<h2 class="section-title">涉及文件</h2>

<table class="info-table">
  <thead>
    <tr><th>文件</th><th>职责</th></tr>
  </thead>
  <tbody>
    <tr><td><code>WorkflowListScreen.kt</code></td><td>工作流列表 UI，创建入口</td></tr>
    <tr><td><code>WorkflowDetailScreen.kt</code></td><td>工作流详情 UI，节点编辑</td></tr>
    <tr><td><code>ScheduleConfigDialog.kt</code></td><td>调度配置对话框，3 种模式设置</td></tr>
    <tr><td><code>Workflow.kt</code></td><td>数据模型，Workflow + sealed class WorkflowNode</td></tr>
    <tr><td><code>WorkflowRepository.kt</code></td><td>JSON 读写、triggerWorkflowInternal()、并发保护</td></tr>
    <tr><td><code>WorkflowScheduler.kt</code></td><td>scheduleWorkflow()，构建并注册 WorkManager 任务</td></tr>
    <tr><td><code>WorkflowWorker.kt</code></td><td>CoroutineWorker，WorkManager 回调入口</td></tr>
    <tr><td><code>WorkflowExecutor.kt</code></td><td>DAG 执行引擎，buildDependencyGraph + executeTopologicalOrder</td></tr>
  </tbody>
</table>

</div>`);
