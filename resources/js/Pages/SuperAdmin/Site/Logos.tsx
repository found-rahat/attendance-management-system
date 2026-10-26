import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Flash, PageHeader } from '../../../components/ui';
import type { SiteSettings } from '../../../types';

export default function SiteLogos({ site }: { site: SiteSettings }) {
    const { flash } = usePage().props;
    const [logoDark, setLogoDark] = useState<File | null>(null);
    const [logoLight, setLogoLight] = useState<File | null>(null);
    const [favicon, setFavicon] = useState<File | null>(null);
    const [removeDark, setRemoveDark] = useState(false);
    const [removeLight, setRemoveLight] = useState(false);
    const [removeFavicon, setRemoveFavicon] = useState(false);
    const [savingLogos, setSavingLogos] = useState(false);

    function submitLogos() {
        setSavingLogos(true);
        const formData = new FormData();

        if (logoDark) formData.append('logo_dark', logoDark);
        if (logoLight) formData.append('logo_light', logoLight);
        if (favicon) formData.append('favicon', favicon);

        formData.append('remove_logo_dark', removeDark ? '1' : '0');
        formData.append('remove_logo_light', removeLight ? '1' : '0');
        formData.append('remove_favicon', removeFavicon ? '1' : '0');

        router.post('/super/site/logos', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setLogoDark(null);
                setLogoLight(null);
                setFavicon(null);
                setRemoveDark(false);
                setRemoveLight(false);
                setRemoveFavicon(false);
            },
            onFinish: () => setSavingLogos(false),
        });
    }

    return (
        <AppLayout>
            <Head title="Logos & Branding" />
            <PageHeader
                icon="image"
                title="Logos & Branding"
                subtitle="ডার্ক ও লাইট মোডের লোগো এবং ফেব icons আপলোড করুন।"
            />
            <Flash message={flash?.message} />

            <div className="mt-5 card p-6 max-w-2xl">
                <h2 className="font-semibold mb-4">Brand logos</h2>
                <p className="text-sm text-muted mb-4">
                    ডার্ক এবং লাইট মোডের জন্য আলাদা আলাদা লোগো সেট করুন। না থাকলে ডিফল্ট টেক্সট দেখাবে।
                </p>

                {(['dark', 'light'] as const).map((mode) => {
                    const key = mode === 'dark' ? 'logo_dark' : 'logo_light';
                    const state = mode === 'dark' ? logoDark : logoLight;
                    const setState = mode === 'dark' ? setLogoDark : setLogoLight;
                    const remove = mode === 'dark' ? removeDark : removeLight;
                    const setRemove = mode === 'dark' ? setRemoveDark : setRemoveLight;
                    const current = (site as any)?.[key];
                    const preview = state ? URL.createObjectURL(state) : current;

                    return (
                        <div
                            key={mode}
                            className="space-y-3 rounded-xl border border-line-2 bg-panel-3 p-4"
                        >
                            <p className="text-sm font-medium capitalize">
                                {mode} mode logo
                            </p>

                            {preview && !remove && (
                                <div className="flex items-center gap-3 rounded-lg border border-line bg-panel/60 p-3">
                                    <img
                                        src={preview}
                                        alt={`${mode} logo preview`}
                                        className="h-10 w-auto max-w-[200px] object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (state) {
                                                setState(null);
                                            } else {
                                                setRemove(true);
                                            }
                                        }}
                                        className="text-xs font-medium text-danger hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setState(file);
                                            setRemove(false);
                                        }
                                    }}
                                    className="block w-full max-w-md text-xs text-muted file:mr-3 file:rounded-lg file:border file:border-brand/50 file:bg-brand/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-brand-3 hover:file:bg-brand/15"
                                />
                                {current && !state && (
                                    <label className="flex items-center gap-2 text-xs text-muted">
                                        <input
                                            type="checkbox"
                                            checked={remove}
                                            onChange={(e) => setRemove(e.target.checked)}
                                            className="h-3.5 w-3.5 accent-[#8b2cf5]"
                                        />
                                        Remove current logo
                                    </label>
                                )}
                            </div>
                        </div>
                    );
                })}

                <div className="space-y-3 rounded-xl border border-line-2 bg-panel-3 p-4 mt-4">
                    <p className="text-sm font-medium">Favicon</p>
                    <p className="text-xs text-muted">
                        .ico, .png বা .svg (square recommended)। না থাকলে default favicon দেখাবে।
                    </p>

                    {(favicon || site.favicon) && !removeFavicon && (
                        <div className="flex items-center gap-3 rounded-lg border border-line bg-panel/60 p-3">
                            <img
                                src={favicon ? URL.createObjectURL(favicon) : (site.favicon as string)}
                                alt="favicon preview"
                                className="h-8 w-8 object-contain"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (favicon) {
                                        setFavicon(null);
                                    } else {
                                        setRemoveFavicon(true);
                                    }
                                }}
                                className="text-xs font-medium text-danger hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <input
                            type="file"
                            accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/jpeg,image/svg+xml,image/webp,.ico"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFavicon(file);
                                    setRemoveFavicon(false);
                                }
                            }}
                            className="block w-full max-w-md text-xs text-muted file:mr-3 file:rounded-lg file:border file:border-brand/50 file:bg-brand/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-brand-3 hover:file:bg-brand/15"
                        />
                        {site.favicon && !favicon && (
                            <label className="flex items-center gap-2 text-xs text-muted">
                                <input
                                    type="checkbox"
                                    checked={removeFavicon}
                                    onChange={(e) => setRemoveFavicon(e.target.checked)}
                                    className="h-3.5 w-3.5 accent-[#8b2cf5]"
                                />
                                Remove current favicon
                            </label>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    disabled={savingLogos}
                    onClick={submitLogos}
                    className="btn-primary mt-4"
                >
                    {savingLogos ? 'Saving...' : 'Save logos'}
                </button>
            </div>
        </AppLayout>
    );
}
