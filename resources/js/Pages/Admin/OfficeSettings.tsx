import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Field, Flash, PageHeader } from '../../components/ui';
import { LocationPicker, Recenter } from '../../components/LocationPicker';
import '../../lib/leaflet';

type Settings = {
    office_name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
    late_after: string;
    exit_time: string | null;
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
    exit_time: string;
    timezone: string;
    max_accuracy_meters: string | number;
};

const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];

function toNumber(value: unknown, fallback: number): number {
    const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    return Number.isFinite(n) ? n : fallback;
}

export default function OfficeSettings({ settings }: Props) {
    const { errors, flash } = usePage().props;
    const [values, setValues] = useState<FormValues>({ ...settings, exit_time: settings.exit_time ?? '18:00' });
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
        setValues((prev) => ({ ...prev, latitude: lat.toFixed(7), longitude: lng.toFixed(7) }));
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
        if (!search.trim()) return;

        setSearching(true);
        setSearchError('');

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(search)}`;
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
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

            <PageHeader icon="location" title="Office Settings" subtitle="Define your office location and geofence rules." />

            <Flash message={flash?.message} errors={errors} />

            <form onSubmit={save} className="card mt-5 space-y-6 p-6">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[240px] flex-1">
                            <label className="label">Search a place (OpenStreetMap)</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') searchPlace(e);
                                }}
                                placeholder="যেমন: Gulshan, Dhaka"
                                className="input"
                            />
                        </div>
                        <button type="button" onClick={searchPlace} disabled={searching} className="btn-ghost">
                            <Icon name="search" size={18} />
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                        <button type="button" onClick={useMyLocation} className="btn-ghost">
                            <Icon name="location" size={18} /> Use my location
                        </button>
                    </div>

                    {searchError && <p className="text-sm text-danger">{searchError}</p>}

                    <div className="h-[420px] overflow-hidden rounded-xl border border-line">
                        <MapContainer center={mapCenter} zoom={16} className="h-full w-full">
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Recenter position={mapCenter} />
                            <LocationPicker position={mapCenter} radius={radius} onPick={setPosition} />
                        </MapContainer>
                    </div>

                    <p className="text-xs text-muted">
                        Map-এ যেকোনো জায়গায় click করুন বা pin টেনে (drag) office-এর অবস্থান ঠিক করুন। সবুজ
                        circle হলো geofence radius।
                    </p>
                </div>

                <Field label="Office name">
                    <input type="text" className="input" value={values.office_name} onChange={(e) => update('office_name', e.target.value)} />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Latitude">
                        <input type="number" step="any" className="input" value={values.latitude} onChange={(e) => update('latitude', e.target.value)} />
                    </Field>
                    <Field label="Longitude">
                        <input type="number" step="any" className="input" value={values.longitude} onChange={(e) => update('longitude', e.target.value)} />
                    </Field>
                    <Field label="Geofence radius (meters)">
                        <input type="number" className="input" value={values.radius_meters} onChange={(e) => update('radius_meters', e.target.value)} />
                    </Field>
                    <Field label="Late after (office time)">
                        <input type="time" className="input" value={values.late_after} onChange={(e) => update('late_after', e.target.value)} />
                    </Field>
                    <Field label="Exit time (office time)">
                        <input type="time" className="input" value={values.exit_time} onChange={(e) => update('exit_time', e.target.value)} />
                    </Field>
                    <Field label="Max GPS accuracy (meters)">
                        <input type="number" className="input" value={values.max_accuracy_meters} onChange={(e) => update('max_accuracy_meters', e.target.value)} />
                    </Field>
                    <Field label="Timezone">
                        <input type="text" className="input" list="timezone-list" value={values.timezone} onChange={(e) => update('timezone', e.target.value)} />
                        <datalist id="timezone-list">
                            <option value="Asia/Dhaka" />
                            <option value="Asia/Kolkata" />
                            <option value="UTC" />
                        </datalist>
                    </Field>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : 'Save settings'}
                </button>
            </form>
        </AppLayout>
    );
}
