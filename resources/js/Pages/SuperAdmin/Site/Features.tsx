import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Flash, PageHeader } from '../../../components/ui';
import type { SiteFeature } from '../../../types';

function FeatureRow({ feature }: { feature: SiteFeature & { id: number } }) {
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
                            router.delete(`/super/site/features/${feature.id}`, {
                                preserveScroll: true,
                            });
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

export default function SiteFeatures({ features }: { features: (SiteFeature & { id: number })[] }) {
    const { flash } = usePage().props;
    const [newFeature, setNewFeature] = useState({ icon: '⭐', title: '', text: '' });
    const [addingFeature, setAddingFeature] = useState(false);

    function addFeature() {
        setAddingFeature(true);
        router.post('/super/site/features', newFeature, {
            preserveScroll: true,
            onSuccess: () => setNewFeature({ icon: '⭐', title: '', text: '' }),
            onFinish: () => setAddingFeature(false),
        });
    }

    return (
        <AppLayout>
            <Head title="Features" />
            <PageHeader
                icon="layers"
                title="Features"
                subtitle="ল্যান্ডিং পেজের ফিচার ম্যানেজ করুন।"
            />
            <Flash message={flash?.message} />

            <div className="mt-5 card p-6 max-w-4xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Landing features</h3>
                    <span className="text-xs text-muted">{features.length} items</span>
                </div>

                <div className="mt-4 space-y-4">
                    {features.map((feature) => (
                        <FeatureRow key={feature.id} feature={feature} />
                    ))}
                    {features.length === 0 && <p className="text-sm text-muted">কোনো feature নেই।</p>}
                </div>

                <div className="mt-6 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4">
                    <p className="text-sm font-medium mb-3">নতুন feature যোগ করুন</p>
                    <div className="mt-3 flex gap-3">
                        <input
                            type="text"
                            maxLength={4}
                            value={newFeature.icon}
                            onChange={(e) =>
                                setNewFeature((prev) => ({ ...prev, icon: e.target.value }))
                            }
                            title="Icon / emoji"
                            className="input w-16 text-center"
                        />
                        <input
                            type="text"
                            placeholder="Title"
                            value={newFeature.title}
                            onChange={(e) =>
                                setNewFeature((prev) => ({ ...prev, title: e.target.value }))
                            }
                            className="input flex-1"
                        />
                    </div>
                    <textarea
                        rows={2}
                        placeholder="Description"
                        value={newFeature.text}
                        onChange={(e) =>
                            setNewFeature((prev) => ({ ...prev, text: e.target.value }))
                        }
                        className="input mt-2"
                    />
                    <button
                        type="button"
                        disabled={addingFeature}
                        onClick={addFeature}
                        className="btn-primary mt-3 px-4 py-2 text-xs"
                    >
                        {addingFeature ? 'Adding...' : '+ Add feature'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
