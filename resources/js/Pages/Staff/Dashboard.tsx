import { Head, Link } from '@inertiajs/react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, EmptyRow, PageHeader, StatCard } from '../../components/ui';
import { checkInIcon, officeIcon } from '../../lib/leaflet';
import { formatDate, formatTime } from '../../lib/datetime';

type Attendance = {
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

type Office = {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    max_accuracy: number;
};

type Props = {
    today: Attendance | null;
    todayDate: string;
    monthLabel: string;
    stats: { present: number; late: number; total: number; outside: number };
    recent: Attendance[];
    office: Office;
};

export default function StaffDashboard({ today, monthLabel, stats, recent, office }: Props) {
    const officePosition: [number, number] = [office.latitude, office.longitude];
    const todayPosition: [number, number] | null =
        today?.check_in_latitude != null && today?.check_in_longitude != null
            ? [today.check_in_latitude, today.check_in_longitude]
            : null;

    const checkedIn = Boolean(today?.check_in_at);
    const checkedOut = Boolean(today?.check_out_at);

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <PageHeader icon="dashboard" title="Dashboard" subtitle={`${monthLabel} · ${office.name}`}>
                {!checkedIn ? (
                    <Link href="/attendance" className="btn-primary">
                        <Icon name="userOk" size={18} /> Check In
                    </Link>
                ) : !checkedOut ? (
                    <Link href="/attendance" className="btn-primary">
                        <Icon name="logout" size={18} /> Check Out
                    </Link>
                ) : (
                    <Link href="/attendance/history" className="btn-ghost">
                        <Icon name="clock" size={18} /> View history
                    </Link>
                )}
            </PageHeader>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {/* Today's status */}
                <div className="card min-w-0 p-5 xl:col-span-1">
                    <p className="text-sm text-muted">Today's attendance</p>

                    <div className="mt-3 flex items-center gap-3">
                        <span
                            className={`grid h-12 w-12 place-items-center rounded-xl border ${
                                checkedOut
                                    ? 'border-ok/50 bg-ok/15 text-ok'
                                    : checkedIn
                                      ? 'border-info/50 bg-info/15 text-info'
                                      : 'border-line bg-panel-3 text-muted'
                            }`}
                        >
                            <Icon name={checkedOut ? 'check' : checkedIn ? 'userOk' : 'clock'} size={24} />
                        </span>
                        <div>
                            <p className="text-lg font-semibold">
                                {checkedOut ? 'Completed' : checkedIn ? 'Checked in' : 'Not checked in yet'}
                            </p>
                            <p className="text-sm text-muted">
                                {checkedOut
                                    ? 'আজকের কাজ শেষ।'
                                    : checkedIn
                                      ? 'Check Out করতে ভুলবেন না।'
                                      : 'অফিসে পৌঁছে Check In করুন।'}
                            </p>
                        </div>
                    </div>

                    <dl className="mt-5 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-muted">Check In</dt>
                            <dd className="font-medium">
                                {today?.check_in_at ? formatTime(today.check_in_at) : '—'}
                                {today?.check_in_outside && <Badge tone="gold">outside</Badge>}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-muted">Check Out</dt>
                            <dd className="font-medium">{today?.check_out_at ? formatTime(today.check_out_at) : '—'}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-muted">Distance</dt>
                            <dd className="font-medium">
                                {today?.check_in_distance != null ? `${Math.round(today.check_in_distance)}m` : '—'}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-muted">Status</dt>
                            <dd>
                                {today?.status ? (
                                    <Badge tone={today.status === 'late' ? 'warn' : 'ok'}>{today.status}</Badge>
                                ) : (
                                    <span className="text-muted">—</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Office map */}
                <div className="card min-w-0 overflow-hidden xl:col-span-2">
                    <div className="flex items-center justify-between border-b border-line px-5 py-4">
                        <span className="text-sm font-medium">Office location</span>
                        <span className="text-xs text-muted">radius {office.radius}m</span>
                    </div>
                    <div className="h-[240px] w-full">
                        <MapContainer center={officePosition} zoom={16} className="h-full w-full">
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Circle
                                center={officePosition}
                                radius={office.radius}
                                pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.08 }}
                            />
                            <Marker position={officePosition} icon={officeIcon}>
                                <Popup>{office.name}</Popup>
                            </Marker>
                            {todayPosition && (
                                <Marker position={todayPosition} icon={checkInIcon}>
                                    <Popup>Your check-in</Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                </div>
            </div>

            <section className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
                <StatCard tone="green" icon="userOk" label="Present" value={stats.present} sub={monthLabel} />
                <StatCard tone="orange" icon="clock" label="Late" value={stats.late} sub={monthLabel} />
                <StatCard tone="purple" icon="calendar" label="Total Records" value={stats.total} sub={monthLabel} />
                <StatCard tone="gold" icon="location" label="Outside Geofence" value={stats.outside} sub={monthLabel} />
            </section>

            <div className="card mt-5 overflow-x-auto">
                <header className="flex items-center justify-between border-b border-line px-5 py-4">
                    <span className="font-medium">Recent records</span>
                    <Link href="/attendance/history" className="text-sm text-brand-3 hover:underline">
                        View all →
                    </Link>
                </header>
                <table className="data-table min-w-[640px]">
                    <thead>
                        <tr>
                            <th className="text-left">Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                            <th>Distance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recent.map((row) => (
                            <tr key={row.id}>
                                <td className="text-left">{formatDate(row.date)}</td>
                                <td>{formatTime(row.check_in_at)}</td>
                                <td>{formatTime(row.check_out_at)}</td>
                                <td>
                                    <Badge tone={row.status === 'late' ? 'warn' : 'ok'}>{row.status}</Badge>
                                </td>
                                <td>
                                    <span className="inline-flex flex-wrap items-center justify-center gap-1">
                                        {row.check_in_distance != null ? `${Math.round(row.check_in_distance)}m` : '—'}
                                        {row.check_in_outside && <Badge tone="gold">outside</Badge>}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {recent.length === 0 && <EmptyRow colSpan={5}>No attendance records yet.</EmptyRow>}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
