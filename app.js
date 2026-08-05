'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const KEY = 'thirty_demo_v1';

const people = [
  { id: 'sue', name: 'Sue', city: 'Palma del Río', avatar: 'sue', online: true, note: 'Conectada ahora' },
  { id: 'sergio', name: 'Sergio', city: 'Córdoba', avatar: 'sergio', online: true, note: 'Escuchando música' },
  { id: 'cristina', name: 'Cristina', city: 'Sevilla', avatar: 'cris', online: true, note: 'Disponible' },
  { id: 'pablo', name: 'Pablo', city: 'Palma del Río', avatar: 'pablo', online: false, note: 'Hace 24 min' },
  { id: 'maria', name: 'María José', city: 'Écija', avatar: 'maria', online: true, note: 'En línea' },
  { id: 'david', name: 'David', city: 'Córdoba', avatar: 'david', online: false, note: 'Hace 2 h' }
];

const defaultPosts = [
  { id: 1, type: 'estado', who: 'Sue', avatar: 'sue', when: 'Hace 18 min', text: '¿Os acordáis cuando para quedar había que escribir en el tablón y esperar a que alguien lo viera? Pues sábado en el local, como en 2010. 😄', likes: 7, liked: false, comments: [{ who: 'Javi', text: 'Confirmadísimo. Llevo la guitarra.' }] },
  { id: 2, type: 'foto', who: 'Sergio', avatar: 'sergio', when: 'Hace 43 min', text: 'He encontrado esto en un disco duro antiguo. Calidad cuestionable, recuerdo perfecto.', photo: 1, likes: 12, liked: true, comments: [{ who: 'Cristina', text: 'La cámara digital de 5 megapíxeles haciendo magia.' }] },
  { id: 3, type: 'estado', who: 'Cristina', avatar: 'cris', when: 'Hace 2 h', text: 'He creado el evento para la noche de karaoke. Estáis todos invitados y no se aceptan excusas.', likes: 5, liked: false, comments: [] },
  { id: 4, type: 'foto', who: 'Pablo', avatar: 'pablo', when: 'Ayer a las 23:14', text: 'Otro concierto que termina con afonía y una foto movida.', photo: 3, likes: 9, liked: false, comments: [] }
];

const defaultPhotos = [
  { id: 0, shot: 1, album: 'amigos', title: 'Feria con los de siempre', caption: 'Una noche de feria de esas que acababan con 80 fotos casi iguales.', date: '12 de agosto de 2011', comments: ['Sue: Qué jóvenes y qué poco miedo al flash.'] },
  { id: 1, shot: 2, album: 'amigos', title: 'Verano', caption: 'Tarde de piscina y cámara compacta.', date: '22 de julio de 2012', comments: ['Sergio: Esta foto estaba en mi antiguo portátil.'] },
  { id: 2, shot: 4, album: 'viajes', title: 'Escapada improvisada', caption: 'Sin reservas, sin cobertura y sin ninguna prisa.', date: '3 de septiembre de 2013', comments: [] },
  { id: 3, shot: 3, album: 'musica', title: 'Primera fila', caption: 'La foto salió movida porque había que saltar.', date: '18 de mayo de 2014', comments: ['Cristina: Mereció totalmente la pena.'] },
  { id: 4, shot: 5, album: 'amigos', title: 'El local', caption: 'Donde se arreglaba el mundo cada viernes.', date: '8 de noviembre de 2010', comments: [] },
  { id: 5, shot: 6, album: 'viajes', title: 'Carretera y manta', caption: 'La playlist duraba más que el viaje.', date: '6 de abril de 2015', comments: [] }
];

const defaultEvents = [
  { id: 1, group: 'proximos', day: '15', month: 'AGO', title: 'Barbacoa de verano', place: 'Casa de Sergio', time: '21:00', going: true },
  { id: 2, group: 'invitaciones', day: '05', month: 'SEP', title: 'Noche de karaoke', place: 'El centro', time: '22:30', going: false },
  { id: 3, group: 'proximos', day: '19', month: 'SEP', title: 'Tarde de juegos y pizza', place: 'Casa de Cristina', time: '19:30', going: false },
  { id: 4, group: 'pasados', day: '24', month: 'JUL', title: 'Cumpleaños de Pablo', place: 'La terraza', time: '20:00', going: true }
];

const defaultConversations = {
  sue: { messages: [{ mine: false, text: '¿Has visto que vuelve la red social azul?', time: '22:04' }, { mine: true, text: 'Sí, pero esta vez sin zumbidos ni dramas.', time: '22:06' }] },
  sergio: { messages: [{ mine: false, text: 'El sábado llevo altavoz. Tú lleva la guitarra.', time: '18:31' }] },
  cristina: { messages: [{ mine: false, text: 'Te he mandado la invitación del karaoke.', time: 'Ayer' }] }
};

function loadState() {
  const base = { posts: defaultPosts, photos: defaultPhotos, events: defaultEvents, conversations: defaultConversations, wall: [], profile: { name: 'Javi Díaz', bio: 'Desarrollador, músico a ratos y superviviente de los 30.' }, request: true };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved ? { ...structuredClone(base), ...saved } : structuredClone(base);
  } catch {
    return structuredClone(base);
  }
}

let state = loadState();
let currentView = 'inicio';
let feedFilter = 'todo';
let albumFilter = 'todo';
let eventFilter = 'proximos';
let currentConversation = 'sue';
let currentPhoto = 0;
let toastTimer;

function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function avatar(name, letters = '') { return `<span class="avatar avatar--${name}">${letters || name.slice(0, 1).toUpperCase()}</span>`; }
function escapeHtml(value) { const el = document.createElement('div'); el.textContent = String(value ?? ''); return el.innerHTML; }
function showToast(text) { const toast = $('#toast'); toast.textContent = text; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2300); }

function showView(id) {
  currentView = id;
  $$('.screen').forEach(screen => { const active = screen.id === id; screen.classList.toggle('active', active); screen.hidden = !active; });
  $('#search-results').hidden = true;
  $$('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'perfil') renderProfile();
  if (id === 'mensajes') renderMessages();
  if (id === 'gente') renderPeople();
  if (id === 'fotos') renderPhotos();
  if (id === 'eventos') renderEvents();
}

function renderFeed() {
  const posts = state.posts.filter(post => feedFilter === 'todo' || post.type === feedFilter);
  $('#feed').innerHTML = posts.map(post => `
    <article class="card post" data-post="${post.id}">
      <header class="post-head">${avatar(post.avatar, post.who[0])}<div><b>${escapeHtml(post.who)}</b><small>${escapeHtml(post.when)}</small></div></header>
      <p class="post-text">${escapeHtml(post.text)}</p>
      ${post.type === 'foto' ? `<button class="post-photo shot--${post.photo}" data-open-photo="${post.photo}" aria-label="Abrir foto">${state.photos.find(photo => photo.id === post.photo)?.title || 'Foto'}</button>` : ''}
      <div class="post-actions"><button class="${post.liked ? 'liked' : ''}" data-like="${post.id}">♥ Me gusta (${post.likes})</button><button data-focus-comment="${post.id}">▱ Comentar</button><button data-share="${post.id}">↗ Compartir</button></div>
      <div class="comments">${post.comments.map(comment => `<p><b>${escapeHtml(comment.who)}:</b> ${escapeHtml(comment.text)}</p>`).join('')}<form class="comment-form" data-comment-form="${post.id}"><input name="comment" maxlength="120" placeholder="Escribe un comentario…" required><button>Comentar</button></form></div>
    </article>`).join('');
}

function renderProfile() {
  $('#perfil-title').textContent = state.profile.name;
  $('#profile-bio').textContent = state.profile.bio;
  $('#wall').innerHTML = state.wall.length ? state.wall.map(item => `<article class="wall-entry">${avatar('javi', 'JD')}<div><b>${escapeHtml(state.profile.name)}</b><p>${escapeHtml(item.text)}</p><small>${item.when}</small></div></article>`).join('') : '<p class="empty">Tu tablón todavía está esperando su primera actualización.</p>';
  $('#profile-people').innerHTML = personCards(people.slice(0, 6));
}

function personCards(list) {
  return list.map(person => `<article class="person">${avatar(person.avatar, person.name[0])}<div><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.city)}</small></div><footer><button data-chat="${person.id}">Mensaje</button><button data-demo-friend>Ver perfil</button></footer></article>`).join('');
}

function renderPeople(query = '') {
  const term = query.trim().toLowerCase();
  const list = people.filter(person => `${person.name} ${person.city}`.toLowerCase().includes(term));
  $('#people-grid').innerHTML = personCards(list);
  $('#people-count').textContent = `${list.length} resultados`;
  $('#friend-request').hidden = !state.request;
}

function renderPhotos() {
  const list = state.photos.filter(photo => albumFilter === 'todo' || photo.album === albumFilter);
  $('#photo-grid').innerHTML = list.map(photo => `<button class="photo-tile shot shot--${photo.shot}" data-open-photo="${photo.id}"><span>${escapeHtml(photo.title)}</span></button>`).join('');
}

function openPhoto(id) {
  const photo = state.photos.find(item => item.id === Number(id));
  if (!photo) return;
  currentPhoto = photo.id;
  $('#photo-large').className = `shot shot--${photo.shot}`;
  $('#photo-date').textContent = photo.date;
  $('#photo-caption').textContent = photo.caption;
  $('#photo-comments').innerHTML = photo.comments.map(comment => `<p>${escapeHtml(comment)}</p>`).join('') || '<small>Todavía no hay comentarios.</small>';
  const dialog = $('#photo-modal');
  if (!dialog.open) dialog.showModal();
}

function renderMessages() {
  const ids = Object.keys(state.conversations);
  if (!state.conversations[currentConversation]) currentConversation = ids[0];
  $('#conversation-list').innerHTML = ids.map(id => { const person = people.find(item => item.id === id); return `<button class="conversation ${id === currentConversation ? 'active' : ''}" data-conversation="${id}">${avatar(person.avatar, person.name[0])}<span><b>${escapeHtml(person.name)}</b><small>${escapeHtml(person.note)}</small></span></button>`; }).join('');
  const person = people.find(item => item.id === currentConversation);
  $('#thread-head').textContent = person ? person.name : 'Conversación';
  $('#thread').innerHTML = state.conversations[currentConversation].messages.map(message => `<p class="bubble ${message.mine ? 'mine' : ''}">${escapeHtml(message.text)}<small>${escapeHtml(message.time)}</small></p>`).join('');
  $('#thread').scrollTop = $('#thread').scrollHeight;
}

function renderOnline(query = '') {
  const term = query.trim().toLowerCase();
  const list = people.filter(person => person.online && person.name.toLowerCase().includes(term));
  $('#online-list').innerHTML = list.map(person => `<button class="online-user" data-chat="${person.id}">${avatar(person.avatar, person.name[0])}<span><b>${escapeHtml(person.name)}</b><small>${escapeHtml(person.note)}</small></span></button>`).join('');
}

function renderEvents() {
  const list = state.events.filter(event => event.group === eventFilter);
  $('#event-list').innerHTML = list.map(event => `<article class="event"><time><b>${event.day}</b>${event.month}</time><div><h3>${escapeHtml(event.title)}</h3><span>${escapeHtml(event.place)} · ${escapeHtml(event.time)}</span></div><footer><button class="${event.going ? 'active' : ''}" data-rsvp="${event.id}">${event.going ? '✓ Voy' : 'Asistiré'}</button><button data-demo-action>Compartir</button></footer></article>`).join('') || '<p>No hay eventos en esta sección.</p>';
}

function openChat(id) {
  const person = people.find(item => item.id === id);
  if (!person) return;
  currentConversation = id;
  if (!state.conversations[id]) state.conversations[id] = { messages: [] };
  $('#chat-name').textContent = person.name;
  $('#chat-window').hidden = false;
  renderChat();
}

function renderChat() {
  $('#chat-messages').innerHTML = state.conversations[currentConversation].messages.map(message => `<p class="bubble ${message.mine ? 'mine' : ''}">${escapeHtml(message.text)}</p>`).join('') || '<small>Empieza la conversación.</small>';
  $('#chat-messages').scrollTop = $('#chat-messages').scrollHeight;
}

function globalSearch(term) {
  const query = term.trim().toLowerCase();
  if (!query) { $('#search-results').hidden = true; showView(currentView); return; }
  $$('.screen').forEach(screen => { screen.hidden = true; screen.classList.remove('active'); });
  const foundPeople = people.filter(person => `${person.name} ${person.city}`.toLowerCase().includes(query));
  const foundPhotos = state.photos.filter(photo => `${photo.title} ${photo.caption}`.toLowerCase().includes(query));
  const foundEvents = state.events.filter(event => `${event.title} ${event.place}`.toLowerCase().includes(query));
  const results = $('#search-results');
  results.hidden = false;
  results.innerHTML = `<h1>Resultados para “${escapeHtml(term)}”</h1>${foundPeople.map(person => `<button class="search-result" data-view="gente">${avatar(person.avatar, person.name[0])}<span><b>${escapeHtml(person.name)}</b><br><small>${escapeHtml(person.city)}</small></span></button>`).join('')}${foundPhotos.map(photo => `<button class="search-result" data-open-photo="${photo.id}"><span class="shot shot--${photo.shot}" style="width:42px;height:42px"></span><b>${escapeHtml(photo.title)}</b></button>`).join('')}${foundEvents.map(event => `<button class="search-result" data-view="eventos"><b>${escapeHtml(event.title)}</b><small>${escapeHtml(event.place)}</small></button>`).join('') || (!foundPeople.length && !foundPhotos.length ? '<p>No hemos encontrado nada. Prueba con Sue, concierto, verano o karaoke.</p>' : '')}`;
}

function closeDialogs() { $$('dialog[open]').forEach(dialog => dialog.close()); }

document.addEventListener('click', event => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) showView(viewButton.dataset.view);

  const like = event.target.closest('[data-like]');
  if (like) { const post = state.posts.find(item => item.id === Number(like.dataset.like)); post.liked = !post.liked; post.likes += post.liked ? 1 : -1; save(); renderFeed(); }

  const focus = event.target.closest('[data-focus-comment]');
  if (focus) $(`[data-comment-form="${focus.dataset.focusComment}"] input`)?.focus();

  if (event.target.closest('[data-share]')) showToast('Enlace copiado de forma ficticia. Muy 2010.');
  if (event.target.closest('[data-demo-action]') || event.target.closest('[data-demo-friend]')) showToast('Opción preparada para una próxima versión.');

  const photo = event.target.closest('[data-open-photo]');
  if (photo) openPhoto(photo.dataset.openPhoto);

  if (event.target.closest('[data-open-upload]')) $('#upload-modal').showModal();
  if (event.target.closest('[data-close-modal]')) event.target.closest('dialog').close();

  const chat = event.target.closest('[data-chat]');
  if (chat) openChat(chat.dataset.chat);

  const conversation = event.target.closest('[data-conversation]');
  if (conversation) { currentConversation = conversation.dataset.conversation; renderMessages(); }

  const filter = event.target.closest('[data-filter]');
  if (filter) { feedFilter = filter.dataset.filter; $$('[data-filter]').forEach(button => button.classList.toggle('active', button === filter)); renderFeed(); }

  const album = event.target.closest('[data-album]');
  if (album) { albumFilter = album.dataset.album; $$('[data-album]').forEach(button => button.classList.toggle('active', button === album)); renderPhotos(); }

  const eventTab = event.target.closest('[data-event-filter]');
  if (eventTab) { eventFilter = eventTab.dataset.eventFilter; $$('[data-event-filter]').forEach(button => button.classList.toggle('active', button === eventTab)); renderEvents(); }

  const profileTab = event.target.closest('[data-profile-tab]');
  if (profileTab) { $$('[data-profile-tab]').forEach(button => button.classList.toggle('active', button === profileTab)); $$('[data-profile-panel]').forEach(panel => { const active = panel.dataset.profilePanel === profileTab.dataset.profileTab; panel.classList.toggle('active', active); panel.hidden = !active; }); }

  const rsvp = event.target.closest('[data-rsvp]');
  if (rsvp) { const item = state.events.find(eventItem => eventItem.id === Number(rsvp.dataset.rsvp)); item.going = !item.going; save(); renderEvents(); showToast(item.going ? 'Te has apuntado al evento.' : 'Has cambiado tu asistencia.'); }
});

$('#status').addEventListener('input', event => $('#counter').textContent = 180 - event.target.value.length);
$('#publish').addEventListener('click', () => { const text = $('#status').value.trim(); if (!text) return showToast('Escribe algo antes de publicar.'); state.posts.unshift({ id: Date.now(), type: 'estado', who: state.profile.name, avatar: 'javi', when: 'Ahora mismo', text, likes: 0, liked: false, comments: [] }); $('#status').value = ''; $('#counter').textContent = '180'; save(); renderFeed(); showToast('Estado publicado en este navegador.'); });

$('#feed').addEventListener('submit', event => { const form = event.target.closest('[data-comment-form]'); if (!form) return; event.preventDefault(); const input = form.elements.comment; const post = state.posts.find(item => item.id === Number(form.dataset.commentForm)); post.comments.push({ who: state.profile.name, text: input.value.trim() }); input.value = ''; save(); renderFeed(); });

$('#wall-form').addEventListener('submit', event => { event.preventDefault(); const field = event.target.querySelector('textarea'); state.wall.unshift({ text: field.value.trim(), when: 'Ahora mismo' }); field.value = ''; save(); renderProfile(); showToast('Publicado en tu tablón.'); });

$('#invite-form').addEventListener('submit', event => { event.preventDefault(); $('#invite-result').textContent = 'Invitación simulada. No se ha enviado ningún correo.'; event.target.reset(); });
$('#people-search').addEventListener('input', event => renderPeople(event.target.value));
$('#chat-search').addEventListener('input', event => renderOnline(event.target.value));
$('#search').addEventListener('input', event => globalSearch(event.target.value));

$('#accept').addEventListener('click', () => { state.request = false; save(); renderPeople(); showToast('Ana ya forma parte de tus amigos.'); });
$('#ignore').addEventListener('click', () => { state.request = false; save(); renderPeople(); showToast('Petición ocultada.'); });

$('#message-form').addEventListener('submit', event => { event.preventDefault(); const field = event.target.querySelector('textarea'); state.conversations[currentConversation].messages.push({ mine: true, text: field.value.trim(), time: 'Ahora' }); field.value = ''; save(); renderMessages(); });
$('#new-message').addEventListener('click', () => { currentConversation = 'cristina'; renderMessages(); $('#message-form textarea').focus(); });

$('#chat-form').addEventListener('submit', event => { event.preventDefault(); const field = event.target.querySelector('input'); state.conversations[currentConversation].messages.push({ mine: true, text: field.value.trim(), time: 'Ahora' }); field.value = ''; save(); renderChat(); });
$('#close-chat').addEventListener('click', () => $('#chat-window').hidden = true);
$('#collapse-chat').addEventListener('click', () => { const list = $('#online-list'); list.hidden = !list.hidden; $('#collapse-chat').textContent = list.hidden ? '+' : '−'; });

$('#bell').addEventListener('click', () => { const panel = $('#notifications'); panel.hidden = !panel.hidden; });

$('#upload-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); const nextId = Math.max(...state.photos.map(photo => photo.id), 0) + 1; state.photos.unshift({ id: nextId, shot: (nextId % 6) + 1, album: data.get('album'), title: data.get('title'), caption: data.get('caption') || 'Nuevo recuerdo en Thirty.', date: '6 de agosto de 2026', comments: [] }); save(); event.target.reset(); closeDialogs(); albumFilter = 'todo'; showView('fotos'); renderPhotos(); showToast('Foto de demostración añadida.'); });

$('#photo-comment-form').addEventListener('submit', event => { event.preventDefault(); const input = event.target.querySelector('input'); const photo = state.photos.find(item => item.id === currentPhoto); photo.comments.push(`${state.profile.name}: ${input.value.trim()}`); input.value = ''; save(); openPhoto(currentPhoto); });

$('#create-event').addEventListener('click', () => $('#event-modal').showModal());
$('#event-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); const date = new Date(`${data.get('date')}T12:00:00`); const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']; state.events.unshift({ id: Date.now(), group: 'proximos', day: String(date.getDate()).padStart(2, '0'), month: months[date.getMonth()], title: data.get('title'), place: data.get('place'), time: data.get('time'), going: true }); save(); event.target.reset(); closeDialogs(); eventFilter = 'proximos'; showView('eventos'); renderEvents(); showToast('Evento creado localmente.'); });

$('#edit-profile').addEventListener('click', () => { const form = $('#profile-form'); form.elements.name.value = state.profile.name; form.elements.bio.value = state.profile.bio; $('#profile-modal').showModal(); });
$('#profile-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); state.profile = { name: data.get('name'), bio: data.get('bio') }; save(); closeDialogs(); renderProfile(); showToast('Perfil actualizado.'); });

$$('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));

renderFeed();
renderPeople();
renderPhotos();
renderMessages();
renderOnline();
renderEvents();
renderProfile();
