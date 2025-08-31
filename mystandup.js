
// === MyStandup (vanilla JS) ===
(function(){
  function el(tag, attrs={}, children=[]) {
    const e = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs||{})) {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) e.setAttribute(k, v);
    }
    for (const c of (children||[])) {
      if (c==null) continue;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return e;
  }

  const icons = {
    search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/></svg>',
    calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/></svg>',
    clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="M12 8v5l3 3m6-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',
    users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm6 4a4 4 0 0 0 0-8"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="M12 21s7-4.35 7-10A7 7 0 1 0 5 11c0 5.65 7 10 7 10Z"/></svg>',
    ticket: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="M3 9a3 3 0 1 0 0 6v3a2 2 0 0 0 2 2h14l2-2V8l-2-2H5a2 2 0 0 0-2 2v1Z"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="M18 6 6 18M6 6l12 12"/></svg>',
    filter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path stroke="currentColor" stroke-width="2" d="M22 6H2m16 6H6m10 6H8"/></svg>'
  };

  function fmtDate(s) { const d = new Date(s); return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' }); }
  function fmtTime(s) { const d = new Date(s); return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }
  function daysLeft(s) { const diff = (new Date(s) - new Date())/86400000; return Math.max(0, Math.ceil(diff)); }

  function App(root, options){
    const state = { query:'', activeMonth:'all', selected:null, events:normalize(options.events||[]), logoUrl:options.logoUrl||null };
    function normalize(list){
      return (list||[]).map((e,i)=> ({
        id: e.id ?? (i+1), artist: e.artist||'Без названия', city: e.city||'', venue: e.venue||'',
        date: e.date, image: e.image || 'https://picsum.photos/seed/standup/1200/800',
        description: e.description||'', keyPoints: Array.isArray(e.keyPoints)?e.keyPoints:[],
        label: e.label||'', url: e.url||''
      })).filter(e => !isNaN(new Date(e.date)));
    }
    const MONTHS = (function(){ const set=new Set(state.events.map(e=>e.date.slice(0,7))); const arr=Array.from(set).sort().map(m=>({key:m,label:monthLabel(m)})); return [{key:'all',label:'Все'},...arr]; })();
    function monthLabel(ym){ const [y,m]=ym.split('-').map(x=>+x); return new Date(y,m-1,1).toLocaleDateString('ru-RU',{month:'long'}); }
    function filtered(){ return state.events.filter(e=> (state.activeMonth==='all'||e.date.slice(0,7)===state.activeMonth) && (e.artist+' '+e.city+' '+e.venue).toLowerCase().includes(state.query.trim().toLowerCase())); }
    function upcoming(){ const now=new Date(); return [...state.events].filter(e=>new Date(e.date)>=now).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3); }

    const container = el('div',{class:'ms-container'}); root.innerHTML=''; root.appendChild(container);

    const header = el('div',{class:'ms-header'});
    const headerInner = el('div',{class:'ms-wrap ms-header-inner'});
    const logo = state.logoUrl ? el('img',{class:'ms-logo',src:state.logoUrl,alt:'MY STANDUP'}) : el('span',{html:'<strong>MY STANDUP</strong>'});
    const nav = el('nav',{class:'ms-nav',ariaLabel:'Главная навигация'},[ el('a',{href:'#top'},['Афиша']), el('a',{href:'#upcoming'},['Ближайшие']), el('a',{href:'#about'},['О нас']), el('a',{href:'#faq'},['FAQ']), el('a',{href:'#contacts'},['Контакты']), ]);
    headerInner.appendChild(logo); headerInner.appendChild(nav); header.appendChild(headerInner); container.appendChild(header);

    const top = el('section',{id:'top', class:'ms-wrap ms-section'});
    top.appendChild(el('div',{class:'ms-title'},['Концерты 2025']));
    top.appendChild(el('p',{class:'ms-sub'},['Выбирайте город, месяц и любимых комиков. Билеты — в пару кликов.']));
    const searchWrap = el('div',{class:'ms-search'});
    const inputWrap = el('div',{class:'ms-input-wrap'});
    const input = el('input',{class:'ms-input',type:'search',placeholder:'Поиск по артисту, городу, площадке'});
    const searchIcon = el('div',{class:'ms-icon',html:icons.search});
    input.addEventListener('input', ()=>{ state.query=input.value; renderLists(); results.scrollIntoView({behavior:'smooth', block:'start'}); });
    inputWrap.appendChild(input); inputWrap.appendChild(searchIcon); searchWrap.appendChild(inputWrap);

    const filterRow = el('div',{class:'ms-filter'});
    filterRow.appendChild(el('span',{},[el('span',{class:'ms-icon',html:icons.filter}), 'Фильтр по месяцам']));
    const chips = el('div',{class:'ms-chips no-scrollbar', role:'tablist', ariaLabel:'Месяц'});
    const monthNodes=[]; MONTHS.forEach(m=>{ const b=el('button',{class:'ms-chip'+(state.activeMonth===m.key?' active':''),'data-key':m.key},[m.label[0].toUpperCase()+m.label.slice(1)]); b.addEventListener('click',()=>{state.activeMonth=m.key; monthNodes.forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderLists(); results.scrollIntoView({behavior:'smooth', block:'start'});}); monthNodes.push(b); chips.appendChild(b); });
    filterRow.appendChild(chips); searchWrap.appendChild(filterRow);
    top.appendChild(searchWrap); container.appendChild(top);

    const upSec = el('section',{id:'upcoming', class:'ms-wrap ms-section ms-upcoming'});
    const upTitle = el('h2',{},['Ближайшие события']); const upGrid = el('div',{class:'ms-grid'});
    upSec.appendChild(upTitle); upSec.appendChild(upGrid); container.appendChild(upSec);

    const results = el('main',{class:'ms-wrap ms-section'});
    const posterGrid = el('div',{class:'ms-grid'}); results.appendChild(posterGrid); container.appendChild(results);

    const about = el('section',{id:'about', class:'ms-wrap ms-section'});
    about.appendChild(cardBox('<h2>О нас</h2><p>Мы — MyStandup, уже более 10 лет объединяем комиков и зрителей в разных городах. Делаем атмосферные стендап-ивенты и обеспечиваем честный, удобный сервис покупки билетов.</p>'));
    container.appendChild(about);

    const faq = el('section',{id:'faq', class:'ms-wrap ms-section'});
    faq.appendChild(el('h2',{},['FAQ']));
    faq.appendChild(faqList([ ['Где мой билет после оплаты?','Э-билет приходит на e-mail сразу и действует на входе.'], ['Можно вернуть билет?','Да, до начала концерта: ≥10 дней — 100%, 5–10 — 50%, 3–5 — 30%, менее 3 — не возвращается.'], ['Концерт перенесли или отменили?','При переносе билеты действительны, при отмене деньги возвращаются автоматически.'], ['Есть возрастные ограничения?','Большинство концертов 18+. Точное ограничение указано на странице события.'] ]));
    container.appendChild(faq);

    const contacts = el('section',{id:'contacts', class:'ms-wrap ms-section'});
    contacts.appendChild(cardBox('<h2>Контакты</h2><p>По вопросам организации и сотрудничества пишите на <a href="mailto:info@mystandup.ru" style="color:var(--emerald);text-decoration:underline">info@mystandup.ru</a></p>'));
    container.appendChild(contacts);

    const footer = el('footer',{class:'ms-footer'});
    const fwrap = el('div',{class:'ms-wrap'});
    const fin = el('div',{class:'ms-footer-inner'});
    fin.appendChild(el('div',{},[ el('div',{style:'font-weight:600;color:#fff'},['MY STANDUP']), el('p',{style:'margin-top:8px;font-size:14px'},['MyStandup — лучшие вечера стендапа с 2014 года.']) ]));
    fin.appendChild(el('div',{},[ (function(){ const wrap=el('div',{}); const ul=el('ul',{}); ul.style.display='grid'; ul.style.gridTemplateColumns='repeat(2, minmax(0,1fr))'; ul.style.gap='4px'; [['Афиша','#top'],['Ближайшие','#upcoming'],['О нас','#about'],['FAQ','#faq'],['Контакты','#contacts']].forEach(([label,href])=>{ const li=el('li',{}); li.appendChild(el('a',{href:href},[label])); ul.appendChild(li);}); wrap.appendChild(ul); return wrap; })() ]));
    fwrap.appendChild(fin);
    fwrap.appendChild(el('div',{class:'ms-footer-bottom'},['@2014–2025, Тюмень. Организация стендап-концертов по всей России.']));
    footer.appendChild(fwrap); container.appendChild(footer);

    // Modal
    const modalBack = el('div',{class:'ms-modal-back'});
    const modal = el('div',{class:'ms-modal'});
    const mHead = el('div',{class:'ms-modal-head'});
    const mImg = el('img',{}); const mGrad = el('div',{class:'grad'});
    const mClose = el('button',{class:'ms-close',html:icons.close,onclick:()=> setSelected(null)});
    const mBody = el('div',{class:'ms-modal-body'});
    mHead.appendChild(mImg); mHead.appendChild(mGrad); mHead.appendChild(mClose);
    modal.appendChild(mHead); modal.appendChild(mBody);
    modalBack.appendChild(modal); document.body.appendChild(modalBack);

    function setSelected(ev){
      state.selected = ev;
      if (ev){
        mImg.src = ev.image;
        mBody.innerHTML='';
        mBody.appendChild(rowChips([chip(icons.calendar, fmtDate(ev.date)), chip(icons.clock, fmtTime(ev.date)), chip(icons.users, '18+')]));
        mBody.appendChild(el('div',{},[el('span',{html:icons.pin}), ' ', `${ev.city} • ${ev.venue}`]));
        if (ev.label) mBody.appendChild(rowChips([chip(null, ev.label)]));
        mBody.appendChild(el('div',{style:'display:flex;justify-content:space-between;align-items:center'},[
          ev.url ? btnBuy('Купить билет', ev.url) : el('span',{}),
          el('span',{class:'ms-badge'},[`через ${daysLeft(ev.date)} дн. ⏳`])
        ]));
        modalBack.classList.add('show'); modal.classList.add('show');
      } else { modalBack.classList.remove('show'); modal.classList.remove('show'); }
    }

    function btnBuy(text, url){ const b=el('a',{class:'ms-btn',href:url,target:'_blank',rel:'noreferrer'}); b.appendChild(el('span',{html:icons.ticket})); b.appendChild(document.createTextNode(text)); return b; }
    function chip(svg, txt){ const s=el('span',{class:'ms-chip-inline'}); if(svg) s.appendChild(el('span',{html:svg})); s.appendChild(document.createTextNode(txt)); return s; }
    function rowChips(arr){ return el('div',{class:'ms-row'},arr); }
    function cardBox(innerHTML){ return el('div',{style:'border:1px solid var(--border);background:var(--white10);padding:24px;border-radius:20px'},[el('div',{html:innerHTML})]); }
    function faqList(items){ const wrap=el('div',{}); items.forEach(([q,a])=>{ const det=el('details',{style:'border:1px solid var(--border);background:var(--white10);padding:16px;border-radius:14px;margin:8px 0'}); det.appendChild(el('summary',{},[q])); det.appendChild(el('p',{},[a])); wrap.appendChild(det);}); return wrap; }

    function renderCard(ev){
      const card = el('div',{class:'ms-card'});
      const top = el('div',{style:'display:flex;justify-content:space-between'});
      const left = el('div',{});
      left.appendChild(el('span',{class:'ms-city'},[(ev.city||'').toUpperCase()]));
      left.appendChild(el('div',{},[el('span',{class:'ms-adult'},['18+'])]));
      const right = el('div',{class:'ms-card-time'},[fmtDate(ev.date),' / ',fmtTime(ev.date)]);
      top.appendChild(left); top.appendChild(right); card.appendChild(top);

      const poster = el('div',{class:'ms-poster'});
      const img = el('img',{src:ev.image, alt:ev.artist});
      const grad = el('div',{class:'ms-poster-grad'});
      const title = el('div',{class:'ms-poster-title'},[ev.artist]);
      poster.appendChild(img); poster.appendChild(grad); poster.appendChild(title);
      card.appendChild(poster);

      const info = el('div',{});
      info.appendChild(el('div',{class:'ms-artist'},[ev.artist]));
      info.appendChild(el('div',{class:'ms-venue'},[ev.venue? (ev.city+' • '+ev.venue):(ev.city)]));
      card.appendChild(info);

      const actions = el('div',{class:'ms-row', style:'justify-content:space-between;align-items:center;margin-top:10px'});
      if (ev.url){ actions.appendChild(btnBuy('Купить билет', ev.url)); }
      else if (ev.label){ actions.appendChild(el('span',{class:'ms-badge'},[ev.label])); }
      actions.appendChild(el('span',{class:'ms-badge'},[`через ${daysLeft(ev.date)} дн. ⏳`]));
      card.addEventListener('click', ()=> setSelected(ev));
      card.appendChild(actions);
      return card;
    }

    function renderLists(){
      const showUpcoming = state.query.trim()==='' && state.activeMonth==='all';
      upSec.style.display = showUpcoming ? '' : 'none';
      upGrid.innerHTML=''; if (showUpcoming){ upcoming().forEach(ev => upGrid.appendChild(renderCard(ev))); }
      posterGrid.innerHTML=''; const list = filtered(); if (!list.length){ posterGrid.appendChild(el('div',{},['Ничего не найдено.'])); } else { list.forEach(ev => posterGrid.appendChild(renderCard(ev))); }
    }

    renderLists();
    window.addEventListener('keydown', (e)=> { if (e.key==='Escape') setSelected(null); });
    modalBack.addEventListener('click', (e)=> { if (e.target===modalBack) setSelected(null); });
  }

  window.MyStandup = window.MyStandup || {};
  window.MyStandup.mount = function(el, options){ options=options||{}; return new App(el, options); };
})();
