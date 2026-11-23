const API_BASE = '../php-api/public/api';

(async () => {
  // ── Leer el ID del equipo desde la URL (?id=5) ────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const teamId = params.get('id');

  const nameEl    = document.getElementById('team-name');
  const coachEl   = document.getElementById('team-coach');
  const crestWrap = document.getElementById('team-crest-wrap');
  const catTabs   = document.getElementById('cat-tabs');
  const catContent = document.getElementById('cat-content');
  const errorMsg  = document.getElementById('error-msg');

  if (!teamId) {
    nameEl.textContent = 'Equipo no encontrado';
    errorMsg.classList.remove('d-none');
    errorMsg.textContent = 'No se especificó ningún equipo. Vuelve a la lista de equipos.';
    return;
  }

  // ── Fetch datos del equipo ─────────────────────────────────────────────────
  let team;
  try {
    const res = await fetch(`${API_BASE}/teams/${encodeURIComponent(teamId)}`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    team = await res.json();
  } catch (e) {
    nameEl.textContent = 'Error';
    errorMsg.classList.remove('d-none');
    return;
  }

  // ── Cabecera ───────────────────────────────────────────────────────────────
  document.title = team.nombre + ' | Liga de las Estrellas';
  nameEl.textContent = team.nombre;

  if (team.entrenador) {
    coachEl.textContent = '🧑‍🏫 Entrenador: ' + team.entrenador;
  }

  if (team.escudo_url) {
    crestWrap.innerHTML = `<img src="${team.escudo_url}" alt="${team.nombre}"
      style="width:100%;height:100%;object-fit:cover">`;
  }

  // ── Tabs de categorías ─────────────────────────────────────────────────────
  if (!team.categorias || team.categorias.length === 0) {
    catContent.innerHTML = '<p class="text-secondary">Este equipo aún no tiene categorías registradas.</p>';
    return;
  }

  team.categorias.forEach((cat, idx) => {
    const isFirst = idx === 0;
    const tabId   = `cat-tab-${cat.ec_id}`;
    const paneId  = `cat-pane-${cat.ec_id}`;

    // Tab button
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.setAttribute('role', 'presentation');
    li.innerHTML = `
      <button class="nav-link ${isFirst ? 'active' : ''}"
              id="${tabId}" data-bs-toggle="pill"
              data-bs-target="#${paneId}"
              type="button" role="tab">
        ${cat.nombre}
      </button>`;
    catTabs.appendChild(li);

    // Tab pane
    const pane = document.createElement('div');
    pane.className = `tab-pane fade ${isFirst ? 'show active' : ''}`;
    pane.id = paneId;
    pane.setAttribute('role', 'tabpanel');

    if (!cat.jugadores || cat.jugadores.length === 0) {
      pane.innerHTML = '<p class="text-secondary">No hay jugadores registrados en esta categoría.</p>';
    } else {
      const rows = cat.jugadores.map((j) => {
        const fotoCell = j.foto_url
          ? `<img src="${j.foto_url}" alt="${j.nombre}" class="rounded-circle" style="width:38px;height:38px;object-fit:cover">`
          : `<span class="badge bg-secondary">${j.numero}</span>`;
        const edad = j.fecha_nac
          ? calcEdad(j.fecha_nac) + ' años'
          : '-';
        return `
          <tr>
            <td>${fotoCell}</td>
            <td class="fw-semibold">${j.nombre}</td>
            <td>${j.apellidos}</td>
            <td><span class="badge bg-primary">${j.numero}</span></td>
            <td>${j.fecha_nac ? j.fecha_nac : '-'}</td>
            <td>${edad}</td>
          </tr>`;
      }).join('');

      pane.innerHTML = `
        <div class="table-responsive">
          <table class="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Foto / #</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Dorsal</th>
                <th>Nac.</th>
                <th>Edad</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="text-secondary small mt-2">Total jugadores: ${cat.jugadores.length}</p>`;
    }

    catContent.appendChild(pane);
  });
})();

function calcEdad(fechaNac) {
  const hoy    = new Date();
  const nac    = new Date(fechaNac);
  let edad     = hoy.getFullYear() - nac.getFullYear();
  const m      = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
