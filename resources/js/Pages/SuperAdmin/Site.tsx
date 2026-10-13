import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Field, Flash, PageHeader } from '../../components/ui';
import type { SiteSettings } from '../../types';

type SiteScalars = Omit<SiteSettings, 'features' | 'faqs'>;

type LandingFeatureRow = {
    id: number;
    icon: string;
    title: string;
    text: string;
    sort_order: number;
};

type LandingFaqRow = {
    id: number;
    question: string;
    answer: string;
    sort_order: number;
};

type Props = {
    site: SiteScalars;
    features: LandingFeatureRow[];
    faqs: LandingFaqRow[];
};

function FeatureRow({ feature }: { feature: LandingFeatureRow }) {
    const [values, setValues] = useState({
        icon: feature.icon,
        title: feature.title,
        text: feature.text,
    });
    const [saving, setSaving] = useState(false);

    function update(field: keyof typeof values, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <div className="rounded-xl border border-line-2 bg-panel-3 p-4">
            <div className="flex gap-3">
                <input
                    type="text"
                    maxLength={4}
                    value={values.icon}
                    onChange={(e) => update('icon', e.target.value)}
                    title="Icon / emoji"
                    className="input w-16 text-center"
                />
                <input
                    type="text"
                    value={values.title}
                    placeholder="Title"
                    onChange={(e) => update('title', e.target.value)}
                    className="input flex-1"
                />
            </div>
            <textarea
                rows={2}
                value={values.text}
                placeholder="Description"
                onChange={(e) => update('text', e.target.value)}
                className="input mt-2"
            />
            <div className="mt-2 flex items-center gap-3">
                <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                        setSaving(true);
                        router.put(`/super/site/features/${feature.id}`, values, {
                            preserveScroll: true,
                            onFinish: () => setSaving(false),
                        });
                    }}
                    className="btn-primary px-3 py-1.5 text-xs"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (confirm(`Remove feature "${feature.title}"?`)) {
                            router.delete(`/super/site/features/${feature.id}`, { preserveScroll: true });
                        }
                    }}
                    className="text-xs font-medium text-danger hover:underline"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}

function FaqRow({ faq }: { faq: LandingFaqRow }) {
    const [values, setValues] = useState({ question: faq.question, answer: faq.answer });
    const [saving, setSaving] = useState(false);

    function update(field: keyof typeof values, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <div className="rounded-xl border border-line-2 bg-panel-3 p-4">
            <input
                type="text"
                value={values.question}
                placeholder="Question"
                onChange={(e) => update('question', e.target.value)}
                className="input"
            />
            <textarea
                rows={2}
                value={values.answer}
                placeholder="Answer"
                onChange={(e) => update('answer', e.target.value)}
                className="input mt-2"
            />
            <div className="mt-2 flex items-center gap-3">
                <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                        setSaving(true);
                        router.put(`/super/site/faqs/${faq.id}`, values, {
                            preserveScroll: true,
                            onFinish: () => setSaving(false),
                        });
                    }}
                    className="btn-primary px-3 py-1.5 text-xs"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (confirm('Remove this FAQ?')) {
                            router.delete(`/super/site/faqs/${faq.id}`, { preserveScroll: true });
                        }
                    }}
                    className="text-xs font-medium text-danger hover:underline"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}

export default function SuperAdminSite({ site, features, faqs }: Props) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState<SiteScalars>(site);
    const [submitting, setSubmitting] = useState(false);

    const [newFeature, setNewFeature] = useState({ icon: '⭐', title: '', text: '' });
    const [addingFeature, setAddingFeature] = useState(false);

    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [addingFaq, setAddingFaq] = useState(false);

    const [logoDark, setLogoDark] = useState<File | null>(null);
    const [logoLight, setLogoLight] = useState<File | null>(null);
    const [favicon, setFavicon] = useState<File | null>(null);
    const [removeDark, setRemoveDark] = useState(false);
    const [removeLight, setRemoveLight] = useState(false);
    const [removeFavicon, setRemoveFavicon] = useState(false);
    const [savingLogos, setSavingLogos] = useState(false);

    function update(field: keyof SiteScalars, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.put('/super/site', values, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    }

    function addFeature() {
        setAddingFeature(true);
        router.post('/super/site/features', newFeature, {
            preserveScroll: true,
            onSuccess: () => setNewFeature({ icon: '⭐', title: '', text: '' }),
            onFinish: () => setAddingFeature(false),
        });
    }

    function submitLogos() {
        setSavingLogos(true);
        const formData = new FormData();

        if (logoDark) {
            formData.append('logo_dark', logoDark);
        }

        if (logoLight) {
            formData.append('logo_light', logoLight);
        }

        if (favicon) {
            formData.append('favicon', favicon);
        }

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

    function addFaq() {
        setAddingFaq(true);
        router.post('/super/site/faqs', newFaq, {
            preserveScroll: true,
            onSuccess: () => setNewFaq({ question: '', answer: '' }),
            onFinish: () => setAddingFaq(false),
        });
    }


    return (
        <AppLayout>
            <Head title="Website Content" />

            <PageHeader
                icon="globe"
                title="Website Content"
                subtitle="Landing page-র লেখা, features ও FAQ এখান থেকে manage করুন।"
            />

            <Flash message={flash?.message} errors={errors} />

            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
                <form onSubmit={submit} className="card space-y-5 p-6">
                    <h2 className="font-semibold">General content</h2>

                    <Field label="Brand name">
                        <input type="text" className="input" value={values.brand_name ?? ''} onChange={(e) => update('brand_name', e.target.value)} />
                    </Field>

                    <Field label="Hero title">
                        <input type="text" className="input" value={values.hero_title ?? ''} onChange={(e) => update('hero_title', e.target.value)} />
                    </Field>

                    <Field label="Hero subtitle">
                        <textarea rows={3} className="input" value={values.hero_subtitle ?? ''} onChange={(e) => update('hero_subtitle', e.target.value)} />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Field label="Contact email">
                            <input type="email" className="input" value={values.contact_email ?? ''} onChange={(e) => update('contact_email', e.target.value)} />
                        </Field>
                        <Field label="Contact phone">
                            <input type="text" className="input" value={values.contact_phone ?? ''} onChange={(e) => update('contact_phone', e.target.value)} />
                        </Field>
                        <Field label="Contact address">
                            <input type="text" className="input" value={values.contact_address ?? ''} onChange={(e) => update('contact_address', e.target.value)} />
                        </Field>
                    </div>

                    <Field label="CTA heading">
                        <input type="text" className="input" value={values.cta_heading ?? ''} onChange={(e) => update('cta_heading', e.target.value)} />
                    </Field>

                    <Field label="CTA subtext">
                        <textarea rows={2} className="input" value={values.cta_subtext ?? ''} onChange={(e) => update('cta_subtext', e.target.value)} />
                    </Field>

                    <Field label="Footer text">
                        <input type="text" className="input" value={values.footer_text ?? ''} onChange={(e) => update('footer_text', e.target.value)} />
                    </Field>

                    <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? 'Saving...' : 'Save content'}
                    </button>
                </form>

                <div className="card space-y-5 p-6">
                    <h2 className="font-semibold">Brand logos</h2>
                    <p className="text-sm text-muted">
                        Upload dark and light mode logos. If no logo is uploaded, the default "Staff7" text will be shown.
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
                            <div key={mode} className="space-y-3 rounded-xl border border-line-2 bg-panel-3 p-4">
                                <p className="text-sm font-medium capitalize">{mode} mode logo</p>

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

                    <div className="space-y-3 rounded-xl border border-line-2 bg-panel-3 p-4">
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
                        className="btn-primary"
                    >
                        {savingLogos ? 'Saving...' : 'Save logos'}
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Landing features</h3>
                            <span className="text-xs text-muted">{features.length} items</span>
                        </div>

                        <div className="mt-4 space-y-4">
                            {features.map((feature) => (
                                <FeatureRow key={feature.id} feature={feature} />
                            ))}
                            {features.length === 0 && <p className="text-sm text-muted">কোনো feature নেই।</p>}
                        </div>

                        <div className="mt-5 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4">
                            <p className="text-sm font-medium">নতুন feature যোগ করুন</p>
                            <div className="mt-3 flex gap-3">
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={newFeature.icon}
                                    onChange={(e) => setNewFeature((prev) => ({ ...prev, icon: e.target.value }))}
                                    title="Icon / emoji"
                                    className="input w-16 text-center"
                                />
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={newFeature.title}
                                    onChange={(e) => setNewFeature((prev) => ({ ...prev, title: e.target.value }))}
                                    className="input flex-1"
                                />
                            </div>
                            <textarea
                                rows={2}
                                placeholder="Description"
                                value={newFeature.text}
                                onChange={(e) => setNewFeature((prev) => ({ ...prev, text: e.target.value }))}
                                className="input mt-2"
                            />
                            <button type="button" disabled={addingFeature} onClick={addFeature} className="btn-primary mt-3 px-4 py-2 text-xs">
                                {addingFeature ? 'Adding...' : '+ Add feature'}
                            </button>
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">FAQ</h3>
                            <span className="text-xs text-muted">{faqs.length} items</span>
                        </div>

                        <div className="mt-4 space-y-4">
                            {faqs.map((faq) => (
                                <FaqRow key={faq.id} faq={faq} />
                            ))}
                            {faqs.length === 0 && <p className="text-sm text-muted">কোনো FAQ নেই।</p>}
                        </div>

                        <div className="mt-5 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4">
                            <p className="text-sm font-medium">নতুন FAQ যোগ করুন</p>
                            <input
                                type="text"
                                placeholder="Question"
                                value={newFaq.question}
                                onChange={(e) => setNewFaq((prev) => ({ ...prev, question: e.target.value }))}
                                className="input mt-3"
                            />
                            <textarea
                                rows={2}
                                placeholder="Answer"
                                value={newFaq.answer}
                                onChange={(e) => setNewFaq((prev) => ({ ...prev, answer: e.target.value }))}
                                className="input mt-2"
                            />
                            <button type="button" disabled={addingFaq} onClick={addFaq} className="btn-primary mt-3 px-4 py-2 text-xs">
                                {addingFaq ? 'Adding...' : '+ Add FAQ'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
