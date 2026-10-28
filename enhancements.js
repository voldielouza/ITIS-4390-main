/* StagePass prototype extensions: event details, ticket selection, feedback and checkout sync. */
(() => {
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const selectedId = params.get('event') || localStorage.getItem('stagepass-selected-event') || 'tame-impala';
  // eventCatalog and currentEvent are declared in script.js, loaded immediately before this file.
  const eventId = typeof eventCatalog !== 'undefined' && eventCatalog[selectedId] ? selectedId : 'tame-impala';
  const event = eventCatalog[eventId];
  const money = n => '$' + n.toFixed(2);
  // Sample Spectrum Center-inspired sections: NOT real venue inventory.
  const seats = [
    {section:'101',row:'A',seat:'4',price:115,stock:4,type:'standard'},
    {section:'102',row:'F',seat:'7',price:89,stock:3,type:'standard'},
    {section:'103',row:'K',seat:'12',price:73,stock:1,type:'standard'},
    {section:'104',row:'G',seat:'12',price:73,stock:4,type:'standard'},
    {section:'105',row:'J',seat:'10',price:65,stock:0,type:'standard'},
    {section:'106',row:'H',seat:'9',price:65,stock:3,type:'resale'},
    {section:'107',row:'M',seat:'18',price:58,stock:2,type:'resale'},
    {section:'108',row:'L',seat:'14',price:58,stock:1,type:'standard'},
    {section:'109',row:'C',seat:'7',price:105,stock:4,type:'standard'},
    {section:'110',row:'D',seat:'11',price:100,stock:2,type:'standard'},
    {section:'111',row:'H',seat:'2',price:90,stock:0,type:'standard'},
    {section:'112',row:'J',seat:'8',price:82,stock:4,type:'standard'},
    {section:'113',row:'A',seat:'10',price:125,stock:2,type:'resale'},
    {section:'114',row:'E',seat:'5',price:95,stock:3,type:'standard'},
    {section:'115',row:'C',seat:'15',price:96,stock:2,type:'standard'},
    {section:'116',row:'F',seat:'4',price:104,stock:4,type:'standard'},
    {section:'117',row:'K',seat:'9',price:76,stock:1,type:'standard'},
    {section:'118',row:'J',seat:'12',price:78,stock:2,type:'standard'},
    {section:'119',row:'D',seat:'6',price:110,stock:0,type:'standard'},
    {section:'120',row:'B',seat:'19',price:115,stock:4,type:'standard'},
    {section:'201',row:'N',seat:'5',price:49,stock:4,type:'standard'},
    {section:'202',row:'Q',seat:'8',price:45,stock:2,type:'standard'},
    {section:'203',row:'P',seat:'11',price:47,stock:0,type:'standard'},
    {section:'204',row:'R',seat:'2',price:42,stock:3,type:'resale'},
    {section:'205',row:'P',seat:'16',price:55,stock:4,type:'standard'},
    {section:'206',row:'M',seat:'21',price:59,stock:2,type:'standard'},
    {section:'207',row:'N',seat:'14',price:51,stock:1,type:'standard'},
    {section:'208',row:'T',seat:'12',price:43,stock:4,type:'standard'}
  ];
  const getSelection = () => {
    try { const s = JSON.parse(sessionStorage.getItem('stagepass-selection')); return s && s.event === eventId ? s : null; } catch { return null; }
  };
  if (page === 'event') {
    const container = document.querySelector('#event-date-list');
    const month = document.querySelector('#month-filter');
    const sort = document.querySelector('#date-sort');
    const dt = new Date(event.dateFull + ' 12:00:00');
    function renderDates() {
      container.replaceChildren();
      const matches = month.value === 'all' || String(dt.getMonth()+1).padStart(2,'0') === month.value;
      document.querySelector('#date-empty').hidden = matches;
      if (!matches) return;
      const row = document.createElement('div'); row.className='date-row';
      const date = document.createElement('div'); date.className='date-badge';
      date.innerHTML = `<strong>${dt.toLocaleDateString('en-US',{month:'short'})}</strong><span>${dt.getDate()}</span>`;
      const details = document.createElement('div');
      details.innerHTML = `<strong>${event.name} · ${event.tour}</strong><p>${event.dateFull} · ${event.time}</p><p>${event.venue}</p>`;
      const button = document.createElement('a'); button.className='primary-button'; button.href=`selection.html?event=${encodeURIComponent(eventId)}`; button.textContent='Find Tickets';
      row.append(date, details, button); container.append(row);
    }
    month.addEventListener('change',renderDates); sort.addEventListener('change',renderDates); renderDates();
  }
  if (page === 'selection') {
    // This interactive prototype draws sections on top of a venue illustration.
    const back = document.querySelector('#selection-back');
    back.href = `concertinfo.html?event=${encodeURIComponent(eventId)}`;
    const map = document.querySelector('#arena-sections');
    const listings = document.querySelector('#ticket-listings');
    const count = document.querySelector('#ticket-quantity');
    const sort = document.querySelector('#ticket-sort');
    const next = document.querySelector('#continue-checkout');
    const clear = document.querySelector('#clear-section');
    let selected = null;

    // Position section buttons around the lower and upper bowl. Values are percentages
    // of the illustrative arena diagram, NOT official Spectrum Center coordinates.
    const positions = {
      '101':[22,37],'102':[25,25],'103':[36,18],'104':[49,16],
      '105':[62,18],'106':[75,25],'107':[79,37],'108':[78,55],
      '109':[69,68],'110':[56,73],'111':[43,73],'112':[30,68],
      '113':[21,55],'114':[36,32],'115':[49,29],'116':[62,32],
      '117':[65,55],'118':[49,60],'119':[35,55],'120':[49,43],
      '201':[11,24],'202':[20,11],'203':[34,6],'204':[49,4],
      '205':[64,6],'206':[79,11],'207':[89,24],'208':[89,72]
    };
    // Status priority determines the correct legend color.
    function statusOf(s) {
      if (selected?.section === s.section) return 'selected';
      if (s.stock === 0) return 'unavailable';
      if (s.type === 'resale') return 'resale';
      return s.stock >= Number(count.value) ? 'match' : 'available';
    }
    function eligible(s) { return s.stock >= Number(count.value); }
    function totals() {
      const n = Number(count.value);
      document.querySelector('#selection-subtotal').textContent = selected ? money(selected.price*n) : '—';
      document.querySelector('#selection-fees').textContent = selected ? money(11*n) : '—';
      document.querySelector('#selection-total').textContent = selected ? money((selected.price+11)*n) : '—';
      document.querySelector('#selection-caption').textContent = selected
        ? `Section ${selected.section} · Row ${selected.row} · Seat ${selected.seat} · ${n} ticket${n === 1 ? '' : 's'} · ${selected.type === 'resale' ? 'Resale' : 'Standard'}`
        : 'Select a section or ticket listing';
      next.disabled = !selected;
      clear.hidden = !selected;
    }
    function pick(section) {
      const found = seats.find(s => s.section === section);
      if (!found || !eligible(found)) return;
      selected = found;
      refreshMap(); renderListings(); totals();
    }
    function refreshMap() {
      map.querySelectorAll('button').forEach(button => {
        const s = seats.find(item => item.section === button.dataset.section);
        const status = statusOf(s);
        button.className = `seat-section status-${status}`;
        button.disabled = !eligible(s);
        button.setAttribute('aria-pressed', String(status === 'selected'));
        const label = status === 'match' ? 'Exact quantity match' :
          status === 'available' ? 'Available for fewer tickets' :
          status === 'selected' ? 'Selected' :
          status === 'resale' ? 'Resale' : 'Unavailable';
        button.setAttribute('aria-label', `Section ${s.section}: ${label}; ${s.stock} demo tickets at ${money(s.price)} each`);
        button.title = `Section ${s.section} • ${label} • ${money(s.price)}`;
      });
    }
    // Keep the map synchronized with the same data used by the listing panel.
    seats.forEach(s => {
      const button = document.createElement('button');
      const [x,y] = positions[s.section];
      button.type = 'button';
      button.dataset.section = s.section;
      button.textContent = s.section;
      button.style.left = `${x}%`;
      button.style.top = `${y}%`;
      button.addEventListener('click', () => pick(s.section));
      map.append(button);
    });
    function renderListings() {
      const sorted = [...seats].sort((a,b) => sort.value === 'low' ? a.price-b.price : b.price-a.price);
      listings.replaceChildren();
      sorted.forEach(s => {
        const status = statusOf(s);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `listing status-${status}`;
        button.disabled = !eligible(s);
        button.setAttribute('aria-pressed', String(status === 'selected'));
        const desc = s.stock === 0 ? 'Unavailable' :
          s.type === 'resale' ? 'Verified resale (demo)' :
          !eligible(s) ? `Only ${s.stock} demo ticket(s) available` : 'Standard ticket';
        button.innerHTML = `<span><strong>Section ${s.section} · Row ${s.row}</strong><small>Seat ${s.seat} · ${desc}</small></span><strong>${money(s.price)}<small> / ticket</small></strong>`;
        button.addEventListener('click', () => pick(s.section));
        listings.append(button);
      });
    }
    count.addEventListener('change', () => {
      if (selected && !eligible(selected)) selected = null;
      refreshMap(); renderListings(); totals();
    });
    sort.addEventListener('change', renderListings);
    clear.addEventListener('click', () => { selected = null; refreshMap(); renderListings(); totals(); });
    refreshMap(); renderListings(); totals();
    next.addEventListener('click', () => {
      if (!selected) return;
      // The existing checkout and ticket pages read this same session key.
      sessionStorage.setItem('stagepass-selection', JSON.stringify({
        event:eventId, section:selected.section, row:selected.row,
        seat:selected.seat, count:Number(count.value), unitPrice:selected.price, feePerTicket:11
      }));
      location.href = `checkout.html?event=${encodeURIComponent(eventId)}`;
    });
  }
  if (page === 'checkout') {
    const selection=getSelection();
    if(selection){
      const set=(field,value)=>document.querySelectorAll(`[data-event-field="${field}"]`).forEach(el=>el.textContent=value);
      set('seatSummary',`Section ${selection.section} · Row ${selection.row} · Seat ${selection.seat}`);
      set('ticketCount',`${selection.count} Ticket${selection.count===1?'':'s'}`);
      set('ticketPrice',money(selection.unitPrice*selection.count));
      set('fees',money(selection.feePerTicket*selection.count));
      set('totalPrice',money((selection.unitPrice+selection.feePerTicket)*selection.count));
    }
  }
  if (page === 'ticket') {
    const purchased=localStorage.getItem('stagepass-purchased-event')===eventId;
    const badge=document.querySelector('#ticket-purchase-status');
    if(badge)badge.textContent=purchased?'Demo purchase confirmed':'Preview only · not purchased';
    const s=getSelection();
    if(s&&purchased){
      [['section',s.section],['row',s.row],['seat',s.seat]].forEach(([k,v])=>document.querySelectorAll(`[data-event-field="${k}"]`).forEach(el=>el.textContent=v));
    }
  }
  if(page==='feedback'){
    const form=document.querySelector('#feedback-form');
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const response={rating:form.elements.rating.value,liked:document.querySelector('#feedback-positive').value,improve:document.querySelector('#feedback-improve').value,createdAt:new Date().toISOString()};
      const all=JSON.parse(localStorage.getItem('stagepass-feedback')||'[]');all.push(response);localStorage.setItem('stagepass-feedback',JSON.stringify(all));
      form.hidden=true;document.querySelector('#feedback-thanks').hidden=false;
    });
  }
})();


