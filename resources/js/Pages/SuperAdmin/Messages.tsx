import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, Flash, PageHeader } from '../../components/ui';

type Message = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    read_at: string | null;
    created_at: string;
};

type Props = {
    messages: Message[];
    unread_count: number;
};

export default function SuperAdminMessages({ messages, unread_count }: Props) {
    const { flash, errors } = usePage().props;

    return (
        <AppLayout>
            <Head title="Messages" />

            <PageHeader icon="mail" title="Contact Messages" subtitle="Inquiries submitted through the public website.">
                {unread_count > 0 && <Badge tone="danger">{unread_count} unread</Badge>}
            </PageHeader>

            <Flash message={flash?.message} errors={errors} />

            {messages.length === 0 ? (
                <p className="card mt-5 p-10 text-center text-sm text-muted">
                    এখনো কোনো message আসেনি।
                </p>
            ) : (
                <ul className="mt-5 space-y-3">
                    {messages.map((message) => (
                        <li
                            key={message.id}
                            className={`card p-5 ${message.read_at ? 'opacity-70' : 'border-brand/50'}`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="flex items-center gap-2 font-semibold">
                                        {message.name}
                                        {!message.read_at && <span className="h-2 w-2 rounded-full bg-danger" />}
                                    </p>
                                    <p className="text-sm text-muted">{message.email}</p>
                                    {message.phone && <p className="text-sm text-muted">{message.phone}</p>}
                                </div>
                                <span className="text-xs text-muted">
                                    {new Date(message.created_at).toLocaleString()}
                                </span>
                            </div>

                            <p className="mt-3 whitespace-pre-wrap text-sm text-ink-soft">{message.message}</p>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                {!message.read_at && (
                                    <button
                                        type="button"
                                        onClick={() => router.patch(`/super/messages/${message.id}/read`)}
                                        className="btn-ghost px-3 py-1.5 text-xs"
                                    >
                                        <Icon name="check" size={14} /> Mark as read
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Delete this message?')) {
                                            router.delete(`/super/messages/${message.id}`);
                                        }
                                    }}
                                    className="btn-danger px-3 py-1.5 text-xs"
                                >
                                    <Icon name="trash" size={14} /> Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </AppLayout>
    );
}
