// ============================================================
// shared.js — Sleep In My EV  |  sleepinmyev.com
// Shared UI utilities loaded by every page.
// ============================================================

let sortKey=null,sortDir=1,activeRow=null;

function fitClass(f){return f==='Good'?'fit-good':f==='Fair'?'fit-fair':'fit-poor';}
function rvClass(v){return v<4?'rv-low':v<7?'rv-mid':'rv-high';}

let currentEV='';
function viewFullEVProfile(){
  if(!currentEV) {
    alert('Please select an EV first using the dropdown above.');
    return;
  }
  var url = 'guides.html?ev=' + encodeURIComponent(currentEV);
  try {
    window.location.href = url;
  } catch(e) {
    window.location = url;
  }
}


function renderFitCell(m){
  if(!currentEV) return '<span style="color:var(--text3);font-size:.82rem">Select EV ↑</span>';
  const fit=m[currentEV]||'—';
  return '<span class="fit-badge '+fitClass(fit)+'">'+fit+'</span>';
}

function onEVSelect(val){
  currentEV=val;
  const mini=document.getElementById('ev-mini-profile');
  const clearBtn=document.getElementById('clear-ev-btn');
  const label=document.getElementById('results-ev-label');
  const colHeader=document.getElementById('fit-col-header');
  if(val && typeof evProfiles!=='undefined' && evProfiles[val]){
    const e=evProfiles[val];
    mini.style.display='block';
    clearBtn.style.display='inline-block';
    document.getElementById('mini-dims').textContent=e.L+'" × '+e.W+'"';
    document.getElementById('mini-h').textContent=e.H+'"';
    document.getElementById('mini-flat').textContent=e.flat.replace('✓ ','');
    document.getElementById('mini-camp').textContent=e.camp.replace('✓ ','');
    document.getElementById('mini-mat').textContent=e.maxMat;
    if(label) label.textContent='Showing fit rating for '+e.name+' — click any row for full details';
    if(colHeader) colHeader.textContent=e.name+' Fit';
  } else {
    mini.style.display='none';
    clearBtn.style.display='none';
    if(label) label.textContent='💡 Select your EV above to see fit ratings and filter results';
    if(colHeader) colHeader.textContent='Fits Your EV';
  }
  filterTable();
}

function clearEV(){
  document.getElementById('f-vehicle').value='';
  onEVSelect('');
}

function renderTable(data){
  const tb=document.getElementById('tbody');
  tb.innerHTML=data.map((m)=>`
    <tr onclick="showDetail(${mattresses.indexOf(m)})" style="cursor:pointer">
      <td><div class="product-name">${m.name}</div><div class="product-brand">${m.brand}</div></td>
      <td><span class="type-tag">${m.type}</span></td>
      <td><span class="price-val">$${m.price}</span></td>
      <td><span class="weight-val">${m.weight_lbs} lbs</span></td>
      <td><span class="rval ${rvClass(m.rvalue)}">${m.rvalue}</span></td>
      <td id="fit-cell-${mattresses.indexOf(m)}">${renderFitCell(m)}</td>
      <td style="font-size:.85rem;color:var(--text2)">${m.best_for}</td>
      <td>
        <div class="range-bar-wrap">
          <div class="range-bar"><div class="range-bar-fill" style="width:${Math.min(m.range_impact*200,100)}%"></div></div>
          <span class="range-mini">${m.range_impact}%</span>
        </div>
      </td>
    </tr>`).join('');
  document.getElementById('count').textContent=data.length;
  document.getElementById('total-count').textContent=mattresses.length;
}

function showDetail(idx){
  const m=mattresses[idx];
  const p=document.getElementById('detail-panel');

  // All 23 EV keys and display names
  const evLabels={
    model_y:'Tesla Model Y', model_3:'Tesla Model 3', model_x:'Tesla Model X',
    cybertruck:'Tesla Cybertruck', ioniq5:'Hyundai Ioniq 5', ioniq6:'Hyundai Ioniq 6',
    ev9:'Kia EV9', kia_ev6:'Kia EV6', r1s:'Rivian R1S', r1t:'Rivian R1T',
    rivian_r2:'Rivian R2', id4:'VW ID.4', id_buzz:'VW ID.Buzz LWB',
    id_buzz_tourer:'VW ID.Buzz Tourer', ex40:'Volvo EX40', ix:'BMW iX',
    mach_e:'Ford Mach-E', f150_lightning:'Ford F-150 Lightning',
    bz4x:'Toyota bZ4X', solterra:'Subaru Solterra',
    bolt:'Chevrolet Bolt EV', equinox:'Chevrolet Equinox EV', polestar2:'Polestar 2'
  };

  // Build fit badge HTML strings BEFORE the template literal
  var goodHTML = '';
  var fairHTML = '';
  Object.entries(evLabels).forEach(function(entry){
    var key = entry[0], name = entry[1];
    if(m[key]==='Good'){
      goodHTML += '<span style="display:inline-block;background:var(--success-bg);color:var(--success);border-radius:4px;padding:.2rem .55rem;font-size:.78rem;font-weight:600;margin:.15rem">' + name + '</span>';
    } else if(m[key]==='Fair'){
      fairHTML += '<span style="display:inline-block;background:var(--warn-bg);color:var(--warn);border-radius:4px;padding:.2rem .55rem;font-size:.78rem;font-weight:600;margin:.15rem">' + name + '</span>';
    }
  });

  // Build the fits section HTML as a plain string
  var fitsHTML = '';
  if(!goodHTML && !fairHTML){
    fitsHTML = '<div style="font-size:.85rem;color:var(--text3)">No verified good fits yet — check individual EV profiles.</div>';
  } else {
    if(goodHTML) fitsHTML += '<div style="margin-bottom:.5rem">' + goodHTML + '</div>';
    if(fairHTML) fitsHTML += '<div style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--text3);margin:.5rem 0 .3rem">Fair fit (may need modification)</div>' + fairHTML;
  }

  // Build pros/cons
  var prosHTML = m.pros.split(';').map(function(s){ return '<li>'+s.trim()+'</li>'; }).join('');
  var consHTML = m.cons.split(';').map(function(s){ return '<li>'+s.trim()+'</li>'; }).join('');

  p.innerHTML = `
    <div>
      <h3 style="color:var(--primary);margin-bottom:.25rem;font-family:var(--font-serif)">${m.name}</h3>
      <div style="color:var(--text3);font-size:.85rem;margin-bottom:1rem">${m.brand} · ${m.type} · $${m.price}</div>
      <div class="detail-specs">
        <div>
          <div class="spec-row"><span class="spec-k">Price</span><span class="spec-v">$${m.price}</span></div>
          <div class="spec-row"><span class="spec-k">Weight</span><span class="spec-v">${m.weight_lbs} lbs</span></div>
          <div class="spec-row"><span class="spec-k">R-Value</span><span class="spec-v">${m.rvalue}</span></div>
          <div class="spec-row"><span class="spec-k">Thickness</span><span class="spec-v">${m.thickness_in}"</span></div>
          <div class="spec-row"><span class="spec-k">Dimensions</span><span class="spec-v">${m.dimensions}</span></div>
          <div class="spec-row"><span class="spec-k">Pump incl.</span><span class="spec-v">${m.pump_included?'Yes':'No'}</span></div>
          <div class="spec-row"><span class="spec-k">Inflation</span><span class="spec-v">${m.inflation_time}</span></div>
          <div class="spec-row"><span class="spec-k">Range impact</span><span class="spec-v">${m.range_impact}%</span></div>
          <div class="spec-row"><span class="spec-k">Rating</span><span class="spec-v">${m.rating}/5</span></div>
        </div>
        <div>
          <div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:.5rem">Fits these EVs</div>
          ${fitsHTML}
        </div>
      </div>
    </div>
    <div>
      <div class="pro-con">
        <h4>Pros</h4>
        <ul class="pros">${prosHTML}</ul>
        <h4 style="margin-top:.75rem">Cons</h4>
        <ul class="cons">${consHTML}</ul>
      </div>
      <div class="ev-note-box"><strong>⚡ EV Camper Note:</strong> ${m.ev_note}</div>
      <a href="${m.buy_url}" target="_blank" class="buy-btn">View product →</a>
      <button onclick="closeDetail()" style="width:100%;margin-top:.5rem;padding:.6rem;border:1px solid var(--border);border-radius:5px;background:var(--bg);cursor:pointer;font-family:inherit;font-size:.88rem;color:var(--text3)">Close ✕</button>
    </div>`;
  p.classList.add('active');
  p.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function closeDetail(){document.getElementById('detail-panel').classList.remove('active')}

function filterTable(){
  const type=document.getElementById('f-type').value;
  const price=parseFloat(document.getElementById('f-price').value)||9999;
  const wt=parseFloat(document.getElementById('f-weight').value)||999;
  const rv=parseFloat(document.getElementById('f-rv').value)||0;
  let d=mattresses.filter(m=>{
    if(type&&m.type!==type)return false;
    if(m.price>price)return false;
    if(wt<999&&m.weight_lbs>wt)return false;
    if(m.rvalue<rv)return false;
    if(currentEV&&m[currentEV]==='Poor')return false;
    return true;
  });
  if(sortKey)d.sort((a,b)=>sortDir*(a[sortKey]-b[sortKey]));
  renderTable(d);
  closeDetail();
}

function sortBy(k){
  if(sortKey===k)sortDir*=-1;else{sortKey=k;sortDir=1;}
  filterTable();
}

function calcFull(){
  const sel=document.getElementById('cev');
  const r=parseFloat(sel.value)||260;
  const evName=sel.options[sel.selectedIndex].text.split(' (')[0];
  const w=parseFloat(document.getElementById('cwt').value)||9;
  document.getElementById('cwt-val').textContent=w;
  const pct=(w/100).toFixed(3);
  const mi=(r*pct/100).toFixed(2);
  const totalPct=(1.2+parseFloat(pct)).toFixed(2);
  document.getElementById('c-pct').textContent=pct+'%';
  document.getElementById('c-total').textContent='~'+totalPct+'%';
  document.getElementById('c-miles').textContent=mi+' mi';
  const barW=Math.min(pct*22,100);
  document.getElementById('ctx-mat').textContent=`Mattress (${w} lbs)`;
  document.getElementById('ctx-mat-bar').style.width=barW+'%';
  document.getElementById('ctx-mat-pct').textContent=pct+'%';
}

function switchTab(btn,id){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
}

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

function showArticle(id){
  document.getElementById('blog-index').style.display='none';
  document.querySelectorAll('.article-body').forEach(a=>a.style.display='none');
  document.getElementById(id).style.display='block';
  window.scrollTo({top:0,behavior:'smooth'});
}

function showBlogIndex(){
  document.querySelectorAll('.article-body').forEach(a=>a.style.display='none');
  document.getElementById('blog-index').style.display='block';
  window.scrollTo({top:0,behavior:'smooth'});
}

// Only init EV dimensions table on pages that have it
document.addEventListener('DOMContentLoaded', function(){
  if(document.getElementById('ev-all-tbody')) renderAllEVTable();
});

function setActiveNav(){
  var path=window.location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('nav a[data-page]').forEach(function(a){
    a.classList.toggle('active', a.dataset.page===path);
  });
}
document.addEventListener('DOMContentLoaded',setActiveNav);
