registerWalkthroughSection('character-card', '人格卡片创建到注入', `<div style="max-width:960px;margin:0 auto;padding:8px 0 48px;">

<h2 class="section-title">Walkthrough: 人格卡片创建到注入对话</h2>

<h2 class="section-title">全流程概览</h2>

<p>人格卡片（CharacterCard）从用户创建到最终注入对话，经历三个阶段：创建、激活、注入。</p>

<div class="mermaid">
flowchart TD
    subgraph create["阶段一：创建"]
        A["Step 1: PersonaCardGenerationScreen<br/>用户输入角色信息"] --> B["Step 2: CharacterCardManager<br/>createCharacterCard()<br/>写入 DataStore"]
    end
    subgraph activate["阶段二：激活"]
        C["Step 3: setActiveCharacterCard(id)<br/>切换主题 + Waifu 设置"] --> D["Step 4: activeCharacterCardFlow<br/>Flow 发射新值"]
    end
    subgraph inject["阶段三：注入对话"]
        E["Step 5: combinePrompts()<br/>拼装角色提示词"] --> F["Step 6: ConversationService<br/>prepareConversationHistory()"]
        F --> G["Step 7: CharacterCardToolAccessResolver<br/>resolve() 计算工具权限"]
        G --> H["Step 8: SystemPromptConfig<br/>applyCustomPrompts()<br/>替换 BEGIN_SELF_INTRODUCTION_SECTION"]
        H --> I["Step 9: 最终 System Prompt<br/>注入到对话历史 index 0"]
    end
    create --> activate --> inject
</div>

<hr/>

<h2 class="section-title">阶段一：创建</h2>

<h3>Step 1 — PersonaCardGenerationScreen</h3>
<p>用户在此界面输入角色信息，支持两种方式：</p>
<ul>
  <li><strong>手动编辑</strong>：直接填写各字段（角色设定、开场白、自定义提示词等）</li>
  <li><strong>AI 辅助生成</strong>：AI 通过 <code>save_character_info</code> 工具回填字段</li>
</ul>

<h3>Step 2 — CharacterCardManager.createCharacterCard()</h3>
<p>创建完成后，调用 <code>CharacterCardManager.createCharacterCard()</code> 持久化到 DataStore。</p>

<table class="info-table">
  <thead>
    <tr><th>字段</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td><code>characterSetting</code></td><td>角色的核心人格描述，注入为主提示词主体</td></tr>
    <tr><td><code>openingStatement</code></td><td>对话开场白，首次打招呼时使用</td></tr>
    <tr><td><code>otherContentChat / otherContentVoice</code></td><td>聊天 / 语音模式下的附加内容</td></tr>
    <tr><td><code>advancedCustomPrompt</code></td><td>高级自定义提示词，拼在最后</td></tr>
    <tr><td><code>attachedTagIds</code></td><td>关联的 PromptTag ID 列表</td></tr>
    <tr><td><code>toolAccessConfig</code></td><td>工具白名单配置</td></tr>
    <tr><td><code>chatModelBindingMode</code></td><td>绑定的模型配置</td></tr>
  </tbody>
</table>

<div class="callout">
  <b>持久化方式</b><br/>
  DataStore 使用两级结构：<code>CHARACTER_CARD_LIST</code>（Set，存所有卡片 ID）+ 每张卡片的各字段通过 <code>stringPreferencesKey</code> 独立存储。新增卡片时先写字段再把 ID 追加到 Set。
</div>

<hr/>

<h2 class="section-title">阶段二：激活</h2>

<h3>Step 3 — setActiveCharacterCard(id)</h3>
<p>用户在列表中点击"激活"某张卡片时，调用此函数。它会：</p>
<ul>
  <li>将 <code>activeCharacterCardId</code> 写入 DataStore</li>
  <li>读取卡片的主题配置，切换全局主题色</li>
  <li>读取卡片的 Waifu 设置，更新 Waifu 模式开关</li>
</ul>

<h3>Step 4 — activeCharacterCardFlow</h3>
<p><code>activeCharacterCardFlow</code> 是一个 <code>DataStore.data.map { ... }</code> 衍生的响应式 Flow。DataStore 写入后，Flow 自动发射新的 <code>CharacterCard</code> 对象，所有订阅方（UI、ConversationService 等）立即收到最新卡片。</p>

<div class="callout">
  <b>为什么用 Flow 而不是直接读取？</b><br/>
  卡片激活可能在任何时刻发生（包括对话进行中）。Flow 让所有使用方无需轮询，自动获得最新状态，保证下一条消息就能用上新卡片。
</div>

<hr/>

<h2 class="section-title">阶段三：注入对话</h2>

<h3>Step 5 — combinePrompts()</h3>
<p>每次构建 System Prompt 时，调用 <code>combinePrompts()</code> 将卡片内容拼装为最终角色提示词。拼装分 4 个部分，按顺序用 <code>"\n\n"</code> 连接：</p>

<table class="info-table">
  <thead>
    <tr><th>顺序</th><th>内容来源</th><th>说明</th></tr>
  </thead>
  <tbody>
    <tr><td>1</td><td><code>characterSetting</code></td><td>角色人格主体</td></tr>
    <tr><td>2</td><td><code>otherContentChat</code> 或 <code>otherContentVoice</code></td><td>按当前模式选择</td></tr>
    <tr><td>3</td><td>关联 PromptTag 的内容</td><td>通过 <code>attachedTagIds</code> 查询合并</td></tr>
    <tr><td>4</td><td><code>advancedCustomPrompt</code></td><td>高级提示词，放在最后覆盖前面</td></tr>
  </tbody>
</table>

<h3>Step 6 — ConversationService.prepareConversationHistory()</h3>
<p>每次发送消息前，<code>ConversationService</code> 调用此方法构建完整的对话历史（包含 System Prompt）。在这里会读取当前激活的卡片，并触发后续步骤。</p>

<h3>Step 7 — CharacterCardToolAccessResolver.resolve()</h3>
<p>计算本次对话中 AI 可以使用的工具集合，采用<strong>交集逻辑</strong>：</p>

<pre><code>可用工具 = 卡片白名单(toolAccessConfig) ∩ 全局可见工具集</code></pre>

<p>卡片可以缩小工具范围（如禁止 <code>shell_command</code>），但无法扩大超出全局允许范围。</p>

<div class="callout">
  <b>交集逻辑的安全意义</b><br/>
  即使卡片作者把所有工具都加入白名单，也无法绕过用户在全局设置中禁止的工具。权限只能被卡片收窄，不能被卡片放宽。
</div>

<h3>Step 8 — SystemPromptConfig.applyCustomPrompts()</h3>
<p>System Prompt 模板中有一个占位符 <code>BEGIN_SELF_INTRODUCTION_SECTION</code>，<code>applyCustomPrompts()</code> 将其替换为 <code>combinePrompts()</code> 生成的角色提示词。这样角色设定会出现在 System Prompt 的固定位置，不会和其他内容混淆。</p>

<h3>Step 9 — 注入到对话历史 index 0</h3>
<p>最终构建好的 System Prompt 被包装为 <code>PromptTurn(SYSTEM)</code>，插入到对话历史的 <strong>index 0</strong>（最前面）。AI 每次收到的消息列表第一条永远是当前角色的完整 System Prompt。</p>

<hr/>

<h2 class="section-title">关键设计小结</h2>

<table class="info-table">
  <thead>
    <tr><th>设计点</th><th>实现方式</th><th>作用</th></tr>
  </thead>
  <tbody>
    <tr><td>AI 辅助创建</td><td><code>save_character_info</code> 工具</td><td>让 AI 帮用户填写角色字段，降低创建门槛</td></tr>
    <tr><td>响应式激活</td><td><code>activeCharacterCardFlow</code></td><td>激活即生效，无需重启对话</td></tr>
    <tr><td>4 段拼装</td><td><code>combinePrompts()</code></td><td>结构清晰，各层次提示词互不干扰</td></tr>
    <tr><td>工具权限交集</td><td><code>CharacterCardToolAccessResolver</code></td><td>卡片只能收窄权限，保证安全</td></tr>
    <tr><td>占位符替换</td><td><code>applyCustomPrompts()</code></td><td>角色提示词位置固定，便于模板维护</td></tr>
    <tr><td>System Prompt 位置</td><td>index 0 插入</td><td>确保 AI 始终先读角色设定</td></tr>
  </tbody>
</table>

<h2 class="section-title">涉及文件</h2>

<table class="info-table">
  <thead>
    <tr><th>文件</th><th>职责</th></tr>
  </thead>
  <tbody>
    <tr><td><code>PersonaCardGenerationScreen.kt</code></td><td>UI 入口，手动编辑 + AI 辅助生成</td></tr>
    <tr><td><code>CharacterCard.kt</code></td><td>数据实体定义</td></tr>
    <tr><td><code>CharacterCardManager.kt</code></td><td>CRUD 操作、DataStore 持久化、activeCharacterCardFlow</td></tr>
    <tr><td><code>CharacterCardToolAccessResolver.kt</code></td><td>工具白名单交集计算</td></tr>
    <tr><td><code>ConversationService.kt</code></td><td>prepareConversationHistory()，触发 System Prompt 构建</td></tr>
    <tr><td><code>SystemPromptConfig.kt</code></td><td>applyCustomPrompts()，占位符替换</td></tr>
  </tbody>
</table>

</div>`);
