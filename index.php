<?php
// Handle static file requests
if (preg_match('/\.(?:png|jpg|jpeg|gif|css|js|ico|svg)$/', $_SERVER["REQUEST_URI"])) {
    $file = __DIR__ . '/public' . $_SERVER["REQUEST_URI"];
    if (file_exists($file)) {
        $mime_types = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon'
        ];
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        $mime = $mime_types[$ext] ?? 'application/octet-stream';
        header('Content-Type: ' . $mime);
        readfile($file);
        exit;
    } else {
        http_response_code(404);
        exit;
    }
}

require_once __DIR__ . '/vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/templates');
$twig = new \Twig\Environment($loader, [
    'cache' => false,
]);

// Include router logic
include 'router.php';
