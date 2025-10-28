<?php
require_once 'auth.php';

// Get the request URI and remove query string
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestUri = trim($requestUri, '/');

// Handle logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    logout();
}

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($requestUri === 'login') {
        if (handleLogin()) {
            header('Location: /dashboard');
            exit;
        }
    } elseif ($requestUri === 'signup') {
        if (handleSignup()) {
            header('Location: /dashboard');
            exit;
        }
    }
}

// Route mapping
switch ($requestUri) {
    case '':
    case 'landing':
        $template = 'pages/landing.html.twig';
        break;
    case 'auth/login':
    case 'login':
        if (isLoggedIn()) {
            header('Location: /dashboard');
            exit;
        }
        $template = 'auth/login.html.twig';
        break;
    case 'auth/signup':
    case 'signup':
        if (isLoggedIn()) {
            header('Location: /dashboard');
            exit;
        }
        $template = 'auth/signup.html.twig';
        break;
    case 'dashboard':
        requireAuth();
        $template = 'pages/dashboard.html.twig';
        break;
    case 'tickets':
        requireAuth();
        $template = 'pages/tickets.html.twig';
        break;
    default:
        $template = 'pages/landing.html.twig';
        break;
}

// Prepare template variables
$templateVars = [
    'current_page' => $requestUri,
    'user' => $_SESSION['user'] ?? null,
    'error' => $_SESSION['error'] ?? null,
    'success' => $_SESSION['success'] ?? null
];

// Clear flash messages
unset($_SESSION['error'], $_SESSION['success']);

echo $twig->render($template, $templateVars);