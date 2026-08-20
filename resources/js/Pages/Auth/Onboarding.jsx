import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Check, ArrowRight, ArrowLeft, Building2, Target, Users, Sparkles, ShieldCheck, Zap 
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        orgName: 'AppLead Enterprise',
        role: 'Revenue Operations Leader',
        teamSize: '10-50 employees',
        leadTarget: '1,000+ ICP Leads / month',
        integrations: ['Salesforce', 'Stripe', 'Slack']
    });

    const nextStep = () => {
        if (step < 5) setStep(prev => prev + 1);
        else router.get('/dashboard');
    };

    const prevStep = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans">
            <Head title="Workspace Onboarding — AppLead" />

            <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col divide-y divide-border">
                {/* Top Progress Bar */}
                <div className="p-4 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-foreground text-background font-bold text-xs flex items-center justify-center">
                            A
                        </div>
                        <span className="font-bold text-xs text-foreground">AppLead Workspace Setup</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground font-semibold">
                        <span>Step {step} of 5</span>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="w-full bg-muted/40 h-1">
                    <div 
                        className="bg-foreground h-full transition-all duration-300"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>

                {/* Step Body */}
                <div className="p-6 md:p-8 space-y-5 flex-1 min-h-[340px]">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Welcome to AppLead OS</h2>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    Let's configure your high-density data intelligence workspace. This will customize your AI lead scoring, telemetry widgets, and pipeline triggers.
                                </p>
                            </div>

                            <div className="pt-2 space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-foreground block mb-1">Organization / Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.orgName}
                                        onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                                        className="w-full p-2.5 bg-background border border-border rounded-lg text-xs font-medium outline-hidden focus:ring-1 focus:ring-ring"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                                <Users className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Your Role & Organization Dynamics</h2>
                                <p className="text-xs text-muted-foreground mt-1">Select your primary role to optimize navigation and telemetry views.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                                {['Revenue Operations', 'Sales Leader', 'Financial Analyst', 'Executive / Founder'].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setFormData({ ...formData, role: r })}
                                        className={cn(
                                            "p-3 rounded-lg border text-left transition-all font-medium",
                                            formData.role === r ? "border-foreground bg-muted font-bold shadow-xs" : "border-border hover:bg-muted/40"
                                        )}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                                <Target className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Target Objectives</h2>
                                <p className="text-xs text-muted-foreground mt-1">What is your team's primary revenue acquisition goal?</p>
                            </div>

                            <div className="space-y-2 text-xs pt-2">
                                {[
                                    'Accelerate Enterprise Sales Velocity',
                                    'Predict High-Converting ICP Leads with AI',
                                    'Centralize CRM, Invoicing, and Employee OKRs',
                                    'Automate Inbound Lead Acquisition Chatbot'
                                ].map((target) => (
                                    <div 
                                        key={target}
                                        onClick={() => setFormData({ ...formData, leadTarget: target })}
                                        className={cn(
                                            "p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between font-medium",
                                            formData.leadTarget === target ? "border-foreground bg-muted font-semibold" : "border-border hover:bg-muted/40"
                                        )}
                                    >
                                        <span>{target}</span>
                                        {formData.leadTarget === target && <Check className="w-4 h-4 text-emerald-600" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                                <Zap className="w-5 h-5 text-foreground" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Connect Integrations</h2>
                                <p className="text-xs text-muted-foreground mt-1">Select tools you want to sync with AppLead telemetry.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                                {['Salesforce', 'HubSpot', 'Stripe', 'Slack', 'Segment', 'QuickBooks'].map((app) => {
                                    const isSel = formData.integrations.includes(app);
                                    return (
                                        <button
                                            key={app}
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    integrations: isSel ? prev.integrations.filter(i => i !== app) : [...prev.integrations, app]
                                                }));
                                            }}
                                            className={cn(
                                                "p-3 rounded-lg border text-center transition-all font-semibold",
                                                isSel ? "border-foreground bg-foreground text-background shadow-xs" : "border-border hover:bg-muted/40"
                                            )}
                                        >
                                            {app}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-4 text-center py-4 animate-fade-in">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Your Workspace is Ready</h2>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                                Organization <span className="font-semibold text-foreground">{formData.orgName}</span> has been configured with AI copilot scoring, real-time telemetry, and enterprise RBAC parameters.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-muted/10 flex items-center justify-between">
                    {step > 1 ? (
                        <Button variant="outline" size="sm" onClick={prevStep} className="h-8 text-xs font-semibold gap-1">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </Button>
                    ) : <div />}

                    <Button onClick={nextStep} size="sm" className="h-8 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 gap-1.5 ml-auto">
                        {step === 5 ? "Launch Command Center" : "Continue"}
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
