<?php
// API PHP — Liga Infantil y Juvenil de las Estrellas
// Sin Node.js. Usa XAMPP + MySQL (phpMyAdmin).

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$cfg = require __DIR__ . '/config.php';
try {
    $dsn = "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset={$cfg['db_charset']}";
    $pdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'No se pudo conectar a MySQL: ' . $e->getMessage()]);
    exit;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function need(array $body, array $fields): void {
    foreach ($fields as $f) {
        if (!isset($body[$f]) || $body[$f] === '') {
            json_out(['message' => "Campo requerido: $f"], 400);
        }
    }
}

function optional_text($value): ?string {
    if (!isset($value)) return null;
    $v = trim((string)$value);
    return $v === '' ? null : $v;
}

function ensure_jornadas_schema(PDO $pdo): void {
    // Compatibilidad: agrega estructura de jornadas sin romper instalaciones existentes.
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS jornadas (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(120) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB'
    );

    $col = $pdo->query("SHOW COLUMNS FROM partidos LIKE 'jornada_id'")->fetch();
    if (!$col) {
        $pdo->exec('ALTER TABLE partidos ADD COLUMN jornada_id BIGINT UNSIGNED NULL AFTER arbitro_id');
    }
}

function ensure_eventos_schema(PDO $pdo): void {
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS eventos (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            contenido TEXT NOT NULL,
            imagen_url VARCHAR(255),
            orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
            activo TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB'
    );
}

function ensure_bitacora_schema(PDO $pdo): void {
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS bitacora_cambios (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            admin_id BIGINT UNSIGNED NULL,
            admin_nombre VARCHAR(160) NOT NULL,
            admin_rol ENUM("super","equipo") NOT NULL,
            accion VARCHAR(120) NOT NULL,
            detalle TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_bitacora_created_at (created_at),
            INDEX idx_bitacora_admin_rol (admin_rol)
        ) ENGINE=InnoDB'
    );
}

function audit_log(PDO $pdo, ?array $actor, string $accion, string $detalle): void {
    if (!$actor || empty($actor['rol'])) return;
    if (!in_array($actor['rol'], ['super', 'equipo'], true)) return;
    try {
        $stmt = $pdo->prepare('INSERT INTO bitacora_cambios (admin_id,admin_nombre,admin_rol,accion,detalle) VALUES (?,?,?,?,?)');
        $stmt->execute([
            isset($actor['id']) ? (int)$actor['id'] : null,
            (string)($actor['nombre'] ?? 'Administrador'),
            (string)$actor['rol'],
            $accion,
            $detalle,
        ]);
    } catch (Throwable $ex) {
        // No bloquear la operación principal por falla de bitácora.
    }
}

// ── JWT sin dependencias externas ──────────────────────────────────────────────
function b64u(string $d): string { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }
function ub64(string $d): string { return base64_decode(strtr($d, '-_', '+/')); }

function jwt_make(array $payload, string $secret, int $ttl): string {
    $h = b64u(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload['iat'] = time();
    $payload['exp'] = time() + $ttl;
    $b = b64u(json_encode($payload));
    $s = b64u(hash_hmac('sha256', "$h.$b", $secret, true));
    return "$h.$b.$s";
}

function jwt_read(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $b, $s] = $parts;
    if (!hash_equals(b64u(hash_hmac('sha256', "$h.$b", $secret, true)), $s)) return null;
    $p = json_decode(ub64($b), true);
    if (!$p || (int)($p['exp'] ?? 0) < time()) return null;
    return $p;
}

function token_user(): ?array {
    global $cfg;
    $allH = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $allH['Authorization'] ?? $allH['authorization'] ?? '';
    $raw  = null;
    if (preg_match('/^Bearer\s+(\S+)/i', $auth, $m)) { $raw = $m[1]; }
    elseif (!empty($_GET['token']))                   { $raw = $_GET['token']; }
    return $raw ? jwt_read($raw, $cfg['jwt_secret']) : null;
}

function auth_check(): array {
    $u = token_user();
    if (!$u) json_out(['message' => 'Token requerido o inválido'], 401);
    return $u;
}

function super_check(): array {
    $u = auth_check();
    if (($u['rol'] ?? '') !== 'super') json_out(['message' => 'Solo superadmin'], 403);
    return $u;
}

// ── Auto-recalcular tabla de posiciones ────────────────────────────────────────
function recalc(PDO $pdo, int $ecId): void {
    $stmt = $pdo->prepare(
        'SELECT goles_local, goles_visita, equipo_categoria_local_id AS ec_l
         FROM partidos
         WHERE (equipo_categoria_local_id = ? OR equipo_categoria_visita_id = ?)
           AND estado = "jugado"'
    );
    $stmt->execute([$ecId, $ecId]);
    $rows = $stmt->fetchAll();
    $pj = $g = $e = $p = $gf = $gc = $pts = 0;
    foreach ($rows as $r) {
        $esLocal = (int)$r['ec_l'] === $ecId;
        $mios  = $esLocal ? (int)$r['goles_local']  : (int)$r['goles_visita'];
        $suyos = $esLocal ? (int)$r['goles_visita'] : (int)$r['goles_local'];
        $pj++; $gf += $mios; $gc += $suyos;
        if ($mios > $suyos)       { $g++; $pts += 3; }
        elseif ($mios === $suyos) { $e++; $pts += 1; }
        else                      { $p++; }
    }
    $ex = $pdo->prepare('SELECT id FROM tabla_posiciones WHERE equipo_categoria_id = ? LIMIT 1');
    $ex->execute([$ecId]);
    if ($ex->fetch()) {
        $pdo->prepare(
            'UPDATE tabla_posiciones SET pj=?,g=?,e=?,p=?,gf=?,gc=?,puntos=? WHERE equipo_categoria_id=?'
        )->execute([$pj,$g,$e,$p,$gf,$gc,$pts,$ecId]);
    } else {
        $pdo->prepare(
            'INSERT INTO tabla_posiciones (equipo_categoria_id,pj,g,e,p,gf,gc,puntos) VALUES (?,?,?,?,?,?,?,?)'
        )->execute([$ecId,$pj,$g,$e,$p,$gf,$gc,$pts]);
    }
}

function apply_match_discipline(PDO $pdo, int $matchId, int $ecLocalId, int $ecVisitaId): void {
        // Cumplen suspensión pendiente en este partido los jugadores de ambos equipos/categoría.
        $pdo->prepare(
                'UPDATE jugadores
                 SET suspension_restante = GREATEST(suspension_restante - 1, 0)
                 WHERE equipo_categoria_id IN (?, ?) AND suspension_restante > 0'
        )->execute([$ecLocalId, $ecVisitaId]);

        // Acumular amarillas y generar suspensión automática por cada bloque de 5.
        $pdo->prepare(
                'UPDATE jugadores j
                 JOIN (
                     SELECT jugador_id, SUM(amarillas) AS total_amarillas
                     FROM partido_alineaciones
                     WHERE partido_id = ?
                     GROUP BY jugador_id
                 ) a ON a.jugador_id = j.id
                 SET
                     j.suspension_restante = j.suspension_restante + FLOOR((j.tarjetas_amarillas_acum + a.total_amarillas) / 5),
                     j.tarjetas_amarillas_acum = MOD(j.tarjetas_amarillas_acum + a.total_amarillas, 5)
                 WHERE a.total_amarillas > 0'
        )->execute([$matchId]);

        // Una roja agrega una suspensión de un partido adicional.
        $pdo->prepare(
                'UPDATE jugadores j
                 JOIN (
                     SELECT jugador_id, SUM(CASE WHEN roja = 1 THEN 1 ELSE 0 END) AS rojas
                     FROM partido_alineaciones
                     WHERE partido_id = ?
                     GROUP BY jugador_id
                 ) r ON r.jugador_id = j.id
                 SET j.suspension_restante = j.suspension_restante + r.rojas
                 WHERE r.rojas > 0'
        )->execute([$matchId]);
}

ensure_jornadas_schema($pdo);
ensure_eventos_schema($pdo);
ensure_bitacora_schema($pdo);

// ── Router ─────────────────────────────────────────────────────────────────────
$base  = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
$full  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri   = '/' . ltrim(substr($full, strlen($base)), '/');
$meth  = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

switch (true) {

// ── Health ─────────────────────────────────────────────────────────────────────
case $uri === '/api/health' && $meth === 'GET':
    json_out(['status' => 'ok']);

// ── Auth: me ───────────────────────────────────────────────────────────────────
case $uri === '/api/auth/me' && $meth === 'GET':
    json_out(auth_check());

// ── Auth: login ────────────────────────────────────────────────────────────────
case $uri === '/api/auth/login' && $meth === 'POST':
    need($input, ['email', 'password']);
    $stmt = $pdo->prepare('SELECT id,nombre,email,password_hash,rol,activo FROM admins WHERE email=? LIMIT 1');
    $stmt->execute([$input['email']]);
    $adm = $stmt->fetch();
    if (!$adm || !$adm['activo'] || !password_verify($input['password'], $adm['password_hash']))
        json_out(['message' => 'Credenciales inválidas'], 401);
    $equipoId = null;
    if ($adm['rol'] === 'equipo') {
        $eStmt = $pdo->prepare('SELECT equipo_id FROM admin_equipos WHERE admin_id=? LIMIT 1');
        $eStmt->execute([(int)$adm['id']]);
        $eRow = $eStmt->fetch();
        if ($eRow) $equipoId = (int)$eRow['equipo_id'];
    }
    $tok = jwt_make(
        ['id' => (int)$adm['id'], 'nombre' => $adm['nombre'], 'email' => $adm['email'], 'rol' => $adm['rol'], 'equipo_id' => $equipoId],
        $cfg['jwt_secret'], $cfg['jwt_expires']
    );
    json_out(['token' => $tok, 'admin' => ['id' => (int)$adm['id'], 'nombre' => $adm['nombre'], 'email' => $adm['email'], 'rol' => $adm['rol'], 'equipo_id' => $equipoId]]);

// ── Auth: register (requiere estar autenticado) ────────────────────────────────
case $uri === '/api/auth/register' && $meth === 'POST':
    $actor = super_check();
    need($input, ['nombre', 'email', 'password']);
    $rol  = in_array($input['rol'] ?? '', ['super','equipo']) ? $input['rol'] : 'equipo';
    $equipoId = isset($input['equipoId']) ? (int)$input['equipoId'] : 0;
    if ($rol === 'equipo' && $equipoId <= 0) {
        json_out(['message' => 'Debes asignar un equipo al admin de equipo'], 400);
    }
    $hash = password_hash($input['password'], PASSWORD_BCRYPT);
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('INSERT INTO admins (nombre,email,password_hash,rol) VALUES (?,?,?,?)');
        $stmt->execute([$input['nombre'], $input['email'], $hash, $rol]);
        $newAdminId = (int)$pdo->lastInsertId();

        if ($rol === 'equipo') {
            $teamExists = $pdo->prepare('SELECT id FROM equipos WHERE id=? LIMIT 1');
            $teamExists->execute([$equipoId]);
            if (!$teamExists->fetch()) {
                $pdo->rollBack();
                json_out(['message' => 'Equipo no encontrado para asignación'], 404);
            }
            $pdo->prepare('INSERT INTO admin_equipos (admin_id,equipo_id) VALUES (?,?)')->execute([$newAdminId, $equipoId]);
        }

        $pdo->commit();
        audit_log(
            $pdo,
            $actor,
            'ADMIN_CREAR',
            'Creó administrador "' . $input['nombre'] . '" (' . $input['email'] . ') con rol ' . $rol
            . ($rol === 'equipo' ? ' y equipo_id ' . $equipoId : '')
        );
        json_out([
            'id' => $newAdminId,
            'nombre' => $input['nombre'],
            'email' => $input['email'],
            'rol' => $rol,
            'equipo_id' => $rol === 'equipo' ? $equipoId : null,
        ], 201);
    } catch (Throwable $ex) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        $msg = 'Email ya registrado';
        if (stripos((string)$ex->getMessage(), 'uniq_equipo_admin') !== false) {
            $msg = 'Ese equipo ya tiene administrador asignado';
        }
        json_out(['message' => $msg], 409);
    }

// ── Admins: listar (solo super) ────────────────────────────────────────────────
case $uri === '/api/admins' && $meth === 'GET':
    super_check();
    json_out($pdo->query(
        'SELECT a.id,a.nombre,a.email,a.rol,a.activo,a.created_at,ae.equipo_id,e.nombre AS equipo_nombre
         FROM admins a
         LEFT JOIN admin_equipos ae ON ae.admin_id=a.id
         LEFT JOIN equipos e ON e.id=ae.equipo_id
         ORDER BY a.id'
    )->fetchAll());

// ── Bitácora: listar (solo super) ────────────────────────────────────────────
case $uri === '/api/bitacora' && $meth === 'GET':
    super_check();
    $where = []; $prms = [];
    if (!empty($_GET['rol']) && in_array($_GET['rol'], ['super', 'equipo'], true)) {
        $where[] = 'admin_rol=?';
        $prms[] = $_GET['rol'];
    }
    $sql = 'SELECT id,admin_id,admin_nombre,admin_rol,accion,detalle,created_at
            FROM bitacora_cambios'
         . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
         . ' ORDER BY created_at DESC, id DESC LIMIT 800';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($prms);
    json_out($stmt->fetchAll());

// ── Admins: actualizar ─────────────────────────────────────────────────────────
case preg_match('#^/api/admins/(\d+)$#', $uri, $m) && $meth === 'PUT':
    $actor = super_check();
    $id = (int)$m[1];
    $flds = []; $prms = [];
    if (!empty($input['nombre']))   { $flds[] = 'nombre=?';        $prms[] = $input['nombre']; }
    if (in_array($input['rol'] ?? '', ['super','equipo'])) { $flds[] = 'rol=?'; $prms[] = $input['rol']; }
    if (isset($input['activo']))    { $flds[] = 'activo=?';        $prms[] = (int)$input['activo']; }
    if (!empty($input['password'])) { $flds[] = 'password_hash=?'; $prms[] = password_hash($input['password'], PASSWORD_BCRYPT); }
    if (!$flds) json_out(['message' => 'Nada que actualizar'], 400);
    $prms[] = $id;
    $pdo->prepare('UPDATE admins SET '.implode(',', $flds).' WHERE id=?')->execute($prms);
    audit_log($pdo, $actor, 'ADMIN_EDITAR', 'Actualizó administrador id ' . $id . ' (campos: ' . implode(', ', $flds) . ')');
    json_out(['updated' => true]);

// ── Admins: eliminar ───────────────────────────────────────────────────────────
case preg_match('#^/api/admins/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $me = super_check();
    $id = (int)$m[1];
    if ($id === (int)$me['id']) json_out(['message' => 'No puedes eliminarte a ti mismo'], 400);
    $pdo->prepare('DELETE FROM admins WHERE id=?')->execute([$id]);
    audit_log($pdo, $me, 'ADMIN_ELIMINAR', 'Eliminó administrador id ' . $id);
    json_out(['deleted' => true]);

// ── Equipos: listar (público) ──────────────────────────────────────────────────
case $uri === '/api/teams' && $meth === 'GET':
    if (isset($_GET['categoryId']) && (int)$_GET['categoryId'] > 0) {
        $stmt = $pdo->prepare(
            'SELECT DISTINCT e.id,e.nombre,e.escudo_url,e.entrenador,e.telefono,e.email,e.ciudad,e.sede,e.descripcion
             FROM equipos e
             JOIN equipo_categoria ec ON ec.equipo_id=e.id
             WHERE ec.categoria_id=?
             ORDER BY e.nombre'
        );
        $stmt->execute([(int)$_GET['categoryId']]);
        json_out($stmt->fetchAll());
    }
    json_out($pdo->query('SELECT id,nombre,escudo_url,entrenador,telefono,email,ciudad,sede,descripcion FROM equipos ORDER BY nombre')->fetchAll());

// ── Equipos: crear ─────────────────────────────────────────────────────────────
case $uri === '/api/teams' && $meth === 'POST':
    $actor = auth_check();
    need($input, ['nombre']);
    $stmt = $pdo->prepare('INSERT INTO equipos (nombre,escudo_url,entrenador,telefono,email,ciudad,sede,descripcion) VALUES (?,?,?,?,?,?,?,?)');
    $stmt->execute([
        $input['nombre'],
        $input['escudo_url'] ?? null,
        $input['entrenador'] ?? null,
        $input['telefono'] ?? null,
        $input['email'] ?? null,
        $input['ciudad'] ?? null,
        $input['sede'] ?? null,
        $input['descripcion'] ?? null
    ]);
    $newId = (int)$pdo->lastInsertId();
    audit_log($pdo, $actor, 'EQUIPO_CREAR', 'Creó equipo "' . $input['nombre'] . '" (id ' . $newId . ')');
    json_out(['id' => $newId, 'nombre' => $input['nombre'],
              'escudo_url' => $input['escudo_url'] ?? null, 'entrenador' => $input['entrenador'] ?? null,
              'telefono' => $input['telefono'] ?? null, 'email' => $input['email'] ?? null], 201);

// ── Equipos: detalle con categorías y jugadores (público) ──────────────────────
case preg_match('#^/api/teams/(\d+)$#', $uri, $m) && $meth === 'GET':
    $tid = (int)$m[1];
    $st  = $pdo->prepare('SELECT id,nombre,escudo_url,entrenador,telefono,email,ciudad,sede,descripcion FROM equipos WHERE id=? LIMIT 1');
    $st->execute([$tid]);
    $team = $st->fetch();
    if (!$team) json_out(['message' => 'Equipo no encontrado'], 404);
    $st2 = $pdo->prepare(
        'SELECT ec.id AS ec_id, c.nombre AS categoria
         FROM equipo_categoria ec JOIN categorias c ON ec.categoria_id=c.id
         WHERE ec.equipo_id=? ORDER BY c.nombre'
    );
    $st2->execute([$tid]);
    $cats = $st2->fetchAll();
    $team['categorias'] = [];
    foreach ($cats as $cat) {
        $st3 = $pdo->prepare(
            'SELECT id,nombre,apellidos,numero,fecha_nac,foto_url FROM jugadores
             WHERE equipo_categoria_id=? AND activo=1 ORDER BY numero'
        );
        $st3->execute([(int)$cat['ec_id']]);
        $team['categorias'][] = ['ec_id' => (int)$cat['ec_id'], 'nombre' => $cat['categoria'], 'jugadores' => $st3->fetchAll()];
    }
    json_out($team);

// ── Equipos: actualizar ────────────────────────────────────────────────────────
case preg_match('#^/api/teams/(\d+)$#', $uri, $m) && $meth === 'PUT':
    $actor = auth_check();
    $id = (int)$m[1];
    need($input, ['nombre']);
    $pdo->prepare('UPDATE equipos SET nombre=?,escudo_url=?,entrenador=?,telefono=?,email=?,ciudad=?,sede=?,descripcion=? WHERE id=?')
        ->execute([
            $input['nombre'],
            $input['escudo_url'] ?? null,
            $input['entrenador'] ?? null,
            $input['telefono'] ?? null,
            $input['email'] ?? null,
            $input['ciudad'] ?? null,
            $input['sede'] ?? null,
            $input['descripcion'] ?? null,
            $id
        ]);
    audit_log($pdo, $actor, 'EQUIPO_EDITAR', 'Actualizó equipo id ' . $id . ' -> "' . $input['nombre'] . '"');
    json_out(['id' => $id, 'nombre' => $input['nombre']]);

// ── Equipos: eliminar ──────────────────────────────────────────────────────────
case preg_match('#^/api/teams/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = auth_check();
    $teamId = (int)$m[1];
    $pdo->prepare('DELETE FROM equipos WHERE id=?')->execute([$teamId]);
    audit_log($pdo, $actor, 'EQUIPO_ELIMINAR', 'Eliminó equipo id ' . $teamId);
    json_out(['deleted' => true]);

// ── Noticias: listar (público) ────────────────────────────────────────────────────
case $uri === '/api/news' && $meth === 'GET':
    json_out($pdo->query('SELECT id,titulo,contenido,imagen_url,orden FROM noticias WHERE activo=1 ORDER BY orden,created_at DESC')->fetchAll());

// ── Noticias: crear (admin) ───────────────────────────────────────────────────────
case $uri === '/api/news' && $meth === 'POST':
    $actor = super_check();
    need($input, ['titulo', 'contenido']);
    $stmt = $pdo->prepare('INSERT INTO noticias (titulo,contenido,imagen_url,orden,activo) VALUES (?,?,?,?,1)');
    $stmt->execute([$input['titulo'], $input['contenido'], $input['imagen_url'] ?? null, $input['orden'] ?? 0]);
    audit_log($pdo, $actor, 'NOTICIA_CREAR', 'Creó noticia "' . $input['titulo'] . '"');
    json_out(['id' => (int)$pdo->lastInsertId(), 'titulo' => $input['titulo']], 201);

// ── Noticias: obtener una (público) ───────────────────────────────────────────────
case preg_match('#^/api/news/(\d+)$#', $uri, $m) && $meth === 'GET':
    $stmt = $pdo->prepare('SELECT id,titulo,contenido,imagen_url,orden FROM noticias WHERE id=? AND activo=1 LIMIT 1');
    $stmt->execute([(int)$m[1]]);
    $news = $stmt->fetch();
    if (!$news) json_out(['message' => 'Noticia no encontrada'], 404);
    json_out($news);

// ── Noticias: editar (admin) ──────────────────────────────────────────────────────
case preg_match('#^/api/news/(\d+)$#', $uri, $m) && $meth === 'PUT':
    $actor = super_check();
    $id = (int)$m[1];
    need($input, ['titulo', 'contenido']);
    $pdo->prepare('UPDATE noticias SET titulo=?,contenido=?,imagen_url=?,orden=? WHERE id=?')
        ->execute([$input['titulo'], $input['contenido'], $input['imagen_url'] ?? null, $input['orden'] ?? 0, $id]);
    audit_log($pdo, $actor, 'NOTICIA_EDITAR', 'Actualizó noticia id ' . $id . ' -> "' . $input['titulo'] . '"');
    json_out(['id' => $id, 'titulo' => $input['titulo']]);

// ── Noticias: eliminar (admin) ────────────────────────────────────────────────────
case preg_match('#^/api/news/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = super_check();
    $id = (int)$m[1];
    $pdo->prepare('DELETE FROM noticias WHERE id=?')->execute([$id]);
    audit_log($pdo, $actor, 'NOTICIA_ELIMINAR', 'Eliminó noticia id ' . $id);
    json_out(['deleted' => true]);

// ── Eventos: listar (público) ───────────────────────────────────────────────────
case $uri === '/api/events' && $meth === 'GET':
    json_out($pdo->query('SELECT id,titulo,contenido,imagen_url,orden FROM eventos WHERE activo=1 ORDER BY orden,created_at DESC')->fetchAll());

// ── Eventos: crear (admin) ─────────────────────────────────────────────────────
case $uri === '/api/events' && $meth === 'POST':
    $actor = super_check();
    need($input, ['titulo', 'contenido']);
    $stmt = $pdo->prepare('INSERT INTO eventos (titulo,contenido,imagen_url,orden,activo) VALUES (?,?,?,?,1)');
    $stmt->execute([$input['titulo'], $input['contenido'], $input['imagen_url'] ?? null, $input['orden'] ?? 0]);
    audit_log($pdo, $actor, 'EVENTO_CREAR', 'Creó evento "' . $input['titulo'] . '"');
    json_out(['id' => (int)$pdo->lastInsertId(), 'titulo' => $input['titulo']], 201);

// ── Eventos: obtener uno (público) ─────────────────────────────────────────────
case preg_match('#^/api/events/(\d+)$#', $uri, $m) && $meth === 'GET':
    $stmt = $pdo->prepare('SELECT id,titulo,contenido,imagen_url,orden FROM eventos WHERE id=? AND activo=1 LIMIT 1');
    $stmt->execute([(int)$m[1]]);
    $event = $stmt->fetch();
    if (!$event) json_out(['message' => 'Evento no encontrado'], 404);
    json_out($event);

// ── Eventos: editar (admin) ───────────────────────────────────────────────────
case preg_match('#^/api/events/(\d+)$#', $uri, $m) && $meth === 'PUT':
    $actor = super_check();
    $id = (int)$m[1];
    need($input, ['titulo', 'contenido']);
    $pdo->prepare('UPDATE eventos SET titulo=?,contenido=?,imagen_url=?,orden=? WHERE id=?')
        ->execute([$input['titulo'], $input['contenido'], $input['imagen_url'] ?? null, $input['orden'] ?? 0, $id]);
    audit_log($pdo, $actor, 'EVENTO_EDITAR', 'Actualizó evento id ' . $id . ' -> "' . $input['titulo'] . '"');
    json_out(['id' => $id, 'titulo' => $input['titulo']]);

// ── Eventos: eliminar (admin) ─────────────────────────────────────────────────
case preg_match('#^/api/events/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = super_check();
    $id = (int)$m[1];
    $pdo->prepare('DELETE FROM eventos WHERE id=?')->execute([$id]);
    audit_log($pdo, $actor, 'EVENTO_ELIMINAR', 'Eliminó evento id ' . $id);
    json_out(['deleted' => true]);

// ── Categorías: listar globales (público) ──────────────────────────────────────
case $uri === '/api/categories' && $meth === 'GET':
    json_out($pdo->query('SELECT id,nombre FROM categorias ORDER BY nombre')->fetchAll());

// ── Jornadas: listar (público) ─────────────────────────────────────────────────
case $uri === '/api/jornadas' && $meth === 'GET':
    json_out($pdo->query('SELECT id,nombre FROM jornadas ORDER BY nombre')->fetchAll());

// ── Jornadas: crear (super) ────────────────────────────────────────────────────
case $uri === '/api/jornadas' && $meth === 'POST':
    $actor = super_check();
    need($input, ['nombre']);
    try {
        $stmt = $pdo->prepare('INSERT INTO jornadas (nombre) VALUES (?)');
        $stmt->execute([trim($input['nombre'])]);
        audit_log($pdo, $actor, 'JORNADA_CREAR', 'Creó jornada "' . trim($input['nombre']) . '"');
        json_out(['id' => (int)$pdo->lastInsertId(), 'nombre' => trim($input['nombre'])], 201);
    } catch (Throwable $ex) {
        json_out(['message' => 'La jornada ya existe'], 409);
    }

// ── Jornadas: eliminar (super) ─────────────────────────────────────────────────
case preg_match('#^/api/jornadas/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = super_check();
    $id = (int)$m[1];
    $check = $pdo->prepare('SELECT COUNT(*) AS total FROM partidos WHERE jornada_id=?');
    $check->execute([$id]);
    $used = (int)($check->fetch()['total'] ?? 0);
    if ($used > 0) {
        json_out(['message' => 'No puedes eliminar una jornada con partidos asignados'], 409);
    }
    $pdo->prepare('DELETE FROM jornadas WHERE id=?')->execute([$id]);
    audit_log($pdo, $actor, 'JORNADA_ELIMINAR', 'Eliminó jornada id ' . $id);
    json_out(['deleted' => true]);

// ── Categorías: crear global (admin) ───────────────────────────────────────────
case $uri === '/api/categories' && $meth === 'POST':
    $actor = super_check();
    need($input, ['nombre']);
    try {
        $stmt = $pdo->prepare('INSERT INTO categorias (nombre) VALUES (?)');
        $stmt->execute([trim($input['nombre'])]);
        audit_log($pdo, $actor, 'CATEGORIA_CREAR', 'Creó categoría global "' . trim($input['nombre']) . '"');
        json_out(['id' => (int)$pdo->lastInsertId(), 'nombre' => trim($input['nombre'])], 201);
    } catch (Throwable $ex) {
        json_out(['message' => 'La categoría ya existe'], 409);
    }

// ── Categorías por equipo: listar (público) ────────────────────────────────────
case preg_match('#^/api/teams/(\d+)/categories$#', $uri, $m) && $meth === 'GET':
    $stmt = $pdo->prepare(
        'SELECT ec.id,c.nombre FROM equipo_categoria ec
         JOIN categorias c ON ec.categoria_id=c.id WHERE ec.equipo_id=? ORDER BY c.nombre'
    );
    $stmt->execute([(int)$m[1]]);
    json_out($stmt->fetchAll());

// ── Categorías por equipo: crear ───────────────────────────────────────────────
case preg_match('#^/api/teams/(\d+)/categories$#', $uri, $m) && $meth === 'POST':
    $actor = auth_check();
    $teamId = (int)$m[1];
    if (empty($input['categoryId']) && empty($input['nombre'])) {
        json_out(['message' => 'Debes indicar una categoría existente o un nombre'], 400);
    }
    $pdo->beginTransaction();
    try {
        if (!empty($input['categoryId'])) {
            $catId = (int)$input['categoryId'];
            $st = $pdo->prepare('SELECT id,nombre FROM categorias WHERE id=? LIMIT 1');
            $st->execute([$catId]);
            $cat = $st->fetch();
            if (!$cat) {
                $pdo->rollBack();
                json_out(['message' => 'Categoría no encontrada'], 404);
            }
            $catNombre = $cat['nombre'];
        } else {
            $st = $pdo->prepare('SELECT id,nombre FROM categorias WHERE nombre=? LIMIT 1');
            $st->execute([trim($input['nombre'])]);
            $cat = $st->fetch();
            if ($cat) {
                $catId = (int)$cat['id'];
                $catNombre = $cat['nombre'];
            } else {
                $pdo->prepare('INSERT INTO categorias (nombre) VALUES (?)')->execute([trim($input['nombre'])]);
                $catId = (int)$pdo->lastInsertId();
                $catNombre = trim($input['nombre']);
            }
        }
        $pdo->prepare('INSERT INTO equipo_categoria (equipo_id,categoria_id) VALUES (?,?)')->execute([$teamId,$catId]);
        $ecId = (int)$pdo->lastInsertId();
        $pdo->commit();
        audit_log($pdo, $actor, 'CATEGORIA_ASIGNAR', 'Asignó categoría "' . $catNombre . '" al equipo id ' . $teamId);
        json_out(['id' => $ecId, 'nombre' => $catNombre, 'categoria_id' => $catId], 201);
    } catch (Throwable $ex) { $pdo->rollBack(); json_out(['message' => 'Categoría ya asignada a este equipo'], 409); }

// ── Categorías (ec): eliminar ──────────────────────────────────────────────────
case preg_match('#^/api/categories/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = auth_check();
    $ecId = (int)$m[1];
    $pdo->prepare('DELETE FROM equipo_categoria WHERE id=?')->execute([$ecId]);
    audit_log($pdo, $actor, 'CATEGORIA_DESASIGNAR', 'Eliminó asignación equipo_categoria id ' . $ecId);
    json_out(['deleted' => true]);

// ── Team-categories: todo (para selects del admin — público) ───────────────────
case $uri === '/api/team-categories' && $meth === 'GET':
    $stmt = $pdo->query(
        'SELECT ec.id, e.id AS team_id, e.nombre AS team_nombre,
                c.id AS cat_id, c.nombre AS cat_nombre,
                CONCAT(e.nombre," (",c.nombre,")") AS display
         FROM equipo_categoria ec
         JOIN equipos e ON ec.equipo_id=e.id
         JOIN categorias c ON ec.categoria_id=c.id
         ORDER BY e.nombre, c.nombre'
    );
    json_out($stmt->fetchAll());

// ── Jugadores por categoría: listar (público) ──────────────────────────────────
case preg_match('#^/api/categories/(\d+)/players$#', $uri, $m) && $meth === 'GET':
    $stmt = $pdo->prepare(
        'SELECT j.id,j.nombre,j.apellidos,j.nombre_papa,j.nombre_mama,j.escuela,j.grado_escolar,j.telefono_casa,j.telefono_mama,j.telefono_papa,j.tipo_sanguineo,
                j.numero,j.fecha_nac,j.foto_url,j.estatura,j.peso,j.alergias,j.tarjetas_amarillas_acum,j.suspension_restante,
                ec.equipo_id,e.nombre as equipo_nombre,ec.id as equipo_categoria_id
         FROM jugadores j
         JOIN equipo_categoria ec ON j.equipo_categoria_id = ec.id
         JOIN equipos e ON ec.equipo_id = e.id
         WHERE j.equipo_categoria_id=? AND j.activo=1 ORDER BY j.numero'
    );
    $stmt->execute([(int)$m[1]]);
    $rows = $stmt->fetchAll();
    json_out(array_map(fn($r) => array_merge($r, [
        'fechaNac' => $r['fecha_nac'],
        'nombrePapa' => $r['nombre_papa'],
        'nombreMama' => $r['nombre_mama'],
        'gradoEscolar' => $r['grado_escolar'],
        'telefonoCasa' => $r['telefono_casa'],
        'telefonoMama' => $r['telefono_mama'],
        'telefonoPapa' => $r['telefono_papa'],
        'tipoSanguineo' => $r['tipo_sanguineo'],
        'tarjetasAmarillasAcum' => (int)$r['tarjetas_amarillas_acum'],
        'suspensionRestante' => (int)$r['suspension_restante'],
        'equipoId' => (int)$r['equipo_id'],
        'equipoNombre' => (string)$r['equipo_nombre'],
    ]), $rows));

// ── Jugadores: crear ───────────────────────────────────────────────────────────
case preg_match('#^/api/categories/(\d+)/players$#', $uri, $m) && $meth === 'POST':
    $actor = auth_check();
    $ecId = (int)$m[1];
    need($input, ['nombre','apellidos','numero']);
    $teamStmt = $pdo->prepare(
        'SELECT ec.equipo_id,e.nombre AS equipo_nombre
         FROM equipo_categoria ec
         JOIN equipos e ON ec.equipo_id = e.id
         WHERE ec.id=? LIMIT 1'
    );
    $teamStmt->execute([$ecId]);
    $teamRow = $teamStmt->fetch();
    if (!$teamRow) json_out(['message' => 'Relación equipo-categoría inválida'], 400);
    $stmt = $pdo->prepare(
        'INSERT INTO jugadores (
            equipo_categoria_id,nombre,apellidos,nombre_papa,nombre_mama,escuela,grado_escolar,telefono_casa,telefono_mama,telefono_papa,tipo_sanguineo,
            numero,fecha_nac,foto_url,estatura,peso,alergias
         ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $stmt->execute([$ecId,$input['nombre'],$input['apellidos'],
                    optional_text($input['nombrePapa'] ?? null),optional_text($input['nombreMama'] ?? null),
                    optional_text($input['escuela'] ?? null),optional_text($input['gradoEscolar'] ?? null),
                    optional_text($input['telefonoCasa'] ?? null),optional_text($input['telefonoMama'] ?? null),optional_text($input['telefonoPapa'] ?? null),
                    optional_text($input['tipoSanguineo'] ?? null),
                    (int)$input['numero'],$input['fechaNac']??null,$input['foto']??null,
                    $input['estatura']!==''&&$input['estatura']!==null?(float)$input['estatura']:null,
                    $input['peso']!==''&&$input['peso']!==null?(float)$input['peso']:null,
                    $input['alergias']??null]);
    $newId = (int)$pdo->lastInsertId();
    audit_log($pdo, $actor, 'JUGADOR_CREAR', 'Creó jugador "' . $input['nombre'] . ' ' . $input['apellidos'] . '" (id ' . $newId . ')');
    json_out(['id'=>$newId,'nombre'=>$input['nombre'],'apellidos'=>$input['apellidos'],
              'numero'=>(int)$input['numero'],'fechaNac'=>$input['fechaNac']??null,
              'foto_url'=>$input['foto']??null,'estatura'=>$input['estatura']??null,
              'peso'=>$input['peso']??null,'alergias'=>$input['alergias']??null,
              'equipoId'=>(int)$teamRow['equipo_id'],'equipoNombre'=>(string)$teamRow['equipo_nombre'],
              'nombrePapa'=>optional_text($input['nombrePapa'] ?? null),'nombreMama'=>optional_text($input['nombreMama'] ?? null),
              'escuela'=>optional_text($input['escuela'] ?? null),'gradoEscolar'=>optional_text($input['gradoEscolar'] ?? null),
              'telefonoCasa'=>optional_text($input['telefonoCasa'] ?? null),'telefonoMama'=>optional_text($input['telefonoMama'] ?? null),
              'telefonoPapa'=>optional_text($input['telefonoPapa'] ?? null),'tipoSanguineo'=>optional_text($input['tipoSanguineo'] ?? null)], 201);

// ── Jugadores: actualizar ──────────────────────────────────────────────────────
case preg_match('#^/api/players/(\d+)$#', $uri, $m) && $meth === 'PUT':
    $actor = auth_check();
    $id = (int)$m[1];
    need($input, ['nombre','apellidos','numero']);
    $pdo->prepare(
        'UPDATE jugadores
         SET nombre=?,apellidos=?,nombre_papa=?,nombre_mama=?,escuela=?,grado_escolar=?,telefono_casa=?,telefono_mama=?,telefono_papa=?,tipo_sanguineo=?,
             numero=?,fecha_nac=?,foto_url=?,estatura=?,peso=?,alergias=?
         WHERE id=?'
    )->execute([$input['nombre'],$input['apellidos'],
                optional_text($input['nombrePapa'] ?? null),optional_text($input['nombreMama'] ?? null),
                optional_text($input['escuela'] ?? null),optional_text($input['gradoEscolar'] ?? null),
                optional_text($input['telefonoCasa'] ?? null),optional_text($input['telefonoMama'] ?? null),optional_text($input['telefonoPapa'] ?? null),
                optional_text($input['tipoSanguineo'] ?? null),
                (int)$input['numero'],$input['fechaNac']??null,$input['foto']??null,
                $input['estatura']!==''&&$input['estatura']!==null?(float)$input['estatura']:null,
                $input['peso']!==''&&$input['peso']!==null?(float)$input['peso']:null,
                $input['alergias']??null,$id]);
    audit_log($pdo, $actor, 'JUGADOR_EDITAR', 'Actualizó jugador id ' . $id . ' -> "' . $input['nombre'] . ' ' . $input['apellidos'] . '"');
    json_out(['id'=>$id,'nombre'=>$input['nombre'],'apellidos'=>$input['apellidos'],'numero'=>(int)$input['numero']]);

// ── Jugadores: eliminar ────────────────────────────────────────────────────────
case preg_match('#^/api/players/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = auth_check();
    $id = (int)$m[1];
    $pdo->prepare('DELETE FROM jugadores WHERE id=?')->execute([$id]);
    audit_log($pdo, $actor, 'JUGADOR_ELIMINAR', 'Eliminó jugador id ' . $id);
    json_out(['deleted' => true]);

// ── Partidos: listar (público) ─────────────────────────────────────────────────
case $uri === '/api/matches' && $meth === 'GET':
    $where = []; $prms = [];
    if (isset($_GET['estado']))      { $where[] = 'p.estado=?';            $prms[] = $_GET['estado']; }
    if (isset($_GET['categoriaId'])) { $where[] = 'ec_l.categoria_id=?'; $prms[] = (int)$_GET['categoriaId']; }
    if (isset($_GET['jornadaId']))   { $where[] = 'p.jornada_id=?';       $prms[] = (int)$_GET['jornadaId']; }
    if (isset($_GET['arbitroId']))   { $where[] = 'p.arbitro_id=?';       $prms[] = (int)$_GET['arbitroId']; }
    if (isset($_GET['equipoId'])) {
        $where[] = '(ec_l.equipo_id=? OR ec_v.equipo_id=?)';
        $prms[] = (int)$_GET['equipoId'];
        $prms[] = (int)$_GET['equipoId'];
    }
    $sql = 'SELECT p.id, p.fecha, p.estado, p.goles_local, p.goles_visita, p.comentario,
                   p.equipo_categoria_local_id, p.equipo_categoria_visita_id, p.arbitro_id, p.jornada_id,
                   el.nombre AS local_equipo, ev.nombre AS visita_equipo, c.nombre AS categoria,
                   CONCAT(a.nombre," ",a.apellidos) AS arbitro_nombre,
                   j.nombre AS jornada_nombre
            FROM partidos p
            JOIN equipo_categoria ec_l ON p.equipo_categoria_local_id=ec_l.id
            JOIN equipo_categoria ec_v ON p.equipo_categoria_visita_id=ec_v.id
            JOIN equipos el ON ec_l.equipo_id=el.id
            JOIN equipos ev ON ec_v.equipo_id=ev.id
            JOIN categorias c ON ec_l.categoria_id=c.id
            LEFT JOIN arbitros a ON p.arbitro_id=a.id
            LEFT JOIN jornadas j ON p.jornada_id=j.id'
          . ($where ? ' WHERE '.implode(' AND ', $where) : '')
          . ' ORDER BY p.fecha ASC';
    $st = $pdo->prepare($sql);
    $st->execute($prms);
    json_out($st->fetchAll());

// ── Partidos: crear (super) ────────────────────────────────────────────────────
case $uri === '/api/matches' && $meth === 'POST':
    $actor = super_check();
    need($input, ['jornadaId','ecLocalId','ecVisitaId','fecha']);
    if ((int)$input['ecLocalId'] === (int)$input['ecVisitaId']) {
        json_out(['message' => 'Local y visita deben ser distintos'], 400);
    }
    $jornadaId = (int)$input['jornadaId'];
    if ($jornadaId <= 0) {
        json_out(['message' => 'Debes asignar una jornada'], 400);
    }
    $stJ = $pdo->prepare('SELECT id FROM jornadas WHERE id=? LIMIT 1');
    $stJ->execute([$jornadaId]);
    if (!$stJ->fetch()) {
        json_out(['message' => 'Jornada no encontrada'], 404);
    }
    $stEc = $pdo->prepare('SELECT id,categoria_id FROM equipo_categoria WHERE id IN (?,?) ORDER BY id');
    $stEc->execute([(int)$input['ecLocalId'], (int)$input['ecVisitaId']]);
    $ecs = $stEc->fetchAll();
    if (count($ecs) !== 2) {
        json_out(['message' => 'Equipos/categorías inválidos para el partido'], 400);
    }
    if ((int)$ecs[0]['categoria_id'] !== (int)$ecs[1]['categoria_id']) {
        json_out(['message' => 'Solo se pueden programar partidos entre equipos de la misma categoría'], 409);
    }
    $arbitroId = !empty($input['arbitroId']) ? (int)$input['arbitroId'] : null;
    $stmt = $pdo->prepare(
           'INSERT INTO partidos (equipo_categoria_local_id,equipo_categoria_visita_id,arbitro_id,jornada_id,fecha,comentario,estado)
            VALUES (?,?,?,?,?,?,"programado")'
    );
        $stmt->execute([(int)$input['ecLocalId'],(int)$input['ecVisitaId'],$arbitroId,$jornadaId,$input['fecha'],$input['lugar']??null]);
        $matchId = (int)$pdo->lastInsertId();
        audit_log($pdo, $actor, 'PARTIDO_CREAR', 'Programó partido id ' . $matchId . ' (jornada_id ' . $jornadaId . ')');
        json_out(['id' => $matchId], 201);

// ── Partidos: detalle alineación (super) ──────────────────────────────────────
case preg_match('#^/api/matches/(\d+)/lineup$#', $uri, $m) && $meth === 'GET':
    super_check();
    $matchId = (int)$m[1];
    $st = $pdo->prepare(
        'SELECT p.id,p.estado,p.equipo_categoria_local_id,p.equipo_categoria_visita_id,
                el.nombre AS local_equipo, ev.nombre AS visita_equipo, c.nombre AS categoria
         FROM partidos p
         JOIN equipo_categoria ec_l ON p.equipo_categoria_local_id=ec_l.id
         JOIN equipo_categoria ec_v ON p.equipo_categoria_visita_id=ec_v.id
         JOIN equipos el ON ec_l.equipo_id=el.id
         JOIN equipos ev ON ec_v.equipo_id=ev.id
         JOIN categorias c ON ec_l.categoria_id=c.id
         WHERE p.id=? LIMIT 1'
    );
    $st->execute([$matchId]);
    $match = $st->fetch();
    if (!$match) json_out(['message' => 'Partido no encontrado'], 404);

    $localEc = (int)$match['equipo_categoria_local_id'];
    $visitaEc = (int)$match['equipo_categoria_visita_id'];

    $stLocal = $pdo->prepare(
        'SELECT id,nombre,apellidos,numero,tarjetas_amarillas_acum,suspension_restante
         FROM jugadores
         WHERE equipo_categoria_id=? AND activo=1
         ORDER BY numero,nombre'
    );
    $stLocal->execute([$localEc]);
    $localRoster = $stLocal->fetchAll();

    $stVisita = $pdo->prepare(
        'SELECT id,nombre,apellidos,numero,tarjetas_amarillas_acum,suspension_restante
         FROM jugadores
         WHERE equipo_categoria_id=? AND activo=1
         ORDER BY numero,nombre'
    );
    $stVisita->execute([$visitaEc]);
    $visitaRoster = $stVisita->fetchAll();

    $stLineup = $pdo->prepare(
        'SELECT jugador_id,lado,amarillas,roja,equipo_categoria_id
         FROM partido_alineaciones
         WHERE partido_id=?
         ORDER BY id'
    );
    $stLineup->execute([$matchId]);

    json_out([
        'match' => [
            'id' => $matchId,
            'estado' => $match['estado'],
            'categoria' => $match['categoria'],
            'local_equipo' => $match['local_equipo'],
            'visita_equipo' => $match['visita_equipo'],
            'equipo_categoria_local_id' => $localEc,
            'equipo_categoria_visita_id' => $visitaEc,
        ],
        'localRoster' => $localRoster,
        'visitaRoster' => $visitaRoster,
        'lineup' => $stLineup->fetchAll(),
    ]);

// ── Partidos: guardar alineación/tarjetas (super) ─────────────────────────────
case preg_match('#^/api/matches/(\d+)/lineup$#', $uri, $m) && $meth === 'PUT':
    $actor = super_check();
    $matchId = (int)$m[1];
    $st = $pdo->prepare('SELECT id,estado,disciplina_aplicada,equipo_categoria_local_id,equipo_categoria_visita_id FROM partidos WHERE id=? LIMIT 1');
    $st->execute([$matchId]);
    $match = $st->fetch();
    if (!$match) json_out(['message' => 'Partido no encontrado'], 404);
    if ($match['estado'] === 'jugado' || (int)$match['disciplina_aplicada'] === 1) {
        json_out(['message' => 'No puedes editar alineación de un partido ya jugado'], 400);
    }

    $localEc = (int)$match['equipo_categoria_local_id'];
    $visitaEc = (int)$match['equipo_categoria_visita_id'];
    $players = is_array($input['players'] ?? null) ? $input['players'] : [];

    $normalized = [];
    foreach ($players as $row) {
        $jugadorId = (int)($row['jugadorId'] ?? 0);
        $lado = $row['lado'] ?? '';
        if ($jugadorId <= 0 || !in_array($lado, ['local', 'visita'], true)) {
            json_out(['message' => 'Formato inválido en jugadores de alineación'], 400);
        }
        if (isset($normalized[$jugadorId])) {
            json_out(['message' => 'Jugador repetido en la alineación'], 409);
        }
        $normalized[$jugadorId] = [
            'jugadorId' => $jugadorId,
            'lado' => $lado,
            'amarillas' => max(0, min(5, (int)($row['amarillas'] ?? 0))),
            'roja' => !empty($row['roja']) ? 1 : 0,
            'ecId' => $lado === 'local' ? $localEc : $visitaEc,
        ];
    }

    $ids = array_keys($normalized);
    if (!empty($ids)) {
        $marks = implode(',', array_fill(0, count($ids), '?'));
        $stPlayers = $pdo->prepare(
            "SELECT id,equipo_categoria_id,suspension_restante,activo,nombre,apellidos
             FROM jugadores
             WHERE id IN ($marks)"
        );
        $stPlayers->execute($ids);
        $dbPlayers = [];
        foreach ($stPlayers->fetchAll() as $p) {
            $dbPlayers[(int)$p['id']] = $p;
        }
        if (count($dbPlayers) !== count($ids)) {
            json_out(['message' => 'Hay jugadores inválidos en la alineación'], 400);
        }

        $suspendedNames = [];
        foreach ($normalized as $entry) {
            $p = $dbPlayers[$entry['jugadorId']];
            if ((int)$p['activo'] !== 1) {
                json_out(['message' => 'No puedes alinear jugadores inactivos'], 400);
            }
            if ((int)$p['equipo_categoria_id'] !== (int)$entry['ecId']) {
                json_out(['message' => 'Un jugador no pertenece al lado/categoría seleccionada'], 409);
            }
            if ((int)$p['suspension_restante'] > 0) {
                $suspendedNames[] = $p['nombre'] . ' ' . $p['apellidos'];
            }
        }
        if (!empty($suspendedNames)) {
            json_out(['message' => 'Jugadores suspendidos no alineables: ' . implode(', ', $suspendedNames)], 409);
        }
    }

    $pdo->beginTransaction();
    try {
        $pdo->prepare('DELETE FROM partido_alineaciones WHERE partido_id=?')->execute([$matchId]);
        if (!empty($normalized)) {
            $ins = $pdo->prepare(
                'INSERT INTO partido_alineaciones (partido_id,jugador_id,equipo_categoria_id,lado,amarillas,roja)
                 VALUES (?,?,?,?,?,?)'
            );
            foreach ($normalized as $entry) {
                $ins->execute([$matchId, $entry['jugadorId'], $entry['ecId'], $entry['lado'], $entry['amarillas'], $entry['roja']]);
            }
        }
        $pdo->commit();
    } catch (Throwable $ex) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        json_out(['message' => 'No se pudo guardar la alineación'], 500);
    }
    audit_log($pdo, $actor, 'PARTIDO_ALINEACION', 'Guardó alineación de partido id ' . $matchId . ' con ' . count($normalized) . ' jugadores');
    json_out(['saved' => true, 'count' => count($normalized)]);

// ── Partidos: actualizar resultado (super) ─────────────────────────────────────
case preg_match('#^/api/matches/(\d+)$#', $uri, $m) && $meth === 'PUT':
    $actor = super_check();
    $id = (int)$m[1];
    $st  = $pdo->prepare('SELECT * FROM partidos WHERE id=? LIMIT 1');
    $st->execute([$id]);
    $match = $st->fetch();
    if (!$match) json_out(['message' => 'Partido no encontrado'], 404);
    $flds = []; $prms = [];
    if (isset($input['fecha']))    { $flds[] = 'fecha=?';      $prms[] = $input['fecha']; }
    if (isset($input['lugar']))    { $flds[] = 'comentario=?'; $prms[] = $input['lugar']; }
    if (array_key_exists('arbitroId', $input)) { $flds[] = 'arbitro_id=?'; $prms[] = $input['arbitroId'] ? (int)$input['arbitroId'] : null; }
    if (array_key_exists('goles_local', $input) && array_key_exists('goles_visita', $input)) {
        $flds[] = 'goles_local=?';  $prms[] = (int)$input['goles_local'];
        $flds[] = 'goles_visita=?'; $prms[] = (int)$input['goles_visita'];
        $flds[] = 'estado=?';       $prms[] = 'jugado';
    } elseif (isset($input['estado'])) {
        $flds[] = 'estado=?'; $prms[] = $input['estado'];
    }
    if ($flds) { $prms[] = $id; $pdo->prepare('UPDATE partidos SET '.implode(',', $flds).' WHERE id=?')->execute($prms); }
    if (array_key_exists('goles_local', $input) && array_key_exists('goles_visita', $input)) {
        // Aplicar disciplina solo la primera vez que se marca como jugado.
        if ((int)$match['disciplina_aplicada'] === 0) {
            apply_match_discipline($pdo, $id, (int)$match['equipo_categoria_local_id'], (int)$match['equipo_categoria_visita_id']);
            $pdo->prepare('UPDATE partidos SET disciplina_aplicada=1 WHERE id=?')->execute([$id]);
        }
        recalc($pdo, (int)$match['equipo_categoria_local_id']);
        recalc($pdo, (int)$match['equipo_categoria_visita_id']);
    }
    audit_log($pdo, $actor, 'PARTIDO_EDITAR', 'Actualizó partido id ' . $id);
    json_out(['updated' => true]);

// ── Partidos: eliminar (super) ─────────────────────────────────────────────────
case preg_match('#^/api/matches/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = super_check();
    $id = (int)$m[1];
    $st  = $pdo->prepare('SELECT equipo_categoria_local_id,equipo_categoria_visita_id,estado FROM partidos WHERE id=? LIMIT 1');
    $st->execute([$id]);
    $match = $st->fetch();
    if (!$match) json_out(['message' => 'Partido no encontrado'], 404);
    $pdo->prepare('DELETE FROM partidos WHERE id=?')->execute([$id]);
    if ($match['estado'] === 'jugado') {
        recalc($pdo, (int)$match['equipo_categoria_local_id']);
        recalc($pdo, (int)$match['equipo_categoria_visita_id']);
    }
    audit_log($pdo, $actor, 'PARTIDO_ELIMINAR', 'Eliminó partido id ' . $id);
    json_out(['deleted' => true]);

// ── Tabla de posiciones: listar (público) ──────────────────────────────────────
case $uri === '/api/standings' && $meth === 'GET':
    $where = []; $prms = [];
    if (isset($_GET['categoryId']))      { $where[] = 'tp.equipo_categoria_id=?'; $prms[] = (int)$_GET['categoryId']; }
    if (isset($_GET['categoriaId']))     { $where[] = 'ec.categoria_id=?'; $prms[] = (int)$_GET['categoriaId']; }
    if (isset($_GET['categoriaNombre'])) { $where[] = 'c.nombre=?';         $prms[] = $_GET['categoriaNombre']; }
        $dgExpr = '(CAST(tp.gf AS SIGNED) - CAST(tp.gc AS SIGNED))';
    $sql = 'SELECT tp.id, tp.pj, tp.g, tp.e, tp.p, tp.gf, tp.gc, tp.puntos,
                                     ' . $dgExpr . ' AS dg, e.id AS equipo_id, e.nombre AS equipo,
                   c.nombre AS categoria, ec.id AS ec_id
            FROM tabla_posiciones tp
            JOIN equipo_categoria ec ON tp.equipo_categoria_id=ec.id
            JOIN equipos e ON ec.equipo_id=e.id
            JOIN categorias c ON ec.categoria_id=c.id'
          . ($where ? ' WHERE '.implode(' AND ', $where) : '')
                    . ' ORDER BY tp.puntos DESC, ' . $dgExpr . ' DESC, tp.gf DESC';
    $st = $pdo->prepare($sql);
    $st->execute($prms);
    json_out($st->fetchAll());

// ── Tabla: upsert manual (admin) ───────────────────────────────────────────────
case $uri === '/api/standings' && $meth === 'POST':
    $actor = auth_check();
    need($input, ['categoriaId','pj','g','e','p','gf','gc','puntos']);
    $ecId = (int)$input['categoriaId'];
    $st   = $pdo->prepare('SELECT id FROM tabla_posiciones WHERE equipo_categoria_id=? LIMIT 1');
    $st->execute([$ecId]);
    if ($st->fetch()) {
        $pdo->prepare('UPDATE tabla_posiciones SET pj=?,g=?,e=?,p=?,gf=?,gc=?,puntos=? WHERE equipo_categoria_id=?')
            ->execute([(int)$input['pj'],(int)$input['g'],(int)$input['e'],(int)$input['p'],
                       (int)$input['gf'],(int)$input['gc'],(int)$input['puntos'],$ecId]);
        audit_log($pdo, $actor, 'TABLA_EDITAR', 'Actualizó tabla de posiciones para equipo_categoria_id ' . $ecId);
        json_out(['updated' => true]);
    } else {
        $pdo->prepare('INSERT INTO tabla_posiciones (equipo_categoria_id,pj,g,e,p,gf,gc,puntos) VALUES (?,?,?,?,?,?,?,?)')
            ->execute([$ecId,(int)$input['pj'],(int)$input['g'],(int)$input['e'],(int)$input['p'],
                       (int)$input['gf'],(int)$input['gc'],(int)$input['puntos']]);
        audit_log($pdo, $actor, 'TABLA_CREAR', 'Creó tabla de posiciones para equipo_categoria_id ' . $ecId);
        json_out(['created' => true], 201);
    }

// ── Tabla: eliminar ────────────────────────────────────────────────────────────
case preg_match('#^/api/standings/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = auth_check();
    $id = (int)$m[1];
    $pdo->prepare('DELETE FROM tabla_posiciones WHERE id=?')->execute([$id]);
    audit_log($pdo, $actor, 'TABLA_ELIMINAR', 'Eliminó registro de tabla id ' . $id);
    json_out(['deleted' => true]);

// ── PDF cédula ──────────────────────────────────────────────────────────────────
case preg_match('#^/api/pdf/match/(\d+)$#', $uri, $m) && $meth === 'GET':
    auth_check();
    $matchId = (int)$m[1];

    $st = $pdo->prepare(
        'SELECT p.id,p.fecha,p.comentario,p.goles_local,p.goles_visita,p.estado,
                el.nombre AS local_equipo, ev.nombre AS visita_equipo,
                c.nombre AS categoria, j.nombre AS jornada,
                CONCAT(COALESCE(a.nombre, ""), CASE WHEN a.id IS NULL THEN "" ELSE " " END, COALESCE(a.apellidos, "")) AS arbitro
         FROM partidos p
         JOIN equipo_categoria ec_l ON p.equipo_categoria_local_id=ec_l.id
         JOIN equipo_categoria ec_v ON p.equipo_categoria_visita_id=ec_v.id
         JOIN equipos el ON ec_l.equipo_id=el.id
         JOIN equipos ev ON ec_v.equipo_id=ev.id
         JOIN categorias c ON ec_l.categoria_id=c.id
         LEFT JOIN jornadas j ON p.jornada_id=j.id
         LEFT JOIN arbitros a ON p.arbitro_id=a.id
         WHERE p.id=?
         LIMIT 1'
    );
    $st->execute([$matchId]);
    $match = $st->fetch();
    if (!$match) json_out(['message' => 'Partido no encontrado'], 404);

    $hasScore = $match['goles_local'] !== null && $match['goles_visita'] !== null;
    if ($match['estado'] !== 'jugado' || !$hasScore) {
        json_out(['message' => 'La cédula solo se genera cuando el partido ya tiene resultado'], 409);
    }

    $stLine = $pdo->prepare(
        'SELECT pa.lado, j.numero, j.nombre, j.apellidos, pa.amarillas, pa.roja
         FROM partido_alineaciones pa
         JOIN jugadores j ON pa.jugador_id=j.id
         WHERE pa.partido_id=?
         ORDER BY pa.lado ASC, j.numero ASC, j.nombre ASC, j.apellidos ASC'
    );
    $stLine->execute([$matchId]);
    $lineup = $stLine->fetchAll();

    if (!$lineup) {
        json_out(['message' => 'Debes guardar la alineación antes de generar la cédula'], 409);
    }

    $local = [];
    $visita = [];
    foreach ($lineup as $row) {
        if (($row['lado'] ?? '') === 'local') $local[] = $row;
        if (($row['lado'] ?? '') === 'visita') $visita[] = $row;
    }
    if (!count($local) || !count($visita)) {
        json_out(['message' => 'La cédula requiere jugadores de local y visita en alineación'], 409);
    }

    $esc = static fn($v): string => htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
    $fmtDate = '-';
    $fmtTime = '-';
    if (!empty($match['fecha'])) {
        $ts = strtotime((string)$match['fecha']);
        if ($ts) {
            $fmtDate = date('d/m/Y', $ts);
            $fmtTime = date('H:i', $ts);
        }
    }

    $rows = max(12, count($local), count($visita));

    $scriptName = str_replace('\\', '/', (string)($_SERVER['SCRIPT_NAME'] ?? ''));
    $appBaseUrl = preg_replace('#/php-api/public/index\.php$#', '', $scriptName);
    if ($appBaseUrl === null || $appBaseUrl === '') $appBaseUrl = '';
    $imgDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'img';
    $preferredLogo = 'LOGO_PDF.jpeg';
    $logoCandidates = [$preferredLogo, 'LOGO_PDF.jpg', 'LOGO_PDF.png', 'logo_pdf.jpeg', 'logo_pdf.jpg', 'logo_pdf.png', 'logo.jpg', 'logo.jpeg', 'logo.png', 'logo.webp'];
    $logoFile = null;
    $preferredPath = $imgDir . DIRECTORY_SEPARATOR . $preferredLogo;
    if (is_file($preferredPath)) {
        $logoFile = $preferredLogo;
    }
    foreach ($logoCandidates as $candidate) {
        if ($logoFile) break;
        $full = $imgDir . DIRECTORY_SEPARATOR . $candidate;
        if (is_file($full)) {
            $logoFile = $candidate;
            break;
        }
    }
    $logoUrl = $logoFile ? $appBaseUrl . '/img/' . rawurlencode($logoFile) : null;

    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cédula de juego</title>';
    echo '<style>';
    echo '@page{size:A4;margin:12mm;}';
    echo 'body{font-family:Arial,Helvetica,sans-serif;color:#17366a;margin:0;font-size:12px;}';
    echo '.sheet{border:1px solid #2f5ca8;padding:10px;}';
    echo '.top{display:flex;justify-content:space-between;gap:12px;}';
    echo '.logoWrap{display:flex;align-items:flex-start;gap:10px;}';
    echo '.logoWrap img{height:78px;width:auto;max-width:280px;object-fit:contain;border:1px solid #2f5ca8;padding:2px;background:#fff;display:block;}';
    echo '.league{font-weight:700;line-height:1.1;font-size:22px;letter-spacing:.4px;}';
    echo '.meta{width:52%;font-size:11px;}';
    echo '.metaRow{display:flex;gap:8px;margin:4px 0;}';
    echo '.metaItem{flex:1;border-bottom:1px solid #2f5ca8;min-height:18px;}';
    echo '.metaLabel{font-weight:700;font-size:10px;display:inline-block;margin-right:6px;}';
    echo '.title{text-align:center;margin:10px 0 6px;}';
    echo '.title h1{margin:0;font-size:42px;line-height:1;color:#1a4ea1;letter-spacing:1px;}';
    echo '.title h2{margin:2px 0 0;font-size:20px;color:#1a4ea1;}';
    echo '.teamsHdr{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:8px 0 6px;}';
    echo '.teamsHdr .box{background:#1a4ea1;color:#fff;text-align:center;font-weight:700;padding:4px 6px;text-transform:uppercase;}';
    echo '.teamsHdr small{display:block;font-size:10px;opacity:.95;}';
    echo '.tables{display:grid;grid-template-columns:1fr 1fr;gap:14px;}';
    echo 'table{width:100%;border-collapse:collapse;}';
    echo 'th,td{border:1px solid #2f5ca8;padding:3px 4px;font-size:10px;color:#17366a;}';
    echo 'th{text-transform:uppercase;background:#edf2ff;}';
    echo '.numCol{width:48px;text-align:center;}';
    echo '.cardCol{width:24px;text-align:center;font-weight:700;}';
    echo '.jugCol{text-align:left;}';
    echo '.obsTitle{margin-top:10px;font-size:11px;font-weight:700;}';
    echo '.obsBox{border:1px solid #2f5ca8;padding:6px;height:148px;}';
    echo '.obsLine{border-bottom:1px solid #9db1db;height:14px;}';
    echo '.scoreGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px;}';
    echo '.scoreBox{border:1px solid #2f5ca8;min-height:46px;padding:6px;}';
    echo '.scoreBox .lbl{font-size:11px;font-weight:700;}';
    echo '.scoreBox .val{margin-top:4px;font-size:18px;font-weight:700;text-align:center;color:#0c2d61;}';
    echo '.signs{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:26px;}';
    echo '.sign{text-align:center;}';
    echo '.line{border-top:1px solid #2f5ca8;margin-bottom:5px;}';
    echo '.no-print{margin-top:14px;padding:8px 14px;border:none;background:#1a4ea1;color:#fff;border-radius:4px;cursor:pointer;}';
    echo '@media print{.no-print{display:none;}}';
    echo '</style></head><body>';

    echo '<div class="sheet">';
    echo '<div class="top">';
    echo '<div class="logoWrap">';
    if ($logoUrl) echo '<img src="' . $esc($logoUrl) . '" alt="Liga">';
    echo '<div class="league">LIGA INFANTIL Y JUVENIL<br>DE LAS ESTRELLAS</div>';
    echo '</div>';
    echo '<div class="meta">';
    echo '<div class="metaRow"><div class="metaItem"><span class="metaLabel">FECHA:</span>' . $esc($fmtDate) . '</div><div class="metaItem"><span class="metaLabel">HORARIO:</span>' . $esc($fmtTime) . '</div></div>';
    echo '<div class="metaRow"><div class="metaItem"><span class="metaLabel">ARBITRO:</span>' . $esc(trim((string)($match['arbitro'] ?? '-')) ?: '-') . '</div><div class="metaItem"><span class="metaLabel">CATEGORIA:</span>' . $esc($match['categoria'] ?? '-') . '</div></div>';
    echo '<div class="metaRow"><div class="metaItem"><span class="metaLabel">CANCHA:</span>' . $esc($match['comentario'] ?? '-') . '</div><div class="metaItem"><span class="metaLabel">JORNADA:</span>' . $esc($match['jornada'] ?? '-') . '</div></div>';
    echo '</div></div>';

    echo '<div class="title"><h1>CEDULA DE JUEGO</h1><h2>TEMPORADA 2025 - 2026</h2></div>';

    echo '<div class="teamsHdr">';
    echo '<div class="box"><small>LOCAL</small>' . $esc($match['local_equipo']) . '</div>';
    echo '<div class="box"><small>VISITANTE</small>' . $esc($match['visita_equipo']) . '</div>';
    echo '</div>';

    echo '<div class="tables">';

    $renderSide = static function (array $players, int $rows, callable $esc): void {
        echo '<table>';
        echo '<thead><tr><th class="numCol">No.</th><th class="jugCol">Jugador</th><th class="cardCol">A</th><th class="cardCol">E</th></tr></thead><tbody>';
        for ($i = 0; $i < $rows; $i++) {
            $p = $players[$i] ?? null;
            $num = $p ? (int)($p['numero'] ?? 0) : '';
            $name = $p ? trim((string)($p['nombre'] ?? '') . ' ' . (string)($p['apellidos'] ?? '')) : '';
            $a = ($p && (int)($p['amarillas'] ?? 0) > 0) ? 'X' : '';
            $e = ($p && (int)($p['roja'] ?? 0) === 1) ? 'X' : '';
            echo '<tr>';
            echo '<td class="numCol">' . $esc($num) . '</td>';
            echo '<td class="jugCol">' . $esc($name) . '</td>';
            echo '<td class="cardCol">' . $esc($a) . '</td>';
            echo '<td class="cardCol">' . $esc($e) . '</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
    };

    $renderSide($local, $rows, $esc);
    $renderSide($visita, $rows, $esc);

    echo '</div>';

    echo '<div class="obsTitle">OBSERVACIONES:</div>';
    echo '<div class="obsBox">';
    for ($i = 0; $i < 10; $i++) echo '<div class="obsLine"></div>';
    echo '</div>';

    echo '<div class="scoreGrid">';
    echo '<div class="scoreBox"><div class="lbl">MARCADOR LOCAL:</div><div class="val">' . $esc((int)$match['goles_local']) . '</div></div>';
    echo '<div class="scoreBox"><div class="lbl">MARCADOR VISITANTE:</div><div class="val">' . $esc((int)$match['goles_visita']) . '</div></div>';
    echo '</div>';

    echo '<div class="signs">';
    echo '<div class="sign"><div class="line"></div>NOMBRE Y FIRMA LOCAL</div>';
    echo '<div class="sign"><div class="line"></div>NOMBRE Y FIRMA VISITANTE</div>';
    echo '</div>';

    echo '</div>';
    echo '<button onclick="window.print()" class="no-print">Imprimir / Guardar PDF</button>';
    echo '</body></html>';
    exit;

case preg_match('#^/api/pdf/team/(\d+)/category/(\d+)$#', $uri, $m) && $meth === 'GET':
    auth_check();
    $teamId = (int)$m[1]; $ecId = (int)$m[2];
    $stmt = $pdo->prepare('SELECT nombre,entrenador,escudo_url FROM equipos WHERE id=? LIMIT 1');
    $stmt->execute([$teamId]);
    $team = $stmt->fetch() ?: ['nombre' => 'Equipo', 'entrenador' => '', 'escudo_url' => null];
    $stmt = $pdo->prepare('SELECT c.nombre FROM equipo_categoria ec JOIN categorias c ON ec.categoria_id=c.id WHERE ec.id=? LIMIT 1');
    $stmt->execute([$ecId]);
    $cat = $stmt->fetch();
    $catNombre = $cat ? $cat['nombre'] : 'Categoría';
    $stmt = $pdo->prepare('SELECT nombre,apellidos,numero,fecha_nac FROM jugadores WHERE equipo_categoria_id=? AND activo=1 ORDER BY numero');
    $stmt->execute([$ecId]);
    $jgs = $stmt->fetchAll();
    $scriptName = str_replace('\\', '/', (string)($_SERVER['SCRIPT_NAME'] ?? ''));
    $appBaseUrl = preg_replace('#/php-api/public/index\.php$#', '', $scriptName);
    if ($appBaseUrl === null || $appBaseUrl === '') $appBaseUrl = '';

    $teamLogo = trim((string)($team['escudo_url'] ?? ''));
    if ($teamLogo !== '' && !preg_match('#^(https?:)?//#i', $teamLogo) && strpos($teamLogo, $appBaseUrl . '/') !== 0) {
        if (str_starts_with($teamLogo, '/')) $teamLogo = $appBaseUrl . $teamLogo;
        else $teamLogo = $appBaseUrl . '/' . ltrim($teamLogo, '/');
    }

    header('Content-Type: text/html; charset=utf-8');
    $tn = htmlspecialchars($team['nombre']); $cn = htmlspecialchars($catNombre);
    echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cédula '.$tn.' - '.$cn.'</title>';
    echo '<style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}';
    echo 'th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#1a1a2e;color:#fff}';
    echo 'h1{color:#1a1a2e}.firma-td{height:40px}.team-header{display:flex;align-items:center;gap:14px;margin-bottom:10px}.team-logo{width:80px;height:80px;object-fit:contain;border:1px solid #ccc;border-radius:6px;padding:4px;background:#fff}@media print{.no-print{display:none}}</style></head><body>';
    if ($teamLogo !== '') echo '<div class="team-header"><img class="team-logo" src="'.htmlspecialchars($teamLogo, ENT_QUOTES, 'UTF-8').'" alt="Escudo de equipo"><div>';
    echo '<h1>'.$tn.'</h1><h2>Categoría: '.$cn.'</h2>';
    if ($teamLogo !== '') echo '</div></div>';
    if ($team['entrenador']) echo '<p>Entrenador: '.htmlspecialchars($team['entrenador']).'</p>';
    echo '<p>Temporada 2025-2026 &nbsp;|&nbsp; Jugadores: '.count($jgs).'</p>';
    echo '<table><thead><tr><th>#</th><th>Nombre</th><th>Apellidos</th><th>Fecha Nac.</th><th>Firma</th></tr></thead><tbody>';
    foreach ($jgs as $j) {
        echo '<tr><td>'.(int)$j['numero'].'</td><td>'.htmlspecialchars($j['nombre']).'</td>';
        echo '<td>'.htmlspecialchars($j['apellidos']).'</td>';
        echo '<td>'.htmlspecialchars($j['fecha_nac'] ?? '-').'</td><td class="firma-td"></td></tr>';
    }
    echo '</tbody></table><p style="margin-top:30px">Firma técnico: ______________________</p>';
    echo '<button onclick="window.print()" class="no-print" style="margin-top:20px;padding:10px 20px;background:#1a1a2e;color:#fff;border:none;border-radius:5px;cursor:pointer">Imprimir / Guardar PDF</button>';
    echo '</body></html>';
    exit;

// ── Árbitros: listar (público) ────────────────────────────────────────────────
case $uri === '/api/arbitros' && $meth === 'GET':
    json_out($pdo->query('SELECT id,nombre,apellidos FROM arbitros ORDER BY apellidos,nombre')->fetchAll());

// ── Árbitros: crear (super) ────────────────────────────────────────────────────
case $uri === '/api/arbitros' && $meth === 'POST':
    $actor = super_check();
    need($input, ['nombre','apellidos']);
    $pdo->prepare('INSERT INTO arbitros (nombre,apellidos) VALUES (?,?)')->execute([trim($input['nombre']),trim($input['apellidos'])]);
    audit_log($pdo, $actor, 'ARBITRO_CREAR', 'Creó árbitro "' . trim($input['nombre']) . ' ' . trim($input['apellidos']) . '"');
    json_out(['id'=>(int)$pdo->lastInsertId(),'nombre'=>trim($input['nombre']),'apellidos'=>trim($input['apellidos'])], 201);

// ── Árbitros: actualizar (super) ───────────────────────────────────────────────
case preg_match('#^/api/arbitros/(\d+)$#', $uri, $m) && $meth === 'PUT':
    $actor = super_check();
    $id = (int)$m[1];
    need($input, ['nombre','apellidos']);
    $pdo->prepare('UPDATE arbitros SET nombre=?,apellidos=? WHERE id=?')->execute([trim($input['nombre']),trim($input['apellidos']),$id]);
    audit_log($pdo, $actor, 'ARBITRO_EDITAR', 'Actualizó árbitro id ' . $id);
    json_out(['updated'=>true]);

// ── Árbitros: eliminar (super) ─────────────────────────────────────────────────
case preg_match('#^/api/arbitros/(\d+)$#', $uri, $m) && $meth === 'DELETE':
    $actor = super_check();
    $id = (int)$m[1];
    $pdo->prepare('DELETE FROM arbitros WHERE id=?')->execute([$id]);
    audit_log($pdo, $actor, 'ARBITRO_ELIMINAR', 'Eliminó árbitro id ' . $id);
    json_out(['deleted'=>true]);

// ── Estadísticas: dashboard (público) ───────────────────────────────────────────
case $uri === '/api/stats/dashboard' && $meth === 'GET':
    $stEquipos = $pdo->query('SELECT COUNT(*) as total FROM equipos')->fetch();
    $stCategorias = $pdo->query('SELECT COUNT(*) as total FROM categorias')->fetch();
    $stGoles = $pdo->query('SELECT COALESCE(SUM(goles_local + goles_visita), 0) as total FROM partidos WHERE estado = "jugado" AND goles_local IS NOT NULL AND goles_visita IS NOT NULL')->fetch();
    
    json_out([
        'totalEquipos' => (int)$stEquipos['total'],
        'totalCategorias' => (int)$stCategorias['total'],
        'totalGoles' => (int)$stGoles['total']
    ]);

default:
    json_out(['message' => 'Ruta no encontrada'], 404);
}
