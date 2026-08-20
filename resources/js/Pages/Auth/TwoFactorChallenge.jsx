import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function TwoFactorChallenge() {
    const [useRecovery, setUseRecovery] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/two-factor-challenge');
    };

    return (
        <>
            <Head title="Two-Factor Authentication" />
            <div className="min-h-screen flex items-center justify-center bg-white relative">


                <Card className="w-full max-w-[420px] mx-4 relative z-10 border-border bg-white shadow-none">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-lg bg-[#EBF212] flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-black" />
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold">Two-Factor Authentication</CardTitle>
                        <CardDescription>
                            {useRecovery ? 'Enter one of your recovery codes' : 'Enter the code from your authenticator app'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-red-600">
                                {Object.values(errors).map((error, i) => <p key={i}>⚠ {error}</p>)}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {!useRecovery ? (
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-xs uppercase tracking-wider text-muted-foreground">Authentication Code</Label>
                                    <Input id="code" type="text" inputMode="numeric" autoComplete="one-time-code"
                                        placeholder="000000" className="text-center text-2xl tracking-[0.5em] font-mono h-14 bg-muted/30 border-border/50"
                                        value={data.code} onChange={e => setData('code', e.target.value)} autoFocus required />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="recovery_code" className="text-xs uppercase tracking-wider text-muted-foreground">Recovery Code</Label>
                                    <Input id="recovery_code" type="text" placeholder="Enter recovery code"
                                        className="bg-muted/30 border-border/50 h-11"
                                        value={data.recovery_code} onChange={e => setData('recovery_code', e.target.value)} autoFocus required />
                                </div>
                            )}

                            <Button type="submit" className="w-full h-11" disabled={processing}>
                                {processing ? 'Verifying...' : 'Verify'}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <button type="button" onClick={() => setUseRecovery(!useRecovery)}
                                className="text-sm text-[#860DFF] hover:underline cursor-pointer">
                                {useRecovery ? 'Use authenticator code' : 'Use a recovery code instead'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
