<?php
// Debug script to test CSS loading
echo "<!DOCTYPE html>
<html>
<head>
    <title>CSS Debug Test</title>
    <link rel='stylesheet' href='/assets/css/index.css'>
    <style>
        .debug-test { 
            background: red; 
            color: white; 
            padding: 20px; 
            margin: 20px;
        }
    </style>
</head>
<body>
    <div class='debug-test'>
        <h1>CSS Debug Test</h1>
        <p>If this has red background, inline CSS works</p>
    </div>
    
    <div class='bg-[#9B8AFB] text-white p-4 m-4'>
        <h2>Tailwind Test</h2>
        <p>If this has purple background, Tailwind CSS is working</p>
    </div>
    
    <div class='bg-white border border-gray-200 p-4 m-4'>
        <h3>Border Test</h3>
        <p>This should have a gray border</p>
    </div>
    
    <script>
        console.log('CSS file path: /assets/css/index.css');
        console.log('Current URL:', window.location.href);
        
        // Test if CSS file loads
        fetch('/assets/css/index.css')
            .then(response => {
                console.log('CSS Response Status:', response.status);
                return response.text();
            })
            .then(css => {
                console.log('CSS Content Length:', css.length);
                console.log('CSS starts with:', css.substring(0, 100));
            })
            .catch(error => {
                console.error('CSS Load Error:', error);
            });
    </script>
</body>
</html>";
?>