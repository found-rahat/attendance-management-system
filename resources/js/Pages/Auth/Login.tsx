import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Icon } from '../../components/Icons';
import Logo from '../../components/Logo';
import ThemeToggle from '../../components/ThemeToggle';
import { Field } from '../../components/ui';

export default function Login() {
    const { errors } = usePage().props;
    const [values, setValues] = useState({ email: '', password: '', remember: false });
    const [submitting, setSubmitting] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/login', values, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <>
            <Head title="Login" />

            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>

            <div className="flex min-h-screen items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    <div className="mb-6 text-center">
                        <div className="flex justify-center">
                            <Logo />
                        </div>
                        <p className="mt-4 text-sm text-muted">Sign in to check in / out at your office.</p>
                    </div>

                    <div className="card p-8">
                        <form onSubmit={submit} className="space-y-4">
                            <Field label="Email">
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    value={values.email}
                                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                                    className="input"
                                />
                            </Field>

                            <Field label="Password">
                                <input
                                    type="password"
                                    required
                                    value={values.password}
                                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                                    className="input"
                                />
                            </Field>

                            <label className="flex items-center gap-2 text-sm text-ink-soft">
                                <input
                                    type="checkbox"
                                    checked={values.remember}
                                    onChange={(e) => setValues({ ...values, remember: e.target.checked })}
                                    className="h-4 w-4 accent-[#8b2cf5]"
                                />
                                Remember me
                            </label>

                            {errors?.email && (
                                <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger-soft">
                                    {errors.email}
                                </p>
                            )}

                            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
                                <Icon name="logout" size={18} />
                                {submitting ? 'Please wait...' : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <div className="card mt-4 p-4 text-xs text-muted">
                        <p className="font-medium text-ink-soft">Demo accounts (password: password)</p>
                        <p>super@platform.com — Super admin</p>
                        <p>admin@company.com — Company admin</p>
                        <p>rahim@company.com — Staff</p>
                    </div>
                </div>
            </div>
        </>
    );
}
