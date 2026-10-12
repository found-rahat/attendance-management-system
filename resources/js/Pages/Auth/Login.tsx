import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Login() {
    const { errors } = usePage().props;
    const [values, setValues] = useState({
        email: '',
        password: '',
        remember: false,
    });
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

            <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
                    <h1 className="text-2xl font-bold">Staff Attendance</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Sign in to check in / out at the office.
                    </p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                autoFocus
                                value={values.email}
                                onChange={(e) =>
                                    setValues({ ...values, email: e.target.value })
                                }
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                            />
                            {errors?.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={values.password}
                                onChange={(e) =>
                                    setValues({ ...values, password: e.target.value })
                                }
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                            />
                            {errors?.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Please wait...' : 'Sign in'}
                        </button>
                    </form>

                    <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                        <p className="font-medium">Demo accounts (password: password)</p>
                        <p>super@platform.com — Super admin</p>
                        <p>admin@company.com — Company admin</p>
                        <p>rahim@company.com — Staff</p>
                    </div>
                </div>
            </div>
        </>
    );
}