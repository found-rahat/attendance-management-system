import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

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
    const { flash } = usePage().props;

    return (
        <AppLayout>
            <Head title="Messages" />

            <main className="mx-auto max-w-4xl space-y-5 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Contact Messages</h1>
                    {unread_count > 0 && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            {unread_count} unread
                        </span>
                    )}
                </div>

                {flash?.message && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                        {flash.message}
                    </div>
                )}

                {messages.length === 0 ? (
                    <p className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
                        এখনো কোনো message আসেনি।
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {messages.map((message) => (
                            <li
                                key={message.id}
                                className={`rounded-xl border bg-white p-5 shadow-sm ${
                                    message.read_at ? 'opacity-75' : 'border-indigo-200 ring-1 ring-indigo-100'
                                }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {message.name}
                                            {!message.read_at && (
                                                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-red-500" />
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">{message.email}</p>
                                        {message.phone && (
                                            <p className="text-sm text-gray-500">{message.phone}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">
                                            {new Date(message.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                                    {message.message}
                                </p>

                                <div className="mt-4 flex items-center gap-2">
                                    {!message.read_at && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.patch(`/super/messages/${message.id}/read`)
                                            }
                                            className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Delete this message?')) {
                                                router.delete(`/super/messages/${message.id}`);
                                            }
                                        }}
                                        className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </AppLayout>
    );
}