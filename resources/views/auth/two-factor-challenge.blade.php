@extends('layouts.auth')
@section('content')
<div class="auth-card">
    <div class="logo">
        <h1>Two-Factor Authentication</h1>
        <p>Enter the code from your authenticator app</p>
    </div>

    @if ($errors->any())
    <ul class="error-list">
        @foreach ($errors->all() as $error)
        <li>⚠ {{ $error }}</li>
        @endforeach
    </ul>
    @endif

    <div id="code-form">
        <form method="POST" action="{{ url('/two-factor-challenge') }}">
            @csrf
            <div class="form-group">
                <label for="code">Authentication Code</label>
                <input type="text" id="code" name="code" inputmode="numeric" autocomplete="one-time-code" placeholder="000000" required autofocus style="text-align:center;font-size:24px;letter-spacing:8px;">
            </div>
            <button type="submit" class="btn-primary">Verify</button>
        </form>
    </div>

    <div style="text-align:center;margin-top:20px;">
        <button onclick="toggleRecovery()" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:13px;font-family:inherit;">
            Use a recovery code instead
        </button>
    </div>

    <div id="recovery-form" style="display:none;">
        <form method="POST" action="{{ url('/two-factor-challenge') }}">
            @csrf
            <div class="form-group">
                <label for="recovery_code">Recovery Code</label>
                <input type="text" id="recovery_code" name="recovery_code" placeholder="Enter recovery code" required>
            </div>
            <button type="submit" class="btn-primary">Verify</button>
        </form>
    </div>
</div>
<script>
function toggleRecovery() {
    const code = document.getElementById('code-form');
    const recovery = document.getElementById('recovery-form');
    if (code.style.display === 'none') { code.style.display='block'; recovery.style.display='none'; }
    else { code.style.display='none'; recovery.style.display='block'; }
}
</script>
@endsection
