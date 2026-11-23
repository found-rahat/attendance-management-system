import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, EmptyRow, Modal, PageHeader, Pagination } from '../../components/ui';
import { checkInIcon, officeIcon } from '../../lib/leaflet';
import { formatDate, formatDateTime, formatDuration, formatTime } from '../../lib/datetime';

type Record = {
    id: number;
    date: string;
    check_in_at: string | null;
    check_out_at: string | null;
    check_in_company_name: string | null;
    check_out_company_name: string | null;
    check_in_address: string | null;
    check_out_address: string | null;
    check_in_latitude: number | null;
    check_in_longitude: number | null;
    check_in_distance: number | null;
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
    records: {
        data: Record[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    office: Office;
    filters: { from: string | null; to: string | null };
};

export default function StaffHistory({ records, office, filters }: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [selected, setSelected] = useState<Record | null>(null);

    function search() {
        router.get(
            '/attendance/history',
            { from: from || undefined, to: to || undefined },
            { preserveState: true, replace: true },
        );
    }

    const rows = records.data;
    const officePosition: [number, number] = [office.latitude, office.longitude];
    const staffPosition: [number, number] | null =
        selected?.check_in_latitude != null && selected?.check_in_longitude != null
            ? [selected.check_in_latitude, selected.check_in_longitude]
            : null;

    return (
        <AppLayout>
            <Head title="My Attendance History" />

            <PageHeader icon="clock" title="My Attendance History" subtitle="Your check-in and check-out records." />

            <div className="card flex flex-wrap items-end gap-4 p-4">
                <label className="text-sm">
                    <span className="label">From</span>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
                </label>
                <label className="text-sm">
                    <span className="label">To</span>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
                </label>
                <button type="button" onClick={search} className="btn-primary">
                    <Icon name="search" size={18} /> Search
                </button>
            </div>

            <div className="card mt-5 overflow-x-auto">
                <table className="data-table min-w-[720px]">
                    <thead>
                        <tr>
                            <th className="text-left">Date</th>
                            <th>Entry Time</th>
                            <th>Exit Time</th>
                            <th>Duration</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} className="cursor-pointer" onClick={() => setSelected(row)}>
                                <td className="text-left font-medium">{formatDate(row.date)}</td>
                                <td>{formatTime(row.check_in_at)}</td>
                                <td>{formatTime(row.check_out_at)}</td>
                                <td>{formatDuration(row.check_in_at, row.check_out_at)}</td>
                                <td>
                                    <Badge tone={row.status === 'completed' || row.status === 'present' ? 'ok' : row.status === 'late' || row.status === 'early_leave' ? 'warn' : 'neutral'}>
                                        {row.status}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && <EmptyRow colSpan={5}>No attendance records found.</EmptyRow>}
                    </tbody>
                </table>
            </div>

            <div className="mt-5">
                <Pagination
                    currentPage={records.current_page}
                    lastPage={records.last_page}
                    prevUrl={records.prev_page_url}
                    nextUrl={records.next_page_url}
                />
            </div>

            <Modal
                open={selected !== null}
                onClose={() => setSelected(null)}
                title={selected ? `Location — ${formatDate(selected.date)}` : ''}
            >
                {selected && staffPosition && (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="grid h-5 w-5 place-items-center rounded-full bg-info text-[10px] text-white">🏢</span>
                                {office.name} (office)
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="grid h-5 w-5 place-items-center rounded-full bg-ok text-[10px] text-white">✓</span>
                                Your check-in location
                            </span>
                        </div>

                        <div className="h-[360px] overflow-hidden rounded-xl border border-line">
                            <MapContainer center={officePosition} zoom={17} className="h-full w-full">
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
                                    <Popup>
                                        <strong>{office.name}</strong>
                                        <br />
                                        Office (radius {office.radius}m)
                                    </Popup>
                                </Marker>

                                {staffPosition && (
                                    <Marker position={staffPosition} icon={checkInIcon}>
                                        <Popup>
                                            Your check-in
                                            <br />
                                            {formatDateTime(selected.check_in_at)}
                                        </Popup>
                                    </Marker>
                                )}

                                <FitBounds points={staffPosition ? [officePosition, staffPosition] : [officePosition]} />
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
                                <p className="text-xs text-muted">Distance from office</p>
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
        </AppLayout>
    );
}

function FitBounds({ points }: { points: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds(points);

        if (points.length === 1) {
            map.setView(points[0], 17);
            return;
        }

        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points.map((p) => p.join(',')).join('|')]);

    return null;
}
