import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { 
    CheckCircle2, AlertTriangle, XCircle, Server, Database, 
    ShieldCheck, Sparkles, ArrowRight, ChevronRight, RefreshCw, 
    Zap, Boxes, UserCheck, Globe, Lock, Terminal, Cpu, Check, Layers
} from 'lucide-react';

export default function InstallWizard({ requirements, permissions, defaultAppUrl }) {
    const [currentStep, setCurrentStep] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        app_name: 'SpaceReach',
        app_url: defaultAppUrl || 'http://localhost:8000',
        app_env: 'production',
        app_debug: false,
        db_driver: 'mysql',
        db_host: '127.0.0.1',
        db_port: '3306',
        db_database: 'spacereach',
        db_username: 'root',
        db_password: '',
        data_option: 'blank', // 'blank' or 'demo'
        admin_name: 'Super Admin',
        admin_email: 'admin@spacereach.com',
        admin_password: '',
        admin_password_confirmation: '',
    });

    // DB Test state
    const [dbTesting, setDbTesting] = useState(false);
    const [dbTestResult, setDbTestResult] = useState(null);

    // Processing state
    const [installing, setInstalling] = useState(false);
    const [installError, setInstallError] = useState(null);
    const [installSuccess, setInstallSuccess] = useState(false);

    const steps = [
        { id: 1, title: 'System Requirements', icon: Cpu },
        { id: 2, title: 'Environment Setup', icon: Globe },
        { id: 3, title: 'Database Connection', icon: Database },
        { id: 4, title: 'Application Mode', icon: Layers },
        { id: 5, title: 'Admin Account', icon: UserCheck },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Check if requirements pass
    const allRequirementsPass = Object.values(requirements || {}).every(r => r.supported) &&
                                Object.values(permissions || {}).every(p => p.writable);

    // Handle DB connection test
    const handleTestDatabase = async () => {
        setDbTesting(true);
        setDbTestResult(null);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/install/test-db', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    db_driver: formData.db_driver,
                    db_host: formData.db_host,
                    db_port: formData.db_port,
                    db_database: formData.db_database,
                    db_username: formData.db_username,
                    db_password: formData.db_password,
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setDbTestResult({ success: true, message: data.message });
            } else {
                setDbTestResult({ success: false, message: data.message || 'Connection failed' });
            }
        } catch (err) {
            setDbTestResult({ success: false, message: err.message || 'Network error while testing connection.' });
        } finally {
            setDbTesting(false);
        }
    };

    // Submit full installer process
    const handleInstallSubmit = async (e) => {
        if (e) e.preventDefault();

        if (formData.admin_password !== formData.admin_password_confirmation) {
            setInstallError('Admin passwords do not match!');
            return;
        }

        if (formData.admin_password.length < 8) {
            setInstallError('Password must be at least 8 characters long.');
            return;
        }

        setInstalling(true);
        setInstallError(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/install/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setInstallSuccess(true);
            } else {
                setInstallError(data.message || 'Installation failed. Please review input parameters.');
            }
        } catch (err) {
            setInstallError('System error during installation: ' + err.message);
        } finally {
            setInstalling(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col justify-center items-center p-4 md:p-8 font-sans selection:bg-blue-600 selection:text-white">
            <Head title="SpaceReach Portal Setup Wizard" />

            {/* Background Aesthetic Orbs */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-4xl bg-[#0F172A]/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
                
                {/* Header */}
                <div className="px-6 py-6 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                SpaceReach <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Portal Installer</span>
                            </h1>
                            <p className="text-xs text-slate-400">Automated Server Setup & Database Configuration</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        <span>PHP {requirements?.php_version?.current || '8.2+'}</span>
                    </div>
                </div>

                {/* Progress Step Bar */}
                <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800/80">
                    <div className="grid grid-cols-5 gap-2">
                        {steps.map((s) => {
                            const Icon = s.icon;
                            const isActive = currentStep === s.id;
                            const isCompleted = currentStep > s.id || installSuccess;
                            return (
                                <div 
                                    key={s.id}
                                    onClick={() => isCompleted && !installing && setCurrentStep(s.id)}
                                    className={`flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl transition-all ${
                                        isCompleted ? 'cursor-pointer hover:bg-slate-800/50' : ''
                                    } ${isActive ? 'bg-blue-600/15 border border-blue-500/30' : ''}`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                                        isCompleted 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                            : isActive 
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}>
                                        {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                                    </div>
                                    <span className={`text-xs font-medium truncate hidden sm:block ${
                                        isActive ? 'text-blue-400 font-semibold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                                    }`}>
                                        {s.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 md:p-8 flex-1">
                    {installSuccess ? (
                        /* SUCCESS SCREEN */
                        <div className="py-12 flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 animate-bounce">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-2 max-w-md">
                                <h2 className="text-2xl font-bold text-white">Installation Successful!</h2>
                                <p className="text-sm text-slate-300">
                                    SpaceReach portal has been fully configured and initialized. You can now login with your Super Admin credentials.
                                </p>
                            </div>

                            <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-800">
                                    <span className="text-slate-400">Portal URL:</span>
                                    <span className="text-blue-400 font-mono">{formData.app_url}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800">
                                    <span className="text-slate-400">Admin Email:</span>
                                    <span className="text-slate-200 font-mono">{formData.admin_email}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-400">Installed Mode:</span>
                                    <span className="text-emerald-400 font-semibold uppercase">{formData.data_option} Mode</span>
                                </div>
                            </div>

                            <a
                                href="/login"
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                            >
                                Launch Portal & Login <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* STEP 1: SYSTEM REQUIREMENTS */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Cpu className="w-5 h-5 text-blue-400" /> System Compatibility & Permissions Check
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Verifying your web server environment before proceeding with installation.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* PHP Extensions */}
                                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                                            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">PHP Extensions</h3>
                                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                                {Object.entries(requirements || {}).map(([key, req]) => (
                                                    <div key={key} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-800/50 last:border-0">
                                                        <span className="text-slate-300">{req.name}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                                                            req.supported ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                            {req.supported ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                            {req.current}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Directory Permissions */}
                                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                                            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Directory Write Permissions</h3>
                                            <div className="space-y-2">
                                                {Object.entries(permissions || {}).map(([key, perm]) => (
                                                    <div key={key} className="flex justify-between items-center text-xs py-2 border-b border-slate-800/50 last:border-0">
                                                        <div>
                                                            <span className="text-slate-200 font-mono">{perm.name}</span>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                                                            perm.writable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                            {perm.writable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                            {perm.writable ? 'Writable' : 'Not Writable'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {!allRequirementsPass && (
                                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-xs text-red-300 mt-4">
                                                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                                                    <span>Some requirements or directory permissions are missing. Please fix server settings before proceeding.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: ENVIRONMENT CONFIG */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Globe className="w-5 h-5 text-blue-400" /> Application Environment Setup
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Configure general portal settings and deployment URL.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-300">Application Name</label>
                                            <input 
                                                type="text" 
                                                name="app_name"
                                                value={formData.app_name}
                                                onChange={handleChange}
                                                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                placeholder="SpaceReach Portal"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-300">Application URL</label>
                                            <input 
                                                type="url" 
                                                name="app_url"
                                                value={formData.app_url}
                                                onChange={handleChange}
                                                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                placeholder="http://domain.com"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-300">Environment</label>
                                            <select 
                                                name="app_env"
                                                value={formData.app_env}
                                                onChange={handleChange}
                                                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                                            >
                                                <option value="production">Production (Recommended)</option>
                                                <option value="local">Local Development</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5 flex flex-col justify-end">
                                            <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-800 bg-slate-900/50">
                                                <input 
                                                    type="checkbox"
                                                    name="app_debug"
                                                    checked={formData.app_debug}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                                                />
                                                <span className="text-xs text-slate-300 font-medium">Enable Debug Mode (APP_DEBUG)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: DATABASE SETUP */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Database className="w-5 h-5 text-blue-400" /> Database Connection Parameters
                                            </h2>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Provide connection details for MySQL, PostgreSQL, or SQLite.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleTestDatabase}
                                            disabled={dbTesting}
                                            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-blue-400 font-medium hover:bg-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${dbTesting ? 'animate-spin' : ''}`} />
                                            {dbTesting ? 'Testing...' : 'Test Connection'}
                                        </button>
                                    </div>

                                    {/* DB Test Result Banner */}
                                    {dbTestResult && (
                                        <div className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
                                            dbTestResult.success 
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                                        }`}>
                                            {dbTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                                            <span>{dbTestResult.message}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5 md:col-span-3">
                                            <label className="text-xs font-medium text-slate-300">Database Driver</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['mysql', 'pgsql', 'sqlite'].map(driver => (
                                                    <label 
                                                        key={driver}
                                                        className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                                                            formData.db_driver === driver 
                                                                ? 'bg-blue-600/20 border-blue-500 text-white font-semibold' 
                                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                                        }`}
                                                    >
                                                        <input 
                                                            type="radio" 
                                                            name="db_driver" 
                                                            value={driver} 
                                                            checked={formData.db_driver === driver} 
                                                            onChange={handleChange}
                                                            className="sr-only"
                                                        />
                                                        <span className="text-xs uppercase tracking-wider">{driver === 'mysql' ? 'MySQL / MariaDB' : driver === 'pgsql' ? 'PostgreSQL' : 'SQLite'}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.db_driver !== 'sqlite' ? (
                                            <>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-300">Host</label>
                                                    <input 
                                                        type="text" 
                                                        name="db_host"
                                                        value={formData.db_host}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-300">Port</label>
                                                    <input 
                                                        type="text" 
                                                        name="db_port"
                                                        value={formData.db_port}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-300">Database Name</label>
                                                    <input 
                                                        type="text" 
                                                        name="db_database"
                                                        value={formData.db_database}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-medium text-slate-300">Username</label>
                                                    <input 
                                                        type="text" 
                                                        name="db_username"
                                                        value={formData.db_username}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                    />
                                                </div>

                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-xs font-medium text-slate-300">Password</label>
                                                    <input 
                                                        type="password" 
                                                        name="db_password"
                                                        value={formData.db_password}
                                                        onChange={handleChange}
                                                        placeholder="Database password"
                                                        className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="space-y-1.5 md:col-span-3">
                                                <label className="text-xs font-medium text-slate-300">SQLite Database Path</label>
                                                <input 
                                                    type="text" 
                                                    name="db_database"
                                                    value={formData.db_database}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: APPLICATION MODE (BLANK vs DEMO) */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Layers className="w-5 h-5 text-blue-400" /> Select Application Mode
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Do you wish to install a clean blank application or populate initial demo data?
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Blank Application Card */}
                                        <div 
                                            onClick={() => setFormData(p => ({ ...p, data_option: 'blank' }))}
                                            className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                                                formData.data_option === 'blank' 
                                                    ? 'bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/40 shadow-xl' 
                                                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                    <Zap className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                        Blank Application <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Production Ready</span>
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                        Starts with a clean slate application containing default roles, permissions, sales pipeline stages, leave types, and your super admin user.
                                                    </p>
                                                </div>
                                            </div>

                                            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                                                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-400" /> Clean production environment</li>
                                                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-400" /> Default RBAC & security policies</li>
                                                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-400" /> Fast installation setup</li>
                                            </ul>
                                        </div>

                                        {/* Demo Dataset Card */}
                                        <div 
                                            onClick={() => setFormData(p => ({ ...p, data_option: 'demo' }))}
                                            className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                                                formData.data_option === 'demo' 
                                                    ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl' 
                                                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                    <Boxes className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                        Demo Application <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">Sample Dataset</span>
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                        Pre-populates full demonstration records including 500 contacts, deals, invoices, lead acquisition engine records, and chatbot knowledge base.
                                                    </p>
                                                </div>
                                            </div>

                                            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                                                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> 500+ Sample CRM contacts & deals</li>
                                                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Invoicing & payments demonstration</li>
                                                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-400" /> Pre-configured chatbot & analytics</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 5: ADMIN ACCOUNT */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <UserCheck className="w-5 h-5 text-blue-400" /> Super Admin Account Credentials
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Create the primary administrator account used to access the portal dashboard.
                                        </p>
                                    </div>

                                    {installError && (
                                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            <span>{installError}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-xs font-medium text-slate-300">Administrator Name</label>
                                            <input 
                                                type="text" 
                                                name="admin_name"
                                                value={formData.admin_name}
                                                onChange={handleChange}
                                                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                placeholder="Super Admin"
                                            />
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-xs font-medium text-slate-300">Administrator Email</label>
                                            <input 
                                                type="email" 
                                                name="admin_email"
                                                value={formData.admin_email}
                                                onChange={handleChange}
                                                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                placeholder="admin@spacereach.com"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-300">Password</label>
                                            <input 
                                                type="password" 
                                                name="admin_password"
                                                value={formData.admin_password}
                                                onChange={handleChange}
                                                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                                            <input 
                                                type="password" 
                                                name="admin_password_confirmation"
                                                value={formData.admin_password_confirmation}
                                                onChange={handleChange}
                                                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" 
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer Navigation Buttons */}
                            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(p => Math.max(1, p - 1))}
                                    disabled={currentStep === 1 || installing}
                                    className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all"
                                >
                                    Previous Step
                                </button>

                                {currentStep < 5 ? (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(p => Math.min(5, p + 1))}
                                        disabled={currentStep === 1 && !allRequirementsPass}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-40"
                                    >
                                        Next Step <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleInstallSubmit}
                                        disabled={installing}
                                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {installing ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Installing Portal & Executing Migrations...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Complete Setup & Launch Portal
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
