import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import { Flash, PageHeader } from '../../../components/ui';
import type { SiteSettings } from '../../../types';

export default function SiteIndex({ site }: { site: SiteSettings }) {
    const { flash } = usePage().props;

    return (
        <AppLayout>
            <Head title="Website Overview" />
            <PageHeader
                icon="globe"
                title="Website Management"
                subtitle="বেসবসাইটের আলাদা আলাদা মডিউল থেকে কন্টেন্ট ম্যানেজ করুন।"
            />
            <Flash message={flash?.message} />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a
                    href="/super/site/general"
                    className="card p-6 hover:border-brand/50 transition"
                >
                    <h3 className="font-semibold">General Content</h3>
                    <p className="text-sm text-muted mt-1">ব্র্যান্ড নাম, কন্টাক্ট, CTA ইত্যাদি</p>
                </a>
                <a
                    href="/super/site/hero"
                    className="card p-6 hover:border-brand/50 transition"
                >
                    <h3 className="font-semibold">Hero Section</h3>
                    <p className="text-sm text-muted mt-1">হিরো সেকশনের টাইটেল ও সাবটাইটেল</p>
                </a>
                <a
                    href="/super/site/logos"
                    className="card p-6 hover:border-brand/50 transition"
                >
                    <h3 className="font-semibold">Logos & Branding</h3>
                    <p className="text-sm text-muted mt-1">ডার্ক/লাইট লোগো ও ফেব icons</p>
                </a>
                <a
                    href="/super/site/features"
                    className="card p-6 hover:border-brand/50 transition"
                >
                    <h3 className="font-semibold">Features</h3>
                    <p className="text-sm text-muted mt-1">ল্যান্ডিং পেজ ফিচার ম্যানেজ করুন</p>
                </a>
                <a
                    href="/super/site/faqs"
                    className="card p-6 hover:border-brand/50 transition"
                >
                    <h3 className="font-semibold">FAQs</h3>
                    <p className="text-sm text-muted mt-1">সচরাচর জিজ্ঞাসাবাব ম্যানেজ করুন</p>
                </a>
            </div>
        </AppLayout>
    );
}
