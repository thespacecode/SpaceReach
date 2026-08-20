import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Forgot Password - TheSpaceCode" />
            <div className="min-h-screen w-full bg-[#FFFFFF] flex items-center justify-center p-4">
                {/* Logo */}
                <header className="fixed top-0 left-0 z-50" style={{ padding: '20px' }}>
                    <img src="/images/logo.jpg" alt="TheSpaceCode" className="h-6 w-auto" />
                </header>

                <div className="w-full max-w-md">
                    <div className="mb-6">
                        <a href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                        </a>
                    </div>

                    <div className="mb-5">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                            Reset your password
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-700 font-medium">
                            {status}
                        </div>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700 font-medium">
                            {Object.values(errors).map((err, idx) => (
                                <p key={idx}>⚠ {err}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-[#1E293B]">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    className="h-11 pl-10 rounded-lg bg-white border-border focus:border-black focus:ring-black text-xs"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-11 rounded-lg bg-[#EBF212] hover:brightness-95 text-black font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <span>Send Password Reset Link</span>
                            )}
                        </button>
                    </form>

                    <footer className="mt-8 text-center text-xs text-muted-foreground">
                        <p>2026 All Rights Reserved. Privacy and Terms.</p>
                    </footer>
                </div>
            </div>
        </>
    );
}
