import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import AppLayout from '../../Layouts/AppLayout';
import { LocationPicker, Recenter } from '../../components/LocationPicker';
import '../../lib/leaflet';

type Settings = {
    office_name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    late_after: string;
    timezone: string;
    max_accuracy_meters: number;
};

type Props = {
    settings: Settings;
};

type FormValues = {
    office_name: string;
    latitude: string | number;
    longitude: string | number;
    radius_meters: string | number;
    late_after: string;
    timezone: string;
    max_accuracy_meters: string | number;
};

const commonInput =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none';

const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];

function toNumber(value: unknown, fallback: number): number {
    const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    return Number.isFinite(n) ? n : fallback;
}

export default function OfficeSettings({ settings }: Props) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState<FormValues>(settings);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');

    const mapCenter: [number, number] =
        toNumber(values.latitude, 0) !== 0 || toNumber(values.longitude, 0) !== 0
            ? [toNumber(values.latitude, DEFAULT_CENTER[0]), toNumber(values.longitude, DEFAULT_CENTER[1])]
            : DEFAULT_CENTER;
    const radius = Math.max(10, toNumber(values.radius_meters, 100));

    function update(field: keyof FormValues, value: string) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    function setPosition(lat: number, lng: number) {
        setValues((prev) => ({
            ...prev,
            latitude: lat.toFixed(7),
            longitude: lng.toFixed(7),
        }));
    }

    function useMyLocation() {
        if (!navigator.geolocation) {
            setSearchError('This device has no GPS support.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition(pos.coords.latitude, pos.coords.longitude),
            () => setSearchError('Could not get your location. Allow permission and try again.'),
            { enableHighAccuracy: true, timeout: 15000 },
        );
    }

    async function searchPlace(e: React.FormEvent) {
        e.preventDefault();
        if (!search.trim()) {
            return;
        }

        setSearching(true);
        setSearchError('');

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(search)}`;
            const res = await fetch(url, {
                headers: { Accept: 'application/json' },
            });
            const data = await res.json();

            if (Array.isArray(data) && data.length > 0) {
                setPosition(parseFloat(data[0].lat), parseFloat(data[0].lon));
            } else {
                setSearchError('কোনো location পাওয়া যায়নি।');
            }
        } catch {
            setSearchError('Search failed. Internet connection check করুন।');
        } finally {
            setSearching(false);
        }
    }

    function save(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.put('/admin/settings', values, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AppLayout>
            <Head title="Office Settings" />

            <main className="mx-auto max-w-4xl space-y-5 p-4">
                <h1 className="text-2xl font-bold">Office Settings (Geofence)</h1>

                {flash?.message && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                        {flash.message}
                    </div>
                )}

                <form onSubmit={save} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                    {/* --- Interactive map picker --- */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="min-w-[240px] flex-1">
                                <label className="block text-sm font-medium">
                                    Search a place (OpenStreetMap)
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            searchPlace(e);
                                        }
                                    }}
                                    placeholder="যেমন: Gulshan, Dhaka"
                                    className={commonInput}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={searchPlace}
                                disabled={searching}
                                className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                            >
                                {searching ? 'Searching...' : 'Search'}
                            </button>
                            <button
                                type="button"
                                onClick={useMyLocation}
                                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
                            >
                                📍 Use my location
                            </button>
                        </div>

                        {searchError && (
                            <p className="text-sm text-red-600">{searchError}</p>
                        )}

                        <div className="h-[420px] overflow-hidden rounded-lg border">
                            <MapContainer center={mapCenter} zoom={16} className="h-full w-full">
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Recenter position={mapCenter} />
                                <LocationPicker
                                    position={mapCenter}
                                    radius={radius}
                                    onPick={setPosition}
                                />
                            </MapContainer>
                        </div>

                        <p className="text-xs text-gray-500">
                            Map-এ যেকোনো জায়গায় click করুন বা pin টেনে (drag) office-এর
                            অবস্থান ঠিক করুন। সবুজ circle হলো geofence radius।
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Office name</label>
                        <input
                            type="text"
                            value={values.office_name}
                            onChange={(e) => update('office_name', e.target.value)}
                            className={commonInput}
                        />
                        {errors?.office_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.office_name}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={values.latitude}
                                onChange={(e) => update('latitude', e.target.value)}
                                className={commonInput}
                            />
                            {errors?.latitude && (
                                <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={values.longitude}
                                onChange={(e) => update('longitude', e.target.value)}
                                className={commonInput}
                            />
                            {errors?.longitude && (
                                <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Geofence radius (meters)
                            </label>
                            <input
                                type="number"
                                value={values.radius_meters}
                                onChange={(e) => update('radius_meters', e.target.value)}
                                className={commonInput}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Staff can only check in / out inside this radius.
                            </p>
                            {errors?.radius_meters && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.radius_meters}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Late after (office time)
                            </label>
                            <input
                                type="time"
                                value={values.late_after}
                                onChange={(e) => update('late_after', e.target.value)}
                                className={commonInput}
                            />
                            {errors?.late_after && (
                                <p className="mt-1 text-sm text-red-600">{errors.late_after}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Max GPS accuracy (meters)
                            </label>
                            <input
                                type="number"
                                value={values.max_accuracy_meters}
                                onChange={(e) => update('max_accuracy_meters', e.target.value)}
                                className={commonInput}
                            />
                            {errors?.max_accuracy_meters && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.max_accuracy_meters}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Timezone</label>
                            <input
                                type="text"
                                value={values.timezone}
                                onChange={(e) => update('timezone', e.target.value)}
                                className={commonInput}
                                list="timezone-list"
                            />
                            <datalist id="timezone-list">
                                <option value="Asia/Dhaka" />
                                <option value="Asia/Kolkata" />
                                <option value="UTC" />
                            </datalist>
                            {errors?.timezone && (
                                <p className="mt-1 text-sm text-red-600">{errors.timezone}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save settings'}
                        </button>
                    </div>
                </form>
            </main>
        </AppLayout>
    );
}