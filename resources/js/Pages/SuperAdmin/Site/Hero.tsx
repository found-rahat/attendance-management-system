import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../../Layouts/AppLayout';
import { Field, Flash, PageHeader } from '../../../components/ui';
import type { SiteSettings } from '../../../types';

export default function SiteHero({ site }: { site: SiteSettings }) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState({
        hero_title: site.hero_title ?? '',
        hero_subtitle: site.hero_subtitle ?? '',
    });
    const [submitting, setSubmitting] = useState(false);

    function update(field: string, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.put('/super/site/hero', values, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppLayout>
            <Head title="Hero Section" />
            <PageHeader
                icon="hero"
                title="Hero Section"
                subtitle="ল্যান্ডিং পেজের হিরো সেকশনের টাইটেল ও সাবটাইটেল এডিট করুন।"
            />
            <Flash message={flash?.message} errors={errors} />

            <form onSubmit={submit} className="mt-5 card space-y-5 p-6 max-w-2xl">
                <Field label="Hero title">
                    <input
                        type="text"
                        className="input"
                        value={values.hero_title}
                        onChange={(e) => update('hero_title', e.target.value)}
                    />
                </Field>

                <Field label="Hero subtitle">
                    <textarea
                        rows={4}
                        className="input"
                        value={values.hero_subtitle}
                        onChange={(e) => update('hero_subtitle', e.target.value)}
                    />
                </Field>

                <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : 'Save hero section'}
                </button>
            </form>
        </AppLayout>
    );
}
