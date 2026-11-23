const API_BASE   = '../php-api/public/api';
const UPLOAD_URL = '../php-api/public/upload.php';
let authToken    = localStorage.getItem('token');
let currentAdmin = null;

const state = {
  teams: [],
  masterCategories: [],
  categories: new Map(),
  players: new Map(),
  standings: [],
  teamCategories: [],
  matches: [],
  jornadas: [],
  admins: [],
  arbitros: [],
  news: [],
  events: [],
  bitacora: [],
  currentUserRol: null,
  equipoId: null,
  editMatchId: null,
  lineupMatchId: null,
  lineupData: null,
};

const els = {
  authView: document.getElementById('auth-view'),
  app: document.getElementById('app'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  logoutBtn: document.getElementById('logout-btn'),
  userChip: document.getElementById('user-chip'),
  userName: document.getElementById('user-name'),
  teamForm:           document.getElementById('team-form'),
  teamName:           document.getElementById('team-name'),
  teamCoach:          document.getElementById('team-coach'),
  teamPhone:          document.getElementById('team-phone'),
  teamEmail:          document.getElementById('team-email'),
  teamCity:           document.getElementById('team-city'),
  teamVenue:          document.getElementById('team-venue'),
  teamDescription:    document.getElementById('team-description'),
  teamCrest:          document.getElementById('team-crest'),
  teamCrestPreview:   document.getElementById('team-crest-preview'),
  teamsTable:         document.getElementById('teams-table'),
  categoryForm: document.getElementById('category-form'),
  categoryMasterForm: document.getElementById('category-master-form'),
  categoryTeam: document.getElementById('category-team'),
  categoryMasterName: document.getElementById('category-master-name'),
  categoryExisting: document.getElementById('category-existing'),
  categoryFilterTeam: document.getElementById('category-filter-team'),
  categoriesMasterTable: document.getElementById('categories-master-table'),
  categoriesTable: document.getElementById('categories-table'),
  playerForm:            document.getElementById('player-form'),
  playerTeam:            document.getElementById('player-team'),
  playerCategory:        document.getElementById('player-category'),
  playerName:            document.getElementById('player-name'),
  playerLastname:        document.getElementById('player-lastname'),
  playerBorn:            document.getElementById('player-born'),
  playerNumber:          document.getElementById('player-number'),
  playerEstatura:        document.getElementById('player-estatura'),
  playerPeso:            document.getElementById('player-peso'),
  playerAlergias:        document.getElementById('player-alergias'),
  playerNombrePapa:      document.getElementById('player-nombre-papa'),
  playerNombreMama:      document.getElementById('player-nombre-mama'),
  playerEscuela:         document.getElementById('player-escuela'),
  playerGradoEscolar:    document.getElementById('player-grado-escolar'),
  playerTelefonoCasa:    document.getElementById('player-telefono-casa'),
  playerTelefonoMama:    document.getElementById('player-telefono-mama'),
  playerTelefonoPapa:    document.getElementById('player-telefono-papa'),
  playerTipoSanguineo:   document.getElementById('player-tipo-sanguineo'),
  playerPhoto:           document.getElementById('player-photo'),
  playerPhotoPreview:    document.getElementById('player-photo-preview'),
  playerFilterTeam:      document.getElementById('player-filter-team'),
  playerFilterCategory:  document.getElementById('player-filter-category'),
  playersTable:          document.getElementById('players-table'),
  playerInfoModal:       document.getElementById('playerInfoModal'),
  playerModalPhoto:      document.getElementById('player-modal-photo'),
  playerModalName:       document.getElementById('player-modal-name'),
  playerModalTeam:       document.getElementById('player-modal-team'),
  playerModalCategory:   document.getElementById('player-modal-category'),
  playerModalNumber:     document.getElementById('player-modal-number'),
  playerModalBorn:       document.getElementById('player-modal-born'),
  playerModalBlood:      document.getElementById('player-modal-blood'),
  playerModalHeight:     document.getElementById('player-modal-height'),
  playerModalWeight:     document.getElementById('player-modal-weight'),
  playerModalAllergies:  document.getElementById('player-modal-allergies'),
  playerModalFather:     document.getElementById('player-modal-father'),
  playerModalMother:     document.getElementById('player-modal-mother'),
  playerModalPhoneHome:  document.getElementById('player-modal-phone-home'),
  playerModalPhoneMom:   document.getElementById('player-modal-phone-mom'),
  playerModalPhoneDad:   document.getElementById('player-modal-phone-dad'),
  playerModalSchool:     document.getElementById('player-modal-school'),
  playerModalGrade:      document.getElementById('player-modal-grade'),
  playerEditPanel:       document.getElementById('player-edit-panel'),
  playerEditBlood:       document.getElementById('player-edit-blood'),
  playerEditHeight:      document.getElementById('player-edit-height'),
  playerEditWeight:      document.getElementById('player-edit-weight'),
  playerEditAllergies:   document.getElementById('player-edit-allergies'),
  playerEditFather:      document.getElementById('player-edit-father'),
  playerEditMother:      document.getElementById('player-edit-mother'),
  playerEditPhoneHome:   document.getElementById('player-edit-phone-home'),
  playerEditPhoneMom:    document.getElementById('player-edit-phone-mom'),
  playerEditPhoneDad:    document.getElementById('player-edit-phone-dad'),
  playerEditSchool:      document.getElementById('player-edit-school'),
  playerEditGrade:       document.getElementById('player-edit-grade'),
  playerModalEdit:       document.getElementById('player-modal-edit'),
  playerModalCancel:     document.getElementById('player-modal-cancel'),
  playerModalSave:       document.getElementById('player-modal-save'),
  standingForm: document.getElementById('standing-form'),
  standingTeam: document.getElementById('standing-team'),
  standingCategory: document.getElementById('standing-category'),
  standingFilterCategory: document.getElementById('standing-filter-category'),
  standingInputs: {
    pj: document.getElementById('standing-pj'),
    g: document.getElementById('standing-g'),
    e: document.getElementById('standing-e'),
    p: document.getElementById('standing-p'),
    gf: document.getElementById('standing-gf'),
    gc: document.getElementById('standing-gc'),
    pts: document.getElementById('standing-pts'),
  },
  standingsTable: document.getElementById('standings-table'),
  pdfTeam: document.getElementById('pdf-team'),
  pdfCategory: document.getElementById('pdf-category'),
  pdfMatch: document.getElementById('pdf-match'),
  pdfGenerate: document.getElementById('pdf-generate'),
  pdfGenerateRoster: document.getElementById('pdf-generate-roster'),
  newsForm: document.getElementById('news-form'),
  newsTitle: document.getElementById('news-title'),
  newsContent: document.getElementById('news-content'),
  newsOrder: document.getElementById('news-order'),
  newsImage: document.getElementById('news-image'),
  newsImagePreview: document.getElementById('news-image-preview'),
  newsTable: document.getElementById('news-table'),
  eventForm: document.getElementById('event-form'),
  eventTitle: document.getElementById('event-title'),
  eventContent: document.getElementById('event-content'),
  eventOrder: document.getElementById('event-order'),
  eventImage: document.getElementById('event-image'),
  eventImagePreview: document.getElementById('event-image-preview'),
  eventsTable: document.getElementById('events-table'),
  adminForm: document.getElementById('admin-form'),
  adminName: document.getElementById('admin-name'),
  adminEmail: document.getElementById('admin-email'),
  adminPassword: document.getElementById('admin-password'),
  adminRol: document.getElementById('admin-rol'),
  adminTeamWrap: document.getElementById('admin-team-wrap'),
  adminTeam: document.getElementById('admin-team'),
  adminsTable: document.getElementById('admins-table'),
  bitacoraFilterRol: document.getElementById('bitacora-filter-rol'),
  bitacoraTable: document.getElementById('bitacora-table'),
  jornadaForm:      document.getElementById('jornada-form'),
  jornadaName:      document.getElementById('jornada-name'),
  jornadasTable:    document.getElementById('jornadas-table'),
  matchForm:         document.getElementById('match-form'),
  matchJornada:      document.getElementById('match-jornada'),
  matchCategory:     document.getElementById('match-category'),
  matchLocal:        document.getElementById('match-local'),
  matchVisita:       document.getElementById('match-visita'),
  matchFecha:        document.getElementById('match-fecha'),
  matchLugar:        document.getElementById('match-lugar'),
  matchArbitro:      document.getElementById('match-arbitro'),
  matchesTable:      document.getElementById('matches-table'),
  // Árbitros
  arbitroForm:       document.getElementById('arbitro-form'),
  arbitroNombre:     document.getElementById('arbitro-nombre'),
  arbitroApellidos:  document.getElementById('arbitro-apellidos'),
  arbitrosTable:     document.getElementById('arbitros-table'),
  matchFilterEstado: document.getElementById('match-filter-estado'),
  resultFormWrap: document.getElementById('result-form-wrap'),
  resultMatchLabel: document.getElementById('result-match-label'),
  resultLocal: document.getElementById('result-local'),
  resultVisita: document.getElementById('result-visita'),
  resultSave: document.getElementById('result-save'),
  resultPreview: document.getElementById('result-preview'),
  lineupWrap: document.getElementById('lineup-wrap'),
  lineupMatchLabel: document.getElementById('lineup-match-label'),
  lineupLocalList: document.getElementById('lineup-local-list'),
  lineupVisitaList: document.getElementById('lineup-visita-list'),
  lineupSave: document.getElementById('lineup-save'),
  summaryTeams: document.getElementById('summary-teams'),
  summaryCategories: document.getElementById('summary-categories'),
  summaryPlayers: document.getElementById('summary-players'),
  summaryLabelTeam: document.getElementById('summary-label-team'),
  summaryLabelCategory: document.getElementById('summary-label-category'),
  summaryLabelPlayer: document.getElementById('summary-label-player'),
  summaryIconTeam: document.getElementById('summary-icon-team'),
  summaryIconCategory: document.getElementById('summary-icon-category'),
  summaryIconPlayer: document.getElementById('summary-icon-player'),
  summaryTeamMeta: document.getElementById('summary-team-meta'),
  summaryCategoryMeta: document.getElementById('summary-category-meta'),
  summaryPlayerMeta: document.getElementById('summary-player-meta'),
  summaryTeamCrestWrap: document.getElementById('summary-team-crest-wrap'),
  summaryPdfBtn: document.getElementById('summary-pdf-btn'),
  toastContainer: document.getElementById('toast-container'),
};

function handleSummaryPdfClick() {
  if (!els.pdfCategory || !els.pdfCategory.value) {
    showToast('Selecciona una categoría para descargar la cédula', 'error');
    return;
  }
  generateTeamPdf();
}

function renderDashboardSummary() {
  const assignedTeam = state.teams.find((team) => team.id === Number(state.equipoId)) || state.teams[0] || null;
  const playersCount = Array.from(state.players.values()).reduce((acc, arr) => acc + arr.length, 0);

  if (state.currentUserRol === 'equipo') {
    if (els.summaryLabelTeam) els.summaryLabelTeam.textContent = 'Equipo';
    if (els.summaryLabelCategory) els.summaryLabelCategory.textContent = 'Administrador';
    if (els.summaryLabelPlayer) els.summaryLabelPlayer.textContent = 'Jugadores';
    if (els.summaryTeams) els.summaryTeams.textContent = assignedTeam?.nombre || 'Sin equipo';
    if (els.summaryCategories) els.summaryCategories.textContent = currentAdmin?.nombre || 'Sin nombre';
    if (els.summaryPlayers) els.summaryPlayers.textContent = playersCount;
    if (els.summaryTeamMeta) els.summaryTeamMeta.textContent = assignedTeam?.entrenador ? `Entrenador: ${assignedTeam.entrenador}` : 'Equipo asignado';
    if (els.summaryCategoryMeta) els.summaryCategoryMeta.textContent = currentAdmin?.email || 'Administrador de equipo';
    if (els.summaryPlayerMeta) els.summaryPlayerMeta.textContent = 'Jugadores registrados';
    if (els.summaryIconTeam) els.summaryIconTeam.className = 'fa-solid fa-shield-halved text-success';
    if (els.summaryIconCategory) els.summaryIconCategory.className = 'fa-solid fa-user-shield text-info';
    if (els.summaryIconPlayer) els.summaryIconPlayer.className = 'fa-solid fa-user text-warning';
    if (els.summaryTeamCrestWrap) {
      if (assignedTeam?.escudo_url) {
        els.summaryTeamCrestWrap.innerHTML = `<img src="${assignedTeam.escudo_url}" alt="${assignedTeam.nombre}">`;
        els.summaryTeamCrestWrap.classList.remove('d-none');
      } else {
        els.summaryTeamCrestWrap.innerHTML = '<i class="fa-solid fa-shield-halved text-secondary"></i>';
        els.summaryTeamCrestWrap.classList.remove('d-none');
      }
    }
    return;
  }

  if (els.summaryLabelTeam) els.summaryLabelTeam.textContent = 'Equipos';
  if (els.summaryLabelCategory) els.summaryLabelCategory.textContent = 'Categorías';
  if (els.summaryLabelPlayer) els.summaryLabelPlayer.textContent = 'Jugadores';
  if (els.summaryIconTeam) els.summaryIconTeam.className = 'fa-solid fa-people-group text-success';
  if (els.summaryIconCategory) els.summaryIconCategory.className = 'fa-solid fa-layer-group text-info';
  if (els.summaryIconPlayer) els.summaryIconPlayer.className = 'fa-solid fa-user text-warning';
  if (els.summaryTeamMeta) els.summaryTeamMeta.textContent = '';
  if (els.summaryCategoryMeta) els.summaryCategoryMeta.textContent = '';
  if (els.summaryPlayerMeta) els.summaryPlayerMeta.textContent = '';
  if (els.summaryTeamCrestWrap) {
    els.summaryTeamCrestWrap.innerHTML = '';
    els.summaryTeamCrestWrap.classList.add('d-none');
  }
}

function showToast(message, type = 'info') {
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-bg-' + (type === 'error' ? 'danger' : type === 'success' ? 'success' : 'secondary') + ' border-0';
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  els.toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3200 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function showPlayerInfoModal(player, categoryId) {
  if (!player || !els.playerInfoModal) return;
  const categoryLabel = els.playerFilterCategory?.selectedOptions?.[0]?.textContent || '-';
  els.playerInfoModal.dataset.playerId = String(player.id || '');
  els.playerInfoModal.dataset.categoryId = String(categoryId || '');

  if (els.playerModalPhoto) {
    if (player.foto_url) {
      els.playerModalPhoto.src = player.foto_url;
      els.playerModalPhoto.classList.remove('d-none');
    } else {
      els.playerModalPhoto.classList.add('d-none');
      els.playerModalPhoto.src = '';
    }
  }

  if (els.playerModalName) els.playerModalName.textContent = `${player.nombre || ''} ${player.apellidos || ''}`.trim() || '-';
  if (els.playerModalTeam) els.playerModalTeam.textContent = player.equipoNombre || '-';
  if (els.playerModalCategory) els.playerModalCategory.textContent = categoryLabel;
  if (els.playerModalNumber) els.playerModalNumber.textContent = player.numero || '-';
  if (els.playerModalBorn) els.playerModalBorn.textContent = player.fechaNac ? String(player.fechaNac).slice(0, 10) : '-';
  if (els.playerModalBlood) els.playerModalBlood.textContent = player.tipoSanguineo || '-';
  if (els.playerModalHeight) els.playerModalHeight.textContent = player.estatura ? `${player.estatura} m` : '-';
  if (els.playerModalWeight) els.playerModalWeight.textContent = player.peso ? `${player.peso} kg` : '-';
  if (els.playerModalAllergies) els.playerModalAllergies.textContent = player.alergias || '-';
  if (els.playerModalFather) els.playerModalFather.textContent = player.nombrePapa || '-';
  if (els.playerModalMother) els.playerModalMother.textContent = player.nombreMama || '-';
  if (els.playerModalPhoneHome) els.playerModalPhoneHome.textContent = player.telefonoCasa || '-';
  if (els.playerModalPhoneMom) els.playerModalPhoneMom.textContent = player.telefonoMama || '-';
  if (els.playerModalPhoneDad) els.playerModalPhoneDad.textContent = player.telefonoPapa || '-';
  if (els.playerModalSchool) els.playerModalSchool.textContent = player.escuela || '-';
  if (els.playerModalGrade) els.playerModalGrade.textContent = player.gradoEscolar || '-';

  if (els.playerEditPanel) els.playerEditPanel.classList.add('d-none');
  if (els.playerModalEdit) els.playerModalEdit.classList.remove('d-none');

  if (els.playerEditBlood) els.playerEditBlood.value = player.tipoSanguineo || '';
  if (els.playerEditHeight) els.playerEditHeight.value = player.estatura ?? '';
  if (els.playerEditWeight) els.playerEditWeight.value = player.peso ?? '';
  if (els.playerEditAllergies) els.playerEditAllergies.value = player.alergias || '';
  if (els.playerEditFather) els.playerEditFather.value = player.nombrePapa || '';
  if (els.playerEditMother) els.playerEditMother.value = player.nombreMama || '';
  if (els.playerEditPhoneHome) els.playerEditPhoneHome.value = player.telefonoCasa || '';
  if (els.playerEditPhoneMom) els.playerEditPhoneMom.value = player.telefonoMama || '';
  if (els.playerEditPhoneDad) els.playerEditPhoneDad.value = player.telefonoPapa || '';
  if (els.playerEditSchool) els.playerEditSchool.value = player.escuela || '';
  if (els.playerEditGrade) els.playerEditGrade.value = player.gradoEscolar || '';

  new bootstrap.Modal(els.playerInfoModal).show();
}

async function savePlayerFromModal() {
  if (!els.playerInfoModal) return;
  const playerId = Number(els.playerInfoModal.dataset.playerId || 0);
  const categoryId = Number(els.playerInfoModal.dataset.categoryId || 0);
  if (!playerId || !categoryId) return;

  const list = state.players.get(categoryId) || [];
  const current = list.find((p) => Number(p.id) === playerId);
  if (!current) return;

  const body = {
    nombre: current.nombre,
    apellidos: current.apellidos,
    numero: Number(current.numero || 0),
    fechaNac: current.fechaNac || null,
    foto: current.foto_url || null,
    estatura: els.playerEditHeight?.value || null,
    peso: els.playerEditWeight?.value || null,
    alergias: els.playerEditAllergies?.value.trim() || null,
    nombrePapa: els.playerEditFather?.value.trim() || null,
    nombreMama: els.playerEditMother?.value.trim() || null,
    escuela: els.playerEditSchool?.value.trim() || null,
    gradoEscolar: els.playerEditGrade?.value.trim() || null,
    telefonoCasa: els.playerEditPhoneHome?.value.trim() || null,
    telefonoMama: els.playerEditPhoneMom?.value.trim() || null,
    telefonoPapa: els.playerEditPhoneDad?.value.trim() || null,
    tipoSanguineo: els.playerEditBlood?.value.trim() || null,
  };

  await api(`/players/${playerId}`, { method: 'PUT', body: JSON.stringify(body) });

  const updated = {
    ...current,
    ...body,
    id: playerId,
    fechaNac: body.fechaNac,
    foto_url: body.foto,
  };
  state.players.set(categoryId, list.map((p) => (Number(p.id) === playerId ? updated : p)));
  renderPlayers();
  showToast('Jugador actualizado', 'success');
  if (els.playerEditPanel) els.playerEditPanel.classList.add('d-none');
  if (els.playerModalEdit) els.playerModalEdit.classList.remove('d-none');
  const openModal = bootstrap.Modal.getInstance(els.playerInfoModal);
  if (openModal) openModal.hide();
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();
  let parsed = null;
  if (rawText) {
    if (contentType.includes('application/json')) {
      try {
        parsed = JSON.parse(rawText);
      } catch (error) {
        throw new Error(`Respuesta JSON inválida en ${path}`);
      }
    } else {
      try {
        parsed = JSON.parse(rawText);
      } catch (_error) {
        parsed = null;
      }
    }
  }
  if (!res.ok) {
    let errText = 'Error en la solicitud';
    if (parsed && typeof parsed === 'object') errText = parsed.message || JSON.stringify(parsed);
    else if (rawText && rawText.trim().startsWith('<')) errText = `El servidor devolvió HTML en ${path} (HTTP ${res.status})`;
    else errText = rawText || res.statusText;
    throw new Error(errText);
  }
  if (res.status === 204 || !rawText) return null;
  if (parsed !== null) return parsed;
  throw new Error(`El servidor devolvió una respuesta no JSON en ${path}`);
}

function setAuthenticated(admin, token) {
  currentAdmin = admin;
  authToken = token;
  state.currentUserRol = admin.rol;
  state.equipoId = admin.equipo_id || null;
  localStorage.setItem('token', token);
  els.userName.textContent = admin.nombre + (admin.rol === 'super' ? ' 👑' : '');
  els.userChip.classList.remove('d-none');
  els.authView.style.display = 'none';
  els.app.style.display = '';
  if (admin.rol === 'super') {
    document.querySelectorAll('.super-only-tab').forEach(el => el.classList.remove('d-none'));
    if (els.summaryPdfBtn) els.summaryPdfBtn.disabled = false;
  } else {
    // Admin de equipo: ve jugadores y PDF por equipo/categoria
    document.querySelectorAll('#admin-tabs .nav-item').forEach(el => el.classList.add('d-none'));
    const jugTab = document.querySelector('[data-bs-target="#tab-jugadores"]');
    const pdfTab = document.querySelector('[data-bs-target="#tab-pdf"]');
    if (jugTab) {
      jugTab.closest('.nav-item').classList.remove('d-none');
      new bootstrap.Tab(jugTab).show();
    }
    if (pdfTab) {
      pdfTab.closest('.nav-item').classList.remove('d-none');
    }
    const pdfMatchCard = els.pdfMatch?.closest('.panel-card');
    if (pdfMatchCard) pdfMatchCard.style.display = 'none';
    if (els.pdfTeam) {
      els.pdfTeam.value = String(admin.equipo_id || '');
      els.pdfTeam.disabled = true;
    }
  }
  loadAllData();
}

function logout() {
  authToken = null;
  currentAdmin = null;
  state.currentUserRol = null;
  localStorage.removeItem('token');
  els.app.style.display = 'none';
  els.userChip.classList.add('d-none');
  els.authView.style.display = '';
  // Restaurar estado de tabs
  document.querySelectorAll('#admin-tabs .nav-item').forEach(el => el.classList.remove('d-none'));
  document.querySelectorAll('.super-only-tab').forEach(el => el.classList.add('d-none'));
  const pdfMatchCard = els.pdfMatch?.closest('.panel-card');
  if (pdfMatchCard) pdfMatchCard.style.display = '';
  if (els.pdfTeam) {
    els.pdfTeam.disabled = false;
  }
  state.lineupMatchId = null;
  state.lineupData = null;
  if (els.lineupWrap) els.lineupWrap.style.display = 'none';
  if (els.resultFormWrap) els.resultFormWrap.style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = els.loginEmail.value.trim();
  const password = els.loginPassword.value;
  try {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    showToast('Bienvenido ' + data.admin.nombre, 'success');
    setAuthenticated(data.admin, data.token);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadTeams() {
  const teams = await api('/teams');
  state.teams = teams;
  renderTeams();
  refreshTeamSelects();
  els.summaryTeams.textContent = teams.length;
  renderDashboardSummary();
}

async function loadMasterCategories() {
  const categories = await api('/categories');
  state.masterCategories = categories;
  renderMasterCategories();
  refreshMasterCategorySelects();
  els.summaryCategories.textContent = categories.length;
  return categories;
}

function renderMasterCategories() {
  if (!els.categoriesMasterTable) return;
  els.categoriesMasterTable.innerHTML = state.masterCategories
    .map((c) => `<tr><td>${c.nombre}</td></tr>`)
    .join('') || '<tr><td class="text-secondary">Sin categorías registradas</td></tr>';
}

function renderTeams() {
  els.teamsTable.innerHTML = state.teams
    .map((t) => `
      <tr>
        <td style="width:52px;text-align:center;">
          ${t.escudo_url
            ? `<img src="${t.escudo_url}" style="width:40px;height:40px;object-fit:contain;border-radius:6px;">`
            : `<i class="fa-regular fa-image text-muted" style="font-size:1.6rem;"></i>`}
        </td>
        <td>${t.nombre}</td>
        <td class="text-end">
          <label class="btn btn-sm btn-outline-secondary me-1" title="Cambiar escudo" style="cursor:pointer;margin-bottom:0;">
            <i class="fa-solid fa-camera"></i>
            <input type="file" accept="image/*" style="display:none" class="crest-upload-input" data-id="${t.id}" data-nombre="${t.nombre}" data-entrenador="${t.entrenador || ''}">
          </label>
          <button class="btn btn-sm btn-outline-light me-1" data-action="edit" data-id="${t.id}"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      </tr>`)
    .join('');
  // Bind camera upload for each row
  els.teamsTable.querySelectorAll('.crest-upload-input').forEach((input) => {
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      const id = Number(input.dataset.id);
      const nombre = input.dataset.nombre;
      const entrenador = input.dataset.entrenador || null;
      try {
        const url = await uploadImage(file, 'team', toSlug(nombre));
        const t = state.teams.find((t) => t.id === id);
        if (t) {
          t.escudo_url = url;
          await api(`/teams/${id}`, { method: 'PUT', body: JSON.stringify({ nombre: t.nombre, entrenador, escudo_url: url }) });
          renderTeams();
          showToast('Escudo actualizado', 'success');
        }
      } catch (err) { showToast(err.message, 'error'); }
    });
  });
}

function refreshTeamSelects() {
  const selects = [els.categoryTeam, els.categoryFilterTeam, els.playerTeam, els.playerFilterTeam, els.standingTeam, els.pdfTeam, els.adminTeam];
  selects.forEach((sel) => {
    if (!sel) return;
    sel.innerHTML = state.teams.map((t) => `<option value="${t.id}">${t.nombre}</option>`).join('');
  });
}

function refreshMasterCategorySelects() {
  const options = state.masterCategories.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');
  if (els.categoryExisting) {
    els.categoryExisting.innerHTML = options;
  }
  if (els.matchCategory) {
    els.matchCategory.innerHTML = '<option value="">Selecciona categoría</option>' + options;
  }
}

function refreshMatchTeamCategoryOptions() {
  if (!els.matchCategory || !els.matchLocal || !els.matchVisita) return;
  const categoryId = Number(els.matchCategory.value || 0);
  const filtered = categoryId
    ? state.teamCategories.filter((tc) => Number(tc.cat_id) === categoryId)
    : [];
  const opts = filtered.map((tc) => `<option value="${tc.id}">${tc.display}</option>`).join('');
  els.matchLocal.innerHTML = opts;
  els.matchVisita.innerHTML = opts;
}

function refreshJornadaSelect() {
  if (!els.matchJornada) return;
  const options = state.jornadas.map((j) => `<option value="${j.id}">${j.nombre}</option>`).join('');
  els.matchJornada.innerHTML = '<option value="">Selecciona jornada</option>' + options;
}

function toggleAdminTeamField() {
  if (!els.adminRol || !els.adminTeamWrap || !els.adminTeam) return;
  const isEquipo = els.adminRol.value === 'equipo';
  els.adminTeamWrap.style.display = isEquipo ? '' : 'none';
  if (!isEquipo) els.adminTeam.value = '';
}

// ── Helpers para upload e imagen preview ────────────────────────────────────
async function uploadImage(file, tipo, teamSlug, catSlug = '') {
  if (!file) return null;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('tipo', tipo);
  fd.append('teamSlug', teamSlug);
  if (catSlug) fd.append('catSlug', catSlug);
  const headers = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const res = await fetch(UPLOAD_URL, { method: 'POST', body: fd, headers });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'Error al subir imagen'); }
  const data = await res.json();
  return data.url;
}

function toSlug(s) {
  return (s || '').toLowerCase()
    .replace(/[\u00e1\u00e0\u00e2\u00e4]/g,'a').replace(/[\u00e9\u00e8\u00ea\u00eb]/g,'e')
    .replace(/[\u00ed\u00ec\u00ee\u00ef]/g,'i').replace(/[\u00f3\u00f2\u00f4\u00f6]/g,'o')
    .replace(/[\u00fa\u00f9\u00fb\u00fc]/g,'u').replace(/\u00f1/g,'n')
    .replace(/[^a-z0-9]+/g,'_');
}

function bindImagePreview(inputEl, previewEl) {
  if (!inputEl || !previewEl) return;
  inputEl.addEventListener('change', () => {
    const file = inputEl.files[0];
    if (!file) { previewEl.innerHTML = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewEl.innerHTML = `<img src="${ev.target.result}" style="max-height:80px;max-width:100%;border-radius:6px;margin-top:6px;">`;
    };
    reader.readAsDataURL(file);
  });
}

async function createTeam(e) {
  e.preventDefault();
  const nombre     = els.teamName.value.trim();
  const entrenador = els.teamCoach?.value.trim() || null;
  const telefono   = els.teamPhone?.value.trim() || null;
  const email      = els.teamEmail?.value.trim() || null;
  const ciudad     = els.teamCity?.value.trim() || null;
  const sede       = els.teamVenue?.value.trim() || null;
  const descripcion = els.teamDescription?.value.trim() || null;
  if (!nombre) return;
  try {
    let escudo_url = null;
    const file = els.teamCrest?.files[0];
    if (file) escudo_url = await uploadImage(file, 'team', toSlug(nombre));
    const team = await api('/teams', { method: 'POST', body: JSON.stringify({ nombre, entrenador, escudo_url, telefono, email, ciudad, sede, descripcion }) });
    state.teams.push({ ...team, escudo_url, telefono, email, ciudad, sede, descripcion });
    renderTeams();
    refreshTeamSelects();
    els.teamForm.reset();
    if (els.teamCrestPreview) els.teamCrestPreview.innerHTML = '';
    showToast('Equipo creado', 'success');
    els.summaryTeams.textContent = state.teams.length;
  } catch (err) { showToast(err.message, 'error'); }
}

async function updateTeam(id, name) {
  const nombre = name.trim();
  if (!nombre) return;
  const existing = state.teams.find((t) => t.id === Number(id));
  await api(`/teams/${id}`, { method: 'PUT', body: JSON.stringify({
    nombre,
    entrenador: existing?.entrenador ?? null,
    escudo_url: existing?.escudo_url ?? null,
  }) });
  state.teams = state.teams.map((t) => (t.id === Number(id) ? { ...t, nombre } : t));
  renderTeams();
  refreshTeamSelects();
}

async function deleteTeam(id) {
  await api(`/teams/${id}`, { method: 'DELETE' });
  state.teams = state.teams.filter((t) => t.id !== Number(id));
  renderTeams();
  refreshTeamSelects();
  showToast('Equipo eliminado', 'success');
  els.summaryTeams.textContent = state.teams.length;
  renderDashboardSummary();
}

async function loadCategories(teamId) {
  if (!teamId) return [];
  const cats = await api(`/teams/${teamId}/categories`);
  state.categories.set(Number(teamId), cats);
  renderCategories();
  updateCategoryDependentSelects();
  return cats;
}

function renderCategories() {
  const teamId = Number(els.categoryFilterTeam.value || (state.teams[0] && state.teams[0].id));
  const cats = state.categories.get(teamId) || [];
  const teamName = state.teams.find((t) => t.id === teamId)?.nombre || '';
  els.categoriesTable.innerHTML = cats
    .map((c) => `
      <tr>
        <td>${c.nombre}</td>
        <td>${teamName}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-action="delete-category" data-id="${c.id}" data-team="${teamId}"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      </tr>`)
    .join('');
}

function updateCategoryDependentSelects() {
  const setCategoryOptions = (selectEl, cats) => {
    if (!selectEl) return;
    const previousValue = String(selectEl.value || '');
    selectEl.innerHTML = cats.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');
    if (!cats.length) return;
    if (previousValue && cats.some((c) => String(c.id) === previousValue)) {
      selectEl.value = previousValue;
      return;
    }
    selectEl.value = String(cats[0].id);
  };

  const teamIdForPlayerForm = Number(els.playerTeam.value || (state.teams[0]?.id || 0));
  const catsForPlayerForm = state.categories.get(teamIdForPlayerForm) || [];
  setCategoryOptions(els.playerCategory, catsForPlayerForm);

  const teamIdForPlayerFilter = Number(els.playerFilterTeam.value || (state.teams[0]?.id || 0));
  const catsForPlayerFilter = state.categories.get(teamIdForPlayerFilter) || [];
  setCategoryOptions(els.playerFilterCategory, catsForPlayerFilter);

  const teamIdForStand = Number(els.standingTeam.value || (state.teams[0]?.id || 0));
  const catsForStand = state.categories.get(teamIdForStand) || [];
  setCategoryOptions(els.standingCategory, catsForStand);
  if (els.standingFilterCategory) {
    const previousValue = String(els.standingFilterCategory.value || '');
    const options = ['<option value="">Todas las categorías</option>'].concat(
      catsForStand.map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    ).join('');
    els.standingFilterCategory.innerHTML = options;
    if (previousValue && catsForStand.some((c) => String(c.id) === previousValue)) {
      els.standingFilterCategory.value = previousValue;
    }
  }

  const teamIdForPdf = Number(els.pdfTeam?.value || (state.teams[0]?.id || 0));
  const catsForPdf = state.categories.get(teamIdForPdf) || [];
  setCategoryOptions(els.pdfCategory, catsForPdf);
}

async function createMasterCategory(e) {
  e.preventDefault();
  const nombre = els.categoryMasterName?.value.trim();
  if (!nombre) return;
  try {
    const cat = await api('/categories', { method: 'POST', body: JSON.stringify({ nombre }) });
    state.masterCategories.push(cat);
    state.masterCategories.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    renderMasterCategories();
    refreshMasterCategorySelects();
    els.categoryMasterForm.reset();
    els.summaryCategories.textContent = state.masterCategories.length;
    showToast('Categoría global creada', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function createCategory(e) {
  e.preventDefault();
  const teamId = Number(els.categoryTeam.value);
  const categoryId = Number(els.categoryExisting.value);
  if (!teamId || !categoryId) return;
  try {
    const cat = await api(`/teams/${teamId}/categories`, { method: 'POST', body: JSON.stringify({ categoryId }) });
    const list = state.categories.get(teamId) || [];
    list.push(cat);
    state.categories.set(teamId, list);
    renderCategories();
    updateCategoryDependentSelects();
    els.categoryForm.reset();
    showToast('Categoría asignada al equipo', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteCategory(id, teamId) {
  await api(`/categories/${id}`, { method: 'DELETE' });
  const list = state.categories.get(Number(teamId)) || [];
  state.categories.set(Number(teamId), list.filter((c) => c.id !== Number(id)));
  renderCategories();
  updateCategoryDependentSelects();
  showToast('Categoría eliminada', 'success');
}

async function loadPlayers(categoryId) {
  if (!categoryId) return [];
  const players = await api(`/categories/${categoryId}/players`);
  state.players.set(Number(categoryId), players);
  renderPlayers();
  els.summaryPlayers.textContent = Array.from(state.players.values()).reduce((acc, arr) => acc + arr.length, 0);
  renderDashboardSummary();
  return players;
}

function renderPlayers() {
  const selectedTeamId = Number(els.playerFilterTeam.value);
  const categoryId = Number(els.playerFilterCategory.value || 0);
  if (!categoryId) {
    els.playersTable.innerHTML = '<tr><td colspan="5" class="text-secondary text-center py-3">Selecciona una categoría para ver jugadores</td></tr>';
    return;
  }
  const allPlayers = state.players.get(categoryId) || [];
  
  // Filtrar por equipo si se seleccionó uno
  const players = selectedTeamId 
    ? allPlayers.filter(p => Number(p.equipoId) === selectedTeamId)
    : allPlayers;
  
  if (!players.length) {
    els.playersTable.innerHTML = '<tr><td colspan="5" class="text-secondary text-center py-3">No hay jugadores registrados</td></tr>';
    return;
  }
  
  els.playersTable.innerHTML = players
    .map((p) => {
      const foto = p.foto_url
        ? `<img src="${p.foto_url}" style="width:30px;height:30px;object-fit:cover;border-radius:50%;margin-right:6px;vertical-align:middle;">`
        : '';
      return `
        <tr data-player-id="${p.id}" data-player-cat="${categoryId}" style="cursor:pointer">
          <td><span class="badge bg-secondary">${p.numero}</span></td>
          <td>${foto}${p.nombre}</td>
          <td>${p.apellidos}</td>
          <td><small>${p.equipoNombre || '-'}</small></td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" data-action="delete-player" data-id="${p.id}" data-cat="${categoryId}"><i class="fa-regular fa-trash-can"></i></button>
          </td>
        </tr>`;
    })
    .join('');
}

async function createPlayer(e) {
  e.preventDefault();
  const categoryId = Number(els.playerCategory.value);
  const teamId     = Number(els.playerTeam.value);
  const teamName   = state.teams.find((t) => t.id === teamId)?.nombre || 'equipo';
  const catName    = (state.categories.get(teamId) || []).find((c) => c.id === categoryId)?.nombre || 'categoria';
  try {
    let foto = null;
    const file = els.playerPhoto?.files[0];
    if (file) foto = await uploadImage(file, 'player', toSlug(teamName), toSlug(catName));
    const body = {
      nombre:    els.playerName.value.trim(),
      apellidos: els.playerLastname.value.trim(),
      fechaNac:  els.playerBorn.value || null,
      numero:    Number(els.playerNumber.value),
      estatura:  els.playerEstatura?.value || null,
      peso:      els.playerPeso?.value || null,
      alergias:  els.playerAlergias?.value.trim() || null,
      nombrePapa: els.playerNombrePapa?.value.trim() || null,
      nombreMama: els.playerNombreMama?.value.trim() || null,
      escuela: els.playerEscuela?.value.trim() || null,
      gradoEscolar: els.playerGradoEscolar?.value.trim() || null,
      telefonoCasa: els.playerTelefonoCasa?.value.trim() || null,
      telefonoMama: els.playerTelefonoMama?.value.trim() || null,
      telefonoPapa: els.playerTelefonoPapa?.value.trim() || null,
      tipoSanguineo: els.playerTipoSanguineo?.value.trim() || null,
      foto,
    };
    const player = await api(`/categories/${categoryId}/players`, { method: 'POST', body: JSON.stringify(body) });
    const list = state.players.get(categoryId) || [];
    list.push({
      ...player,
      foto_url: foto,
      equipoId: Number(player.equipoId || teamId),
      equipoNombre: player.equipoNombre || teamName,
    });
    state.players.set(categoryId, list);
    renderPlayers();
    els.playerForm.reset();
    if (els.playerPhotoPreview) els.playerPhotoPreview.innerHTML = '';
    showToast('Jugador agregado', 'success');
    els.summaryPlayers.textContent = Array.from(state.players.values()).reduce((acc, arr) => acc + arr.length, 0);
    renderDashboardSummary();
  } catch (err) { showToast(err.message, 'error'); }
}

async function deletePlayer(id, categoryId) {
  await api(`/players/${id}`, { method: 'DELETE' });
  const list = state.players.get(Number(categoryId)) || [];
  state.players.set(Number(categoryId), list.filter((p) => p.id !== Number(id)));
  renderPlayers();
  showToast('Jugador eliminado', 'success');
  els.summaryPlayers.textContent = Array.from(state.players.values()).reduce((acc, arr) => acc + arr.length, 0);
  renderDashboardSummary();
}

// ── Árbitros ──────────────────────────────────────────────────────
async function loadArbitros() {
  if (state.currentUserRol !== 'super') return;
  const arbitros = await api('/arbitros');
  state.arbitros = arbitros;
  renderArbitros();
  refreshArbitroSelect();
}

function renderArbitros() {
  if (!els.arbitrosTable) return;
  els.arbitrosTable.innerHTML = state.arbitros.map((a) => `
    <tr>
      <td>${a.nombre}</td>
      <td>${a.apellidos}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" data-action="delete-arbitro" data-id="${a.id}">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    </tr>`).join('');
}

function refreshArbitroSelect() {
  if (!els.matchArbitro) return;
  els.matchArbitro.innerHTML = '<option value="">-- Sin asignar --</option>'
    + state.arbitros.map((a) => `<option value="${a.id}">${a.nombre} ${a.apellidos}</option>`).join('');
}

async function createArbitro(e) {
  e.preventDefault();
  const nombre    = els.arbitroNombre?.value.trim();
  const apellidos = els.arbitroApellidos?.value.trim();
  if (!nombre || !apellidos) return;
  try {
    const arb = await api('/arbitros', { method: 'POST', body: JSON.stringify({ nombre, apellidos }) });
    state.arbitros.push(arb);
    renderArbitros();
    refreshArbitroSelect();
    els.arbitroForm.reset();
    showToast('Árbitro registrado', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteArbitro(id) {
  await api(`/arbitros/${id}`, { method: 'DELETE' });
  state.arbitros = state.arbitros.filter((a) => a.id !== Number(id));
  renderArbitros();
  refreshArbitroSelect();
  showToast('Árbitro eliminado', 'success');
}

async function loadStandings(categoryId) {
  const query = categoryId ? `?categoryId=${categoryId}` : '';
  const rows = await api(`/standings${query}`);
  state.standings = rows;
  renderStandings();
}

function renderStandings() {
  els.standingsTable.innerHTML = state.standings
    .map((s) => `
      <tr>
        <td>${s.equipo}</td><td>${s.pj}</td><td>${s.g}</td><td>${s.e}</td><td>${s.p}</td><td>${s.gf}</td><td>${s.gc}</td><td>${s.puntos}</td>
        <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-action="delete-standing" data-id="${s.id}"><i class="fa-regular fa-trash-can"></i></button></td>
      </tr>`)
    .join('');
}

async function createStanding(e) {
  e.preventDefault();
  const body = {
    equipoId: Number(els.standingTeam.value),
    categoriaId: Number(els.standingCategory.value),
    pj: Number(els.standingInputs.pj.value),
    g: Number(els.standingInputs.g.value),
    e: Number(els.standingInputs.e.value),
    p: Number(els.standingInputs.p.value),
    gf: Number(els.standingInputs.gf.value),
    gc: Number(els.standingInputs.gc.value),
    puntos: Number(els.standingInputs.pts.value),
  };
  try {
    await api('/standings', { method: 'POST', body: JSON.stringify(body) });
    showToast('Registro guardado', 'success');
    await loadStandings(body.categoriaId);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteStanding(id) {
  await api(`/standings/${id}`, { method: 'DELETE' });
  state.standings = state.standings.filter((s) => s.id !== Number(id));
  renderStandings();
  showToast('Registro eliminado', 'success');
}

async function generatePdf() {
  const matchId = Number(els.pdfMatch?.value || 0);
  if (!matchId) return showToast('Selecciona un partido jugado', 'error');
  const url = `${API_BASE}/pdf/match/${matchId}`;
  const sep = url.includes('?') ? '&' : '?';
  window.open(`${url}${sep}token=${encodeURIComponent(authToken || '')}&_ts=${Date.now()}`, '_blank');
}

async function generateTeamPdf() {
  const teamId = Number(els.pdfTeam?.value || 0);
  const categoryId = Number(els.pdfCategory?.value || 0);
  if (!teamId || !categoryId) return showToast('Selecciona equipo y categoría', 'error');
  const url = `${API_BASE}/pdf/team/${teamId}/category/${categoryId}`;
  const sep = url.includes('?') ? '&' : '?';
  window.open(`${url}${sep}token=${encodeURIComponent(authToken || '')}&_ts=${Date.now()}`, '_blank');
}

async function createAdmin(e) {
  e.preventDefault();
  const rol = els.adminRol?.value || 'equipo';
  const body = {
    nombre:   els.adminName.value.trim(),
    email:    els.adminEmail.value.trim(),
    password: els.adminPassword.value,
    rol,
    equipoId: rol === 'equipo' ? Number(els.adminTeam?.value || 0) : null,
  };
  if (rol === 'equipo' && !body.equipoId) {
    showToast('Selecciona un equipo para el admin de equipo', 'error');
    return;
  }
  try {
    await api('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    showToast('Administrador creado', 'success');
    els.adminForm.reset();
    toggleAdminTeamField();
    await loadAdmins();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Team-categories ───────────────────────────────────────────────────────────
async function loadTeamCategories() {
  const tcs = await api('/team-categories');
  state.teamCategories = tcs;
  refreshMatchTeamCategoryOptions();
}

// ── Jornadas ─────────────────────────────────────────────────────────────────
async function loadJornadas() {
  if (state.currentUserRol !== 'super') return;
  const jornadas = await api('/jornadas');
  state.jornadas = jornadas;
  renderJornadas();
  refreshJornadaSelect();
}

function renderJornadas() {
  if (!els.jornadasTable) return;
  els.jornadasTable.innerHTML = state.jornadas
    .map((j) => `
      <tr>
        <td>${j.nombre}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-action="delete-jornada" data-id="${j.id}"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      </tr>`)
    .join('') || '<tr><td colspan="2" class="text-secondary">Sin jornadas registradas</td></tr>';
}

async function createJornada(e) {
  e.preventDefault();
  const nombre = els.jornadaName?.value.trim();
  if (!nombre) return;
  try {
    const jornada = await api('/jornadas', { method: 'POST', body: JSON.stringify({ nombre }) });
    state.jornadas.push(jornada);
    state.jornadas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    renderJornadas();
    refreshJornadaSelect();
    els.jornadaForm?.reset();
    showToast('Jornada creada', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteJornada(id) {
  await api(`/jornadas/${id}`, { method: 'DELETE' });
  state.jornadas = state.jornadas.filter((j) => j.id !== Number(id));
  renderJornadas();
  refreshJornadaSelect();
  showToast('Jornada eliminada', 'success');
}

// ── Matches ───────────────────────────────────────────────────────────────────
async function loadMatches() {
  const matches = await api('/matches');
  state.matches = matches;
  renderMatches();
  refreshPdfMatchSelect();
}

function refreshPdfMatchSelect() {
  if (!els.pdfMatch) return;
  const previous = String(els.pdfMatch.value || '');
  const jugados = state.matches.filter((m) => m.estado === 'jugado');

  if (!jugados.length) {
    els.pdfMatch.innerHTML = '<option value="">Sin partidos jugados disponibles</option>';
    return;
  }

  els.pdfMatch.innerHTML = jugados.map((m) => {
    const marcador = `${Number(m.goles_local ?? 0)} - ${Number(m.goles_visita ?? 0)}`;
    const fecha = m.fecha
      ? new Date(m.fecha).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Sin fecha';
    const jornada = m.jornada_nombre ? `${m.jornada_nombre} · ` : '';
    return `<option value="${m.id}">${jornada}${m.local_equipo} ${marcador} ${m.visita_equipo} (${fecha})</option>`;
  }).join('');

  if (previous && jugados.some((m) => String(m.id) === previous)) {
    els.pdfMatch.value = previous;
  }
}

function renderMatches() {
  if (!els.matchesTable) return;
  const filter  = els.matchFilterEstado?.value || '';
  const list    = filter ? state.matches.filter((m) => m.estado === filter) : state.matches;
  const fmtDate = (d) => d ? new Date(d).toLocaleString('es-ES', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';
  els.matchesTable.innerHTML = list.map((m) => {
    const score  = m.estado === 'jugado' ? `<span class="badge bg-success fs-6">${m.goles_local} - ${m.goles_visita}</span>` : '<span class="text-secondary">vs</span>';
    const estado = m.estado === 'jugado' ? '<span class="badge bg-success">Jugado</span>' : '<span class="badge bg-warning text-dark">Programado</span>';
    const accion = m.estado !== 'jugado'
      ? `<button class="btn btn-sm btn-outline-success me-1" data-action="set-result" data-id="${m.id}" data-local="${m.local_equipo}" data-visita="${m.visita_equipo}"><i class="fa-solid fa-futbol"></i></button>`
      : '';
    const accionPdf = m.estado === 'jugado'
      ? `<button class="btn btn-sm btn-outline-primary me-1" data-action="pdf-match" data-id="${m.id}" title="Generar cédula PDF"><i class="fa-solid fa-file-pdf"></i></button>`
      : '';
    const accionAlineacion = `<button class="btn btn-sm btn-outline-info me-1" data-action="open-lineup" data-id="${m.id}" data-local="${m.local_equipo}" data-visita="${m.visita_equipo}"><i class="fa-solid fa-list-check"></i></button>`;
    const arb = m.arbitro_nombre ? `<small>${m.arbitro_nombre}</small>` : '<span class="text-secondary small">&mdash;</span>';
    const jornada = m.jornada_nombre ? `<span class="badge bg-secondary">${m.jornada_nombre}</span>` : '<span class="text-secondary small">&mdash;</span>';
    return `<tr data-match-id="${m.id}" data-match-local="${m.local_equipo}" data-match-visita="${m.visita_equipo}">
      <td>${jornada}</td>
      <td><span class="badge bg-primary">${m.categoria}</span></td>
      <td class="fw-semibold">${m.local_equipo}</td>
      <td class="text-center">${score}</td>
      <td class="fw-semibold">${m.visita_equipo}</td>
      <td>${arb}</td>
      <td><small>${fmtDate(m.fecha)}</small></td>
      <td><small>${m.comentario || '-'}</small></td>
      <td>${estado}</td>
      <td class="text-end">${accionAlineacion}${accionPdf}${accion}<button class="btn btn-sm btn-outline-danger" data-action="delete-match" data-id="${m.id}"><i class="fa-regular fa-trash-can"></i></button></td>
    </tr>`;
  }).join('');
}

function renderLineupSide(listEl, players, side, lineupByPlayerId) {
  if (!listEl) return;
  listEl.innerHTML = players.map((p) => {
    const current = lineupByPlayerId.get(Number(p.id));
    const checked = current ? 'checked' : '';
    const amarillas = current ? Number(current.amarillas || 0) : 0;
    const roja = current && Number(current.roja) === 1 ? 'checked' : '';
    const suspended = Number(p.suspension_restante || 0) > 0;
    return `
      <div class="lineup-item ${suspended ? 'suspended' : ''}">
        <div class="form-check mb-2">
          <input class="form-check-input lineup-player-check" type="checkbox" id="lineup-${side}-${p.id}" data-side="${side}" data-player-id="${p.id}" ${checked} ${suspended ? 'disabled' : ''}>
          <label class="form-check-label" for="lineup-${side}-${p.id}">
            <strong>#${p.numero ?? '-'} ${p.nombre} ${p.apellidos}</strong>
          </label>
        </div>
        <div class="mini-label mb-2">Amarillas acumuladas: ${p.tarjetas_amarillas_acum || 0} · Suspensión restante: ${p.suspension_restante || 0}</div>
        <div class="row g-2 align-items-end">
          <div class="col-6">
            <label class="form-label small">Amarillas</label>
            <input type="number" min="0" max="5" value="${amarillas}" class="form-control form-control-sm lineup-amarillas" data-player-id="${p.id}" data-side="${side}" ${suspended ? 'disabled' : ''}>
          </div>
          <div class="col-6">
            <div class="form-check mt-4">
              <input class="form-check-input lineup-roja" type="checkbox" id="lineup-roja-${side}-${p.id}" data-player-id="${p.id}" data-side="${side}" ${roja} ${suspended ? 'disabled' : ''}>
              <label class="form-check-label" for="lineup-roja-${side}-${p.id}">Roja</label>
            </div>
          </div>
        </div>
      </div>`;
  }).join('') || '<p class="text-secondary small mb-0">Sin jugadores registrados.</p>';
}

async function openLineupEditor(matchId, localName = '', visitaName = '') {
  const data = await api(`/matches/${matchId}/lineup`);
  state.lineupMatchId = Number(matchId);
  state.lineupData = data;

  const map = new Map();
  (data.lineup || []).forEach((row) => map.set(Number(row.jugador_id), row));
  renderLineupSide(els.lineupLocalList, data.localRoster || [], 'local', map);
  renderLineupSide(els.lineupVisitaList, data.visitaRoster || [], 'visita', map);

  if (els.lineupMatchLabel) {
    const lblLocal = localName || data.match?.local_equipo || 'Local';
    const lblVisita = visitaName || data.match?.visita_equipo || 'Visita';
    els.lineupMatchLabel.textContent = `${lblLocal} vs ${lblVisita}`;
  }
  if (els.lineupWrap) {
    els.lineupWrap.style.display = '';
    els.lineupWrap.scrollIntoView({ behavior: 'smooth' });
  }
}

function collectLineupPayload() {
  const checks = document.querySelectorAll('.lineup-player-check');
  const payload = [];
  checks.forEach((chk) => {
    if (!chk.checked) return;
    const jugadorId = Number(chk.dataset.playerId);
    const lado = chk.dataset.side;
    const amarillasEl = document.querySelector(`.lineup-amarillas[data-player-id="${jugadorId}"][data-side="${lado}"]`);
    const rojaEl = document.querySelector(`.lineup-roja[data-player-id="${jugadorId}"][data-side="${lado}"]`);
    payload.push({
      jugadorId,
      lado,
      amarillas: Math.max(0, Number(amarillasEl?.value || 0)),
      roja: !!rojaEl?.checked,
    });
  });
  return payload;
}

async function saveLineup() {
  if (!state.lineupMatchId) return;
  const players = collectLineupPayload();
  await api(`/matches/${state.lineupMatchId}/lineup`, { method: 'PUT', body: JSON.stringify({ players }) });
  showToast('Alineación guardada', 'success');
  const current = state.matches.find((m) => m.id === state.lineupMatchId);
  await openLineupEditor(state.lineupMatchId, current?.local_equipo || '', current?.visita_equipo || '');
}

async function createMatch(e) {
  e.preventDefault();
  const body = {
    jornadaId:  Number(els.matchJornada?.value),
    categoryId: Number(els.matchCategory?.value),
    ecLocalId:  Number(els.matchLocal?.value),
    ecVisitaId: Number(els.matchVisita?.value),
    fecha:      els.matchFecha?.value,
    lugar:      els.matchLugar?.value.trim() || null,
    arbitroId:  els.matchArbitro?.value ? Number(els.matchArbitro.value) : null,
  };
  if (!body.jornadaId) return showToast('Debes asignar una jornada al partido', 'error');
  if (!body.categoryId) return showToast('Selecciona una categoría para el partido', 'error');
  if (body.ecLocalId === body.ecVisitaId) return showToast('Local y visita deben ser distintos', 'error');
  try {
    await api('/matches', { method: 'POST', body: JSON.stringify(body) });
    showToast('Partido programado', 'success');
    els.matchForm.reset();
    refreshMatchTeamCategoryOptions();
    await loadMatches();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteMatch(id) {
  await api(`/matches/${id}`, { method: 'DELETE' });
  state.matches = state.matches.filter((m) => m.id !== Number(id));
  renderMatches();
  showToast('Partido eliminado', 'success');
}

async function saveMatchResult() {
  const id  = state.editMatchId;
  if (!id) return;
  const gl  = Number(els.resultLocal?.value  ?? 0);
  const gv  = Number(els.resultVisita?.value ?? 0);
  try {
    await api(`/matches/${id}`, { method: 'PUT', body: JSON.stringify({ goles_local: gl, goles_visita: gv }) });
    showToast('Resultado guardado — tabla actualizada', 'success');
    if (els.resultFormWrap) els.resultFormWrap.style.display = 'none';
    state.editMatchId = null;
    await loadMatches();
    await loadStandings(els.standingFilterCategory?.value || null);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Admins ────────────────────────────────────────────────────────────────────
async function loadAdmins() {
  if (state.currentUserRol !== 'super') return;
  const admins = await api('/admins');
  state.admins = admins;
  renderAdmins();
}

async function loadBitacora() {
  if (state.currentUserRol !== 'super') return;
  const rol = els.bitacoraFilterRol?.value || '';
  const query = rol ? `?rol=${encodeURIComponent(rol)}` : '';
  const rows = await api(`/bitacora${query}`);
  state.bitacora = rows;
  renderBitacora();
}

function renderBitacora() {
  if (!els.bitacoraTable) return;
  if (!state.bitacora.length) {
    els.bitacoraTable.innerHTML = '<tr><td colspan="5" class="text-secondary">Sin registros de cambios</td></tr>';
    return;
  }
  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };
  els.bitacoraTable.innerHTML = state.bitacora.map((row) => `
    <tr>
      <td><small>${formatDate(row.created_at)}</small></td>
      <td>${row.admin_nombre || 'Sistema'}</td>
      <td><span class="badge ${row.admin_rol === 'super' ? 'bg-danger' : 'bg-secondary'}">${row.admin_rol || '-'}</span></td>
      <td><span class="badge bg-info text-dark">${row.accion || '-'}</span></td>
      <td><small>${row.detalle || '-'}</small></td>
    </tr>
  `).join('');
}

function renderAdmins() {
  if (!els.adminsTable) return;
  els.adminsTable.innerHTML = state.admins
    .map((a) => `
      <tr>
        <td>${a.nombre}</td>
        <td>${a.email}</td>
        <td><span class="badge ${a.rol === 'super' ? 'bg-danger' : 'bg-secondary'}">${a.rol}</span></td>
        <td>${a.equipo_nombre || '<span class="text-secondary small">--</span>'}</td>
        <td>${a.activo ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-warning text-dark">No</span>'}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-action="delete-admin" data-id="${a.id}"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      </tr>`)
    .join('');
}

async function deleteAdmin(id) {
  await api(`/admins/${id}`, { method: 'DELETE' });
  state.admins = state.admins.filter((a) => a.id !== Number(id));
  renderAdmins();
  showToast('Administrador eliminado', 'success');
}

function bindEvents() {
  els.loginForm.addEventListener('submit', handleLogin);
  els.logoutBtn.addEventListener('click', () => { logout(); showToast('Sesión cerrada'); });
  els.teamForm.addEventListener('submit', createTeam);
  els.categoryMasterForm?.addEventListener('submit', createMasterCategory);
  els.categoryForm.addEventListener('submit', createCategory);
  els.playerForm.addEventListener('submit', createPlayer);
  els.standingForm.addEventListener('submit', createStanding);
  els.pdfGenerate.addEventListener('click', generatePdf);
  els.pdfGenerateRoster?.addEventListener('click', generateTeamPdf);
  els.adminForm?.addEventListener('submit', createAdmin);
  els.adminRol?.addEventListener('change', toggleAdminTeamField);
  if (els.jornadaForm)       els.jornadaForm.addEventListener('submit', createJornada);
  if (els.matchForm)         els.matchForm.addEventListener('submit', createMatch);
  els.matchCategory?.addEventListener('change', refreshMatchTeamCategoryOptions);
  if (els.resultSave)        els.resultSave.addEventListener('click', saveMatchResult);
  if (els.lineupSave)        els.lineupSave.addEventListener('click', async () => {
    try { await saveLineup(); } catch (err) { showToast(err.message, 'error'); }
  });
  if (els.matchFilterEstado) els.matchFilterEstado.addEventListener('change', renderMatches);
  if (els.arbitroForm)       els.arbitroForm.addEventListener('submit', createArbitro);
  if (els.summaryPdfBtn)     els.summaryPdfBtn.addEventListener('click', handleSummaryPdfClick);

  // Previews de imagen
  bindImagePreview(els.teamCrest, els.teamCrestPreview);
  bindImagePreview(els.playerPhoto, els.playerPhotoPreview);
  bindImagePreview(els.newsImage, els.newsImagePreview);
  bindImagePreview(els.eventImage, els.eventImagePreview);

  els.teamsTable.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'edit') {
      const team = state.teams.find((t) => t.id === Number(id));
      const nuevoNombre = prompt('Nuevo nombre', team?.nombre || '');
      if (nuevoNombre) {
        try { await updateTeam(id, nuevoNombre); showToast('Equipo actualizado', 'success'); }
        catch (err) { showToast(err.message, 'error'); }
      }
    }
    if (action === 'delete') {
      if (confirm('¿Eliminar equipo?')) {
        try { await deleteTeam(id); } catch (err) { showToast(err.message, 'error'); }
      }
    }
  });

  els.categoriesTable.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.action === 'delete-category') {
      const id = btn.dataset.id;
      const teamId = btn.dataset.team;
      if (confirm('¿Eliminar categoría?')) {
        try { await deleteCategory(id, teamId); } catch (err) { showToast(err.message, 'error'); }
      }
    }
  });

  els.categoryFilterTeam.addEventListener('change', () => renderCategories());

  els.playerTeam.addEventListener('change', async () => {
    await loadCategories(els.playerTeam.value);
    updateCategoryDependentSelects();
  });
  els.playerFilterTeam.addEventListener('change', async () => {
    await loadCategories(els.playerFilterTeam.value);
    const firstCat = (state.categories.get(Number(els.playerFilterTeam.value)) || [])[0];
    if (firstCat) {
      els.playerFilterCategory.value = firstCat.id;
      await loadPlayers(firstCat.id);
    }
  });
  els.playerFilterCategory.addEventListener('change', async () => {
    const catId = Number(els.playerFilterCategory.value || 0);
    if (!catId) return renderPlayers();
    await loadPlayers(catId);
  });
  if (els.playerModalSave) {
    els.playerModalSave.addEventListener('click', async () => {
      try {
        await savePlayerFromModal();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
  if (els.playerModalEdit) {
    els.playerModalEdit.addEventListener('click', () => {
      if (els.playerEditPanel) els.playerEditPanel.classList.remove('d-none');
      els.playerModalEdit.classList.add('d-none');
    });
  }
  if (els.playerModalCancel) {
    els.playerModalCancel.addEventListener('click', () => {
      if (els.playerEditPanel) els.playerEditPanel.classList.add('d-none');
      if (els.playerModalEdit) els.playerModalEdit.classList.remove('d-none');
    });
  }
  els.playersTable.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.dataset.action === 'delete-player') {
      const id = btn.dataset.id;
      const cat = btn.dataset.cat;
      if (confirm('¿Eliminar jugador?')) {
        try { await deletePlayer(id, cat); } catch (err) { showToast(err.message, 'error'); }
      }
      return;
    }

    const row = e.target.closest('tr[data-player-id]');
    if (!row) return;
    const categoryId = Number(row.dataset.playerCat || 0);
    const playerId = Number(row.dataset.playerId || 0);
    const players = state.players.get(categoryId) || [];
    const player = players.find((p) => Number(p.id) === playerId);
    if (player) {
      showPlayerInfoModal(player, categoryId);
    }
  });

  els.standingTeam.addEventListener('change', async () => {
    await loadCategories(els.standingTeam.value);
    updateCategoryDependentSelects();
    await loadStandings(els.standingFilterCategory?.value || null);
  });
  els.standingFilterCategory.addEventListener('change', async () => {
    const catId = els.standingFilterCategory.value;
    await loadStandings(catId || null);
  });

  els.pdfTeam?.addEventListener('change', async () => {
    await loadCategories(els.pdfTeam.value);
    updateCategoryDependentSelects();
  });

  els.standingsTable.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.action === 'delete-standing') {
      const id = btn.dataset.id;
      if (confirm('¿Eliminar registro?')) {
        try { await deleteStanding(id); } catch (err) { showToast(err.message, 'error'); }
      }
    }
  });

  // Result live preview
  if (els.resultLocal && els.resultVisita) {
    const updatePreview = () => {
      const gl = els.resultLocal.value  || '0';
      const gv = els.resultVisita.value || '0';
      if (els.resultPreview) els.resultPreview.textContent = `${gl} - ${gv}`;
    };
    els.resultLocal.addEventListener('input', updatePreview);
    els.resultVisita.addEventListener('input', updatePreview);
  }

  // Matches table actions
  if (els.matchesTable) {
    els.matchesTable.addEventListener('click', async (e) => {
      const row = e.target.closest('tr[data-match-id]');
      const btn = e.target.closest('button');
      if (!btn && row) {
        try {
          await openLineupEditor(Number(row.dataset.matchId), row.dataset.matchLocal || '', row.dataset.matchVisita || '');
        } catch (err) {
          showToast(err.message, 'error');
        }
        return;
      }
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === 'delete-match') {
        if (confirm('¿Eliminar partido?')) {
          try { await deleteMatch(id); } catch (err) { showToast(err.message, 'error'); }
        }
      }
      if (btn.dataset.action === 'set-result') {
        state.editMatchId = Number(id);
        const lbl = `${btn.dataset.local} vs ${btn.dataset.visita}`;
        if (els.resultMatchLabel) els.resultMatchLabel.textContent = lbl;
        if (els.resultLocal)  els.resultLocal.value  = '0';
        if (els.resultVisita) els.resultVisita.value = '0';
        if (els.resultPreview) els.resultPreview.textContent = '0 - 0';
        if (els.resultFormWrap) els.resultFormWrap.style.display = '';
        els.resultFormWrap?.scrollIntoView({ behavior: 'smooth' });
      }
      if (btn.dataset.action === 'open-lineup') {
        try {
          await openLineupEditor(Number(id), btn.dataset.local || '', btn.dataset.visita || '');
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
      if (btn.dataset.action === 'pdf-match') {
        const url = `${API_BASE}/pdf/match/${Number(id)}`;
        const sep = url.includes('?') ? '&' : '?';
        window.open(`${url}${sep}token=${encodeURIComponent(authToken || '')}&_ts=${Date.now()}`, '_blank');
      }
    });
  }

  // Árbitros table actions
  if (els.arbitrosTable) {
    els.arbitrosTable.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.action === 'delete-arbitro') {
        if (confirm('¿Eliminar árbitro?')) {
          try { await deleteArbitro(btn.dataset.id); } catch (err) { showToast(err.message, 'error'); }
        }
      }
    });
  }

  // Jornadas table actions
  if (els.jornadasTable) {
    els.jornadasTable.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.action === 'delete-jornada') {
        if (confirm('¿Eliminar jornada?')) {
          try { await deleteJornada(btn.dataset.id); } catch (err) { showToast(err.message, 'error'); }
        }
      }
    });
  }

  // Admins table actions
  if (els.adminsTable) {
    els.adminsTable.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.action === 'delete-admin') {
        if (confirm('¿Eliminar administrador?')) {
          try { await deleteAdmin(btn.dataset.id); } catch (err) { showToast(err.message, 'error'); }
        }
      }
    });
  }

  if (els.eventsTable) {
    els.eventsTable.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === 'delete-event') {
        if (confirm('¿Eliminar evento?')) {
          try { await deleteEvent(id); } catch (err) { showToast(err.message, 'error'); }
        }
      }
    });
  }

  if (els.bitacoraFilterRol) {
    els.bitacoraFilterRol.addEventListener('change', async () => {
      try { await loadBitacora(); } catch (err) { showToast(err.message, 'error'); }
    });
  }
}

async function loadAllData() {
  try {
    await loadTeams();
    await loadMasterCategories();
    toggleAdminTeamField();
    // Equipo admins only see their assigned team
    if (state.currentUserRol !== 'super' && state.equipoId) {
      state.teams = state.teams.filter((t) => t.id === state.equipoId);
      renderTeams();
      refreshTeamSelects();
      if (els.pdfTeam) {
        els.pdfTeam.value = String(state.equipoId);
        els.pdfTeam.disabled = true;
      }
      els.summaryTeams.textContent = state.teams.length;
      renderDashboardSummary();
    }
    await loadTeamCategories();
    if (state.teams.length) {
      await loadCategories(state.teams[0].id);
      updateCategoryDependentSelects();
      const firstCat = state.categories.get(state.teams[0].id)?.[0];
      if (firstCat) {
        await loadPlayers(firstCat.id);
      }
      await loadStandings(els.standingFilterCategory?.value || null);
    }
    if (state.currentUserRol === 'super') {
      await loadJornadas();
      await loadMatches();
      await loadArbitros();
      await loadAdmins();
      await loadNews();
      await loadEvents();
      await loadBitacora();
    }
    renderDashboardSummary();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function initFromToken() {
  if (!authToken) return;
  api('/auth/me')
    .then((user) => {
      currentAdmin = user;
      setAuthenticated(user, authToken);
    })
    .catch(() => logout());
}

bindEvents();
initFromToken();

// ── NOTICIAS ───────────────────────────────────────────────────────────────────
async function loadNews() {
  try {
    state.news = await api('/news');
    renderNews();
  } catch (err) { showToast(err.message, 'error'); }
}

// ── EVENTOS ───────────────────────────────────────────────────────────────────
async function loadEvents() {
  try {
    state.events = await api('/events');
    renderEvents();
  } catch (err) { showToast(err.message, 'error'); }
}

function renderEvents() {
  if (!els.eventsTable) return;
  els.eventsTable.innerHTML = state.events.map((ev) => `
    <tr>
      <td>
        ${ev.imagen_url ? `<img src="${ev.imagen_url}" style="width:50px;height:50px;object-fit:cover;border-radius:3px;">` : '<i class="fa-solid fa-image text-muted"></i>'}
      </td>
      <td>${ev.titulo}</td>
      <td><span class="badge bg-secondary">${ev.orden}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-danger" data-id="${ev.id}" data-action="delete-event"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

async function createEvent(e) {
  e.preventDefault();
  const titulo = els.eventTitle?.value.trim();
  const contenido = els.eventContent?.value.trim();
  const orden = parseInt(els.eventOrder?.value || 0);
  if (!titulo || !contenido) return;
  try {
    let imagen_url = null;
    const file = els.eventImage?.files[0];
    if (file) imagen_url = await uploadImage(file, 'event', toSlug(titulo));
    const event = await api('/events', { method: 'POST', body: JSON.stringify({ titulo, contenido, imagen_url, orden }) });
    state.events.push(event);
    renderEvents();
    els.eventForm?.reset();
    if (els.eventImagePreview) els.eventImagePreview.innerHTML = '';
    showToast('Evento creado', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteEvent(id) {
  await api(`/events/${id}`, { method: 'DELETE' });
  state.events = state.events.filter((ev) => ev.id !== Number(id));
  renderEvents();
  showToast('Evento eliminado', 'success');
}

function renderNews() {
  if (!els.newsTable) return;
  els.newsTable.innerHTML = state.news.map((n) => `
    <tr>
      <td>
        ${n.imagen_url ? `<img src="${n.imagen_url}" style="width:50px;height:50px;object-fit:cover;border-radius:3px;">` : '<i class="fa-solid fa-image text-muted"></i>'}
      </td>
      <td>${n.titulo}</td>
      <td><span class="badge bg-secondary">${n.orden}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-danger" data-id="${n.id}" data-action="delete-news"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

async function createNews(e) {
  e.preventDefault();
  const titulo = els.newsTitle?.value.trim();
  const contenido = els.newsContent?.value.trim();
  const orden = parseInt(els.newsOrder?.value || 0);
  if (!titulo || !contenido) return;
  try {
    let imagen_url = null;
    const file = els.newsImage?.files[0];
    if (file) imagen_url = await uploadImage(file, 'news', toSlug(titulo));
    const news = await api('/news', { method: 'POST', body: JSON.stringify({ titulo, contenido, imagen_url, orden }) });
    state.news.push(news);
    renderNews();
    els.newsForm?.reset();
    if (els.newsImagePreview) els.newsImagePreview.innerHTML = '';
    showToast('Noticia creada', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteNews(id) {
  await api(`/news/${id}`, { method: 'DELETE' });
  state.news = state.news.filter((n) => n.id !== Number(id));
  renderNews();
  showToast('Noticia eliminada', 'success');
}

if (els.newsForm) els.newsForm.addEventListener('submit', createNews);
if (els.eventForm) els.eventForm.addEventListener('submit', createEvent);
if (els.newsTable) {
  els.newsTable.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'delete-news') {
      if (confirm('¿Eliminar noticia?')) {
        try { await deleteNews(id); } catch (err) { showToast(err.message, 'error'); }
      }
    }
  });
}

// Load news if superadmin
if (currentAdmin?.rol === 'super') loadNews();
if (currentAdmin?.rol === 'super') loadEvents();
