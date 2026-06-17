import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'

/**
 * Login page with demo/mock authentication.
 * Uses demo credentials — no backend required.
 */
export default function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields')
            return
        }

        setIsLoading(true)

        // Simulate network delay
        await new Promise(r => setTimeout(r, 800))

        // Demo authentication — accept any valid-looking credentials
        const DEMO_TENANT_ID = 'demo-tenant-001'
        const mockUser = {
            id: 'user-001',
            name: 'Admin User',
            email: email.trim().toLowerCase(),
            role: 'admin',
            tenant_id: DEMO_TENANT_ID,
        }

        localStorage.setItem('token', 'demo-token-' + Date.now())
        localStorage.setItem('user', JSON.stringify(mockUser))

        navigate(`/merchant/${DEMO_TENANT_ID}/dashboard`)

        setIsLoading(false)
    }, [email, password, navigate])

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 pt-20 pb-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="text-2xl font-bold text-text-primary hover:text-primary-500 transition-colors">
                        DinenDash
                    </Link>
                    <h1 className="text-3xl font-bold text-text-primary mt-6 mb-2">Welcome Back</h1>
                    <p className="text-text-secondary">Sign in to your restaurant dashboard</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-dark-xl space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@restaurant.com"
                            className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full bg-dark-bg border border-dark-border text-text-primary py-3 px-4 rounded-lg placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                        Sign In
                    </Button>

                    <p className="text-center text-sm text-text-tertiary">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-primary-500 hover:text-primary-400 transition-colors font-medium">
                            Sign up free
                        </Link>
                    </p>
                </form>

                {/* Demo credentials hint */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-text-tertiary">
                        Demo: admin@punjabidhaba.com / Test@123
                    </p>
                </div>
            </div>
        </div>
    )
}
