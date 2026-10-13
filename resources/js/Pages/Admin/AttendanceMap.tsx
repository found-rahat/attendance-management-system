import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { PageHeader } from '../../components/ui';
import { checkOutIcon, checkInIcon, officeIcon } from '../../lib/leaflet';
import { formatDateTime } from '../../lib/datetime';

type Row = {
    id: number;
    check_in_at: string | null;
    check_out_at: string | null;
    check_in_latitude: number;
    check_in_longitude: number;
    check_out_latitude: number | null;
    check_out_longitude: number | null;
    status: string;
    staff: { id: number; name: string } | null;
};

type Props = {
    date: string;
    rows: Row[];
    office: { name: string; latitude: number; longitude: number; radius: number };
};

export default function AttendanceMap({ date, rows, office }: Props) {
    const [selectedDate, setSelectedDate] = useState(date);

    const center: [number, number] = [office.latitude, office.longitude];

    function changeDate() {
        router.get(
            '/admin/attendance-report/map',
            { date: selectedDate || undefined },
            { preserveState: true, replace: false },
        );
    }

    return (
        <AppLayout>
            <Head title="Attendance Map" />

            <PageHeader icon="track" title={`Attendance Map — ${date}`} subtitle={`${rows.length} check-in location(s) on this date.`}>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input w-auto"
                />
                <button type="button" onClick={changeDate} className="btn-primary">
                    <Icon name="search" size={18} /> Show
                </button>
                <Link href="/admin/attendance-report" className="btn-ghost">
                    <Icon name="calendar" size={18} /> Report
                </Link>
            </PageHeader>

            <p className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-ok" /> Office
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-info" /> Check-in
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-danger" /> Check-out
                </span>
            </p>

            <div className="card h-[600px] overflow-hidden p-0">
                <MapContainer center={center} zoom={16} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Circle
                        center={center}
                        radius={office.radius}
                        pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.08 }}
                    />

                    <Marker position={center} icon={officeIcon}>
                        <Popup>{office.name}</Popup>
                    </Marker>

                    {rows.map((row) => (
                        <div key={row.id}>
                            <Marker position={[row.check_in_latitude, row.check_in_longitude]} icon={checkInIcon}>
                                <Popup>
                                    <strong>{row.staff?.name ?? 'Deleted staff'}</strong>
                                    <br />
                                    Check In: {formatDateTime(row.check_in_at)}
                                    <br />
                                    Status: {row.status}
                                </Popup>
                            </Marker>

                            {row.check_out_latitude != null && row.check_out_longitude != null && (
                                <Marker position={[row.check_out_latitude, row.check_out_longitude]} icon={checkOutIcon}>
                                    <Popup>
                                        {row.staff?.name ?? 'Staff'} — Check Out
                                        <br />
                                        {formatDateTime(row.check_out_at)}
                                    </Popup>
                                </Marker>
                            )}
                        </div>
                    ))}
                </MapContainer>
            </div>
        </AppLayout>
    );
}
