<?php
/**
 * setup.php — Crea el primer superadministrador.
 * Accede UNA SOLA VEZ: http://localhost/v1_LDF/php-api/public/setup.php
 * Borra o renombra este archivo después de usarlo.
 */

$cfg = require __DIR__ . '/config.php';
$dsn = "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset={$cfg['db_charset']}";

try {
    $pdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Throwable $e) {
    die('<p style="color:red">Error de conexión: ' . htmlspecialchars($e->getMessage()) . '</p>');
}

// ── Asegurarse de que las columnas extra existen en jugadores ─────────────────
$cols = $pdo->query("SHOW COLUMNS FROM jugadores")->fetchAll(PDO::FETCH_COLUMN);
if (!in_array('fecha_nac', $cols)) {
    $pdo->exec("ALTER TABLE jugadores ADD COLUMN fecha_nac DATE NULL AFTER apellidos");
    echo '<p>✔ Columna <strong>fecha_nac</strong> añadida a jugadores.</p>';
}
if (!in_array('foto_url', $cols)) {
    $pdo->exec("ALTER TABLE jugadores ADD COLUMN foto_url VARCHAR(255) NULL AFTER fecha_nac");
    echo '<p>✔ Columna <strong>foto_url</strong> añadida a jugadores.</p>';
}

// ── Formulario ────────────────────────────────────────────────────────────────
$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre   = trim($_POST['nombre']   ?? '');
    $email    = trim($_POST['email']    ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!$nombre || !$email || !$password) {
        $msg = '<p style="color:red">Todos los campos son obligatorios.</p>';
    } else {
        $check = $pdo->prepare('SELECT id FROM admins WHERE email=? LIMIT 1');
        $check->execute([$email]);
        if ($check->fetch()) {
            $msg = '<p style="color:orange">Ya existe un admin con ese email.</p>';
        } else {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $pdo->prepare('INSERT INTO admins (nombre,email,password_hash,rol) VALUES (?,?,?,?)')
                ->execute([$nombre, $email, $hash, 'super']);
            $msg = '<p style="color:green;font-weight:bold">✔ Superadmin creado correctamente.</p>'
                 . '<p>Ya puedes <a href="../../frontend/admin.html">ir al panel</a>.</p>'
                 . '<p style="color:red"><strong>Borra o renombra este archivo de inmediato.</strong></p>';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Setup — Liga de las Estrellas</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 480px; margin: 60px auto; padding: 0 20px; }
    input { width: 100%; padding: 8px; margin: 6px 0 16px; box-sizing: border-box; }
    button { background: #1a1a2e; color: #fff; padding: 10px 24px; border: none; cursor: pointer; border-radius: 4px; }
  </style>
</head>
<body>
  <h2>Crear primer superadministrador</h2>
  <?= $msg ?>
  <form method="POST">
    <label>Nombre <input type="text" name="nombre" required></label>
    <label>Email  <input type="email" name="email" required></label>
    <label>Contraseña <input type="password" name="password" minlength="6" required></label>
    <button type="submit">Crear superadmin</button>
  </form>
</body>
</html>
