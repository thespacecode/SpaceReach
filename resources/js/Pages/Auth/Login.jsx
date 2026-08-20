import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { 
    Eye, EyeOff, Building2, Lock, Mail, ArrowRight, ShieldCheck, 
    Sparkles, Loader2, Globe, Zap, Cpu, CheckCircle2
} from 'lucide-react';

const FLOATING_CIRCLES = [
    { id: 1, pos: 'top-[12%] left-[10%]', size: 'w-11 h-11', icon: Sparkles, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', speedX: 0.05, speedY: 0.05 },
    { id: 2, pos: 'top-[18%] right-[12%]', size: 'w-12 h-12', icon: ShieldCheck, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30', speedX: -0.07, speedY: 0.06 },
    { id: 3, pos: 'bottom-[22%] left-[8%]', size: 'w-10 h-10', icon: Globe, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30', speedX: 0.08, speedY: -0.05 },
    { id: 4, pos: 'bottom-[18%] right-[10%]', size: 'w-11 h-11', icon: Zap, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', speedX: -0.06, speedY: -0.07 },
    { id: 5, pos: 'top-[45%] left-[5%]', size: 'w-9 h-9', icon: Building2, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30', speedX: 0.04, speedY: -0.08 },
    { id: 6, pos: 'top-[50%] right-[6%]', size: 'w-10 h-10', icon: Cpu, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30', speedX: -0.09, speedY: 0.04 },
    { id: 7, pos: 'top-[8%] left-[45%]', size: 'w-8 h-8', icon: CheckCircle2, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', speedX: 0.03, speedY: 0.07 },
];

export default function Login({ status }) {
    const { props } = usePage();
    const settings = props.settings || {};
    const companyName = settings.company_name || 'SpaceReach';
    const logoUrl = settings.logo || null;

    const [showPassword, setShowPassword] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const handleMouseMove = (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        setMousePos({
            x: e.clientX - centerX,
            y: e.clientY - centerY,
        });
    };

    return (
        <>
            <Head title={`Sign In — ${companyName}`} />

            <div 
                onMouseMove={handleMouseMove}
                className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 font-sans text-foreground antialiased relative overflow-hidden select-none"
            >
                {/* Small Floating Circular Interactive Badges */}
                {FLOATING_CIRCLES.map((item) => {
                    const Icon = item.icon;
                    const offsetX = mousePos.x * item.speedX;
                    const offsetY = mousePos.y * item.speedY;
                    return (
                        <div
                            key={item.id}
                            style={{
                                transform: `translate3d(${offsetX}px, ${offsetY}px, 0px)`,
                            }}
                            className={`absolute ${item.pos} ${item.size} ${item.color} rounded-full border backdrop-blur-xs flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out shadow-xs z-0 hidden md:flex`}
                        >
                            <Icon className="w-1/2 h-1/2" />
                        </div>
                    );
                })}

                {/* Main Centered Login Card Container (Increased Height & Spacious Padding) */}
                <div className="w-full max-w-lg min-h-[580px] bg-card/95 backdrop-blur-md rounded-3xl p-10 sm:p-14 flex flex-col justify-between space-y-8 relative z-10 transition-all">
                    {/* Header & Logo */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-1">
                            {logoUrl ? (
                                <img src={logoUrl} alt={companyName} className="w-8 h-8 object-contain rounded-lg" />
                            ) : (
                                <Building2 className="w-7 h-7" />
                            )}
                        </div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium">
                            Sign in to access your <span className="font-bold text-foreground">{companyName}</span> workspace
                        </p>
                    </div>

                    {/* Status / Flash Alert */}
                    {status && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Validation Errors */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold space-y-1">
                            {Object.values(errors).map((err, idx) => (
                                <p key={idx}>• {err}</p>
                            ))}
                        </div>
                    )}

                    {/* Credentials Form (Increased Input & Button Height) */}
                    <form onSubmit={submit} className="space-y-5">
                        {/* Email Address */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative flex items-center">
                                <Mail className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full h-12 pl-10 pr-4 text-sm bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative flex items-center">
                                <Lock className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="w-full h-12 pl-10 pr-11 text-sm bg-muted/40 hover:bg-muted/70 focus:bg-background border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
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
                            className="w-full h-12 font-extrabold text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer transition-all gap-2 mt-2"
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

                    {/* Footer copyright */}
                    <div className="pt-2 text-center text-xs text-muted-foreground/70 font-medium flex flex-wrap items-center justify-center gap-1">
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
            </div>
        </>
    );
}
