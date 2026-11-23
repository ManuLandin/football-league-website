document.addEventListener('DOMContentLoaded', () => {
  // Datos simulados
  const teams = [
    { name: 'Estrellas Norte', category: 'Sub-17', coach: 'Laura Vega', city: 'Madrid', founded: 2012, crest: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?auto=format&fit=crop&w=200&q=60' },
    { name: 'Atlético Sur', category: 'Sub-17', coach: 'Diego Ríos', city: 'Sevilla', founded: 2010, crest: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=200&q=60' },
    { name: 'CF Aurora', category: 'Sub-15', coach: 'Marta Silva', city: 'Valencia', founded: 2015, crest: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?auto=format&fit=crop&w=200&q=60' },
    { name: 'Leones del Este', category: 'Sub-19', coach: 'Carlos Méndez', city: 'Barcelona', founded: 2008, crest: 'https://images.unsplash.com/photo-1500468756762-a401b6f17b46?auto=format&fit=crop&w=200&q=60' },
    { name: 'Academia Horizonte', category: 'Sub-19', coach: 'Daniela Cortés', city: 'Bilbao', founded: 2011, crest: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=200&q=60' },
    { name: 'Fénix Capital', category: 'Sub-15', coach: 'Iván Torres', city: 'Madrid', founded: 2016, crest: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=60' }
  ];

  const standings = [
    { team: 'Estrellas Norte', category: 'sub17', pj: 8, g: 6, e: 1, p: 1, gf: 18, gc: 7 },
    { team: 'Atlético Sur', category: 'sub17', pj: 8, g: 5, e: 2, p: 1, gf: 16, gc: 9 },
    { team: 'CF Aurora', category: 'sub15', pj: 7, g: 4, e: 2, p: 1, gf: 14, gc: 6 },
    { team: 'Leones del Este', category: 'sub19', pj: 8, g: 4, e: 3, p: 1, gf: 15, gc: 10 },
    { team: 'Academia Horizonte', category: 'sub19', pj: 8, g: 4, e: 2, p: 2, gf: 12, gc: 8 },
    { team: 'Fénix Capital', category: 'sub15', pj: 7, g: 3, e: 2, p: 2, gf: 10, gc: 9 }
  ];

  const fixtures = [
    { date: '2026-03-02', time: '18:00', home: 'Estrellas Norte', away: 'Atlético Sur', venue: 'Estadio Municipal Aurora', category: 'sub17' },
    { date: '2026-03-03', time: '11:30', home: 'CF Aurora', away: 'Fénix Capital', venue: 'Campo Nuevo Sol', category: 'sub15' },
    { date: '2026-03-03', time: '19:00', home: 'Leones del Este', away: 'Academia Horizonte', venue: 'Parque Olímpico', category: 'sub19' },
    { date: '2026-03-05', time: '17:00', home: 'Fénix Capital', away: 'Estrellas Norte', venue: 'Centro Deportivo Capital', category: 'sub17' }
  ];

  const results = [
    { date: '2026-02-20', home: 'Atlético Sur', away: 'CF Aurora', score: '3 - 1', category: 'Sub-17' },
    { date: '2026-02-19', home: 'Leones del Este', away: 'Fénix Capital', score: '2 - 2', category: 'Sub-19' },
    { date: '2026-02-18', home: 'Estrellas Norte', away: 'Academia Horizonte', score: '1 - 0', category: 'Sub-17' }
  ];

  const gallery = [
    { src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=60', alt: 'Entrenamiento' },
    { src: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=800&q=60', alt: 'Celebración' },
    { src: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=800&q=60', alt: 'Formación' },
    { src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=60', alt: 'Portería' },
    { src: 'https://images.unsplash.com/photo-1497905963172-3c9a2c5cc5dd?auto=format&fit=crop&w=800&q=60', alt: 'Afición' },
    { src: 'https://images.unsplash.com/photo-1444491697005-9d7b0c6f38de?auto=format&fit=crop&w=800&q=60', alt: 'Partido nocturno' }
  ];

  const teamsGrid = document.getElementById('teams-grid');
  const tablaBody = document.getElementById('tabla-body');
  const categoriaSelect = document.getElementById('categoria-select');
  const refreshBtn = document.getElementById('refresh-table');
  const calendarioLista = document.getElementById('calendario-lista');
  const filtroEquipo = document.getElementById('filtro-equipo');
  const filtroCategoria = document.getElementById('filtro-categoria');
  const resultadosGrid = document.getElementById('resultados-grid');
  const galeriaGrid = document.getElementById('galeria-grid');
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  // Render equipos
  function renderTeams() {
    teamsGrid.innerHTML = teams
      .map((team) => `
        <div class="col-sm-6 col-lg-4">
          <div class="card h-100 p-3">
            <div class="d-flex align-items-center mb-3 gap-3">
              <div class="rounded-circle overflow-hidden" style="width:60px;height:60px;background:#0f141d;">
                <img src="${team.crest}" alt="${team.name}" class="w-100 h-100 object-fit-cover">
              </div>
              <div>
                <h5 class="mb-1">${team.name}</h5>
                <small class="text-secondary">${team.city} · ${team.category}</small>
              </div>
            </div>
            <p class="mb-1"><i class="fa-solid fa-user me-2 text-success"></i>Entrenador: ${team.coach}</p>
            <p class="mb-0"><i class="fa-solid fa-calendar me-2 text-success"></i>Fundado: ${team.founded}</p>
          </div>
        </div>
      `)
      .join('');
  }

  function computePoints(row) {
    return row.g * 3 + row.e;
  }

  function renderTable(category = 'general') {
    const filtered = category === 'general'
      ? standings
      : standings.filter((row) => row.category === category);

    const sorted = [...filtered].sort((a, b) => {
      const diffPts = computePoints(b) - computePoints(a);
      if (diffPts !== 0) return diffPts;
      const diffDG = (b.gf - b.gc) - (a.gf - a.gc);
      if (diffDG !== 0) return diffDG;
      return b.gf - a.gf;
    });

    tablaBody.innerHTML = sorted
      .map((row, index) => {
        const dg = row.gf - row.gc;
        return `
          <tr>
            <td>${index + 1}</td>
            <td class="fw-semibold">${row.team}</td>
            <td>${row.pj}</td>
            <td>${row.g}</td>
            <td>${row.e}</td>
            <td>${row.p}</td>
            <td>${row.gf}</td>
            <td>${row.gc}</td>
            <td>${dg}</td>
            <td>${computePoints(row)}</td>
          </tr>
        `;
      })
      .join('');
  }

  function renderFilters() {
    const teamNames = Array.from(new Set(teams.map((t) => t.name)));
    filtroEquipo.innerHTML += teamNames.map((name) => `<option value="${name}">${name}</option>`).join('');
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  function renderFixtures() {
    const teamFilter = filtroEquipo.value;
    const categoryFilter = filtroCategoria.value;

    const filtered = fixtures.filter((match) => {
      const byTeam = teamFilter === 'todos' || match.home === teamFilter || match.away === teamFilter;
      const byCat = categoryFilter === 'todas' || match.category === categoryFilter;
      return byTeam && byCat;
    });

    calendarioLista.innerHTML = filtered
      .map((match) => `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-primary text-uppercase">${match.category}</span>
              <small class="text-secondary">${formatDate(match.date)} · ${match.time}</small>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <div class="text-center flex-grow-1">
                <p class="fw-semibold mb-1">${match.home}</p>
                <small class="text-secondary">Local</small>
              </div>
              <span class="mx-3 text-secondary">vs</span>
              <div class="text-center flex-grow-1">
                <p class="fw-semibold mb-1">${match.away}</p>
                <small class="text-secondary">Visita</small>
              </div>
            </div>
            <div class="d-flex align-items-center mt-3 text-secondary">
              <i class="fa-solid fa-location-dot me-2 text-success"></i>
              <small>${match.venue}</small>
            </div>
          </div>
        </div>
      `)
      .join('');
  }

  function renderResults() {
    resultadosGrid.innerHTML = results
      .map((res) => `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-primary">${res.category}</span>
              <small class="text-secondary">${res.date}</small>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <p class="fw-semibold mb-0">${res.home}</p>
              <span class="fs-5 fw-bold text-success">${res.score}</span>
              <p class="fw-semibold mb-0">${res.away}</p>
            </div>
          </div>
        </div>
      `)
      .join('');
  }

  function renderGallery() {
    galeriaGrid.innerHTML = gallery
      .map((item) => `
        <div class="col-6 col-md-4">
          <div class="gallery-item" style="height: 180px;">
            <img src="${item.src}" alt="${item.alt}">
          </div>
        </div>
      `)
      .join('');
  }

  function handleForm() {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = contactForm.nombre.value.trim();
      const email = contactForm.email.value.trim();
      const mensaje = contactForm.mensaje.value.trim();

      if (!nombre || !email || !mensaje) {
        formFeedback.textContent = 'Por favor completa todos los campos.';
        formFeedback.className = 'text-danger';
        return;
      }

      formFeedback.textContent = 'Mensaje enviado. Te contactaremos pronto.';
      formFeedback.className = 'text-success';
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

  // Inicialización
  renderTeams();
  renderFilters();
  renderTable();
  renderFixtures();
  renderResults();
  renderGallery();
  handleForm();
  enableAnimations();
  wireNavCollapse();

  categoriaSelect.addEventListener('change', () => renderTable(categoriaSelect.value));
  refreshBtn.addEventListener('click', () => renderTable(categoriaSelect.value));
  filtroEquipo.addEventListener('change', renderFixtures);
  filtroCategoria.addEventListener('change', renderFixtures);
});
