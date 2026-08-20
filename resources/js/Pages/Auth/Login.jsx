import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Login({ status }) {
    const { props } = usePage();
    const settings = props.settings || {};
    const companyName = settings.company_name || 'SpaceReach';

    const [step, setStep] = useState(1); // 1: Email Step, 2: Password Step
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleContinueEmail = async (e) => {
        e.preventDefault();
        setEmailError('');
        clearErrors();

        if (!data.email || !data.email.includes('@')) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        setCheckingEmail(true);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({ email: data.email }),
            });

            const result = await res.json();

            if (res.ok && result.exists) {
                setStep(2);
            } else {
                setEmailError(result.message || 'No account found with this email address.');
            }
        } catch (err) {
            setEmailError('Unable to verify email address. Please try again.');
        } finally {
            setCheckingEmail(false);
        }
    };

    const submitLogin = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title={`Sign In — ${companyName}`} />

            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-4 sm:p-8 font-sans text-foreground antialiased select-none">
                {/* Main Centered Login Container */}
                <div className="w-full max-w-md p-6 sm:p-8 flex flex-col items-center justify-center space-y-6 transition-all">

                    {/* Status / Flash Alert */}
                    {status && (
                        <div className="w-full p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Validation Errors */}
                    {(emailError || Object.keys(errors).length > 0) && (
                        <div className="w-full p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold space-y-1">
                            {emailError && <p>• {emailError}</p>}
                            {Object.values(errors).map((err, idx) => (
                                <p key={idx}>• {err}</p>
                            ))}
                        </div>
                    )}

                    {/* STEP 1: EMAIL STEP */}
                    {step === 1 && (
                        <form onSubmit={handleContinueEmail} className="w-full space-y-5">
                            <div className="relative flex items-center">
                                <Mail className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={data.email}
                                    onChange={(e) => {
                                        setData('email', e.target.value);
                                        setEmailError('');
                                    }}
                                    required
                                    autoFocus
                                    className="w-full h-12 pl-10 pr-4 text-sm bg-transparent border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={checkingEmail}
                                className="w-full h-12 font-extrabold text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer transition-all gap-2 mt-2"
                            >
                                {checkingEmail ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Verifying Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Continue</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {/* STEP 2: PASSWORD STEP */}
                    {step === 2 && (
                        <form onSubmit={submitLogin} className="w-full space-y-5">
                            {/* Selected Email Display with Back Button */}
                            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-border/80 flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="text-xs font-bold text-foreground truncate">{data.email}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setEmailError('');
                                    }}
                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    <span>Change</span>
                                </button>
                            </div>

                            {/* Password Field */}
                            <div className="relative flex items-center">
                                <Lock className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full h-12 pl-10 pr-11 text-sm bg-transparent border border-border focus:border-indigo-600 rounded-xl text-foreground placeholder:text-muted-foreground transition-all outline-none font-medium"
                                />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
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
                    )}
                </div>
            </div>
        </>
    );
}
