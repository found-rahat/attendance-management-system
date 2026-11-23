import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../Layouts/AppLayout';
import { Icon } from '../../components/Icons';
import { Badge, PageHeader } from '../../components/ui';
import { formatDateTime } from '../../lib/datetime';

type Session = {
    id: number;
    check_in_company_name: string | null;
    check_in_at: string;
    check_in_latitude: number | null;
    check_in_longitude: number | null;
    check_in_address: string | null;
    check_in_photo: string | null;
    check_in_remarks: string | null;
    check_out_company_name: string | null;
    check_out_at: string | null;
    check_out_address: string | null;
    check_out_photo: string | null;
    check_out_remarks: string | null;
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
    office: Office;
    pending: Session[];
    history: Session[];
};

export default function StaffAttendance({ office, pending, history }: Props) {
    const [locating, setLocating] = useState(false);
    const [current, setCurrent] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [checkInCompany, setCheckInCompany] = useState('');
    const [checkInRemarks, setCheckInRemarks] = useState('');
    const [checkInPhoto, setCheckInPhoto] = useState<File | null>(null);
    const [checkInPhotoUrl, setCheckInPhotoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);

    const [exitSession, setExitSession] = useState<Session | null>(null);
    const [exitCompany, setExitCompany] = useState('');
    const [exitRemarks, setExitRemarks] = useState('');
    const [exitPhoto, setExitPhoto] = useState<File | null>(null);
    const exitFileRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<'pending' | 'complete'>('pending');

    useEffect(() => {
        if (!checkInPhoto) {
            setCheckInPhotoUrl(null);
            return;
        }
        const url = URL.createObjectURL(checkInPhoto);
        setCheckInPhotoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [checkInPhoto]);

    function clearCheckInPhoto() {
        setCheckInPhoto(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    }

    function showPending() {
        setActiveTab('pending');
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('এই device-এ GPS location পাওয়া যাচ্ছে না।'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    setCurrent({ lat: latitude, lng: longitude, accuracy });
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
            setError(e?.message ?? 'Location পাওয়া যাচ্ছে না।');
        } finally {
            setLocating(false);
        }
    }

    useEffect(() => {
        if (window.isSecureContext) {
            detectLocation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (exitSession && window.isSecureContext) {
            detectLocation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exitSession]);

    async function submitCheckIn(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (pending.length > 0) {
            setError('আপনার একটি check-in pending আছে। আগে check out করুন।');
            return;
        }
        if (!current) {
            setError('আগে location detect করুন।');
            return;
        }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('check_in_company_name', checkInCompany);
            fd.append('remarks', checkInRemarks);
            fd.append('latitude', String(current.lat));
            fd.append('longitude', String(current.lng));
            fd.append('accuracy', String(current.accuracy));
            if (checkInPhoto) fd.append('photo', checkInPhoto);
            await axios.post('/checkins/check-in', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCheckInCompany('');
            setCheckInRemarks('');
            clearCheckInPhoto();
            router.reload();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Check in failed.');
        } finally {
            setSubmitting(false);
        }
    }

    async function submitCheckOut(e: React.FormEvent) {
        e.preventDefault();
        if (!exitSession || !current) {
            setError('আগে location detect করুন।');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('check_out_company_name', exitCompany);
            fd.append('remarks', exitRemarks);
            fd.append('latitude', String(current.lat));
            fd.append('longitude', String(current.lng));
            fd.append('accuracy', String(current.accuracy));
            if (exitPhoto) fd.append('photo', exitPhoto);
            await axios.post(`/checkins/${exitSession.id}/check-out`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setExitSession(null);
            setExitCompany('');
            setExitRemarks('');
            setExitPhoto(null);
            if (exitFileRef.current) exitFileRef.current.value = '';
            setActiveTab('complete');
            router.reload();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? 'Check out failed.');
        } finally {
            setSubmitting(false);
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

            {error && (
                <p role="alert" className="my-3 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger-soft">
                    {error}
                </p>
            )}

            {current && (
                <p className="mb-3 text-sm text-muted">
                    Location: {current.lat.toFixed(6)}, {current.lng.toFixed(6)} (±{Math.round(current.accuracy)}m)
                </p>
            )}

            {/* Check In */}
            {pending.length > 0 ? (
                <div className="card mb-5 space-y-3 border-warn/40 bg-warn-bg p-4">
                    <h3 className="font-semibold">Check In</h3>
                    <p className="text-sm text-warn-soft">
                        You already have a pending check-in. Please check out before checking in again.
                    </p>
                    <button type="button" onClick={showPending} className="btn-ghost">
                        View pending check-in
                    </button>
                </div>
            ) : (
                <form onSubmit={submitCheckIn} className="card mb-5 space-y-3 p-4">
                    <h3 className="font-semibold">Check In</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label className="label">Company name</label>
                            <input className="input" value={checkInCompany} onChange={(e) => setCheckInCompany(e.target.value)} />
                        </div>
                        <div>
                            <label className="label">Photo</label>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-ghost">
                                    Upload from gallery
                                </button>
                                <button type="button" onClick={() => cameraInputRef.current?.click()} className="btn-ghost">
                                    Take photo
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setCheckInPhoto(e.target.files?.[0] ?? null)}
                            />
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => setCheckInPhoto(e.target.files?.[0] ?? null)}
                            />
                            {checkInPhotoUrl && (
                                <div className="mt-2 flex items-center gap-2">
                                    <img src={checkInPhotoUrl} alt="check in preview" className="h-20 rounded-lg" />
                                    <button type="button" onClick={clearCheckInPhoto} className="btn-ghost">
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="label">Remarks</label>
                        <textarea className="input" rows={2} value={checkInRemarks} onChange={(e) => setCheckInRemarks(e.target.value)} />
                    </div>
                    <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? 'Saving...' : 'Check In'}
                    </button>
                </form>
            )}

            {/* Exit modal */}
            {exitSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-line bg-panel p-5">
                        <h3 className="mb-3 font-semibold">Check Out</h3>
                        <form onSubmit={submitCheckOut} className="space-y-3">
                            <div>
                                <label className="label">Company name</label>
                                <input className="input" value={exitCompany} onChange={(e) => setExitCompany(e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Photo</label>
                                <input
                                    ref={exitFileRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="input"
                                    onChange={(e) => setExitPhoto(e.target.files?.[0] ?? null)}
                                />
                            </div>
                            <div>
                                <label className="label">Remarks</label>
                                <textarea className="input" rows={2} value={exitRemarks} onChange={(e) => setExitRemarks(e.target.value)} />
                            </div>
                            {current && (
                                <p className="text-xs text-muted">
                                    Location: {current.lat.toFixed(6)}, {current.lng.toFixed(6)} (±{Math.round(current.accuracy)}m)
                                </p>
                            )}
                            <div className="flex flex-wrap justify-end gap-2">
                                <button type="button" onClick={detectLocation} disabled={locating} className="btn-ghost">
                                    {locating ? 'Detecting...' : 'Detect my location'}
                                </button>
                                <button type="button" className="btn-ghost" onClick={() => setExitSession(null)}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="btn-primary">
                                    {submitting ? 'Saving...' : 'Check Out'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History */}
            <div ref={historyRef} className="card p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold">History</h3>
                    <div className="flex gap-1 rounded-xl border border-line bg-panel-2 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('pending')}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                                activeTab === 'pending' ? 'bg-brand/15 text-brand-3' : 'text-muted hover:text-ink'
                            }`}
                        >
                            Pending <Badge tone={activeTab === 'pending' ? 'warn' : 'neutral'}>{pending.length}</Badge>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('complete')}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                                activeTab === 'complete' ? 'bg-brand/15 text-brand-3' : 'text-muted hover:text-ink'
                            }`}
                        >
                            Complete <Badge tone={activeTab === 'complete' ? 'ok' : 'neutral'}>{history.length}</Badge>
                        </button>
                    </div>
                </div>

                {activeTab === 'pending' ? (
                    <div className="space-y-3">
                        {pending.length === 0 && <p className="text-sm text-muted">No pending check-ins.</p>}
                        {pending.map((s) => (
                            <div key={s.id} className="rounded-xl border border-line p-3 text-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="font-medium">{s.check_in_company_name || '—'}</p>
                                        <p className="text-muted">In: {formatDateTime(s.check_in_at)}</p>
                                        {s.check_in_address && <p className="text-xs text-muted">{s.check_in_address}</p>}
                                        {s.check_in_remarks && <p className="text-xs text-muted">{s.check_in_remarks}</p>}
                                        {s.check_in_photo && (
                                            <img src={`/storage/${s.check_in_photo}`} alt="check in" className="mt-2 h-16 rounded-lg" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setExitSession(s);
                                            setExitCompany(s.check_in_company_name || '');
                                        }}
                                        className="btn-ghost"
                                    >
                                        Exit (Check Out)
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.length === 0 && <p className="text-sm text-muted">No completed sessions yet.</p>}
                        {history.map((s) => (
                            <div key={s.id} className="rounded-xl border border-line p-3 text-sm">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{s.check_in_company_name || '—'}</p>
                                        <p className="text-muted">In: {formatDateTime(s.check_in_at)}</p>
                                        {s.check_in_address && <p className="text-xs text-muted">{s.check_in_address}</p>}
                                        {s.check_in_photo && (
                                            <img src={`/storage/${s.check_in_photo}`} alt="in" className="mt-2 h-16 rounded-lg" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{s.check_out_company_name || '—'}</p>
                                        <p className="text-muted">Out: {formatDateTime(s.check_out_at)}</p>
                                        {s.check_out_address && <p className="text-xs text-muted">{s.check_out_address}</p>}
                                        {s.check_out_photo && (
                                            <img src={`/storage/${s.check_out_photo}`} alt="out" className="mt-2 h-16 rounded-lg" />
                                        )}
                                    </div>
                                </div>
                                {(s.check_in_remarks || s.check_out_remarks) && (
                                    <p className="mt-2 text-xs text-muted">
                                        {s.check_in_remarks} {s.check_out_remarks ? `→ ${s.check_out_remarks}` : ''}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
