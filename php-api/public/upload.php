<?php
/**
 * upload.php — Subida de imágenes (equipos, jugadores, noticias y eventos).
 * POST multipart/form-data
 *   file      : archivo de imagen
 *   tipo      : "team" | "player" | "news" | "event"
 *   teamSlug  : nombre del equipo (se convierte a slug para carpeta)
 *   catSlug   : nombre de categoría (solo para jugadores)
 * Guarda en /v1_LDF/img/{teamSlug}/  o  /v1_LDF/img/{teamSlug}/{catSlug}/
 * Devuelve  { url: "/v1_LDF/img/..." }
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$cfg = require __DIR__ . '/config.php';

// ── JWT inline (sin include) ──────────────────────────────────────────────────
function up_b64u(string $d): string { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }
function up_ub64(string $d): string { return base64_decode(strtr($d, '-_', '+/')); }
function up_jwt_read(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $b, $s] = $parts;
    if (!hash_equals(up_b64u(hash_hmac('sha256', "$h.$b", $secret, true)), $s)) return null;
    $p = json_decode(up_ub64($b), true);
    if (!$p || (int)($p['exp'] ?? 0) < time()) return null;
    return $p;
}
function up_fail(string $msg, int $code = 400): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['message' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
$allH = function_exists('getallheaders') ? getallheaders() : [];
$auth = $allH['Authorization'] ?? $allH['authorization'] ?? '';
$raw  = null;
if (preg_match('/^Bearer\s+(\S+)/i', $auth, $m)) { $raw = $m[1]; }
elseif (!empty($_GET['token']))                   { $raw = $_GET['token']; }
if (!$raw || !up_jwt_read($raw, $cfg['jwt_secret'])) {
    up_fail('Token requerido o inválido', 401);
}

// ── Validar archivo ───────────────────────────────────────────────────────────
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    up_fail('Archivo no recibido. Error: ' . ($_FILES['file']['error'] ?? 'ningún archivo'));
}

$allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($_FILES['file']['tmp_name']);
if (!in_array($mime, $allowedMimes)) {
    up_fail('Solo se permiten imágenes (jpg, png, gif, webp). Recibido: ' . $mime);
}

$ext = match($mime) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp',
    default      => 'jpg'
};

// ── Generar slug para carpeta ─────────────────────────────────────────────────
function to_slug(string $s): string {
    $s = mb_strtolower(trim($s), 'UTF-8');
    $map = ['á'=>'a','à'=>'a','â'=>'a','ä'=>'a','é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
            'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i','ó'=>'o','ò'=>'o','ô'=>'o','ö'=>'o',
            'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u','ñ'=>'n','ç'=>'c'];
    $s = strtr($s, $map);
    return preg_replace('/[^a-z0-9]+/', '_', $s);
}

$tipo     = $_POST['tipo']     ?? 'team';
$teamSlug = to_slug($_POST['teamSlug'] ?? 'equipo');
$catSlug  = to_slug($_POST['catSlug']  ?? '');

if (empty($teamSlug)) $teamSlug = 'equipo';

// ── Rutas ─────────────────────────────────────────────────────────────────────
// index.php está en: /xampp/htdocs/v1_LDF/php-api/public/
// img/ está en:      /xampp/htdocs/v1_LDF/img/
$baseDir = realpath(__DIR__ . '/../../') . DIRECTORY_SEPARATOR . 'img' . DIRECTORY_SEPARATOR;

// Detectar prefijo URL dinámicamente desde SCRIPT_NAME
$scriptDir = rtrim(dirname(dirname(dirname($_SERVER['SCRIPT_NAME']))), '/');
// $scriptDir = /v1_LDF  (o "" si está en la raíz)
$urlBase   = $scriptDir . '/img/';

if ($tipo === 'player' && $catSlug !== '') {
    $dir    = $baseDir . $teamSlug . DIRECTORY_SEPARATOR . $catSlug . DIRECTORY_SEPARATOR;
    $urlDir = $urlBase . $teamSlug . '/' . $catSlug . '/';
} else {
    $dir    = $baseDir . $teamSlug . DIRECTORY_SEPARATOR;
    $urlDir = $urlBase . $teamSlug . '/';
}

// Crear carpetas si no existen
if (!is_dir($dir)) {
    if (!mkdir($dir, 0755, true)) {
        up_fail('No se pudo crear el directorio: ' . $dir, 500);
    }
}

// Nombre de archivo según tipo
if ($tipo === 'team') {
    $prefix = 'escudo';
} elseif ($tipo === 'news') {
    $prefix = 'noticia_' . time() . '_' . mt_rand(100, 999);
} elseif ($tipo === 'event') {
    $prefix = 'evento_' . time() . '_' . mt_rand(100, 999);
} else {
    $prefix = 'foto_' . time() . '_' . mt_rand(100, 999);
}
$filename = $prefix . '.' . $ext;
$destPath = $dir . $filename;
$destUrl  = $urlDir . $filename;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $destPath)) {
    up_fail('Error al guardar el archivo en el servidor', 500);
}

http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['url' => $destUrl], JSON_UNESCAPED_UNICODE);
exit;
