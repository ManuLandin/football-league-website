const API_BASE = '../php-api/public/api';

const gallery = [
  { src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=60', alt: 'Entrenamiento' },
  { src: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=800&q=60', alt: 'Celebración' },
  { src: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=800&q=60', alt: 'Formación' },
  { src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60', alt: 'Portería' },
  { src: 'https://images.unsplash.com/photo-1497905963172-3c9a2c5cc5dd?auto=format&fit=crop&w=800&q=60', alt: 'Afición' },
  { src: 'https://images.unsplash.com/photo-1444491697005-9d7b0c6f38de?auto=format&fit=crop&w=800&q=60', alt: 'Partido nocturno' }
];

document.addEventListener('DOMContentLoaded', async () => {
  const teamsGrid = document.getElementById('teams-grid');
  const tablaBody = document.getElementById('tabla-body');
  const categoriaSelect = document.getElementById('categoria-select');
  const refreshBtn = document.getElementById('refresh-table');
  const calendarioLista = document.getElementById('calendario-lista');
  const filtroJornada = document.getElementById('filtro-jornada');
  const filtroArbitro = document.getElementById('filtro-arbitro');
  const filtroEquipo = document.getElementById('filtro-equipo');
  const filtroCategoria = document.getElementById('filtro-categoria');
  const resultadosGrid = document.getElementById('resultados-grid');
  const galeriaGrid = document.getElementById('galeria-grid');
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const teamsCategoryFilter = document.getElementById('teams-category-filter');

  const state = {
    teams: [],
    standings: [],
    matches: [],
    jornadas: [],
    categories: [],
    teamCategories: [],
  };

  async function fetchAPI(path) {
    const res = await fetch(API_BASE + path);
    if (!res.ok) throw new Error('Error API: ' + res.status);
    return res.json();
  }

  function normalizeName(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getCategoryNameById(categoryId) {
    return state.categories.find((category) => Number(category.id) === Number(categoryId))?.nombre || '';
  }

  function getTeamIdsForCategory(categoryId) {
    return state.teamCategories
      .filter((row) => Number(row.cat_id) === Number(categoryId))
      .map((row) => Number(row.team_id));
  }

  function renderTeams() {
    const selectedCategoryId = Number(teamsCategoryFilter?.value || 0);
    const allowedTeamIds = selectedCategoryId ? new Set(getTeamIdsForCategory(selectedCategoryId)) : null;
    const visibleTeams = allowedTeamIds
      ? state.teams.filter((team) => allowedTeamIds.has(Number(team.id)))
      : state.teams;

    if (!visibleTeams.length) {
      teamsGrid.innerHTML = '<div class="col-12 text-secondary">No hay equipos registrados para esa categoría.</div>';
      return;
    }

    teamsGrid.innerHTML = visibleTeams.map((team) => {
      const crest = team.escudo_url
        ? `<img src="${team.escudo_url}" alt="${team.nombre}" class="w-100 h-100 object-fit-cover">`
        : '<span class="display-6">⚽</span>';
      return `
        <div class="col-sm-6 col-lg-4">
          <div class="card h-100 p-3 cursor-pointer team-card" data-team-id="${team.id}" style="cursor:pointer">
            <div class="d-flex align-items-center mb-3 gap-3">
              <div class="rounded-circle overflow-hidden d-flex align-items-center justify-content-center"
                   style="width:60px;height:60px;background:#0f141d;flex-shrink:0">
                ${crest}
              </div>
              <div>
                <h5 class="mb-1">${team.nombre}</h5>
                <small class="text-secondary">${team.entrenador ? 'DT: ' + team.entrenador : ''}</small>
              </div>
            </div>
            <p class="mb-1"><i class="fa-solid fa-phone me-2 text-success"></i>Ver contacto</p>
          </div>
        </div>`;
    }).join('');

    // Agregar event listeners para mostrar el modal
    document.querySelectorAll('.team-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const teamId = Number(card.dataset.teamId);
        const team = state.teams.find((t) => t.id === teamId);
        if (team) showTeamContactModal(team);
      });
    });
  }

  function renderTable() {
    const selectedCategoryId = Number(categoriaSelect.value || 0);
    const selectedCategoryName = getCategoryNameById(selectedCategoryId);
    const filtered = state.standings
      .filter((row) => normalizeName(row.categoria) === normalizeName(selectedCategoryName))
      .sort((a, b) => Number(b.puntos) - Number(a.puntos) || Number(b.dg) - Number(a.dg) || Number(b.gf) - Number(a.gf));

    if (!selectedCategoryId) {
      tablaBody.innerHTML = '<tr><td colspan="11" class="text-center text-secondary">Selecciona una categoría.</td></tr>';
      return;
    }

    if (!filtered.length) {
      tablaBody.innerHTML = '<tr><td colspan="11" class="text-center text-secondary">Sin datos para esta categoría.</td></tr>';
      return;
    }

    tablaBody.innerHTML = filtered.map((row, index) => {
      const teamData = state.teams.find((t) => normalizeName(t.nombre) === normalizeName(row.equipo));
      const escudo = teamData?.escudo_url
        ? `<img src="${teamData.escudo_url}" alt="${row.equipo}" style="width:30px;height:30px;object-fit:contain;border-radius:3px;">`
        : '<i class="fa-solid fa-shield"></i>';
      return `
      <tr>
        <td>${index + 1}</td>
        <td><div style="width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;">${escudo}</div></td>
        <td class="fw-semibold">${row.equipo}</td>
        <td>${row.pj}</td>
        <td>${row.g}</td>
        <td>${row.e}</td>
        <td>${row.p}</td>
        <td>${row.gf}</td>
        <td>${row.gc}</td>
        <td>${Number(row.dg) > 0 ? '+' + row.dg : row.dg}</td>
        <td class="fw-bold">${row.puntos}</td>
      </tr>`}).join('');
  }

  function refreshFixtureTeamFilter() {
    const selectedCategory = filtroCategoria.value;
    const selectedJornada = filtroJornada?.value || 'todas';
    const selectedArbitro = filtroArbitro?.value || 'todos';
    const relevantMatches = state.matches.filter((match) => {
      if (selectedCategory !== 'todas' && normalizeName(match.categoria) !== normalizeName(selectedCategory)) return false;
      if (selectedJornada !== 'todas' && String(match.jornada_id || '') !== String(selectedJornada)) return false;
      if (selectedArbitro !== 'todos' && String(match.arbitro_id || '') !== String(selectedArbitro)) return false;
      return true;
    });

    const names = [...new Set(relevantMatches.flatMap((match) => [match.local_equipo, match.visita_equipo]))].sort((a, b) => a.localeCompare(b, 'es'));
    filtroEquipo.innerHTML = '<option value="todos">Todos los equipos</option>'
      + names.map((name) => `<option value="${name}">${name}</option>`).join('');
  }

  function renderFilters() {
    const categoryOptions = state.categories.map((category) => `<option value="${category.id}">${category.nombre}</option>`).join('');
    categoriaSelect.innerHTML = '<option value="">Selecciona categoría</option>' + categoryOptions;
    filtroCategoria.innerHTML = '<option value="todas">Todas las categorías</option>'
      + state.categories.map((category) => `<option value="${category.nombre}">${category.nombre}</option>`).join('');
    if (filtroJornada) {
      filtroJornada.innerHTML = '<option value="todas">Todas las jornadas</option>'
        + state.jornadas.map((jornada) => `<option value="${jornada.id}">${jornada.nombre}</option>`).join('');
    }
    if (filtroArbitro) {
      const arbitros = [];
      const seen = new Set();
      state.matches.forEach((match) => {
        const id = Number(match.arbitro_id || 0);
        if (!id || seen.has(id)) return;
        seen.add(id);
        arbitros.push({ id, nombre: match.arbitro_nombre || 'Árbitro' });
      });
      arbitros.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      filtroArbitro.innerHTML = '<option value="todos">Todos los árbitros</option>'
        + arbitros.map((arbitro) => `<option value="${arbitro.id}">${arbitro.nombre}</option>`).join('');
    }
    if (teamsCategoryFilter) {
      teamsCategoryFilter.innerHTML = '<option value="0">Todas las categorías</option>' + categoryOptions;
    }
    if (!categoriaSelect.value && state.categories[0]) {
      categoriaSelect.value = state.categories[0].id;
    }
    refreshFixtureTeamFilter();
  }

  function formatDate(dateValue) {
    return new Date(dateValue).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  function formatTime(dateValue) {
    return new Date(dateValue).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function renderFixtures() {
    const teamFilter = filtroEquipo.value;
    const categoryFilter = filtroCategoria.value;
    const jornadaFilter = filtroJornada?.value || 'todas';
    const arbitroFilter = filtroArbitro?.value || 'todos';
    const fixtures = state.matches
      .filter((match) => match.estado === 'programado')
      .filter((match) => categoryFilter === 'todas' || normalizeName(match.categoria) === normalizeName(categoryFilter))
      .filter((match) => jornadaFilter === 'todas' || String(match.jornada_id || '') === String(jornadaFilter))
      .filter((match) => arbitroFilter === 'todos' || String(match.arbitro_id || '') === String(arbitroFilter))
      .filter((match) => teamFilter === 'todos' || match.local_equipo === teamFilter || match.visita_equipo === teamFilter)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    if (!fixtures.length) {
      calendarioLista.innerHTML = '<div class="col-12 text-secondary">No hay partidos programados con ese filtro.</div>';
      return;
    }

    calendarioLista.innerHTML = fixtures.map((match) => `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 p-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex gap-2 align-items-center">
              <span class="badge bg-primary text-uppercase">${match.categoria}</span>
              ${match.jornada_nombre ? `<span class="badge bg-secondary">${match.jornada_nombre}</span>` : ''}
            </div>
            <small class="text-secondary">${formatDate(match.fecha)} · ${formatTime(match.fecha)}</small>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-center flex-grow-1">
              <p class="fw-semibold mb-1">${match.local_equipo}</p>
              <small class="text-secondary">Local</small>
            </div>
            <span class="mx-3 text-secondary">vs</span>
            <div class="text-center flex-grow-1">
              <p class="fw-semibold mb-1">${match.visita_equipo}</p>
              <small class="text-secondary">Visita</small>
            </div>
          </div>
          <div class="d-flex align-items-center mt-3 text-secondary">
            <i class="fa-solid fa-location-dot me-2 text-success"></i>
            <small>${match.comentario || 'Por confirmar'}</small>
          </div>
          <div class="mt-2 text-secondary small">
            <i class="fa-solid fa-whistle me-2"></i>${match.arbitro_nombre || 'Árbitro por definir'}
          </div>
        </div>
      </div>`).join('');
  }

  function renderResults() {
    const played = state.matches
      .filter((match) => match.estado === 'jugado')
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 9);

    if (!played.length) {
      resultadosGrid.innerHTML = '<div class="col-12 text-secondary">Aún no hay resultados.</div>';
      return;
    }

    resultadosGrid.innerHTML = played.map((match) => `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 p-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge bg-primary">${match.categoria}</span>
            <small class="text-secondary">${formatDate(match.fecha)}</small>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <p class="fw-semibold mb-0">${match.local_equipo}</p>
            <span class="fs-5 fw-bold text-success">${match.goles_local} - ${match.goles_visita}</span>
            <p class="fw-semibold mb-0">${match.visita_equipo}</p>
          </div>
        </div>
      </div>`).join('');
  }

  function renderGallery() {
    // Gallery replaced with news carousel - check if element exists
    if (!galeriaGrid) return;
    galeriaGrid.innerHTML = gallery.map((item) => `
      <div class="col-6 col-md-4">
        <div class="gallery-item" style="height: 180px;">
          <img src="${item.src}" alt="${item.alt}">
        </div>
      </div>`).join('');
  }

  function handleForm() {
    if (!contactForm) return;
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = contactForm.nombre.value.trim();
      const email = contactForm.email.value.trim();
      const mensaje = contactForm.mensaje.value.trim();
      if (!nombre || !email || !mensaje) {
        if (formFeedback) formFeedback.textContent = 'Por favor completa todos los campos.';
        if (formFeedback) formFeedback.className = 'text-danger';
        return;
      }
      if (formFeedback) formFeedback.textContent = 'Mensaje enviado. Te contactaremos pronto.';
      if (formFeedback) formFeedback.className = 'text-success';
      contactForm.reset();
    });
  }

  function enableAnimations() {
    const items = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach((el) => observer.observe(el));
  }

  function wireNavCollapse() {
    const navLinks = document.querySelectorAll('.navbar-collapse a');
    const navCollapse = document.querySelector('.navbar-collapse');
    navLinks.forEach((link) => link.addEventListener('click', () => {
      if (navCollapse.classList.contains('show')) {
        new bootstrap.Collapse(navCollapse).toggle();
      }
    }));
  }

  function showTeamContactModal(team) {
    const modal = document.getElementById('teamContactModal');
    const modalTeamCrest = document.getElementById('modal-team-crest');
    const modalTeamName = document.getElementById('modal-team-name');
    const modalTeamCoach = document.getElementById('modal-team-coach');
    const modalTeamPhone = document.getElementById('modal-team-phone');
    const modalTeamEmail = document.getElementById('modal-team-email');
    const modalTeamCity = document.getElementById('modal-team-city');
    const modalTeamVenue = document.getElementById('modal-team-venue');
    const modalTeamDescription = document.getElementById('modal-team-description');
    const modalTeamDescriptionWrap = document.getElementById('modal-team-description-wrap');

    if (modalTeamCrest && team.escudo_url) {
      modalTeamCrest.src = team.escudo_url;
      modalTeamCrest.classList.remove('d-none');
    } else if (modalTeamCrest) {
      modalTeamCrest.classList.add('d-none');
    }

    if (modalTeamName) modalTeamName.textContent = team.nombre || '';
    if (modalTeamCoach) modalTeamCoach.textContent = team.entrenador || '-';
    if (modalTeamPhone) {
      modalTeamPhone.textContent = team.telefono || '-';
      modalTeamPhone.href = team.telefono ? `tel:${team.telefono}` : '#';
    }
    if (modalTeamEmail) {
      modalTeamEmail.textContent = team.email || '-';
      modalTeamEmail.href = team.email ? `mailto:${team.email}` : '#';
    }
    if (modalTeamCity) modalTeamCity.textContent = team.ciudad || '-';
    if (modalTeamVenue) modalTeamVenue.textContent = team.sede || '-';
    if (modalTeamDescription && modalTeamDescriptionWrap) {
      if (team.descripcion) {
        modalTeamDescription.textContent = team.descripcion;
        modalTeamDescriptionWrap.style.display = '';
      } else {
        modalTeamDescriptionWrap.style.display = 'none';
      }
    }

    if (modal) {
      const bModal = new bootstrap.Modal(modal);
      bModal.show();
    }
  }

  async function loadDashboardStats() {
    try {
      const stats = await fetchAPI('/stats/dashboard');
      
      const statEquipos = document.getElementById('stat-equipos');
      const statCategorias = document.getElementById('stat-categorias');
      const statGoles = document.getElementById('stat-goles');
      
      if (statEquipos) {
        statEquipos.textContent = stats.totalEquipos;
      }
      if (statCategorias) {
        statCategorias.textContent = stats.totalCategorias;
      }
      if (statGoles) {
        statGoles.textContent = stats.totalGoles;
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  async function loadNews() {
    try {
      const news = await fetchAPI('/news');
      renderNewsCarousel(news);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  }

  async function loadEvents() {
    try {
      const events = await fetchAPI('/events');
      renderEventsCarousel(events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  }

  function renderEventsCarousel(eventsArray) {
    const eventsCarouselInner = document.getElementById('events-carousel-inner');
    const eventsIndicators = document.getElementById('events-indicators');

    if (!eventsCarouselInner) return;
    if (!eventsArray || !eventsArray.length) return;

    eventsCarouselInner.innerHTML = eventsArray.map((event, index) => `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        ${event.imagen_url
          ? `<img src="${event.imagen_url}" class="d-block w-100" style="height:250px;object-fit:cover;" alt="${event.titulo}">`
          : `<div class="d-block w-100 bg-dark" style="height:250px;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-calendar-star fa-3x text-muted"></i></div>`}
        <div class="carousel-caption d-flex flex-column justify-content-end pb-3">
          <h6 class="mb-1">${event.titulo}</h6>
          <p class="mb-0" style="font-size:0.85rem;">${event.contenido.substring(0, 90)}${event.contenido.length > 90 ? '...' : ''}</p>
        </div>
      </div>
    `).join('');

    if (eventsIndicators) {
      eventsIndicators.innerHTML = eventsArray.map((_, index) => `
        <button type="button" data-bs-target="#events-carousel" data-bs-slide-to="${index}" ${index === 0 ? 'class="active"' : ''}></button>
      `).join('');
    }
  }

  function renderNewsCarousel(newsArray) {
    const newsCarouselInner = document.getElementById('news-carousel-inner');
    const newsIndicators = document.getElementById('news-indicators');

    if (!newsCarouselInner || !newsArray.length) return;

    newsCarouselInner.innerHTML = newsArray.map((news, index) => `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        ${news.imagen_url ? `<img src="${news.imagen_url}" class="d-block w-100" style="height:300px;object-fit:cover;" alt="${news.titulo}">` : `<div class="d-block w-100 bg-dark" style="height:300px;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-image fa-3x text-muted"></i></div>`}
        <div class="carousel-caption d-flex flex-column justify-content-end pb-3">
          <h5 class="mb-2">${news.titulo}</h5>
          <p class="mb-0" style="font-size:0.9rem;">${news.contenido.substring(0, 100)}${news.contenido.length > 100 ? '...' : ''}</p>
        </div>
      </div>
    `).join('');

    newsIndicators.innerHTML = newsArray.map((_, index) => `
      <button type="button" data-bs-target="#news-carousel" data-bs-slide-to="${index}" ${index === 0 ? 'class="active"' : ''}></button>
    `).join('');
  }

  async function init() {
    try {
      [state.teams, state.standings, state.matches, state.categories, state.teamCategories, state.jornadas] = await Promise.all([
        fetchAPI('/teams'),
        fetchAPI('/standings'),
        fetchAPI('/matches'),
        fetchAPI('/categories'),
        fetchAPI('/team-categories'),
        fetchAPI('/jornadas'),
      ]);
    } catch (error) {
      console.warn('No se pudo conectar a la API:', error.message);
    }

    renderFilters();
    renderTeams();
    renderTable();
    renderFixtures();
    renderResults();
    renderGallery();
    loadDashboardStats();
    loadNews();
    loadEvents();
    handleForm();
    enableAnimations();
    wireNavCollapse();
  }

  await init();

  categoriaSelect.addEventListener('change', renderTable);
  refreshBtn.addEventListener('click', async () => {
    state.standings = await fetchAPI('/standings').catch(() => state.standings);
    renderTable();
  });
  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', () => {
      refreshFixtureTeamFilter();
      renderFixtures();
    });
  }
  if (filtroJornada) {
    filtroJornada.addEventListener('change', () => {
      refreshFixtureTeamFilter();
      renderFixtures();
    });
  }
  if (filtroArbitro) {
    filtroArbitro.addEventListener('change', () => {
      refreshFixtureTeamFilter();
      renderFixtures();
    });
  }
  if (filtroEquipo) {
    filtroEquipo.addEventListener('change', renderFixtures);
  }
  teamsCategoryFilter?.addEventListener('change', renderTeams);
});
