// ============================================================
//  C BUILDER ENGINE — Core (language-agnostic)
//  Load order: plugin-api.js → plugins → engine.js → extensions.js → boot.js
// ============================================================

// ============================================================
// UTILS
// ============================================================
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// ============================================================
// HIGHLIGHT
// ============================================================
// Legacy fallback (overridden by plugins)
var KW=new Set(['auto','break','case','char','const','continue','default','do','double','else','enum','extern','float','for','goto','if','inline','int','long','register','restrict','return','short','signed','sizeof','static','struct','switch','typedef','union','unsigned','void','volatile','while']);
var TY=new Set(['int','float','double','char','void','long','short','unsigned','signed','size_t','uint8_t','uint16_t','uint32_t','uint64_t','int8_t','int16_t','int32_t','int64_t','bool','FILE','NULL','true','false','ptrdiff_t']);
var STD=new Set(['printf','fprintf','sprintf','snprintf','scanf','fscanf','malloc','calloc','realloc','free','memcpy','memmove','memset','strlen','strcpy','strcat','strcmp','fopen','fclose','fread','fwrite','fgets','fputs','exit','abort','atoi','atof','rand','srand','getchar','putchar']);
function hlC(code){
  if(!code)return'';
  return code.split('\n').map(function(line){
    if(/^\s*#/.test(line))return'<span class="cp">'+escH(line)+'</span>';
    var ci=-1;
    for(var i=0;i<line.length-1;i++){if(line[i]==='/'&&line[i+1]==='/'){ci=i;break;}}
    var co=ci>=0?line.slice(0,ci):line;
    var cm=ci>=0?'<span class="cc">'+escH(line.slice(ci))+'</span>':'';
    return tok(co)+cm;
  }).join('\n');
}
function tok(code){
  var r='',i=0;
  while(i<code.length){
    if(code[i]==='"'){var j=i+1;while(j<code.length&&!(code[j]==='"'&&code[j-1]!=='\\'))j++;r+='<span class="cs">'+escH(code.slice(i,j+1))+'</span>';i=j+1;continue;}
    if(code[i]==="'"&&i+2<code.length){var j=i+1;while(j<code.length&&!(code[j]==="'"&&code[j-1]!=='\\'))j++;r+='<span class="cs">'+escH(code.slice(i,j+1))+'</span>';i=j+1;continue;}
    if(/[0-9]/.test(code[i])){var j=i+1;while(j<code.length&&/[0-9a-fA-FxXuUlLfF.]/.test(code[j]))j++;r+='<span class="cn">'+escH(code.slice(i,j))+'</span>';i=j;continue;}
    if(/[a-zA-Z_]/.test(code[i])){
      var j=i+1;while(j<code.length&&/[a-zA-Z0-9_]/.test(code[j]))j++;
      var w=code.slice(i,j);var isFn=code.slice(j).trimStart().startsWith('(');
      if(TY.has(w))r+='<span class="ct">'+escH(w)+'</span>';
      else if(KW.has(w))r+='<span class="ck">'+escH(w)+'</span>';
      else if(isFn||STD.has(w))r+='<span class="cf">'+escH(w)+'</span>';
      else if(/^[A-Z_][A-Z0-9_]+$/.test(w))r+='<span class="cm">'+escH(w)+'</span>';
      else r+=escH(w);
      i=j;continue;
    }
    r+=escH(code[i]);i++;
  }
  return r;
}

// ============================================================
// STATE
// ============================================================
var S={
  tabs:[{id:'tab_1',name:'main.c',blocks:[]}],
  activeTab:'tab_1',
  nextTabId:2,
  nextBlockId:1,
  selected:null,
  sidebarDrag:null,
  // Viewport
  zoom:1,
  panX:40,
  panY:40,
  isPanning:false,
  panStart:{x:0,y:0},
  panOrigin:{x:0,y:0},
  // Block drag
  blockDrag:null, // {block, el, offsetX, offsetY, followers:[{block,el,origY}]}
};

// Snap settings
var SNAP_DIST = 50;   // pixels in world space to trigger snap
var BLOCK_H_APPROX = 130; // approximate block height for snap target calc
var BLOCK_GAP = 16;   // gap between snapped blocks

function getTab(){return S.tabs.find(function(t){return t.id===S.activeTab;})}

// ============================================================
// DOM REFS
// ============================================================
var tabsBarEl      = document.getElementById('tabs-bar');
var canvasEl       = document.getElementById('canvas');
var worldEl        = document.getElementById('world');
var canvasEmptyEl  = document.getElementById('canvas-empty');
var snapGuideEl    = document.getElementById('snap-guide');
var sidebarContentEl = document.getElementById('sidebar-content');
var searchInputEl  = document.getElementById('search-input');
var codeContentEl  = document.getElementById('code-content');
var codeFilenameEl = document.getElementById('code-filename');
var toastContainerEl = document.getElementById('toast-container');
var dragGhostEl    = document.getElementById('drag-ghost');
var zoomLabelEl    = document.getElementById('zoom-label');

// ============================================================
// TOAST
// ============================================================
function toast(msg,type){
  var t=document.createElement('div');
  t.className='toast '+(type||'');
  t.textContent=(type==='success'?'✓ ':type==='error'?'✕ ':type==='warn'?'⚠ ':'')+msg;
  toastContainerEl.appendChild(t);
  setTimeout(function(){t.remove();},2300);
}

// ============================================================
// VIEWPORT — zoom & pan
// ============================================================
function applyViewport(){
  worldEl.style.transform='translate('+S.panX+'px,'+S.panY+'px) scale('+S.zoom+')';
  zoomLabelEl.textContent=Math.round(S.zoom*100)+'%';
  // Update grid background scale
  var gs=24*S.zoom;
  canvasEl.style.backgroundSize='auto,'+gs+'px '+gs+'px,'+gs+'px '+gs+'px';
}

function setZoom(z,cx,cy){
  var oldZoom=S.zoom;
  S.zoom=Math.min(2.5,Math.max(0.2,z));
  if(cx!==undefined&&cy!==undefined){
    // Zoom centered on canvas point (cx,cy)
    S.panX=cx-(cx-S.panX)*(S.zoom/oldZoom);
    S.panY=cy-(cy-S.panY)*(S.zoom/oldZoom);
  }
  applyViewport();
}

// Mouse wheel zoom
canvasEl.addEventListener('wheel',function(e){
  e.preventDefault();
  var rect=canvasEl.getBoundingClientRect();
  var cx=e.clientX-rect.left;
  var cy=e.clientY-rect.top;
  var delta=e.deltaY>0?-0.1:0.1;
  setZoom(S.zoom+delta,cx,cy);
},{passive:false});

// CLIC DROIT = pan (prevent browser context menu everywhere)
document.addEventListener('contextmenu',function(e){e.preventDefault();});
canvasEl.addEventListener('mousedown',function(e){
  if(e.button===2){
    e.preventDefault();
    S.isPanning=true;
    S.panStart={x:e.clientX,y:e.clientY};
    S.panOrigin={x:S.panX,y:S.panY};
    canvasEl.classList.add('panning');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT')return;
  if((e.key==='Delete'||e.key==='Backspace')&&S.selected)deleteBlock(S.selected);
  if(e.ctrlKey&&e.key==='d'&&S.selected){e.preventDefault();dupBlock(S.selected);}
  if(e.ctrlKey&&e.key==='c'){e.preventDefault();copyCode();}
  if(e.key==='0'&&e.ctrlKey){e.preventDefault();resetZoom();}
});

document.addEventListener('mousemove',function(e){
  if(S.isPanning){
    S.panX=S.panOrigin.x+(e.clientX-S.panStart.x);
    S.panY=S.panOrigin.y+(e.clientY-S.panStart.y);
    applyViewport();
  }
  if(S.blockDrag)onBlockDragMove(e);
});
document.addEventListener('mouseup',function(e){
  if(e.button===2&&S.isPanning){
    S.isPanning=false;
    canvasEl.classList.remove('panning');
  }
  if(e.button===0&&S.blockDrag)onBlockDragEnd(e);
});

function resetZoom(){
  S.zoom=1;S.panX=40;S.panY=40;
  applyViewport();
}

document.getElementById('btn-zoom-in').addEventListener('click',function(){setZoom(S.zoom+0.15);});
document.getElementById('btn-zoom-out').addEventListener('click',function(){setZoom(S.zoom-0.15);});
document.getElementById('btn-zoom-reset').addEventListener('click',resetZoom);
zoomLabelEl.addEventListener('click',resetZoom);

// Convert screen coords to world coords
function screenToWorld(sx,sy){
  var rect=canvasEl.getBoundingClientRect();
  return {
    x:(sx-rect.left-S.panX)/S.zoom,
    y:(sy-rect.top-S.panY)/S.zoom
  };
}

// ============================================================
// SNAP LOGIC
// ============================================================
// Get ordered blocks by Y position
function getOrderedBlocks(){
  var tab=getTab();if(!tab)return[];
  return tab.blocks.slice().sort(function(a,b){return a.y-b.y;});
}

// Find snap target: returns {targetBlock, snapY} or null
function findSnap(draggingBlock, proposedX, proposedY){
  var tab=getTab();if(!tab)return null;
  var others=tab.blocks.filter(function(b){return b.id!==draggingBlock.id;});
  var best=null,bestDist=Infinity;
  others.forEach(function(b){
    // Get real block element height
    var el=worldEl.querySelector('.canvas-block[data-bid="'+b.id+'"]');
    var bh=el?el.offsetHeight:BLOCK_H_APPROX;
    // Snap point: just below block b
    var snapY=b.y+bh+BLOCK_GAP;
    var dist=Math.abs(proposedY-snapY)+Math.abs(proposedX-b.x)*0.3;
    var yDist=Math.abs(proposedY-snapY);
    if(yDist<SNAP_DIST&&dist<bestDist){
      bestDist=dist;
      best={targetBlock:b,snapY:snapY,snapX:b.x};
    }
  });
  return best;
}

// Show snap guide at world Y
function showSnapGuide(worldY, targetBlock){
  // Convert world Y to canvas Y
  var canvasY=worldY*S.zoom+S.panY;
  snapGuideEl.style.top=canvasY+'px';
  snapGuideEl.classList.add('visible');
  // Highlight target block
  worldEl.querySelectorAll('.canvas-block').forEach(function(el){el.classList.remove('snap-target');});
  if(targetBlock){
    var tEl=worldEl.querySelector('.canvas-block[data-bid="'+targetBlock.id+'"]');
    if(tEl)tEl.classList.add('snap-target');
  }
}
function hideSnapGuide(){
  snapGuideEl.classList.remove('visible');
  worldEl.querySelectorAll('.canvas-block.snap-target').forEach(function(el){el.classList.remove('snap-target');});
}

// ============================================================
// CODE GENERATION
// ============================================================
function renderTpl(tpl,fieldDefs,fields){
  var r=tpl;
  (fieldDefs||[]).forEach(function(fd){
    var v=fields&&fields[fd.id]!==undefined?fields[fd.id]:fd.d;
    r=r.split('{'+fd.id+'}').join(v);
  });
  return r;
}
function genBlockCode(block){
  var tpl=renderTpl(block.tpl,block.fieldDefs,block.fields);
  if(block.isContainer){
    var inner='';
    (block.children||[]).forEach(function(ch){
      var chCode=renderTpl(ch.tpl,ch.fieldDefs,ch.fields);
      inner+='\n    '+chCode.split('\n').join('\n    ');
    });
    return tpl+inner+'\n'+(block.tplClose||'}');
  }
  return tpl;
}
function renderCode(){
  var tab=getTab();
  codeFilenameEl.textContent=tab?tab.name:'main.c';
  var ordered=getOrderedBlocks();
  if(!ordered.length){
    codeContentEl.innerHTML='<span style="color:var(--text-dim)">// Glissez des blocs sur le canvas\n// pour générer du code C</span>';
    codeContentEl.classList.remove('has-code');return;
  }
  codeContentEl.classList.add('has-code');
  var lines=['// généré automatiquement (ordre haut → bas)',''];
  ordered.forEach(function(b){lines.push(genBlockCode(b));lines.push('');});
  var _hl=getHighlighter(tab?tab.name:'main.c');codeContentEl.innerHTML=_hl(lines.join('\n'));
}
function buildCodeText(){
  var tab=getTab();var ordered=getOrderedBlocks();
  if(!ordered.length)return null;
  var lines=['// généré automatiquement (ordre haut → bas)',''];
  ordered.forEach(function(b){lines.push(genBlockCode(b));lines.push('');});
  return lines.join('\n');
}

// ============================================================
// CANVAS RENDER
// ============================================================
function renderCanvas(){
  worldEl.innerHTML='';
  var tab=getTab();
  if(!tab||!tab.blocks.length){canvasEmptyEl.classList.remove('hidden');return;}
  canvasEmptyEl.classList.add('hidden');
  var ordered=getOrderedBlocks();
  ordered.forEach(function(b,i){
    var el=makeBlockEl(b,i);
    worldEl.appendChild(el);
    if(i===0)el.classList.add('first-block');
  });
  applyViewport();
}

function makeBlockEl(block,idx){
  var el=document.createElement('div');
  el.className='canvas-block'+(block.isContainer?' is-container':'');
  el.dataset.bid=block.id;
  el.style.left=block.x+'px';
  el.style.top=block.y+'px';
  if(S.selected===block.id)el.classList.add('selected');
  var cat=BLOCKS[block.catKey]||{};
  var color=cat.color||'#8892a4';

  // Order badge
  var badge=document.createElement('div');
  badge.className='order-badge';badge.textContent=idx+1;
  el.appendChild(badge);

  // Header
  var hdr=document.createElement('div');hdr.className='bhead';
  hdr.innerHTML='<div class="bdot" style="background:'+color+';box-shadow:0 0 6px '+color+'44"></div>'
    +'<span class="btitle" style="color:'+color+'">'+escH(block.name)+'</span>'
    +'<div class="bactions">'
    +'<button class="bbtn" data-action="dup" title="Dupliquer (Ctrl+D)">⧉</button>'
    +'<button class="bbtn del" data-action="del" title="Supprimer (Suppr)">✕</button>'
    +'</div>';
  el.appendChild(hdr);

  // Body
  var body=document.createElement('div');body.className='bbody';
  // Fields
  if(block.fieldDefs&&block.fieldDefs.length){
    var flds=document.createElement('div');flds.className='bfields';
    block.fieldDefs.forEach(function(fd){
      var row=document.createElement('div');row.className='bfield';
      var val=block.fields&&block.fields[fd.id]!==undefined?block.fields[fd.id]:fd.d;
      row.innerHTML='<label>'+escH(fd.l)+'</label><input type="text" data-field="'+fd.id+'" value="'+escH(val)+'" placeholder="'+escH(fd.d)+'"/>';
      flds.appendChild(row);
    });
    body.appendChild(flds);
    flds.querySelectorAll('input').forEach(function(inp){
      inp.addEventListener('input',function(){
        block.fields[inp.dataset.field]=inp.value;
        updateBlockCode(el,block);renderCode();
      });
      inp.addEventListener('click',function(e){e.stopPropagation();});
      inp.addEventListener('mousedown',function(e){e.stopPropagation();});
    });
  }
  // Code preview
  var cpre=document.createElement('div');cpre.className='bcode';
  body.appendChild(cpre);
  el.appendChild(body);

  // Container zone
  if(block.isContainer){
    var clabel=document.createElement('div');
    clabel.className='container-label';
    clabel.textContent='⊞ glissez des blocs ici';
    el.appendChild(clabel);
    var zone=document.createElement('div');
    zone.className='block-children';
    zone.dataset.parentId=block.id;
    rebuildChildZone(zone,block);
    el.appendChild(zone);
    zone.addEventListener('dragover',function(e){e.preventDefault();e.stopPropagation();zone.classList.add('drop-target');});
    zone.addEventListener('dragleave',function(){zone.classList.remove('drop-target');});
    zone.addEventListener('drop',function(e){
      e.preventDefault();e.stopPropagation();zone.classList.remove('drop-target');
      if(!S.sidebarDrag)return;
      var bd=S.sidebarDrag.blockDef;
      if(bd.isContainer){toast('Pas de conteneur dans un conteneur','error');return;}
      if(!block.children)block.children=[];
      var cf={};(bd.fields||[]).forEach(function(fd){cf[fd.id]=fd.d;});
      block.children.push({id:'ch_'+(S.nextBlockId++),name:bd.name,tpl:bd.tpl,fieldDefs:bd.fields||[],fields:cf,color:BLOCKS[S.sidebarDrag.catKey]?BLOCKS[S.sidebarDrag.catKey].color:'#8892a4'});
      rebuildChildZone(zone,block);
      updateBlockCode(el,block);renderCode();
      toast('"'+bd.name+'" ajouté','success');
    });
  }

  updateBlockCode(el,block);

  // Actions
  hdr.querySelectorAll('[data-action]').forEach(function(btn){
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      if(btn.dataset.action==='del')deleteBlock(block.id);
      if(btn.dataset.action==='dup')dupBlock(block.id);
    });
  });

  // Select
  el.addEventListener('click',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;
    selectBlock(block.id,el);
  });

  // Drag to move (only when not panning)
  el.addEventListener('mousedown',function(e){
    if(e.button!==0)return;
    if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;
    startBlockDrag(e,block,el);
  });

  return el;
}

// ============================================================
// CHILD BLOCKS
// ============================================================
function rebuildChildZone(zone,parentBlock){
  zone.innerHTML='';
  (parentBlock.children||[]).forEach(function(ch,ci){
    zone.appendChild(makeChildEl(parentBlock,ch,ci,zone));
  });
}
function makeChildEl(parentBlock,ch,ci,zone){
  var el=document.createElement('div');el.className='child-block';
  var hdr=document.createElement('div');hdr.className='child-block-header';
  hdr.innerHTML='<div class="child-dot" style="background:'+escH(ch.color||'#8892a4')+'"></div>'
    +'<span class="child-name">'+escH(ch.name)+'</span>'
    +'<div class="child-actions">'
    +'<button class="child-btn eject" title="Éjecter vers le canvas">↑</button>'
    +'<button class="child-btn rem" title="Supprimer">✕</button>'
    +'</div>';
  el.appendChild(hdr);
  if(ch.fieldDefs&&ch.fieldDefs.length){
    var flds=document.createElement('div');flds.className='child-fields';
    ch.fieldDefs.forEach(function(fd){
      var row=document.createElement('div');row.className='child-field';
      var val=ch.fields&&ch.fields[fd.id]!==undefined?ch.fields[fd.id]:fd.d;
      row.innerHTML='<label>'+escH(fd.l)+'</label><input type="text" data-field="'+fd.id+'" value="'+escH(val)+'" placeholder="'+escH(fd.d)+'"/>';
      flds.appendChild(row);
    });
    el.appendChild(flds);
    flds.querySelectorAll('input').forEach(function(inp){
      inp.addEventListener('input',function(){
        ch.fields[inp.dataset.field]=inp.value;
        updateChildCode(el,ch);
        var parentEl=worldEl.querySelector('.canvas-block[data-bid="'+parentBlock.id+'"]');
        if(parentEl)updateBlockCode(parentEl,parentBlock);
        renderCode();
      });
      inp.addEventListener('click',function(e){e.stopPropagation();});
      inp.addEventListener('mousedown',function(e){e.stopPropagation();});
    });
  }
  var cpre=document.createElement('div');cpre.className='child-code';
  el.appendChild(cpre);
  updateChildCode(el,ch);
  hdr.querySelector('.child-btn.eject').addEventListener('click',function(e){
    e.stopPropagation();ejectChild(parentBlock,ci,zone);
  });
  hdr.querySelector('.child-btn.rem').addEventListener('click',function(e){
    e.stopPropagation();
    parentBlock.children.splice(ci,1);
    rebuildChildZone(zone,parentBlock);
    var parentEl=worldEl.querySelector('.canvas-block[data-bid="'+parentBlock.id+'"]');
    if(parentEl)updateBlockCode(parentEl,parentBlock);
    renderCode();
  });
  return el;
}
function updateChildCode(childEl,ch){
  var cpre=childEl.querySelector('.child-code');
  if(cpre)var _hl3=getHighlighter(getTab()?getTab().name:'main.c');cpre.innerHTML=_hl3(renderTpl(ch.tpl,ch.fieldDefs,ch.fields));
}
function ejectChild(parentBlock,ci,zone){
  var tab=getTab();
  var ch=parentBlock.children[ci];if(!ch)return;
  parentBlock.children.splice(ci,1);
  // Place ejected block below the entire stack
  var ordered=getOrderedBlocks();
  var lastB=ordered.length?ordered[ordered.length-1]:parentBlock;
  var lastEl=worldEl.querySelector('.canvas-block[data-bid="'+lastB.id+'"]');
  var lastH=lastEl?lastEl.offsetHeight:120;
  var px=parentBlock.x, py=lastB.y+lastH+BLOCK_GAP;
  var catKey=null,bd=null;
  Object.entries(BLOCKS).forEach(function(kv){
    var found=kv[1].blocks.find(function(b){return b.name===ch.name||b.id===ch.blockDefId;});
    if(found){catKey=kv[0];bd=found;}
  });
  var newBlock;
  if(bd){
    newBlock={id:'b_'+(S.nextBlockId++),blockDefId:bd.id,name:bd.name,catKey:catKey,isContainer:false,tpl:bd.tpl,tplClose:'',fieldDefs:bd.fields||[],fields:Object.assign({},ch.fields),children:[],x:px,y:py};
  } else {
    newBlock={id:'b_'+(S.nextBlockId++),blockDefId:'ejected',name:ch.name,catKey:'operators',isContainer:false,tpl:ch.tpl,tplClose:'',fieldDefs:ch.fieldDefs||[],fields:Object.assign({},ch.fields),children:[],x:px,y:py};
  }
  tab.blocks.push(newBlock);
  rebuildChildZone(zone,parentBlock);
  var parentEl=worldEl.querySelector('.canvas-block[data-bid="'+parentBlock.id+'"]');
  if(parentEl)updateBlockCode(parentEl,parentBlock);
  renderCanvas();renderCode();
  toast('"'+ch.name+'" éjecté','success');
}
function updateBlockCode(el,block){
  var cpre=el.querySelector(':scope > .bbody > .bcode');
  if(cpre)var _hl2=getHighlighter(getTab()?getTab().name:'main.c');cpre.innerHTML=_hl2(genBlockCode(block));
}

// ============================================================
// BLOCK DRAG — déplace le bloc + tous les blocs en dessous
// ============================================================
function startBlockDrag(e,block,el){
  e.preventDefault();e.stopPropagation();
  selectBlock(block.id,el);
  var w=screenToWorld(e.clientX,e.clientY);

  // Find all followers = blocks with Y > this block's Y, sorted by Y
  var tab=getTab();
  var curY=block.y; // snapshot current Y before any move
  var followers=tab.blocks
    .filter(function(b){ return b.id!==block.id && b.y>curY; })
    .sort(function(a,b){ return a.y-b.y; })
    .map(function(b){
      var bEl=worldEl.querySelector('.canvas-block[data-bid="'+b.id+'"]');
      return {block:b, el:bEl, origX:b.x, origY:b.y}; // snapshot at drag START
    });

  S.blockDrag={
    block:block, el:el,
    origX:block.x, origY:curY,   // snapshot
    offsetX:w.x-block.x, offsetY:w.y-block.y,
    followers:followers,
    snapTarget:null
  };
  el.classList.add('dragging');
  el.style.zIndex=100;
  // Mark followers visually
  followers.forEach(function(f){ if(f.el){ f.el.classList.add('dragging'); f.el.style.zIndex=99; } });
}

function onBlockDragMove(e){
  var d=S.blockDrag;if(!d)return;
  var w=screenToWorld(e.clientX,e.clientY);
  var nx=w.x-d.offsetX;
  var ny=w.y-d.offsetY;
  var dY=ny-d.origY;  // vertical delta
  var dX=nx-d.origX;  // horizontal delta (only for dragged block)

  // Check snap (only for the block itself, ignoring followers)
  var snap=findSnap(d.block,nx,ny);
  if(snap){
    d.snapTarget=snap;
    showSnapGuide(snap.snapY, snap.targetBlock);
  } else {
    d.snapTarget=null;
    hideSnapGuide();
  }

  // Move dragged block
  d.block.x=nx; d.block.y=ny;
  d.el.style.left=nx+'px'; d.el.style.top=ny+'px';

  // Move all followers by the same dX and dY
  d.followers.forEach(function(f){
    var fx=f.origX+dX;
    var fy=f.origY+dY;
    f.block.x=fx; f.block.y=fy;
    if(f.el){ f.el.style.left=fx+'px'; f.el.style.top=fy+'px'; }
  });
}

function onBlockDragEnd(e){
  var d=S.blockDrag;if(!d)return;

  // Cleanup dragging class
  d.el.classList.remove('dragging'); d.el.style.zIndex='';
  d.followers.forEach(function(f){ if(f.el){ f.el.classList.remove('dragging'); f.el.style.zIndex=''; } });
  hideSnapGuide();

  // Apply snap to dragged block (followers adjust accordingly)
  if(d.snapTarget){
    var snapDY=d.snapTarget.snapY-d.block.y;
    d.block.x=d.snapTarget.snapX;
    d.block.y=d.snapTarget.snapY;
    d.el.classList.add('snapping');
    d.el.style.left=d.block.x+'px';
    d.el.style.top=d.block.y+'px';
    // Apply same snap delta to followers
    d.followers.forEach(function(f){
      f.block.y+=snapDY;
      if(f.el){ f.el.classList.add('snapping'); f.el.style.top=f.block.y+'px'; }
      setTimeout(function(){ if(f.el)f.el.classList.remove('snapping'); },200);
    });
    setTimeout(function(){ d.el.classList.remove('snapping'); },200);
  }

  // Commit final positions — origY no longer needed but clear state
  S.blockDrag=null;
  renderCanvas();
  renderCode();
}

// ============================================================
// BLOCK OPERATIONS
// ============================================================
function selectBlock(id,el){
  worldEl.querySelectorAll('.canvas-block.selected').forEach(function(b){b.classList.remove('selected');});
  S.selected=id;el.classList.add('selected');
}
function deleteBlock(id){
  var tab=getTab();
  tab.blocks=tab.blocks.filter(function(b){return b.id!==id;});
  if(S.selected===id)S.selected=null;
  renderCanvas();renderCode();
}
function dupBlock(id){
  var tab=getTab();
  var orig=tab.blocks.find(function(b){return b.id===id;});if(!orig)return;
  var copy=JSON.parse(JSON.stringify(orig));
  copy.id='b_'+(S.nextBlockId++);
  copy.x+=30;copy.y+=30;
  (copy.children||[]).forEach(function(ch){ch.id='ch_'+(S.nextBlockId++);});
  tab.blocks.push(copy);
  renderCanvas();renderCode();toast('Bloc dupliqué','success');
}
function addBlock(bd,catKey,wx,wy){
  var tab=getTab();
  var fields={};(bd.fields||[]).forEach(function(fd){fields[fd.id]=fd.d;});
  var block={
    id:'b_'+(S.nextBlockId++),blockDefId:bd.id,name:bd.name,catKey:catKey,
    isContainer:!!bd.isContainer,tpl:bd.tpl,tplClose:bd.tplClose||'}',
    fieldDefs:bd.fields||[],fields:fields,children:[],
    x:Math.max(0,wx),y:Math.max(0,wy)
  };
  tab.blocks.push(block);
  canvasEmptyEl.classList.add('hidden');
  // Auto-snap if near another block (before rendering)
  var snap=findSnap(block,block.x,block.y);
  if(snap){block.x=snap.snapX;block.y=snap.snapY;}
  renderCanvas();   // single render pass
  renderCode();
  // Select the new block
  var newEl=worldEl.querySelector('.canvas-block[data-bid="'+block.id+'"]');
  if(newEl)selectBlock(block.id,newEl);
  toast('"'+block.name+'" ajouté','success');
}
function clearCanvas(){
  getTab().blocks=[];S.selected=null;
  renderCanvas();renderCode();toast('Canvas vidé','success');
}

// ============================================================
// CANVAS DROP (sidebar → canvas)
// ============================================================
canvasEl.addEventListener('dragover',function(e){
  e.preventDefault();
  canvasEl.style.outline='2px dashed rgba(74,158,255,0.3)';
  canvasEl.style.outlineOffset='-4px';
});
canvasEl.addEventListener('dragleave',function(e){
  if(!canvasEl.contains(e.relatedTarget)){
    canvasEl.style.outline='';
  }
});
canvasEl.addEventListener('drop',function(e){
  e.preventDefault();
  canvasEl.style.outline='';
  if(!S.sidebarDrag)return;
  var w=screenToWorld(e.clientX,e.clientY);
  addBlock(S.sidebarDrag.blockDef,S.sidebarDrag.catKey,w.x-140,w.y-30);
  S.sidebarDrag=null;
});

// Deselect on canvas background click
canvasEl.addEventListener('click',function(e){
  if(e.target===canvasEl||e.target===worldEl){
    worldEl.querySelectorAll('.canvas-block.selected').forEach(function(b){b.classList.remove('selected');});
    S.selected=null;
  }
});

// ============================================================
// SIDEBAR
// ============================================================
function renderSidebar(filter){
  sidebarContentEl.innerHTML='';
  var fl=(filter||'').toLowerCase();
  Object.entries(BLOCKS).forEach(function(kv){
    var catKey=kv[0],cat=kv[1];
    var visible=fl?cat.blocks.filter(function(b){return b.name.toLowerCase().includes(fl)||b.preview.toLowerCase().includes(fl);}):cat.blocks;
    if(!visible.length)return;
    var catEl=document.createElement('div');catEl.className='category';
    var hdr=document.createElement('div');hdr.className='cat-header';
    hdr.innerHTML='<div class="cat-icon" style="background:'+cat.color+'22;color:'+cat.color+';border:1px solid '+cat.color+'44">'+escH(cat.icon)+'</div>'
      +'<span class="cat-label">'+escH(cat.label)+'</span>'
      +'<span class="cat-count">'+visible.length+'</span>'
      +'<span class="cat-chev">▾</span>';
    hdr.addEventListener('click',function(){catEl.classList.toggle('collapsed');});
    var blocksEl=document.createElement('div');blocksEl.className='category-blocks';
    visible.forEach(function(bd){
      var item=document.createElement('div');
      item.className='block-item'+(bd.isContainer?' is-container':'');
      item.dataset.bid=bd.id;
      item.innerHTML='<style>.block-item[data-bid="'+bd.id+'"]::before{background:'+cat.color+'}</style>'
        +'<span class="bin">'+escH(bd.name)+'</span>'
        +'<span class="bip">'+escH(bd.preview)+'</span>';
      item.setAttribute('draggable','true');
      item.title=(bd.isContainer?'⊞ Conteneur\n':'')+bd.preview;
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
        // Add near bottom of existing stack or at center
        var tab=getTab();
        var ordered=getOrderedBlocks();
        var wx,wy;
        if(ordered.length){
          var last=ordered[ordered.length-1];
          var lastEl=worldEl.querySelector('.canvas-block[data-bid="'+last.id+'"]');
          var lh=lastEl?lastEl.offsetHeight:BLOCK_H_APPROX;
          wx=last.x; wy=last.y+lh+BLOCK_GAP;
        } else {
          // Place at visible center of canvas
          var cr=canvasEl.getBoundingClientRect();
          var cw=screenToWorld(cr.left+cr.width/2, cr.top+cr.height/3);
          wx=cw.x-140; wy=cw.y;
        }
        addBlock(bd,catKey,wx,wy);
      });
      blocksEl.appendChild(item);
    });
    catEl.appendChild(hdr);catEl.appendChild(blocksEl);
    sidebarContentEl.appendChild(catEl);
  });
}
searchInputEl.addEventListener('input',function(e){renderSidebar(e.target.value);});

// ============================================================
// TABS
// ============================================================
function renderTabs(){
  tabsBarEl.innerHTML='';
  S.tabs.forEach(function(tab){
    var el=document.createElement('div');
    el.className='tab'+(tab.id===S.activeTab?' active':'');
    el.innerHTML='<span>'+escH(tab.name)+'</span>'+(S.tabs.length>1?'<span class="tab-x" data-close="'+tab.id+'">✕</span>':'');
    el.addEventListener('click',function(e){
      if(e.target.dataset.close){closeTab(e.target.dataset.close);return;}
      switchTab(tab.id);
    });
    tabsBarEl.appendChild(el);
  });
  var add=document.createElement('button');add.className='tab-add';add.textContent='+';add.title='Nouveau fichier';
  add.addEventListener('click',function(){
    var id='tab_'+S.nextTabId++;
    S.tabs.push({id:id,name:'file_'+S.tabs.length+'.c',blocks:[]});
    switchTab(id);
  });
  tabsBarEl.appendChild(add);
}
function switchTab(id){S.activeTab=id;S.selected=null;renderTabs();renderCanvas();renderCode();}
function closeTab(id){
  if(S.tabs.length<=1)return;
  var idx=S.tabs.findIndex(function(t){return t.id===id;});
  S.tabs.splice(idx,1);
  if(S.activeTab===id)S.activeTab=S.tabs[Math.max(0,idx-1)].id;
  renderTabs();renderCanvas();renderCode();
}

// ============================================================
// EXAMPLE
// ============================================================
function loadExample(){
  var tab=getTab();tab.blocks=[];
  var Y=20;
  function makeBlock(ck,id,fields,extraChildren){
    var cat=BLOCKS[ck];if(!cat)return null;
    var bd=cat.blocks.find(function(b){return b.id===id;});if(!bd)return null;
    var f={};(bd.fields||[]).forEach(function(fd){f[fd.id]=fd.d;});
    Object.assign(f,fields||{});
    return {
      id:'b_'+(S.nextBlockId++),blockDefId:bd.id,name:bd.name,catKey:ck,
      isContainer:!!bd.isContainer,tpl:bd.tpl,tplClose:bd.tplClose||'}',
      fieldDefs:bd.fields||[],fields:f,
      children:(extraChildren||[]).map(function(ch){return Object.assign({id:'ch_'+(S.nextBlockId++)},ch);}),
      x:60,y:Y
    };
  }
  var ch=function(name,tpl,fieldDefs,fields,color){
    return {name:name,tpl:tpl,fieldDefs:fieldDefs||[],fields:fields||{},color:color||'#8892a4'};
  };

  var blocks=[
    makeBlock('preprocessor','pragma_once',{}),
    makeBlock('preprocessor','inc_sys',{h:'stdio.h'}),
    makeBlock('preprocessor','inc_sys',{h:'stdlib.h'}),
    makeBlock('preprocessor','def_const',{name:'MAX',val:'100'}),
    makeBlock('structs','typedef_struct',{name:'Point',t1:'float',f1:'x',t2:'float',f2:'y'}),
    makeBlock('control','func_body',{ret:'float',name:'add',params:'float a, float b'},[
      ch('return','return {val};',[{id:'val',l:'Valeur',d:'0'}],{val:'a + b'},'#f59e0b'),
    ]),
    makeBlock('control','func_main',{},[
      ch('float','float {name} = {val}f;',[{id:'name',l:'Nom',d:'a'},{id:'val',l:'Valeur',d:'0.0'}],{name:'a',val:'3.0'},'#4a9eff'),
      ch('float','float {name} = {val}f;',[{id:'name',l:'Nom',d:'b'},{id:'val',l:'Valeur',d:'0.0'}],{name:'b',val:'2.0'},'#4a9eff'),
      ch('printf','printf("{fmt}\\n", {var});',[{id:'fmt',l:'Format',d:'%f'},{id:'var',l:'Var',d:'x'}],{fmt:'Résultat: %.2f',var:'add(a, b)'},'#84cc16'),
    ]),
  ];

  // Stack blocks vertically with proper spacing
  blocks.forEach(function(b,i){
    if(!b)return;
    // Set Y after previous block height estimate
    if(i>0){
      var prev=blocks[i-1];if(!prev)return;
      var childCount=(prev.children||[]).length;
      var estimatedH=80+(prev.fieldDefs&&prev.fieldDefs.length?prev.fieldDefs.length*22:0)+(childCount*55)+(prev.isContainer?30:0);
      b.y=prev.y+estimatedH+BLOCK_GAP;
    }
    tab.blocks.push(b);
  });

  renderTabs();renderCanvas();renderCode();toast('Exemple chargé !','success');
}

// ============================================================
// COPY / DOWNLOAD
// ============================================================
function copyCode(){
  var code=buildCodeText();
  if(!code){toast('Aucun code','error');return;}
  navigator.clipboard.writeText(code).then(function(){toast('Code copié !','success');}).catch(function(){toast('Erreur copie','error');});
}

// ============================================================
// RESIZER
// ============================================================
function makeResizer(rEl,getL,getR,minL,minR){
  var drag=false;
  rEl.addEventListener('mousedown',function(){drag=true;document.body.style.cursor='col-resize';document.body.style.userSelect='none';});
  document.addEventListener('mousemove',function(e){
    if(!drag)return;
    var lEl=getL(),rEl2=getR();
    var lW=lEl.offsetWidth+e.movementX,rW=rEl2.offsetWidth-e.movementX;
    if(lW>=minL&&rW>=minR){lEl.style.width=lW+'px';lEl.style.flex='none';rEl2.style.width=rW+'px';rEl2.style.flex='none';}
  });
  document.addEventListener('mouseup',function(){drag=false;document.body.style.cursor='';document.body.style.userSelect='';});
}
makeResizer(document.getElementById('resizer-left'),
  function(){return document.getElementById('sidebar');},
  function(){return document.getElementById('canvas-wrap');},180,300);
makeResizer(document.getElementById('resizer-right'),
  function(){return document.getElementById('canvas-wrap');},
  function(){return document.getElementById('code-panel');},300,220);

// ============================================================
// BUTTONS
// ============================================================
document.getElementById('btn-clear').addEventListener('click',clearCanvas);
document.getElementById('btn-copy').addEventListener('click',copyCode);
document.getElementById('btn-copy-footer').addEventListener('click',copyCode);
document.getElementById('btn-example').addEventListener('click',loadExample);
document.getElementById('btn-download').addEventListener('click',function(){
  var code=buildCodeText();
  if(!code){toast('Aucun code','error');return;}
  var blob=new Blob([code],{type:'text/plain'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;
  a.download=codeFilenameEl.textContent||'main.c';
  a.click();URL.revokeObjectURL(url);
  toast('Téléchargé !','success');
});

