// =====================
// DADOS INICIAIS (editáveis pelo aluno)
// Cada objeto representa uma curiosidade. Altere o conteúdo livremente!
// =====================
const INITIAL_DATA = [
  {
    id: 'c1',
    title: 'Gatos ronronam para se curar',
    text: 'A vibração do ronronar (25–150 Hz) pode estimular a regeneração óssea e reduzir estresse — não é só fofura!',
    image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=1200&auto=format&fit=crop',
    category: 'Animais',
    tags: ['gatos','biologia','frequências']
  },
  {
    id: 'c2',
    title: 'Animes e FPS: por que parecem mais rápidos?',
    text: 'Alguns animes usam 12 fps (animados “on twos”), mas efeitos e cortes dinâmicos criam sensação de velocidade maior.',
    image: 'https://images.unsplash.com/photo-1625080903503-00fef6c5f3b2?q=80&w=1200&auto=format&fit=crop',
    category: 'Animes',
    tags: ['fps','animação','estilo']
  },
  {
    id: 'c3',
    title: 'Buracos negros não “sugam” tudo',
    text: 'Se o Sol virasse um buraco negro com a mesma massa, a Terra continuaria orbitando — só ficaria mais escuro.',
    image: 'https://images.unsplash.com/photo-1447433819943-74a20887a81e?q=80&w=1200&auto=format&fit=crop',
    category: 'Astronomia',
    tags: ['gravidade','espaço','órbitas']
  },
  {
    id: 'c4',
    title: 'Mangá lê-se da direita para a esquerda',
    text: 'A ordem de leitura tradicional japonesa começa pelo “final” para preservar o layout e a intenção do autor.',
    image: 'https://images.unsplash.com/photo-1553729784-e91953dec042?q=80&w=1200&auto=format&fit=crop',
    category: 'Mangá',
    tags: ['leitura','japão','cultura']
  }
];

// =====================
// PREFERÊNCIAS E ESTADO
// =====================
const LS_ITEMS_KEY = 'curio_items_v1';
const LS_LIKES_KEY = 'curio_likes_v1';
const LS_THEME_KEY = 'curio_theme_v1';

const state = {
  items: [],
  likes: {},
  filters: {
    search: '',
    category: 'Todos',
    sort: 'recent',
  }
};

// =====================
// INICIALIZAÇÃO
// =====================
function loadFromStorage(){
  try{
    const savedItems = JSON.parse(localStorage.getItem(LS_ITEMS_KEY));
    const savedLikes = JSON.parse(localStorage.getItem(LS_LIKES_KEY));
    const savedTheme = localStorage.getItem(LS_THEME_KEY);

    state.items = Array.isArray(savedItems) ? savedItems : INITIAL_DATA;
    state.likes = savedLikes && typeof savedLikes === 'object' ? savedLikes : {};
    if(savedTheme){
      document.documentElement.setAttribute('data-theme', savedTheme);
      const isDark = savedTheme === 'dark';
      document.getElementById('themeToggle').setAttribute('aria-pressed', String(isDark));
      document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
    }
  }catch(e){
    state.items = INITIAL_DATA;
    state.likes = {};
  }
}

function saveItems(){ localStorage.setItem(LS_ITEMS_KEY, JSON.stringify(state.items)); }
function saveLikes(){ localStorage.setItem(LS_LIKES_KEY, JSON.stringify(state.likes)); }

// =====================
// RENDERIZAÇÃO
// =====================
function renderChips(){
  const chips = document.getElementById('chips');
  chips.innerHTML = '';
  const categories = ['Todos', ...new Set(state.items.map(i => i.category))];
  categories.forEach(cat => {
    const btn = document.createElement('span');
    btn.className = 'badge rounded-pill badge-cat filter-chip px-3 py-2';
    btn.textContent = cat;
    btn.setAttribute('role','button');
    btn.setAttribute('aria-pressed', cat === state.filters.category ? 'true' : 'false');
    btn.onclick = () => { state.filters.category = cat; render(); };
    chips.appendChild(btn);
  });
}

function matchesFilters(item){
  const search = state.filters.search.trim().toLowerCase();
  const inSearch = search === '' || [item.title, item.text, (item.tags||[]).join(' ')].join(' ').toLowerCase().includes(search);
  const inCat = state.filters.category === 'Todos' || item.category === state.filters.category;
  return inSearch && inCat;
}

function sortItems(items){
  const mode = state.filters.sort;
  const withLikes = i => state.likes[i.id] || 0;
  if(mode === 'alpha') return items.toSorted((a,b)=>a.title.localeCompare(b.title));
  if(mode === 'likes') return items.toSorted((a,b)=>withLikes(b) - withLikes(a));
  // recent = ordem de criação (fim do array = mais recente)
  return items.toSorted((a,b)=> state.items.indexOf(b) - state.items.indexOf(a));
}

function renderCards(){
  const row = document.getElementById('cardsRow');
  const empty = document.getElementById('emptyState');
  row.innerHTML = '';

  const filtered = sortItems(state.items.filter(matchesFilters));

  if(filtered.length === 0){
    empty.classList.remove('d-none');
    return;
  }else{
    empty.classList.add('d-none');
  }

  filtered.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';

    const likes = state.likes[item.id] || 0;
    const card = document.createElement('div');
    card.className = 'card card-curio h-100 border-0';
    card.innerHTML = `
      <img src="${item.image}" class="card-img-top" alt="${item.title}">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="card-title mb-0">${item.title}</h5>
          <span class="badge rounded-pill badge-cat">${item.category}</span>
        </div>
        <p class="card-text flex-grow-1">${item.text}</p>
        <div class="d-flex gap-2 flex-wrap mb-3">${(item.tags||[]).map(t=>`<span class="badge text-bg-light">#${t}</span>`).join('')}</div>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <button class="btn btn-sm btn-outline-primary like-btn" data-id="${item.id}" aria-pressed="${likes>0}">❤️ <span class="like-count">${likes}</span></button>
          <button class="btn btn-sm btn-outline-secondary" data-action="details" data-id="${item.id}">Ver mais</button>
        </div>
      </div>`;

    // Eventos dos botões
    card.querySelector('.like-btn').onclick = (ev)=>{
      const id = ev.currentTarget.getAttribute('data-id');
      state.likes[id] = (state.likes[id] || 0) + 1;
      saveLikes();
      renderCards();
    }
    card.querySelector('[data-action="details"]').onclick = ()=> openDetails(item);

    col.appendChild(card);
    row.appendChild(col);
  });
}

function openDetails(item){
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalText').textContent = item.text;
  const img = document.getElementById('modalImage');
  img.src = item.image; img.alt = item.title;
  const tags = document.getElementById('modalTags');
  tags.innerHTML = (item.tags||[]).map(t=>`<span class="badge text-bg-secondary">#${t}</span>`).join(' ');

  const modal = new bootstrap.Modal(document.getElementById('modalDetails'));
  modal.show();
}

function render(){
  renderChips();
  renderCards();
}

// =====================
// INTERAÇÕES (busca, ordenação, formulário, tema)
// =====================
function setupInteractions(){
  document.getElementById('searchInput').addEventListener('input', (e)=>{
    state.filters.search = e.target.value;
    renderCards();
  });
  document.getElementById('sortSelect').addEventListener('change', (e)=>{
    state.filters.sort = e.target.value;
    renderCards();
  });

  // Validação Bootstrap + adicionar item
  const form = document.getElementById('formAdd');
  form.addEventListener('submit', (event)=>{
    event.preventDefault();
    event.stopPropagation();
    if(!form.checkValidity()){
      form.classList.add('was-validated');
      return;
    }
    const newItem = {
      id: 'c' + (Date.now()),
      title: document.getElementById('fldTitle').value.trim(),
      text: document.getElementById('fldText').value.trim(),
      image: document.getElementById('fldImage').value.trim(),
      category: document.getElementById('fldCategory').value.trim(),
      tags: document.getElementById('fldTags').value.split(',').map(t=>t.trim()).filter(Boolean)
    };
    state.items.push(newItem);
    saveItems();
    form.reset();
    form.classList.remove('was-validated');
    const canvas = bootstrap.Offcanvas.getOrCreateInstance('#offcanvasAdd');
    canvas.hide();
    state.filters.category = 'Todos';
    document.getElementById('searchInput').value = '';
    state.filters.search = '';
    render();
  });

  // Tema
  const themeBtn = document.getElementById('themeToggle');
  themeBtn.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(LS_THEME_KEY, next);
    themeBtn.setAttribute('aria-pressed', String(next==='dark'));
    themeBtn.textContent = next==='dark' ? '☀️' : '🌙';
  });
}

// =====================
// BOOTSTRAP: correção de ícone hamburger em tema escuro
// =====================
// (opcional) Ajustar classe para que o ícone apareça em ambos os temas
document.addEventListener('DOMContentLoaded', ()=>{
  const toggler = document.querySelector('.navbar-toggler');
  if(toggler && !toggler.querySelector('span.navbar-toggler-icon')){
    const span = document.createElement('span');
    span.className = 'navbar-toggler-icon';
    toggler.appendChild(span);
  }
});

// =====================
// STARTUP
// =====================
loadFromStorage();
setupInteractions();
render();
