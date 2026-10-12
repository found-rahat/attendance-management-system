import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { formatDate, formatDateTime } from '../../lib/datetime';

type Row = {
    id: number;
    date: string;
    status: string;
    check_in_at: string | null;
    check_out_at: string | null;
    check_in_latitude: number | null;
    check_in_longitude: number | null;
    check_in_distance: number | null;
    check_in_outside: boolean;
    staff: { id: number; name: string; email: string } | null;
};

type Props = {
    rows: {
        data: Row[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    summary: Record<string, number>;
    filters: { from?: string; to?: string; staff_id?: string; status?: string };
    staff: { id: number; name: string }[];
    office: { name: string; latitude: number; longitude: number; radius: number };
};

const summaryLabels: Record<string, string> = {
    records: 'Total Records',
    present: 'Present',
    late: 'Late',
    checked_out: 'Checked Out',
    outside: 'Outside Geofence',
    absent_estimate: 'Absent (est.)',
};

export default function AttendanceReport({ rows, summary, filters, staff, office }: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [staffId, setStaffId] = useState(filters.staff_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function search() {
        router.get(
            '/admin/attendance-report',
            {
                from: from || undefined,
                to: to || undefined,
                staff_id: staffId || undefined,
                status: status || undefined,
            },
            { preserveState: true, replace: true },
        );
    }

    const mapDate = from || new Date().toISOString().slice(0, 10);

    return (
        <AppLayout>
            <Head title="Admin Attendance Report" />

            <main className="mx-auto max-w-7xl space-y-5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Admin Attendance Report</h1>
                    <Link
                        href={`/admin/attendance-report/map?date=${mapDate}`}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        View today's map
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                    {Object.entries(summary).map(([key, value]) => (
                        <div key={key} className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs capitalize text-gray-500">
                                {summaryLabels[key] ?? key.replace('_', ' ')}
                            </p>
                            <p className="text-2xl font-bold">{String(value)}</p>
                        </div>
                    ))}
                </div>

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

                    <label className="text-sm">
                        Staff
                        <select
                            value={staffId}
                            onChange={(e) => setStaffId(e.target.value)}
                            className="mt-1 block rounded-md border border-gray-300 p-2"
                        >
                            <option value="">All staff</option>
                            {staff.map((person) => (
                                <option key={person.id} value={person.id}>
                                    {person.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm">
                        Status
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 block rounded-md border border-gray-300 p-2"
                        >
                            <option value="">All</option>
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                        </select>
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
                                <th className="p-3">Staff</th>
                                <th className="p-3">Check In</th>
                                <th className="p-3">Check Out</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Distance</th>
                                <th className="p-3">Location</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.data.map((row) => (
                                <tr key={row.id} className="border-t">
                                    <td className="p-3">{formatDate(row.date)}</td>
                                    <td className="p-3">
                                        {row.staff?.name ?? 'Deleted staff'}
                                        {row.staff?.email && (
                                            <span className="block text-xs text-gray-400">
                                                {row.staff.email}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">{formatDateTime(row.check_in_at)}</td>
                                    <td className="p-3">{formatDateTime(row.check_out_at)}</td>
                                    <td className="p-3">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                row.status === 'late'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {row.status}
                                        </span>
                                        {row.check_in_outside && (
                                            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                                outside ⚠️
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {row.check_in_distance != null
                                            ? `${Math.round(row.check_in_distance)}m`
                                            : '—'}
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
                                                View Check In
                                            </a>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {rows.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-5 text-center text-gray-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center gap-4">
                    {rows.prev_page_url && (
                        <Link
                            href={rows.prev_page_url}
                            className="rounded-md border px-3 py-2 hover:bg-gray-100"
                        >
                            Previous
                        </Link>
                    )}
                    <span className="text-sm text-gray-600">
                        Page {rows.current_page} of {rows.last_page}
                    </span>
                    {rows.next_page_url && (
                        <Link
                            href={rows.next_page_url}
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