import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Flash, PageHeader } from '../../../components/ui';
import type { SiteFaq } from '../../../types';

function FaqRow({ faq }: { faq: SiteFaq & { id: number } }) {
    const [values, setValues] = useState({ q: faq.q, a: faq.a });
    const [saving, setSaving] = useState(false);

    function update(field: keyof typeof values, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <div className="rounded-xl border border-line-2 bg-panel-3 p-4">
            <input
                type="text"
                value={values.q}
                placeholder="Question"
                onChange={(e) => update('q', e.target.value)}
                className="input"
            />
            <textarea
                rows={2}
                value={values.a}
                placeholder="Answer"
                onChange={(e) => update('a', e.target.value)}
                className="input mt-2"
            />
            <div className="mt-2 flex items-center gap-3">
                <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                        setSaving(true);
                        router.put(`/super/site/faqs/${faq.id}`, { question: values.q, answer: values.a }, {
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
                            router.delete(`/super/site/faqs/${faq.id}`, {
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

export default function SiteFaqs({ faqs }: { faqs: (SiteFaq & { id: number })[] }) {
    const { flash } = usePage().props;
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [addingFaq, setAddingFaq] = useState(false);

    function addFaq() {
        setAddingFaq(true);
        router.post('/super/site/faqs', { question: newFaq.question, answer: newFaq.answer }, {
            preserveScroll: true,
            onSuccess: () => setNewFaq({ question: '', answer: '' }),
            onFinish: () => setAddingFaq(false),
        });
    }

    return (
        <AppLayout>
            <Head title="FAQs" />
            <PageHeader icon="help-circle" title="FAQs" subtitle="সচরাচর জিজ্ঞাসাবাব ম্যানেজ করুন।" />
            <Flash message={flash?.message} />

            <div className="mt-5 card p-6 max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">FAQs</h3>
                    <span className="text-xs text-muted">{faqs.length} items</span>
                </div>

                <div className="mt-4 space-y-4">
                    {faqs.map((faq) => (
                        <FaqRow key={faq.id} faq={faq} />
                    ))}
                    {faqs.length === 0 && <p className="text-sm text-muted">কোনো FAQ নেই।</p>}
                </div>

                <div className="mt-6 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-4">
                    <p className="text-sm font-medium mb-3">নতুন FAQ যোগ করুন</p>
                    <input
                        type="text"
                        placeholder="Question"
                        value={newFaq.question}
                        onChange={(e) =>
                            setNewFaq((prev) => ({ ...prev, question: e.target.value }))
                        }
                        className="input mt-3"
                    />
                    <textarea
                        rows={2}
                        placeholder="Answer"
                        value={newFaq.answer}
                        onChange={(e) =>
                            setNewFaq((prev) => ({ ...prev, answer: e.target.value }))
                        }
                        className="input mt-2"
                    />
                    <button
                        type="button"
                        disabled={addingFaq}
                        onClick={addFaq}
                        className="btn-primary mt-3 px-4 py-2 text-xs"
                    >
                        {addingFaq ? 'Adding...' : '+ Add FAQ'}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
