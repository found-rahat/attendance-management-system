import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import AppLayout from '../../Layouts/AppLayout';
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
                () =>
                    reject(
                        new Error('Location permission দিন এবং GPS চালু করুন।'),
                    ),
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                },
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
            <Head title="Staff Attendance" />

            <main className="mx-auto max-w-5xl space-y-5 p-4">
                <h1 className="text-2xl font-bold">Staff Attendance</h1>

                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">{office.name}</h2>
                            <p className="text-sm text-gray-600">
                                Office radius: {office.radius} meters · Latitude{' '}
                                {office.latitude.toFixed(6)} · Longitude{' '}
                                {office.longitude.toFixed(6)}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={detectLocation}
                            disabled={locating}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                        >
                            {locating ? 'Detecting...' : '📍 Detect my location'}
                        </button>
                    </div>

                    <div className="my-4 h-80 overflow-hidden rounded-lg border">
                        <MapContainer
                            center={officePosition}
                            zoom={17}
                            className="h-full w-full"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

                            {attendance?.check_in_latitude != null &&
                                attendance?.check_in_longitude != null && (
                                    <Marker
                                        position={[
                                            attendance.check_in_latitude,
                                            attendance.check_in_longitude,
                                        ]}
                                        icon={checkInIcon}
                                    >
                                        <Popup>Check In location</Popup>
                                    </Marker>
                                )}
                        </MapContainer>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                        {current ? (
                            <>
                                <p>
                                    Latitude: {current[0].toFixed(7)} · Longitude:{' '}
                                    {current[1].toFixed(7)}{' '}
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={`https://www.openstreetmap.org/?mlat=${current[0]}&mlon=${current[1]}#map=17/${current[0]}/${current[1]}`}
                                        className="text-indigo-600 hover:underline"
                                    >
                                        View detected location
                                    </a>
                                </p>
                                {accuracy != null && (
                                    <p
                                        className={
                                            accuracy > office.max_accuracy
                                                ? 'text-amber-600'
                                                : ''
                                        }
                                    >
                                        GPS accuracy: {Math.round(accuracy)}m
                                        {accuracy > office.max_accuracy &&
                                            ` (weak — ${office.max_accuracy}m-এর বেশি; approximate location)`}
                                    </p>
                                )}
                                {distance != null && (
                                    <p
                                        className={
                                            distance <= office.radius
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }
                                    >
                                        Distance from office:{' '}
                                        {Math.round(distance)}m{' '}
                                        {distance <= office.radius
                                            ? '(inside ✓)'
                                            : '(outside — flagged ⚠️)'}
                                    </p>
                                )}
                                {distance != null && distance > 2000 && (
                                    <p className="rounded-md bg-amber-50 p-2 text-amber-700">
                                        ⚠️ আপনার device যা location দিচ্ছে তা office থেকে প্রায়{' '}
                                        {Math.round(distance / 1000)} km দূরে। এটা সাধারণত
                                        device-এর location ভুল হওয়ার কারণে হয় — VPN বন্ধ করুন,
                                        mock/fake GPS বন্ধ করুন, এবং ফোনে GPS দিয়ে খোলা জায়গা
                                        থেকে আবার চেষ্টা করুন।
                                    </p>
                                )}
                            </>
                        ) : (
                            <p>
                                যেকোনো জায়গা থেকে Check In/Out করা যাবে। Office radius থেকে
                                বাইরে হলে attendance flag করা হবে।
                            </p>
                        )}
                    </div>

                    {error && (
                        <p role="alert" className="my-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            disabled={loading !== null || alreadyCheckedIn}
                            onClick={() => submitAttendance('check-in')}
                            className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
                        >
                            {loading === 'in' ? 'Please wait...' : 'Check In'}
                        </button>

                        <button
                            type="button"
                            disabled={loading !== null || !alreadyCheckedIn || alreadyCheckedOut}
                            onClick={() => submitAttendance('check-out')}
                            className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                        >
                            {loading === 'out' ? 'Please wait...' : 'Check Out'}
                        </button>
                    </div>

                    <div className="mt-5 grid gap-1 rounded-md bg-gray-50 p-3 text-sm sm:grid-cols-2">
                        <p>
                            <span className="font-medium">Check In:</span>{' '}
                            {formatDateTime(attendance?.check_in_at)}
                            {attendance?.check_in_distance != null &&
                                ` (${Math.round(attendance.check_in_distance)}m from office)`}
                            {attendance?.check_in_outside && (
                                <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                    outside ⚠️
                                </span>
                            )}
                        </p>
                        <p>
                            <span className="font-medium">Check Out:</span>{' '}
                            {formatDateTime(attendance?.check_out_at)}
                            {attendance?.check_out_outside && (
                                <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                    outside ⚠️
                                </span>
                            )}
                        </p>
                        <p>
                            <span className="font-medium">Status:</span>{' '}
                            {attendance?.status ?? '—'}
                        </p>
                    </div>
                </div>
            </main>
        </AppLayout>
    );
}

function RecenterMap({
    current,
    office,
}: {
    current: [number, number] | null;
    office: [number, number];
}) {
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
