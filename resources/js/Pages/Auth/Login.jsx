import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Eye, EyeOff, Building2, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export default function Login({ status }) {
    const { props } = usePage();
    const settings = props.settings || {};
    const companyName = settings.company_name || 'AppLead';
    const logoUrl = settings.logo || null;

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title={`Sign In — ${companyName}`} />

            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 font-sans text-foreground antialiased relative overflow-hidden select-none">
                {/* Subtle Background Aesthetic Accents */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Main Centered Login Card Container */}
                <div className="w-full max-w-md bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative z-10 transition-all">
                    {/* Header & Logo */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-1 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                            {logoUrl ? (
                                <img src={logoUrl} alt={companyName} className="w-7 h-7 object-contain rounded-lg" />
                            ) : (
                                <Building2 className="w-6 h-6" />
                            )}
                        </div>
                        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">
                            Sign in to access your <span className="font-bold text-foreground">{companyName}</span> workspace
                        </p>
                    </div>

                    {/* Status / Flash Alert */}
                    {status && (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Validation Errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold space-y-1">
                            {Object.values(errors).map((err, idx) => (
                                <p key={idx}>• {err}</p>
                            ))}
                        </div>
                    )}

                    {/* Credentials Form */}
                    <form onSubmit={submit} className="space-y-4">
                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <Mail className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full h-10 pl-9 pr-3 text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-hidden font-medium"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <Lock className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="w-full h-10 pl-9 pr-10 text-xs bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-hidden font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-border text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span>Remember me</span>
                            </label>

                            <a
                                href="/forgot-password"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full h-10 font-extrabold text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition-all gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer copyright */}
                <div className="mt-6 text-center text-xs text-muted-foreground/70 font-medium flex flex-wrap items-center justify-center gap-1">
                    <span>© {new Date().getFullYear()} {companyName}. Built & Powered by</span>
                    <a 
                        href="https://thespacecode.com" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                    >
                        thespacecode.com
                    </a>
                    <span>. All rights reserved.</span>
                </div>
            </div>
        </>
    );
}
