<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Login' }} — {{ \App\Models\PortalSetting::get('company_name', 'AppLead') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: {{ \App\Models\PortalSetting::get('primary_color', '#6366F1') }};
            --secondary: {{ \App\Models\PortalSetting::get('secondary_color', '#8B5CF6') }};
            --accent: {{ \App\Models\PortalSetting::get('accent_color', '#EC4899') }};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #E2E8F0;
            overflow: hidden;
        }
        .auth-bg {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
        }
        .auth-bg .orb {
            position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3;
            animation: float 20s ease-in-out infinite;
        }
        .auth-bg .orb:nth-child(1) { width: 400px; height: 400px; background: var(--primary); top: -10%; left: -5%; animation-delay: 0s; }
        .auth-bg .orb:nth-child(2) { width: 300px; height: 300px; background: var(--accent); bottom: -10%; right: -5%; animation-delay: -5s; }
        .auth-bg .orb:nth-child(3) { width: 200px; height: 200px; background: var(--secondary); top: 50%; left: 50%; animation-delay: -10s; }
        @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -40px) scale(1.05); }
            66% { transform: translate(-20px, 30px) scale(0.95); }
        }
        .auth-card {
            position: relative; z-index: 1;
            width: 100%; max-width: 440px; padding: 48px;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(99, 102, 241, 0.15);
            border-radius: 24px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .auth-card .logo { text-align: center; margin-bottom: 32px; }
        .auth-card .logo h1 {
            font-size: 28px; font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .auth-card .logo p { color: #94A3B8; font-size: 14px; margin-top: 8px; }
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block; font-size: 13px; font-weight: 500;
            color: #94A3B8; margin-bottom: 8px; letter-spacing: 0.5px; text-transform: uppercase;
        }
        .form-group input {
            width: 100%; padding: 14px 16px; font-size: 15px;
            background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 12px; color: #E2E8F0; outline: none;
            transition: all 0.3s ease; font-family: inherit;
        }
        .form-group input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .form-group input::placeholder { color: #475569; }
        .btn-primary {
            width: 100%; padding: 14px; font-size: 15px; font-weight: 600;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border: none; border-radius: 12px; color: white; cursor: pointer;
            transition: all 0.3s ease; font-family: inherit;
            letter-spacing: 0.5px;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }
        .btn-primary:active { transform: translateY(0); }
        .error-list {
            background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; list-style: none;
        }
        .error-list li { color: #FCA5A5; font-size: 13px; margin: 4px 0; }
        .remember-forgot { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; font-size: 13px; }
        .remember-forgot label { display: flex; align-items: center; gap: 8px; color: #94A3B8; cursor: pointer; }
        .remember-forgot input[type="checkbox"] { accent-color: var(--primary); width: 16px; height: 16px; }
        .remember-forgot a { color: var(--primary); text-decoration: none; }
        .remember-forgot a:hover { text-decoration: underline; }
        .secure-badge {
            text-align: center; margin-top: 24px; font-size: 12px; color: #475569;
            display: flex; align-items: center; justify-content: center; gap: 6px;
        }
    </style>
</head>
<body>
    <div class="auth-bg">
        <div class="orb"></div>
        <div class="orb"></div>
        <div class="orb"></div>
    </div>
    @yield('content')
</body>
</html>
