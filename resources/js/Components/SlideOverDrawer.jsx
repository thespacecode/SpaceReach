import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SlideOverDrawer({
    open,
    onClose,
    title,
    subtitle,
    children,
    width = 'max-w-md'
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose}>
            <div 
                className={cn(
                    "w-full h-full bg-card border-l border-border shadow-2xl flex flex-col divide-y divide-border",
                    width
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}
