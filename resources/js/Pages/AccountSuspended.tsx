import { Head, router } from '@inertiajs/react';
import PublicLayout from '../Layouts/PublicLayout';
import type { SiteSettings } from '../types';

type Props = {
    reason: 'company_disabled' | 'subscription_inactive';
    company_name?: string | null;
    is_active?: boolean;
    subscription_status?: string | null;
    subscription_ends_at?: string | null;
    contact_email?: string | null;
    site: SiteSettings;
};

export default function AccountSuspended({
    reason,
    company_name,
    subscription_status,
    subscription_ends_at,
    contact_email,
    site,
}: Props) {
    const title =
        reason === 'company_disabled'
            ? 'কোম্পানিটি ডি-অ্যাক্টিভেট করা হয়েছে'
            : 'সাবস্ক্রিপশন সক্রিয় নেই';

    const message =
        reason === 'company_disabled'
            ? `"${company_name ?? 'Your company'}" platform admin কর্তৃক ডি-অ্যাক্টিভেট করা হয়েছে। পুনরায় সক্রিয় করতে platform admin-এর সাথে যোগাযোগ করুন।`
            : subscription_status === 'expired'
              ? `আপনার সাবস্ক্রিপশন মেয়াদোত্তীর্ণ হয়ে গেছে${subscription_ends_at ? ` (${subscription_ends_at})` : ''}। Plan renew করতে platform admin-এর সাথে যোগাযোগ করুন।`
              : 'আপনার কোম্পানির সাবস্ক্রিপশন বর্তমানে সক্রিয় নয়। Plan সক্রিয় করতে platform admin-এর সাথে যোগাযোগ করুন।';

    return (
        <PublicLayout site={site}>
            <Head title="Account Suspended" />

            <section className="grid min-h-[60vh] place-items-center px-4 py-20">
                <div className="card w-full max-w-md border-danger/40 p-8 text-center">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-danger/40 bg-danger/10 text-3xl">
                        ⛔
                    </span>

                    <h1 className="mt-5 text-2xl font-bold">{title}</h1>
                    <p className="mt-3 text-sm text-muted">{message}</p>

                    {contact_email && (
                        <p className="mt-4 text-sm text-muted">
                            যোগাযোগ:{' '}
                            <a href={`mailto:${contact_email}`} className="font-semibold text-brand-3 hover:underline">
                                {contact_email}
                            </a>
                        </p>
                    )}

                    <button type="button" onClick={() => router.post('/logout')} className="btn-ghost mt-8 w-full py-3">
                        Logout
                    </button>
                </div>
            </section>
        </PublicLayout>
    );
}