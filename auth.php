<?php
session_start();

// Simple user storage (in production, use a database)
$users = [
    'admin@test.com' => [
        'password' => password_hash('password123', PASSWORD_DEFAULT),
        'name' => 'Admin User'
    ],
    'user@test.com' => [
        'password' => password_hash('password123', PASSWORD_DEFAULT),
        'name' => 'Test User'
    ]
];

function handleLogin() {
    global $users;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return false;
    }
    
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        $_SESSION['error'] = 'Email and password are required';
        return false;
    }
    
    if (!isset($users[$email])) {
        $_SESSION['error'] = 'Invalid email or password';
        return false;
    }
    
    if (!password_verify($password, $users[$email]['password'])) {
        $_SESSION['error'] = 'Invalid email or password';
        return false;
    }
    
    // Login successful
    $_SESSION['user'] = [
        'email' => $email,
        'name' => $users[$email]['name']
    ];
    $_SESSION['success'] = 'Login successful!';
    
    return true;
}

function handleSignup() {
    global $users;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return false;
    }
    
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($name) || empty($email) || empty($password)) {
        $_SESSION['error'] = 'All fields are required';
        return false;
    }
    
    if (isset($users[$email])) {
        $_SESSION['error'] = 'Email already exists';
        return false;
    }
    
    if (strlen($password) < 6) {
        $_SESSION['error'] = 'Password must be at least 6 characters';
        return false;
    }
    
    // In production, save to database
    $users[$email] = [
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'name' => $name
    ];
    
    // Auto login after signup
    $_SESSION['user'] = [
        'email' => $email,
        'name' => $name
    ];
    $_SESSION['success'] = 'Account created successfully!';
    
    return true;
}

function isLoggedIn() {
    return isset($_SESSION['user']);
}

function requireAuth() {
    if (!isLoggedIn()) {
        header('Location: /login');
        exit;
    }
}

function logout() {
    session_destroy();
    header('Location: /');
    exit;
}

// Handle logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    logout();
}
?>