import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { formatDate, formatDateTime } from '../../lib/datetime';

type Record = {
    id: number;
    date: string;
    check_in_at: string | null;
    check_out_at: string | null;
    check_in_latitude: number | null;
    check_in_longitude: number | null;
    check_in_distance: number | null;
    check_in_outside: boolean;
    status: string;
};

type Props = {
    records: {
        data: Record[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: { from: string | null; to: string | null };
};

export default function StaffHistory({ records, filters }: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    function search() {
        router.get(
            '/attendance/history',
            { from: from || undefined, to: to || undefined },
            { preserveState: true, replace: true },
        );
    }

    const rows = records.data;

    return (
        <AppLayout>
            <Head title="My Attendance History" />

            <main className="mx-auto max-w-5xl space-y-5 p-4">
                <h1 className="text-2xl font-bold">My Attendance History</h1>

                <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
                    <label className="text-sm">
                        From
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="mt-1 block rounded-md border border-gray-300 p-2"
                        />
                    </label>

                    <label className="text-sm">
                        To
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="mt-1 block rounded-md border border-gray-300 p-2"
                        />
                    </label>

                    <button
                        type="button"
                        onClick={search}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        Search
                    </button>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Check In</th>
                                <th className="p-3">Check Out</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Distance</th>
                                <th className="p-3">Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id} className="border-t">
                                    <td className="p-3">{formatDate(row.date)}</td>
                                    <td className="p-3">{formatDateTime(row.check_in_at)}</td>
                                    <td className="p-3">{formatDateTime(row.check_out_at)}</td>
                                    <td className="p-3 capitalize">{row.status}</td>
                                    <td className="p-3">
                                        {row.check_in_distance != null
                                            ? `${Math.round(row.check_in_distance)}m`
                                            : '—'}
                                        {row.check_in_outside && (
                                            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                outside ⚠️
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {row.check_in_latitude != null &&
                                        row.check_in_longitude != null ? (
                                            <a
                                                target="_blank"
                                                rel="noreferrer"
                                                href={`https://www.openstreetmap.org/?mlat=${row.check_in_latitude}&mlon=${row.check_in_longitude}#map=18/${row.check_in_latitude}/${row.check_in_longitude}`}
                                                className="text-indigo-600 hover:underline"
                                            >
                                                View on map
                                            </a>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-5 text-center text-gray-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center gap-4">
                    {records.prev_page_url && (
                        <Link
                            href={records.prev_page_url}
                            className="rounded-md border px-3 py-2 hover:bg-gray-100"
                        >
                            Previous
                        </Link>
                    )}
                    <span className="text-sm text-gray-600">
                        Page {records.current_page} of {records.last_page}
                    </span>
                    {records.next_page_url && (
                        <Link
                            href={records.next_page_url}
                            className="rounded-md border px-3 py-2 hover:bg-gray-100"
                        >
                            Next
                        </Link>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
