import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Field, Flash, PageHeader } from '../../../components/ui';
import type { SiteSettings } from '../../../types';

export default function SiteGeneral({ site }: { site: SiteSettings }) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState(site);
    const [submitting, setSubmitting] = useState(false);

    function update(field: keyof SiteSettings, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.put('/super/site/general', values, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppLayout>
            <Head title="General Content" />
            <PageHeader
                icon="layout"
                title="General Content"
                subtitle="ব্র্যান্ড নাম, কন্টাক্ট, CTA ও ফুটার টেক্সট এডিট করুন।"
            />
            <Flash message={flash?.message} errors={errors} />

            <form onSubmit={submit} className="mt-5 card space-y-5 p-6 max-w-3xl">
                <Field label="Brand name">
                    <input
                        type="text"
                        className="input"
                        value={values.brand_name ?? ''}
                        onChange={(e) => update('brand_name', e.target.value)}
                    />
                </Field>

                <Field label="Hero title">
                    <input
                        type="text"
                        className="input"
                        value={values.hero_title ?? ''}
                        onChange={(e) => update('hero_title', e.target.value)}
                    />
                </Field>

                <Field label="Hero subtitle">
                    <textarea
                        rows={3}
                        className="input"
                        value={values.hero_subtitle ?? ''}
                        onChange={(e) => update('hero_subtitle', e.target.value)}
                    />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Contact email">
                        <input
                            type="email"
                            className="input"
                            value={values.contact_email ?? ''}
                            onChange={(e) => update('contact_email', e.target.value)}
                        />
                    </Field>
                    <Field label="Contact phone">
                        <input
                            type="text"
                            className="input"
                            value={values.contact_phone ?? ''}
                            onChange={(e) => update('contact_phone', e.target.value)}
                        />
                    </Field>
                    <Field label="Contact address">
                        <input
                            type="text"
                            className="input"
                            value={values.contact_address ?? ''}
                            onChange={(e) => update('contact_address', e.target.value)}
                        />
                    </Field>
                </div>

                <Field label="CTA heading">
                    <input
                        type="text"
                        className="input"
                        value={values.cta_heading ?? ''}
                        onChange={(e) => update('cta_heading', e.target.value)}
                    />
                </Field>

                <Field label="CTA subtext">
                    <textarea
                        rows={2}
                        className="input"
                        value={values.cta_subtext ?? ''}
                        onChange={(e) => update('cta_subtext', e.target.value)}
                    />
                </Field>

                <Field label="Footer text">
                    <input
                        type="text"
                        className="input"
                        value={values.footer_text ?? ''}
                        onChange={(e) => update('footer_text', e.target.value)}
                    />
                </Field>

                <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : 'Save content'}
                </button>
            </form>
        </AppLayout>
    );
}
