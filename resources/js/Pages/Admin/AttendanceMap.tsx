import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import AppLayout from '../../Layouts/AppLayout';
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

            <main className="mx-auto max-w-6xl space-y-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">
                        Attendance Locations — {date}
                    </h1>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                        <button
                            type="button"
                            onClick={changeDate}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        >
                            Show
                        </button>
                        <Link
                            href="/admin/attendance-report"
                            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
                        >
                            Report
                        </Link>
                    </div>
                </div>

                <p className="text-sm text-gray-600">
                    {rows.length} check-in location(s) on this date. Green marker = office,
                    ✓ = check-in, ✕ = check-out.
                </p>

                <div className="h-[600px] overflow-hidden rounded-xl border bg-white">
                    <MapContainer center={center} zoom={16} className="h-full w-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                                <Marker
                                    position={[row.check_in_latitude, row.check_in_longitude]}
                                    icon={checkInIcon}
                                >
                                    <Popup>
                                        <strong>{row.staff?.name ?? 'Deleted staff'}</strong>
                                        <br />
                                        Check In: {formatDateTime(row.check_in_at)}
                                        <br />
                                        Status: {row.status}
                                    </Popup>
                                </Marker>

                                {row.check_out_latitude != null &&
                                    row.check_out_longitude != null && (
                                        <Marker
                                            position={[
                                                row.check_out_latitude,
                                                row.check_out_longitude,
                                            ]}
                                            icon={checkOutIcon}
                                        >
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
            </main>
        </AppLayout>
    );
}