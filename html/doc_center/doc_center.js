/* ===== Mermaid Configuration ===== */
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    darkMode: true,
    background: '#161b22',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',

    primaryColor: '#21262d',
    primaryTextColor: '#e6edf3',
    primaryBorderColor: '#30363d',
    secondaryColor: '#21262d',
    secondaryTextColor: '#e6edf3',
    secondaryBorderColor: '#30363d',
    tertiaryColor: '#21262d',
    tertiaryTextColor: '#e6edf3',
    tertiaryBorderColor: '#30363d',

    lineColor: '#8b949e',

    noteBkgColor: '#1c2129',
    noteTextColor: '#e6edf3',
    noteBorderColor: '#30363d',

    mainBkg: '#21262d',
    nodeBorder: '#30363d',
    nodeTextColor: '#e6edf3',

    clusterBkg: '#0d1117',
    clusterBorder: '#30363d',
    titleColor: '#8b949e',

    edgeLabelBackground: '#161b22',

    labelColor: '#e6edf3',
    stateBkg: '#21262d',
    stateBorder: '#30363d',
    compositeBackground: '#0d1117',
    compositeBorder: '#30363d',
    compositeTitleBackground: '#21262d',
    innerEndBackground: '#30363d',
    transitionColor: '#8b949e',
    transitionLabelColor: '#8b949e',
    specialStateColor: '#8b949e'
  },
  flowchart: { curve: 'basis', padding: 20, htmlLabels: true },
  state: { padding: 12 }
});

/* ===== TABS MANIFEST =====
   To add a new tab: add an entry here + a <button data-tab="ID"> + a <div id="panel-ID" class="tab-panel">
   If the tab contains Mermaid diagrams, set mermaid:true and mermaidSelector. */
var TABS = [
  { id: 'roadmap',  mermaid: true, mermaidSelector: '#panel-roadmap .mermaid' },
  { id: 'tutorials', mermaid: true, mermaidSelector: '#panel-tutorials .mermaid' },
  { id: 'pages',    mermaid: false },
  { id: 'flow',     mermaid: false },
  { id: 'assembly', mermaid: true, mermaidSelector: '#panel-assembly .mermaid' },
  { id: 'runtime-boot', mermaid: true, mermaidSelector: '#panel-runtime-boot .mermaid' },
  { id: 'runtime-chat', mermaid: true, mermaidSelector: '#panel-runtime-chat .mermaid' },
  { id: 'walkthroughs', mermaid: true, mermaidSelector: '#panel-walkthroughs .mermaid' }
];

var mermaidRenderedSet = new Set();

var tabContents = {};
function registerTabContent(id, html) {
  tabContents[id] = html;
}

var tutorialSections = [];
function registerTutorialSection(id, title, html) {
  tutorialSections.push({ id: id, title: title, html: html });
}
function buildTutorialContent() {
  if (tutorialSections.length === 0) return '';
  var nav = '<div class="tutorial-nav">';
  tutorialSections.forEach(function(s) {
    nav += '<button class="tutorial-nav-btn" onclick="document.getElementById(\'tut-' + s.id + '\').scrollIntoView({behavior:\'smooth\',block:\'start\'})">' + s.title + '</button>';
  });
  nav += '</div>';
  var body = '';
  tutorialSections.forEach(function(s) {
    body += '<div id="tut-' + s.id + '" style="scroll-margin-top:100px;">' + s.html + '</div>';
  });
  return nav + body;
}

var walkthroughSections = [];
function registerWalkthroughSection(id, title, html) {
  walkthroughSections.push({ id: id, title: title, html: html });
}
function buildWalkthroughContent() {
  if (walkthroughSections.length === 0) return '';
  var coreCount = 6;
  var configCount = 5;
  var core = walkthroughSections.slice(0, coreCount);
  var config = walkthroughSections.slice(coreCount, coreCount + configCount);
  var advanced = walkthroughSections.slice(coreCount + configCount);

  var nav = '<div class="wt-nav">';
  nav += '<div class="wt-nav-group"><span class="wt-nav-label">核心链路</span>';
  core.forEach(function(s) {
    nav += '<button class="tutorial-nav-btn" onclick="document.getElementById(\'wt-' + s.id + '\').scrollIntoView({behavior:\'smooth\',block:\'start\'})">' + s.title + '</button>';
  });
  nav += '</div>';
  if (config.length > 0) {
    nav += '<div class="wt-nav-group"><span class="wt-nav-label">功能配置</span>';
    config.forEach(function(s) {
      nav += '<button class="tutorial-nav-btn" onclick="document.getElementById(\'wt-' + s.id + '\').scrollIntoView({behavior:\'smooth\',block:\'start\'})">' + s.title + '</button>';
    });
    nav += '</div>';
  }
  if (advanced.length > 0) {
    nav += '<div class="wt-nav-group"><span class="wt-nav-label">进阶模块</span>';
    advanced.forEach(function(s) {
      nav += '<button class="tutorial-nav-btn" onclick="document.getElementById(\'wt-' + s.id + '\').scrollIntoView({behavior:\'smooth\',block:\'start\'})">' + s.title + '</button>';
    });
    nav += '</div>';
  }
  nav += '</div>';

  var body = '';
  walkthroughSections.forEach(function(s) {
    body += '<div id="wt-' + s.id + '" style="scroll-margin-top:100px;">' + s.html + '</div>';
  });
  return nav + body;
}

function fixMermaidSvgColors(panelId) {
  var panel = document.getElementById('panel-' + panelId) || document.getElementById(panelId);
  if (!panel) return;
  panel.querySelectorAll('svg text').forEach(function(t) {
    var fill = t.getAttribute('fill') || getComputedStyle(t).fill;
    if (!fill || fill === 'black' || fill === '#000' || fill === '#000000' || fill === 'rgb(0, 0, 0)'
        || fill === '#333' || fill === '#333333') {
      t.setAttribute('fill', '#e6edf3');
      t.style.fill = '#e6edf3';
    }
  });
  panel.querySelectorAll('svg tspan').forEach(function(ts) {
    var fill = ts.getAttribute('fill') || '';
    if (!fill || fill === 'black' || fill === '#000' || fill === '#000000' || fill === 'rgb(0, 0, 0)'
        || fill === '#333' || fill === '#333333') {
      ts.setAttribute('fill', '#e6edf3');
      ts.style.fill = '#e6edf3';
    }
  });
  panel.querySelectorAll('svg foreignObject div, svg foreignObject span').forEach(function(el) {
    var color = getComputedStyle(el).color;
    if (color === 'rgb(0, 0, 0)' || color === 'rgb(51, 51, 51)') {
      el.style.color = '#e6edf3';
    }
  });
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('panel-' + tabId).classList.add('active');
  btn.classList.add('active');

  var panel = document.getElementById('panel-' + tabId);
  if (!panel.dataset.loaded) {
    if (tabId === 'tutorials') {
      panel.innerHTML = buildTutorialContent();
      panel.dataset.loaded = '1';
    } else if (tabId === 'walkthroughs') {
      panel.innerHTML = buildWalkthroughContent();
      panel.dataset.loaded = '1';
    } else if (tabContents[tabId]) {
      panel.innerHTML = tabContents[tabId];
      panel.dataset.loaded = '1';
    }
  }

  var tabDef = TABS.find(function(t) { return t.id === tabId; });
  if (tabDef && tabDef.mermaid && !mermaidRenderedSet.has(tabId)) {
    mermaidRenderedSet.add(tabId);
    requestAnimationFrame(function() {
      mermaid.run({ querySelector: tabDef.mermaidSelector }).then(function() {
        setTimeout(function() { fixMermaidSvgColors(tabId); }, 200);
      });
    });
  }
}

function toggleGroup(head) {
  var arrow = head.querySelector('.arrow');
  var children = head.nextElementSibling;
  arrow.classList.toggle('collapsed');
  children.classList.toggle('collapsed');
}

function expandAll() {
  var activePanel = document.querySelector('.tab-panel.active') || document;
  activePanel.querySelectorAll('.t-children').forEach(function(c) { c.classList.remove('collapsed'); });
  activePanel.querySelectorAll('.arrow').forEach(function(a) { a.classList.remove('collapsed'); });
}

function collapseAll() {
  var activePanel = document.querySelector('.tab-panel.active') || document;
  activePanel.querySelectorAll('.t-children').forEach(function(c) { c.classList.add('collapsed'); });
  activePanel.querySelectorAll('.arrow').forEach(function(a) { a.classList.add('collapsed'); });
}

function filterScreens(query) {
  var activePanel = document.querySelector('.tab-panel.active') || document;
  query = query.trim().toLowerCase();
  var groups = activePanel.querySelectorAll('.t-group');
  var anyVisible = false;

  activePanel.querySelectorAll('.highlight').forEach(function(el) { el.classList.remove('highlight'); });

  if (!query) {
    groups.forEach(function(g) { g.style.display = ''; });
    activePanel.querySelectorAll('.map-col').forEach(function(c) { c.style.display = ''; });
    activePanel.querySelectorAll('.t-item').forEach(function(i) { i.style.display = ''; });
    activePanel.querySelectorAll('.t-sub-cat').forEach(function(s) { s.style.display = ''; });
    var noResults = activePanel.querySelector('#noResults') || document.getElementById('noResults');
    if (noResults) noResults.style.display = 'none';
    return;
  }

  groups.forEach(function(group) {
    var names = group.querySelectorAll('[data-searchable]');
    var clsEls = group.querySelectorAll('.n-cls');
    var groupMatch = false;
    names.forEach(function(n) {
      var text = n.textContent.toLowerCase();
      if (text.includes(query)) {
        groupMatch = true;
        n.classList.add('highlight');
      }
    });
    clsEls.forEach(function(c) {
      if (c.textContent.toLowerCase().includes(query)) groupMatch = true;
    });

    var items = group.querySelectorAll('.t-item');
    items.forEach(function(item) {
      var searchables = item.querySelectorAll('[data-searchable]');
      var itemCls = item.querySelectorAll('.n-cls');
      var itemMatch = false;
      searchables.forEach(function(s) {
        if (s.textContent.toLowerCase().includes(query)) itemMatch = true;
      });
      itemCls.forEach(function(c) {
        if (c.textContent.toLowerCase().includes(query)) itemMatch = true;
      });
      item.style.display = itemMatch ? '' : 'none';
    });

    group.style.display = groupMatch ? '' : 'none';
    if (groupMatch) {
      anyVisible = true;
      var children = group.querySelector('.t-children');
      var arrow = group.querySelector('.arrow');
      if (children) children.classList.remove('collapsed');
      if (arrow) arrow.classList.remove('collapsed');
    }
  });

  activePanel.querySelectorAll('.t-sub-cat').forEach(function(cat) {
    var next = cat.nextElementSibling;
    if (next && next.classList.contains('t-item')) {
      cat.style.display = next.style.display;
    }
  });

  activePanel.querySelectorAll('.map-col').forEach(function(col) {
    var visibleGroups = col.querySelectorAll('.t-group:not([style*="display: none"])');
    col.style.display = visibleGroups.length > 0 ? '' : 'none';
  });

  var noResults = activePanel.querySelector('#noResults') || document.getElementById('noResults');
  if (noResults) noResults.style.display = anyVisible ? 'none' : 'block';
}

/* ===== Page Detail Navigation ===== */
var savedMapScrollY = 0;
var detailMermaidRendered = new Set();
var detailContents = {};

function registerDetail(id, html) {
  detailContents[id] = html;
}

function showPageDetail(detailId, title) {
  var mapView = document.getElementById('pageMapView');
  var detailView = document.getElementById('pageDetailView');
  if (!mapView || !detailView) return;

  savedMapScrollY = window.scrollY;

  mapView.classList.add('hidden');
  detailView.classList.add('active');

  detailView.querySelectorAll('.detail-content').forEach(function(c) { c.style.display = 'none'; });
  var target = document.getElementById('detail-' + detailId);
  if (!target) return;
  target.style.display = 'block';

  var crumbTitle = document.getElementById('detailCrumbTitle');
  if (crumbTitle) crumbTitle.textContent = title || detailId;

  window.scrollTo(0, 0);

  if (detailContents[detailId] && !target.dataset.loaded) {
    target.innerHTML = detailContents[detailId];
    target.dataset.loaded = '1';
  }

  renderDetailMermaid(detailId, target);
}

function renderDetailMermaid(detailId, target) {
  if (!detailMermaidRendered.has(detailId)) {
    var mermaidEls = target.querySelectorAll('.mermaid');
    if (mermaidEls.length > 0) {
      detailMermaidRendered.add(detailId);
      requestAnimationFrame(function() {
        mermaid.run({ nodes: Array.from(mermaidEls) }).then(function() {
          setTimeout(function() { fixMermaidSvgColors('detail-' + detailId); }, 200);
        });
      });
    }
  }
}

function hidePageDetail() {
  var mapView = document.getElementById('pageMapView');
  var detailView = document.getElementById('pageDetailView');
  if (!mapView || !detailView) return;

  detailView.classList.remove('active');
  mapView.classList.remove('hidden');

  window.scrollTo(0, savedMapScrollY);
}

/* ===== DOM-Ready Init ===== */
document.addEventListener('DOMContentLoaded', function() {
  // Inject content for the default active tab (roadmap)
  var activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn) {
    var activeTabId = activeBtn.dataset.tab;
    var activePanel = document.getElementById('panel-' + activeTabId);
    if (activePanel && tabContents[activeTabId] && !activePanel.dataset.loaded) {
      activePanel.innerHTML = tabContents[activeTabId];
      activePanel.dataset.loaded = '1';
    }
    var tabDef = TABS.find(function(t) { return t.id === activeTabId; });
    if (tabDef && tabDef.mermaid && !mermaidRenderedSet.has(activeTabId)) {
      mermaidRenderedSet.add(activeTabId);
      requestAnimationFrame(function() {
        mermaid.run({ querySelector: tabDef.mermaidSelector }).then(function() {
          setTimeout(function() { fixMermaidSvgColors(activeTabId); }, 200);
        });
      });
    }
  }

  document.getElementById('mainTabBar').addEventListener('click', function(e) {
    var btn = e.target.closest('.tab-btn');
    if (!btn) return;
    var tabId = btn.dataset.tab;
    if (tabId) switchTab(tabId, btn);
  });

  var tip = document.createElement('div');
  tip.className = 'cls-tooltip';
  var tipText = document.createElement('span');
  var tipBtn = document.createElement('button');
  tipBtn.className = 'copy-btn';
  tipBtn.textContent = '复制';
  tip.appendChild(tipText);
  tip.appendChild(tipBtn);
  document.body.appendChild(tip);
  var hideTimer = null;
  var clsContent = '';

  function showTip() {
    var cls = this.querySelector('.n-cls');
    if (!cls) return;
    clearTimeout(hideTimer);
    clsContent = cls.textContent;
    tipText.textContent = clsContent;
    tipBtn.textContent = '复制';
    tip.style.display = 'flex';
    var rect = this.getBoundingClientRect();
    var tipW = tip.offsetWidth;
    var left = rect.left;
    if (left + tipW > window.innerWidth - 8) left = window.innerWidth - tipW - 8;
    if (left < 8) left = 8;
    tip.style.left = left + 'px';
    tip.style.top = (rect.bottom + 6) + 'px';
  }

  function hideTip() {
    hideTimer = setTimeout(function() { tip.style.display = 'none'; }, 150);
  }

  tip.addEventListener('mouseenter', function() { clearTimeout(hideTimer); });
  tip.addEventListener('mouseleave', function() { tip.style.display = 'none'; });

  tipBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(clsContent).then(function() {
      tipBtn.textContent = '✓ 已复制';
      setTimeout(function() { tipBtn.textContent = '复制'; }, 1000);
    });
  });

  document.querySelectorAll('.detail-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.stopPropagation();
      var detailId = this.dataset.detail;
      var title = this.dataset.title || this.closest('.t-group-head').querySelector('.n-name').textContent;
      showPageDetail(detailId, title);
    });
  });

  document.querySelectorAll('.t-group-head, .t-node').forEach(function(el) {
    if (el.querySelector('.n-cls')) {
      el.addEventListener('mouseenter', showTip);
      el.addEventListener('mouseleave', hideTip);
    }
  });
});
