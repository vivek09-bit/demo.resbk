import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'


function Step1({
    data,
    setData,
    onNext,
}: {
    data: Record<string, any>
    setData: (d: Record<string, any>) => void
    onNext: () => void
}) {
    const [error, setError] = useState('')

    const handleNext = () => {
        if (!data.owner_name?.trim() || !data.email?.trim() || !data.password?.trim()) {
            setError('Please fill in all required fields')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            setError('Please enter a valid email address')
            return
        }
        if (data.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }
        setError('')
        onNext()
    }

    return (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-dark-xl space-y-6">
            <h2 className="text-xl font-bold text-text-primary">Account Details</h2>
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg" role="alert">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="owner_name" className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                <input
                    id="owner_name"
                    value={data.owner_name || ''}
                    onChange={(e) => setData({ ...data, owner_name: e.target.value })}
                    placeholder="Raj Singh"
                    className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                />
            </div>
            <div>
                <label htmlFor="reg_email" className="block text-sm font-medium text-text-secondary mb-2">Business Email</label>
                <input
                    id="reg_email"
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="you@restaurant.com"
                    className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                />
            </div>
            <div>
                <label htmlFor="reg_password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                <input
                    id="reg_password"
                    type="password"
                    value={data.password || ''}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                />
            </div>
            <div className="flex justify-end">
                <Button variant="primary" size="md" onClick={handleNext}>Next Step</Button>
            </div>
        </div>
    )
}

/**
 * Step 2: Business info — restaurant name, address, cuisine, logo.
 */
function Step2({
    data,
    setData,
    onNext,
    onBack,
}: {
    data: Record<string, any>
    setData: (d: Record<string, any>) => void
    onNext: () => void
    onBack: () => void
}) {
    const [error, setError] = useState('')

    const handleNext = () => {
        if (!data.business_name?.trim() || !data.address?.trim()) {
            setError('Please fill in business name and address')
            return
        }
        setError('')
        onNext()
    }

    return (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-dark-xl space-y-6">
            <h2 className="text-xl font-bold text-text-primary">Business Information</h2>
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg" role="alert">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-text-secondary mb-2">Restaurant Name</label>
                <input
                    id="business_name"
                    value={data.business_name || ''}
                    onChange={(e) => setData({ ...data, business_name: e.target.value })}
                    placeholder="Punjabi Dhaba"
                    className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-2">Address</label>
                <textarea
                    id="address"
                    value={data.address || ''}
                    onChange={(e) => setData({ ...data, address: e.target.value })}
                    placeholder="123, MG Road, Connaught Place, New Delhi"
                    rows={3}
                    className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors resize-none"
                />
            </div>
            <div>
                <label htmlFor="cuisine_type" className="block text-sm font-medium text-text-secondary mb-2">Cuisine Type (optional)</label>
                <input
                    id="cuisine_type"
                    value={data.cuisine_type || ''}
                    onChange={(e) => setData({ ...data, cuisine_type: e.target.value })}
                    placeholder="North Indian, Chinese, Cafe..."
                    className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                />
            </div>
            <div>
                <label htmlFor="logo_file" className="block text-sm font-medium text-text-secondary mb-2">Logo (optional)</label>
                <input
                    id="logo_file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setData({ ...data, logo_file: e.target.files?.[0] })}
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600 file:cursor-pointer cursor-pointer"
                />
            </div>
            <div className="flex justify-between">
                <Button variant="outline" size="md" onClick={onBack}>Back</Button>
                <Button variant="primary" size="md" onClick={handleNext}>Next Step</Button>
            </div>
        </div>
    )
}

/**
 * Step 3: Operations — operating hours for each day of the week.
 */
function Step3({
    data,
    setData,
    onBack,
    onSubmit,
}: {
    data: Record<string, any>
    setData: (d: Record<string, any>) => void
    onBack: () => void
    onSubmit: () => void
}) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    const setHours = (day: string, field: 'open' | 'close', value: string) => {
        setData({
            ...data,
            operating_hours: {
                ...(data.operating_hours || {}),
                [day]: { ...((data.operating_hours || {})[day] || {}), [field]: value },
            },
        })
    }

    return (
        <div className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-dark-xl space-y-6">
            <h2 className="text-xl font-bold text-text-primary">Operating Hours</h2>
            <p className="text-sm text-text-secondary">Set your restaurant&apos;s operating hours for each day.</p>
            <div className="space-y-3">
                {days.map((day) => (
                    <div key={day} className="flex items-center gap-3 py-2 border-b border-dark-border last:border-b-0">
                        <label className="capitalize w-24 text-sm font-medium text-text-primary">{day}</label>
                        <input
                            type="time"
                            value={(data.operating_hours?.[day]?.open) || '09:00'}
                            onChange={(e) => setHours(day, 'open', e.target.value)}
                            className="bg-dark-bg border border-dark-border text-text-primary py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                        <span className="text-text-tertiary">—</span>
                        <input
                            type="time"
                            value={(data.operating_hours?.[day]?.close) || '22:00'}
                            onChange={(e) => setHours(day, 'close', e.target.value)}
                            className="bg-dark-bg border border-dark-border text-text-primary py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-between pt-2">
                <Button variant="outline" size="md" onClick={onBack}>Back</Button>
                <Button variant="primary" size="lg" onClick={onSubmit}>Create Account</Button>
            </div>
        </div>
    )
}

/**
 * Company registration page with 3-step wizard:
 * 1. Account Details → 2. Business Info → 3. Operating Hours
 * Posts to POST /api/v1/auth/register-tenant on completion.
 */
export default function RegisterPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [data, setData] = useState<Record<string, any>>({
        owner_name: '',
        email: '',
        password: '',
        business_name: '',
        address: '',
        cuisine_type: '',
        operating_hours: {},
    })

    async function submit() {
        setLoading(true)
        setError(null)

        // Simulate network delay
        await new Promise(r => setTimeout(r, 1000))

        // Mock registration — store demo data locally
        const DEMO_TENANT_ID = 'demo-tenant-' + String(Date.now()).slice(-6)
        const mockTenant = {
            id: DEMO_TENANT_ID,
            name: data.business_name || 'My Restaurant',
            owner_name: data.owner_name,
            email: data.email,
            address: data.address,
            cuisine_type: data.cuisine_type ? data.cuisine_type.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            currency: 'INR',
            operating_hours: data.operating_hours,
        }

        localStorage.setItem('token', 'demo-token-' + Date.now())
        localStorage.setItem('tenant', JSON.stringify(mockTenant))
        localStorage.setItem('user', JSON.stringify({
            id: 'user-' + String(Date.now()).slice(-6),
            name: data.owner_name,
            email: data.email,
            role: 'admin',
            tenant_id: DEMO_TENANT_ID,
        }))
        setSuccess(true)

        // Redirect to dashboard after short delay
        setTimeout(() => {
            navigate(`/merchant/${DEMO_TENANT_ID}/dashboard`)
        }, 2000)

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 pt-20 pb-12">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-2xl font-bold text-text-primary hover:text-primary-500 transition-colors">
                        DinenDash
                    </Link>
                    <h1 className="text-3xl font-bold text-text-primary mt-6 mb-2">Register Your Restaurant</h1>
                    <p className="text-text-secondary">Create your account in 3 simple steps</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${s === step
                                    ? 'bg-primary-500 text-white'
                                    : s < step
                                        ? 'bg-green-500 text-white'
                                        : 'bg-dark-surface border border-dark-border text-text-tertiary'
                                    }`}
                            >
                                {s < step ? '✓' : s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`w-12 h-0.5 transition-colors ${s < step ? 'bg-green-500' : 'bg-dark-border'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-center text-sm text-text-tertiary mb-8">
                    Step {step} of 3 — {step === 1 ? 'Account Details' : step === 2 ? 'Business Information' : 'Operating Hours'}
                </p>

                {/* Global error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6 text-center" role="alert">
                        {error}
                    </div>
                )}

                {/* Success message */}
                {success ? (
                    <div className="bg-dark-surface border border-green-500/30 rounded-xl p-8 shadow-dark-xl text-center space-y-4">
                        <div className="text-5xl" aria-hidden="true">🎉</div>
                        <h2 className="text-2xl font-bold text-text-primary">Registration Successful!</h2>
                        <p className="text-text-secondary">Redirecting to your dashboard...</p>
                    </div>
                ) : (
                    <>
                        {step === 1 && (
                            <Step1 data={data} setData={setData} onNext={() => setStep(2)} />
                        )}
                        {step === 2 && (
                            <Step2
                                data={data}
                                setData={setData}
                                onNext={() => setStep(3)}
                                onBack={() => setStep(1)}
                            />
                        )}
                        {step === 3 && (
                            <Step3
                                data={data}
                                setData={setData}
                                onBack={() => setStep(2)}
                                onSubmit={submit}
                            />
                        )}

                        {loading && (
                            <div className="mt-6 text-center text-text-secondary">
                                <span className="inline-block animate-spin mr-2">⏳</span>
                                Creating your restaurant account...
                            </div>
                        )}

                        {/* Login link */}
                        <p className="text-center text-sm text-text-tertiary mt-8">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-500 hover:text-primary-400 transition-colors font-medium">
                                Sign in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
