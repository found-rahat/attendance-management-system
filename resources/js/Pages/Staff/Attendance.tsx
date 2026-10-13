import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, PageHeader } from '../../components/ui';
import { checkInIcon, currentIcon, officeIcon } from '../../lib/leaflet';
import { formatDateTime } from '../../lib/datetime';

type Attendance = {
    check_in_at: string | null;
    check_out_at: string | null;
    check_in_latitude: number | null;
    check_in_longitude: number | null;
    check_in_distance: number | null;
    check_in_outside: boolean;
    check_out_outside: boolean;
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
    attendance: Attendance | null;
    office: Office;
};

export default function StaffAttendance({ attendance, office }: Props) {
    const [current, setCurrent] = useState<[number, number] | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState<'in' | 'out' | null>(null);
    const [locating, setLocating] = useState(false);
    const currentRef = useRef<[number, number] | null>(null);

    const alreadyCheckedIn = Boolean(attendance?.check_in_at);
    const alreadyCheckedOut = Boolean(attendance?.check_out_at);

    const officePosition: [number, number] = [office.latitude, office.longitude];

    function getLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('এই device-এ GPS location পাওয়া যাচ্ছে না।'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    const info: [number, number] = [latitude, longitude];

                    currentRef.current = info;
                    setCurrent(info);
                    setAccuracy(accuracy);

                    const d = distanceMeters(office.latitude, office.longitude, latitude, longitude);
                    setDistance(d);

                    resolve({ latitude, longitude, accuracy });
                },
                () => reject(new Error('Location permission দিন এবং GPS চালু করুন।')),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
            );
        });
    }

    async function detectLocation() {
        setError('');
        setLocating(true);

        try {
            await getLocation();
        } catch (e: any) {
            setError(e.message ?? 'Location পাওয়া যাচ্ছে না।');
        } finally {
            setLocating(false);
        }
    }

    useEffect(() => {
        if (!window.isSecureContext) {
            setError(
                'GPS location পেতে HTTPS দরকার (অথবা localhost)। এখন HTTP-তে আছেন, তাই browser location block করছে।',
            );
            return;
        }

        detectLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function submitAttendance(action: 'check-in' | 'check-out') {
        setError('');
        setLoading(action === 'check-in' ? 'in' : 'out');

        try {
            const location = await getLocation();
            await axios.post(`/attendance/${action}`, location);
            window.location.reload();
        } catch (e: any) {
            setError(
                e.response?.data?.message ??
                    e.response?.data?.errors?.location?.[0] ??
                    e.response?.data?.errors?.attendance?.[0] ??
                    e.message ??
                    'Attendance request ব্যর্থ হয়েছে।',
            );
        } finally {
            setLoading(null);
        }
    }

    return (
        <AppLayout>
            <Head title="Attendance" />

            <PageHeader icon="location" title="Attendance" subtitle={`${office.name} · radius ${office.radius}m`}>
                <button type="button" onClick={detectLocation} disabled={locating} className="btn-ghost">
                    <Icon name="location" size={18} />
                    {locating ? 'Detecting...' : 'Detect my location'}
                </button>
            </PageHeader>

            <div className="card p-4">
                <div className="my-1 h-80 overflow-hidden rounded-xl border border-line">
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
                            <Popup>{office.name}</Popup>
                        </Marker>

                        <RecenterMap current={current} office={officePosition} />

                        {current && currentRef.current && (
                            <Marker position={currentRef.current} icon={currentIcon}>
                                <Popup>Your current location</Popup>
                            </Marker>
                        )}

                        {attendance?.check_in_latitude != null && attendance?.check_in_longitude != null && (
                            <Marker position={[attendance.check_in_latitude, attendance.check_in_longitude]} icon={checkInIcon}>
                                <Popup>Check In location</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                <div className="mt-4 space-y-1 text-sm text-muted">
                    {current ? (
                        <>
                            <p>
                                Latitude: {current[0].toFixed(7)} · Longitude: {current[1].toFixed(7)}{' '}
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href={`https://www.openstreetmap.org/?mlat=${current[0]}&mlon=${current[1]}#map=17/${current[0]}/${current[1]}`}
                                    className="text-brand-3 hover:underline"
                                >
                                    View detected location
                                </a>
                            </p>
                            {accuracy != null && (
                                <p className={accuracy > office.max_accuracy ? 'text-warn' : ''}>
                                    GPS accuracy: {Math.round(accuracy)}m
                                    {accuracy > office.max_accuracy &&
                                        ` (weak — ${office.max_accuracy}m-এর বেশি; approximate location)`}
                                </p>
                            )}
                            {distance != null && (
                                <p className={distance <= office.radius ? 'text-ok' : 'text-danger'}>
                                    Distance from office: {Math.round(distance)}m{' '}
                                    {distance <= office.radius ? '(inside ✓)' : '(outside — flagged ⚠️)'}
                                </p>
                            )}
                            {distance != null && distance > 2000 && (
                                <p className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-warn-soft">
                                    ⚠️ আপনার device যা location দিচ্ছে তা office থেকে প্রায়{' '}
                                    {Math.round(distance / 1000)} km দূরে। এটা সাধারণত device-এর location ভুল
                                    হওয়ার কারণে হয় — VPN বন্ধ করুন, mock/fake GPS বন্ধ করুন, এবং ফোনে GPS দিয়ে
                                    খোলা জায়গা থেকে আবার চেষ্টা করুন।
                                </p>
                            )}
                        </>
                    ) : (
                        <p>
                            যেকোনো জায়গা থেকে Check In/Out করা যাবে। Office radius থেকে বাইরে হলে attendance
                            flag করা হবে।
                        </p>
                    )}
                </div>

                {error && (
                    <p role="alert" className="my-3 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger-soft">
                        {error}
                    </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        disabled={loading !== null || alreadyCheckedIn}
                        onClick={() => submitAttendance('check-in')}
                        className="inline-flex items-center gap-2 rounded-xl border border-ok/50 bg-ok/15 px-6 py-3 font-semibold text-ok-soft transition hover:bg-ok/25 disabled:opacity-50"
                    >
                        <Icon name="userOk" size={18} />
                        {loading === 'in' ? 'Please wait...' : 'Check In'}
                    </button>

                    <button
                        type="button"
                        disabled={loading !== null || !alreadyCheckedIn || alreadyCheckedOut}
                        onClick={() => submitAttendance('check-out')}
                        className="inline-flex items-center gap-2 rounded-xl border border-info/50 bg-info/15 px-6 py-3 font-semibold text-info-soft transition hover:bg-info/25 disabled:opacity-50"
                    >
                        <Icon name="logout" size={18} />
                        {loading === 'out' ? 'Please wait...' : 'Check Out'}
                    </button>
                </div>

                <div className="mt-5 grid gap-2 rounded-xl border border-line-2 bg-panel-3 p-4 text-sm sm:grid-cols-2">
                    <p>
                        <span className="font-medium text-ink-soft">Check In:</span>{' '}
                        {formatDateTime(attendance?.check_in_at)}
                        {attendance?.check_in_distance != null &&
                            ` (${Math.round(attendance.check_in_distance)}m from office)`}
                        {attendance?.check_in_outside && <Badge tone="gold">outside</Badge>}
                    </p>
                    <p>
                        <span className="font-medium text-ink-soft">Check Out:</span>{' '}
                        {formatDateTime(attendance?.check_out_at)}
                        {attendance?.check_out_outside && <Badge tone="gold">outside</Badge>}
                    </p>
                    <p>
                        <span className="font-medium text-ink-soft">Status:</span> {attendance?.status ?? '—'}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}

function RecenterMap({ current, office }: { current: [number, number] | null; office: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds([office]);

        if (current) {
            bounds.extend(current);
        }

        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, office[0], office[1]]);

    return null;
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

function deg2rad(deg: number) {
    return (deg * Math.PI) / 180;
}
