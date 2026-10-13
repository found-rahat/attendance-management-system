import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, EmptyRow, Field, Flash, Modal, PageHeader, Pagination, StatCard } from '../../components/ui';
import { checkInIcon } from '../../lib/leaflet';
import { formatDate, formatDateTime, toLocalInput } from '../../lib/datetime';

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

const summaryMeta: Record<string, { label: string; tone: 'purple' | 'green' | 'orange' | 'blue' | 'gold' | 'cyan'; icon: string }> = {
    records: { label: 'Total Records', tone: 'purple', icon: 'dashboard' },
    present: { label: 'Present', tone: 'green', icon: 'userOk' },
    late: { label: 'Late', tone: 'orange', icon: 'clock' },
    checked_out: { label: 'Checked Out', tone: 'blue', icon: 'logout' },
    outside: { label: 'Outside Geofence', tone: 'gold', icon: 'location' },
    absent_estimate: { label: 'Absent (est.)', tone: 'cyan', icon: 'userX' },
};

export default function AttendanceReport({ rows, summary, filters, staff, office }: Props) {
    const { errors, flash } = usePage().props;
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [staffId, setStaffId] = useState(filters.staff_id ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [selected, setSelected] = useState<Row | null>(null);
    const [editing, setEditing] = useState<Row | null>(null);
    const [editValues, setEditValues] = useState({ check_in_at: '', check_out_at: '', status: 'present' });
    const [savingEdit, setSavingEdit] = useState(false);

    function startEdit(row: Row) {
        setEditing(row);
        setEditValues({
            check_in_at: toLocalInput(row.check_in_at),
            check_out_at: toLocalInput(row.check_out_at),
            status: row.status === 'late' ? 'late' : 'present',
        });
        setSavingEdit(false);
    }

    function saveEdit() {
        if (!editing) return;
        setSavingEdit(true);
        router.put(`/admin/attendance/${editing.id}`, editValues, {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
            onFinish: () => setSavingEdit(false),
        });
    }

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
    const exportUrl = `/admin/attendance-report/export?${new URLSearchParams({
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(staffId ? { staff_id: staffId } : {}),
        ...(status ? { status } : {}),
    }).toString()}`;

    return (
        <AppLayout>
            <Head title="Attendance Report" />

            <PageHeader
                icon="calendar"
                title="Attendance Report"
                subtitle={`${office.name} · geofence radius ${office.radius}m`}
            >
                <Link href={`/admin/attendance-report/map?date=${mapDate}`} className="btn-ghost">
                    <Icon name="track" size={18} /> View map
                </Link>
                <a href={exportUrl} className="btn-primary">
                    <Icon name="pdf" size={18} /> Export PDF
                </a>
            </PageHeader>

            <Flash message={flash?.message} errors={errors} />

            <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {Object.entries(summary).map(([key, value]) => {
                    const meta = summaryMeta[key] ?? { label: key, tone: 'purple' as const, icon: 'dashboard' };

                    return (
                        <StatCard
                            key={key}
                            tone={meta.tone}
                            icon={meta.icon}
                            label={meta.label}
                            value={String(value)}
                        />
                    );
                })}
            </section>

            <div className="card mt-5 flex flex-wrap items-end gap-4 p-4">
                <label className="text-sm">
                    <span className="label">From</span>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
                </label>
                <label className="text-sm">
                    <span className="label">To</span>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
                </label>
                <label className="text-sm">
                    <span className="label">Staff</span>
                    <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className="input">
                        <option value="">All staff</option>
                        {staff.map((person) => (
                            <option key={person.id} value={person.id}>{person.name}</option>
                        ))}
                    </select>
                </label>
                <label className="text-sm">
                    <span className="label">Status</span>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                        <option value="">All</option>
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                    </select>
                </label>
                <button type="button" onClick={search} className="btn-primary">
                    <Icon name="search" size={18} /> Search
                </button>
            </div>

            <div className="card mt-5 overflow-x-auto">
                <table className="data-table min-w-[860px]">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Staff</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                            <th>Distance</th>
                            <th>Location</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.data.map((row) => (
                            <tr key={row.id}>
                                <td className="text-left">{formatDate(row.date)}</td>
                                <td className="text-left">
                                    {row.staff?.name ?? 'Deleted staff'}
                                    {row.staff?.email && <span className="block text-xs text-muted">{row.staff.email}</span>}
                                </td>
                                <td>{formatDateTime(row.check_in_at)}</td>
                                <td>{formatDateTime(row.check_out_at)}</td>
                                <td>
                                    <span className="inline-flex flex-wrap items-center justify-center gap-1">
                                        <Badge tone={row.status === 'late' ? 'warn' : 'ok'}>{row.status}</Badge>
                                        {row.check_in_outside && <Badge tone="gold">outside</Badge>}
                                    </span>
                                </td>
                                <td>{row.check_in_distance != null ? `${Math.round(row.check_in_distance)}m` : '—'}</td>
                                <td>
                                    {row.check_in_latitude != null && row.check_in_longitude != null ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelected(row)}
                                            className="inline-flex items-center gap-1 text-brand-3 hover:underline"
                                        >
                                            <Icon name="location" size={14} /> View
                                        </button>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => startEdit(row)}
                                        className="inline-flex items-center gap-1 text-brand-3 hover:underline"
                                    >
                                        <Icon name="edit" size={14} /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {rows.data.length === 0 && <EmptyRow colSpan={8}>No attendance records found.</EmptyRow>}
                    </tbody>
                </table>
            </div>

            <div className="mt-5">
                <Pagination
                    currentPage={rows.current_page}
                    lastPage={rows.last_page}
                    prevUrl={rows.prev_page_url}
                    nextUrl={rows.next_page_url}
                />
            </div>

            <Modal
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected ? `${selected.staff?.name ?? 'Staff'} — ${formatDate(selected.date)}` : ''}
            >
                {selected && selected.check_in_latitude != null && selected.check_in_longitude != null && (
                    <div className="space-y-3">
                        <div className="h-[360px] overflow-hidden rounded-xl border border-line">
                            <MapContainer
                                center={[selected.check_in_latitude, selected.check_in_longitude]}
                                zoom={17}
                                className="h-full w-full"
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[selected.check_in_latitude, selected.check_in_longitude]}
                                    icon={checkInIcon}
                                >
                                    <Popup>Check In: {formatDateTime(selected.check_in_at)}</Popup>
                                </Marker>
                            </MapContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted">Check In</p>
                                <p className="font-medium">{formatDateTime(selected.check_in_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Check Out</p>
                                <p className="font-medium">{formatDateTime(selected.check_out_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Distance</p>
                                <p className="font-medium">
                                    {selected.check_in_distance != null
                                        ? `${Math.round(selected.check_in_distance)}m`
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Status</p>
                                <p className="font-medium capitalize">{selected.status}</p>
                            </div>
                        </div>

                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={`https://www.openstreetmap.org/?mlat=${selected.check_in_latitude}&mlon=${selected.check_in_longitude}#map=18/${selected.check_in_latitude}/${selected.check_in_longitude}`}
                            className="btn-ghost w-full"
                        >
                            <Icon name="globe" size={16} /> Open in OpenStreetMap
                        </a>
                    </div>
                )}
            </Modal>

            <Modal
                open={editing !== null}
                onClose={() => setEditing(null)}
                title={editing ? `Edit — ${editing.staff?.name ?? 'Staff'} · ${formatDate(editing.date)}` : ''}
            >
                {editing && (
                    <div className="space-y-4">
                        <Field label="Check In">
                            <input
                                type="datetime-local"
                                className="input"
                                value={editValues.check_in_at}
                                onChange={(e) => setEditValues((prev) => ({ ...prev, check_in_at: e.target.value }))}
                            />
                            {errors?.check_in_at && <p className="mt-1 text-sm text-danger">{errors.check_in_at}</p>}
                        </Field>

                        <Field label="Check Out">
                            <input
                                type="datetime-local"
                                className="input"
                                value={editValues.check_out_at}
                                onChange={(e) => setEditValues((prev) => ({ ...prev, check_out_at: e.target.value }))}
                            />
                            {errors?.check_out_at && <p className="mt-1 text-sm text-danger">{errors.check_out_at}</p>}
                        </Field>

                        <Field label="Status">
                            <select
                                className="input"
                                value={editValues.status}
                                onChange={(e) => setEditValues((prev) => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="present">Present</option>
                                <option value="late">Late</option>
                            </select>
                        </Field>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditing(null)} className="btn-ghost px-4 py-2">
                                Cancel
                            </button>
                            <button type="button" disabled={savingEdit} onClick={saveEdit} className="btn-primary px-4 py-2">
                                {savingEdit ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
