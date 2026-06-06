// FILE TREE
// ============================================================
var FS = {
  files: [
    {id:'tab_1', name:'main.c', type:'c'},
  ],
  nextFileId: 2,
};

function getFileType(name) {
  if(name==='Makefile'||name.endsWith('.mk')) return 'mk';
  if(name.endsWith('.h')) return 'h';
  return 'c';
}

function fileIcon(type) {
  if(type==='h')  return '<span style="color:var(--c-structs);font-weight:700;font-size:10px">H</span>';
  if(type==='mk') return '<span style="color:var(--c-io);font-weight:700;font-size:10px">M</span>';
  return '<span style="color:var(--c-types);font-weight:700;font-size:10px">C</span>';
}

function renderFileTree() {
  var listEl = document.getElementById('filetree-list');
  listEl.innerHTML = '';
  FS.files.forEach(function(file) {
    var item = document.createElement('div');
    item.className = 'ft-item' + (file.id === S.activeTab ? ' active' : '');
    item.dataset.fid = file.id;
    item.innerHTML =
      '<span class="ft-icon">' + fileIcon(file.type) + '</span>' +
      '<span class="ft-name" data-fid="' + file.id + '">' + escH(file.name) + '</span>' +
      '<div class="ft-actions">' +
        '<button class="ft-action" data-rename="' + file.id + '" title="Renommer">✏</button>' +
        (FS.files.length > 1 ? '<button class="ft-action del" data-del="' + file.id + '" title="Supprimer">✕</button>' : '') +
      '</div>';
    item.addEventListener('click', function(e) {
      if(e.target.dataset.rename) { startRename(file, item); return; }
      if(e.target.dataset.del)    { deleteFile(file.id); return; }
      switchTab(file.id);
    });
    listEl.appendChild(item);
  });
}

function startRename(file, item) {
  var nameEl = item.querySelector('.ft-name');
  var inp = document.createElement('input');
  inp.className = 'ft-rename-input';
  inp.value = file.name;
  nameEl.replaceWith(inp);
  inp.focus(); inp.select();
  function commit() {
    var newName = inp.value.trim() || file.name;
    file.name = newName;
    file.type = getFileType(newName);
    // Also update tab name
    var tab = S.tabs.find(function(t){return t.id===file.id;});
    if(tab) tab.name = newName;
    renderFileTree();
    renderTabs();
    renderSidebar();
  }
  inp.addEventListener('blur', commit);
  inp.addEventListener('keydown', function(e){
    if(e.key==='Enter') commit();
    if(e.key==='Escape'){ file.name=file.name; renderFileTree(); }
  });
}

function createFile(type) {
  var ext = type==='h' ? '.h' : type==='mk' ? 'Makefile' : '.c';
  var baseName = type==='mk' ? 'Makefile' : 'nouveau' + ext;
  // Make unique
  var existing = FS.files.map(function(f){return f.name;});
  if(type !== 'mk') {
    var i = 1;
    while(existing.indexOf(baseName) >= 0) {
      baseName = 'nouveau_' + (i++) + ext;
    }
  }
  var id = 'tab_' + S.nextTabId++;
  var file = {id:id, name:baseName, type:type};
  FS.files.push(file);
  S.tabs.push({id:id, name:baseName, blocks:[]});
  switchTab(id);
  renderFileTree();
  // Immediately open rename
  var item = document.querySelector('.ft-item[data-fid="'+id+'"]');
  if(item) startRename(file, item);
}

function deleteFile(id) {
  if(FS.files.length <= 1) { toast('Impossible de supprimer le dernier fichier','error'); return; }
  FS.files = FS.files.filter(function(f){return f.id!==id;});
  closeTab(id);
  renderFileTree();
}

// Sync FS when tabs change
var _origCloseTab = closeTab;
closeTab = function(id) {
  _origCloseTab(id);
  FS.files = FS.files.filter(function(f){return f.id!==id;});
  // If we closed active, file tree needs update
  renderFileTree();
};

// File tree buttons
document.getElementById('ft-new-c').addEventListener('click', function(){ createFile('c'); });
document.getElementById('ft-new-h').addEventListener('click', function(){ createFile('h'); });
document.getElementById('ft-new-mk').addEventListener('click', function(){ createFile('mk'); });

// Filetree resizer
(function(){
  var drag=false;
  var rEl=document.getElementById('resizer-ft');
  rEl.addEventListener('mousedown',function(){drag=true;document.body.style.cursor='col-resize';document.body.style.userSelect='none';});
  document.addEventListener('mousemove',function(e){
    if(!drag)return;
    var ftEl=document.getElementById('filetree');
    var w=ftEl.offsetWidth+e.movementX;
    if(w>=120&&w<=400){ftEl.style.width=w+'px';ftEl.style.flex='none';}
  });
  document.addEventListener('mouseup',function(){drag=false;document.body.style.cursor='';document.body.style.userSelect='';});
})();

// ============================================================
// CONTEXT-AWARE SIDEBAR (H / Makefile / C)
// ============================================================
var _origRenderSidebar = renderSidebar;
renderSidebar = function(filter) {
  var tab = getTab();
  var fileType = 'c';
  if(tab) {
    var file = FS.files.find(function(f){return f.id===tab.id;});
    if(file) fileType = file.type;
  }

  sidebarContentEl.innerHTML = '';
  var fl = (filter||'').toLowerCase();

  var blockSets = fileType==='h' ? [H_BLOCKS] : fileType==='mk' ? [MK_BLOCKS] : [BLOCKS];

  blockSets.forEach(function(bset) {
    Object.entries(bset).forEach(function(kv) {
      var catKey=kv[0], cat=kv[1];
      var visible=fl ? cat.blocks.filter(function(b){return b.name.toLowerCase().includes(fl)||b.preview.toLowerCase().includes(fl);}) : cat.blocks;
      if(!visible.length) return;
      var catEl=document.createElement('div'); catEl.className='category';
      var hdr=document.createElement('div'); hdr.className='cat-header';
      hdr.innerHTML='<div class="cat-icon" style="background:'+cat.color+'22;color:'+cat.color+';border:1px solid '+cat.color+'44">'+escH(cat.icon)+'</div>'
        +'<span class="cat-label">'+escH(cat.label)+'</span>'
        +'<span class="cat-count">'+visible.length+'</span>'
        +'<span class="cat-chev">▾</span>';
      hdr.addEventListener('click',function(){catEl.classList.toggle('collapsed');});
      var blocksEl=document.createElement('div'); blocksEl.className='category-blocks';
      visible.forEach(function(bd){
        var item=document.createElement('div');
        item.className='block-item'+(bd.isContainer?' is-container':'');
        item.dataset.bid=bd.id;
        item.innerHTML='<style>.block-item[data-bid="'+bd.id+'"]::before{background:'+cat.color+'}</style>'
          +'<span class="bin">'+escH(bd.name)+'</span>'
          +'<span class="bip">'+escH(bd.preview)+'</span>';
        item.setAttribute('draggable','true');
        item.title=bd.preview;
        item.addEventListener('dragstart',function(e){
          S.sidebarDrag={blockDef:bd,catKey:catKey};
          e.dataTransfer.effectAllowed='copy';
          dragGhostEl.innerHTML='<div style="background:var(--bg-block);border:1px solid '+cat.color+'55;border-radius:8px;padding:8px 12px;font-family:\'JetBrains Mono\',monospace;font-size:11px;color:var(--text-primary)">'+escH(bd.name)+'</div>';
          dragGhostEl.style.display='block';
          e.dataTransfer.setDragImage(dragGhostEl,0,0);
          setTimeout(function(){dragGhostEl.style.display='none';},0);
        });
        item.addEventListener('dragend',function(){S.sidebarDrag=null;});
        item.addEventListener('dblclick',function(){
          var tab=getTab();
          var ordered=getOrderedBlocks();
          var wx,wy;
          if(ordered.length){
            var last=ordered[ordered.length-1];
            var lastEl=worldEl.querySelector('.canvas-block[data-bid="'+last.id+'"]');
            var lh=lastEl?lastEl.offsetHeight:BLOCK_H_APPROX;
            wx=last.x; wy=last.y+lh+BLOCK_GAP;
          } else {
            var cr=canvasEl.getBoundingClientRect();
            var cw=screenToWorld(cr.left+cr.width/2,cr.top+cr.height/3);
            wx=cw.x-140; wy=cw.y;
          }
          addBlock(bd,catKey,wx,wy);
        });
        blocksEl.appendChild(item);
      });
      catEl.appendChild(hdr); catEl.appendChild(blocksEl);
      sidebarContentEl.appendChild(catEl);
    });
  });
};

// ============================================================
// INLINE ERROR VALIDATION
// ============================================================
function validateBlock(block) {
  var code = genBlockCode(block);
  var errors = [];
  var warnings = [];

  // 1. Unresolved placeholders
  var unresolved = code.match(/\{[a-zA-Z_]\w*\}/g);
  if(unresolved) {
    var unique = unresolved.filter(function(v,i,a){return a.indexOf(v)===i;});
    errors.push('Champ(s) non rempli(s): ' + unique.join(', '));
  }

  // 2. Unbalanced braces (for non-containers)
  if(!block.isContainer) {
    var opens = (code.match(/\{/g)||[]).length;
    var closes = (code.match(/\}/g)||[]).length;
    if(opens !== closes) warnings.push('Accolades déséquilibrées');
  }

  // 3. Missing semicolon on simple statements (not containers, not preprocessor, not comments)
  if(!block.isContainer && code.trim().length > 0) {
    var trimmed = code.trim();
    var isPreproc = trimmed.startsWith('#');
    var isComment = trimmed.startsWith('//') || trimmed.startsWith('/*');
    var isBlock = trimmed.endsWith('{') || trimmed.endsWith('}');
    var hasSemi = trimmed.endsWith(';');
    if(!isPreproc && !isComment && !isBlock && !hasSemi) {
      // Only warn if it looks like a statement
      if(trimmed.match(/^(int|float|double|char|void|long|short|unsigned|static|extern|const|volatile|return|break|continue|goto|free|memset|memcpy|printf|scanf)/)) {
        warnings.push('Point-virgule manquant?');
      }
    }
  }

  // 4. Unbalanced parentheses
  var pOpen = (code.match(/\(/g)||[]).length;
  var pClose = (code.match(/\)/g)||[]).length;
  if(pOpen !== pClose) warnings.push('Parenthèses déséquilibrées');

  return {errors:errors, warnings:warnings};
}

function applyValidation(el, block) {
  var result = validateBlock(block);
  var badge = el.querySelector('.block-error-badge');
  if(!badge) {
    badge = document.createElement('div');
    badge.className = 'block-error-badge';
    el.appendChild(badge);
  }
  el.classList.remove('has-error','has-warning');
  if(result.errors.length) {
    el.classList.add('has-error');
    badge.textContent = '⚠ ' + result.errors[0];
    badge.title = result.errors.concat(result.warnings).join('\n');
  } else if(result.warnings.length) {
    el.classList.add('has-warning');
    badge.textContent = '⚠ ' + result.warnings[0];
    badge.title = result.warnings.join('\n');
  }
}

// Hook validation into updateBlockCode
var _origUpdateBlockCode = updateBlockCode;
updateBlockCode = function(el, block) {
  _origUpdateBlockCode(el, block);
  applyValidation(el, block);
};

// ============================================================
// JSON SAVE / LOAD
// ============================================================
function saveJSON() {
  var data = {
    version: 2,
    files: FS.files,
    tabs: S.tabs.map(function(tab){
      return {
        id: tab.id,
        name: tab.name,
        blocks: tab.blocks
      };
    }),
    nextTabId: S.nextTabId,
    nextBlockId: S.nextBlockId,
  };
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  // Name based on project
  var name = FS.files[0] ? FS.files[0].name.replace(/\.[^.]+$/, '') : 'projet';
  a.download = name + '_cbuilder.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Projet sauvegardé !', 'success');
}

function loadJSON(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      if(!data.tabs || !data.version) throw new Error('Format invalide');

      // Restore state
      S.tabs = data.tabs;
      S.nextTabId = data.nextTabId || (S.tabs.length + 1);
      S.nextBlockId = data.nextBlockId || 100;
      S.activeTab = S.tabs[0].id;
      S.selected = null;

      // Restore file tree
      if(data.files) {
        FS.files = data.files;
      } else {
        // Build from tabs
        FS.files = S.tabs.map(function(t){
          return {id:t.id, name:t.name, type:getFileType(t.name)};
        });
      }

      renderFileTree();
      renderTabs();
      renderCanvas();
      renderCode();
      renderSidebar();
      toast('Projet chargé : ' + S.tabs.length + ' fichier(s)', 'success');
    } catch(err) {
      toast('Erreur: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

document.getElementById('btn-save-json').addEventListener('click', saveJSON);
document.getElementById('btn-load-json').addEventListener('click', function(){
  document.getElementById('input-load-json').click();
});
document.getElementById('input-load-json').addEventListener('change', function(e){
  if(e.target.files[0]) loadJSON(e.target.files[0]);
  e.target.value = '';
});

// ============================================================
// PATCH switchTab to update file tree
// ============================================================
var _origSwitchTab = switchTab;
switchTab = function(id) {
  _origSwitchTab(id);
  renderFileTree();
  renderSidebar(); // context-aware
};


