import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
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

const commonInput =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none';

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
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex gap-3">
                <input
                    type="text"
                    maxLength={4}
                    value={values.icon}
                    onChange={(e) => update('icon', e.target.value)}
                    title="Icon / emoji"
                    className="w-16 rounded-md border border-gray-300 px-2 py-2 text-center focus:border-indigo-500 focus:outline-none"
                />
                <input
                    type="text"
                    value={values.title}
                    placeholder="Title"
                    onChange={(e) => update('title', e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
            </div>
            <textarea
                rows={2}
                value={values.text}
                placeholder="Description"
                onChange={(e) => update('text', e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
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
                    className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
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
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                    Remove
                </button>
            </div>
        </div>
    );
}

function FaqRow({ faq }: { faq: LandingFaqRow }) {
    const [values, setValues] = useState({
        question: faq.question,
        answer: faq.answer,
    });
    const [saving, setSaving] = useState(false);

    function update(field: keyof typeof values, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <input
                type="text"
                value={values.question}
                placeholder="Question"
                onChange={(e) => update('question', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
            />
            <textarea
                rows={2}
                value={values.answer}
                placeholder="Answer"
                onChange={(e) => update('answer', e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
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
                    className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (confirm('Remove this FAQ?')) {
                            router.delete(`/super/site/faqs/${faq.id}`, {
                                preserveScroll: true,
                            });
                        }
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
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

            <main className="mx-auto max-w-3xl space-y-6 p-4">
                <h1 className="text-2xl font-bold">Website Content</h1>
                <p className="text-sm text-gray-600">
                    Landing page-র লেখা, features ও FAQ এখান থেকে manage করুন। Scalar
                    content save করতে নিচের form ব্যবহার করুন।
                </p>

                {flash?.message && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                        {flash.message}
                    </div>
                )}

                {/* Scalar content */}
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"
                >
                    <div>
                        <label className="block text-sm font-medium">Brand name</label>
                        <input
                            type="text"
                            value={values.brand_name ?? ''}
                            onChange={(e) => update('brand_name', e.target.value)}
                            className={commonInput}
                        />
                        {errors?.brand_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.brand_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Hero title</label>
                        <input
                            type="text"
                            value={values.hero_title ?? ''}
                            onChange={(e) => update('hero_title', e.target.value)}
                            className={commonInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Hero subtitle</label>
                        <textarea
                            rows={3}
                            value={values.hero_subtitle ?? ''}
                            onChange={(e) => update('hero_subtitle', e.target.value)}
                            className={commonInput}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium">Contact email</label>
                            <input
                                type="email"
                                value={values.contact_email ?? ''}
                                onChange={(e) => update('contact_email', e.target.value)}
                                className={commonInput}
                            />
                            {errors?.contact_email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.contact_email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Contact phone</label>
                            <input
                                type="text"
                                value={values.contact_phone ?? ''}
                                onChange={(e) => update('contact_phone', e.target.value)}
                                className={commonInput}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Contact address</label>
                            <input
                                type="text"
                                value={values.contact_address ?? ''}
                                onChange={(e) => update('contact_address', e.target.value)}
                                className={commonInput}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">CTA heading</label>
                        <input
                            type="text"
                            value={values.cta_heading ?? ''}
                            onChange={(e) => update('cta_heading', e.target.value)}
                            className={commonInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">CTA subtext</label>
                        <textarea
                            rows={2}
                            value={values.cta_subtext ?? ''}
                            onChange={(e) => update('cta_subtext', e.target.value)}
                            className={commonInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Footer text</label>
                        <input
                            type="text"
                            value={values.footer_text ?? ''}
                            onChange={(e) => update('footer_text', e.target.value)}
                            className={commonInput}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : 'Save content'}
                    </button>
                </form>

                {/* Features */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Landing features</h3>
                        <span className="text-xs text-gray-400">
                            {features.length} items
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Landing page-র "what you get" কার্ডগুলো।
                    </p>

                    <div className="mt-4 space-y-4">
                        {features.map((feature) => (
                            <FeatureRow key={feature.id} feature={feature} />
                        ))}
                        {features.length === 0 && (
                            <p className="text-sm text-gray-400">কোনো feature নেই।</p>
                        )}
                    </div>

                    <div className="mt-5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
                        <p className="text-sm font-medium text-gray-700">নতুন feature যোগ করুন</p>
                        <div className="mt-3 flex gap-3">
                            <input
                                type="text"
                                maxLength={4}
                                value={newFeature.icon}
                                onChange={(e) =>
                                    setNewFeature((prev) => ({ ...prev, icon: e.target.value }))
                                }
                                title="Icon / emoji"
                                className="w-16 rounded-md border border-gray-300 px-2 py-2 text-center focus:border-indigo-500 focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Title"
                                value={newFeature.title}
                                onChange={(e) =>
                                    setNewFeature((prev) => ({ ...prev, title: e.target.value }))
                                }
                                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <textarea
                            rows={2}
                            placeholder="Description"
                            value={newFeature.text}
                            onChange={(e) =>
                                setNewFeature((prev) => ({ ...prev, text: e.target.value }))
                            }
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                        {errors?.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                        {errors?.text && (
                            <p className="mt-1 text-sm text-red-600">{errors.text}</p>
                        )}
                        <button
                            type="button"
                            disabled={addingFeature}
                            onClick={addFeature}
                            className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {addingFeature ? 'Adding...' : '+ Add feature'}
                        </button>
                    </div>
                </div>

                {/* FAQs */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">FAQ</h3>
                        <span className="text-xs text-gray-400">{faqs.length} items</span>
                    </div>

                    <div className="mt-4 space-y-4">
                        {faqs.map((faq) => (
                            <FaqRow key={faq.id} faq={faq} />
                        ))}
                        {faqs.length === 0 && (
                            <p className="text-sm text-gray-400">কোনো FAQ নেই।</p>
                        )}
                    </div>

                    <div className="mt-5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 p-4">
                        <p className="text-sm font-medium text-gray-700">নতুন FAQ যোগ করুন</p>
                        <input
                            type="text"
                            placeholder="Question"
                            value={newFaq.question}
                            onChange={(e) =>
                                setNewFaq((prev) => ({ ...prev, question: e.target.value }))
                            }
                            className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                        <textarea
                            rows={2}
                            placeholder="Answer"
                            value={newFaq.answer}
                            onChange={(e) =>
                                setNewFaq((prev) => ({ ...prev, answer: e.target.value }))
                            }
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                        />
                        {errors?.question && (
                            <p className="mt-1 text-sm text-red-600">{errors.question}</p>
                        )}
                        {errors?.answer && (
                            <p className="mt-1 text-sm text-red-600">{errors.answer}</p>
                        )}
                        <button
                            type="button"
                            disabled={addingFaq}
                            onClick={addFaq}
                            className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {addingFaq ? 'Adding...' : '+ Add FAQ'}
                        </button>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}