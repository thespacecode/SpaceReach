@extends('layouts.auth')
@section('content')
<div class="auth-card">
    <div class="logo">
        <h1>{{ \App\Models\PortalSetting::get('company_name', 'TheSpaceCode') }}</h1>
        <p>{{ \App\Models\PortalSetting::get('company_tagline', 'Portal Login') }}</p>
    </div>

    @if ($errors->any())
    <ul class="error-list">
        @foreach ($errors->all() as $error)
        <li>⚠ {{ $error }}</li>
        @endforeach
    </ul>
    @endif

    @if (session('status'))
    <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:12px 16px;margin-bottom:20px;color:#6EE7B7;font-size:13px;">
        {{ session('status') }}
    </div>
    @endif

    <form method="POST" action="{{ route('login') }}">
        @csrf
        <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" placeholder="your@email.com" required autofocus>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="••••••••" required>
        </div>
        <div class="remember-forgot">
            <label><input type="checkbox" name="remember"> Remember me</label>
            <a href="{{ route('password.request') }}">Forgot password?</a>
        </div>
        <button type="submit" class="btn-primary">Sign In</button>
    </form>
    <div class="secure-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        Secured with 2FA · AES-256 Encryption
    </div>
</div>
@endsection
