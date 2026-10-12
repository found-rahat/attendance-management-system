export type Role = 'super_admin' | 'admin' | 'staff';

export type Company = {
    id: number;
    name: string;
    office_name: string;
    subscription?: {
        status: string;
        ends_at: string | null;
        active: boolean;
        days_left: number | null;
    };
};

export type Subscription = {
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    active: boolean;
    days_left: number | null;
    staff_count: number;
    staff_limit: number;
};

export type User = {
    id: number;
    name: string;
    email: string;
    role: Role;
    is_super_admin: boolean;
    is_admin: boolean;
    is_staff: boolean;
    company: Company | null;
};

export type Auth = {
    user: User | null;
};

export type Flash = {
    message?: string;
};

export type Plan = {
    id: number;
    name: string;
    slug: string;
    price: number | string;
    billing_cycle: string;
    staff_limit: number;
    features: string[] | null;
    is_featured: boolean;
    is_active: boolean;
    sort_order: number;
};

export type SiteFeature = {
    icon: string;
    title: string;
    text: string;
};

export type SiteFaq = {
    q: string;
    a: string;
};

export type SiteSettings = {
    brand_name: string;
    hero_title: string;
    hero_subtitle: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    cta_heading: string;
    cta_subtext: string;
    footer_text: string;
    features: SiteFeature[];
    faqs: SiteFaq[];
};

declare module '@inertiajs/core' {
    interface PageProps {
        auth: Auth;
        flash: Flash;
        errors?: Record<string, string>;
    }
}
