import { useState, useEffect } from 'react'
import axios from 'axios'
import { IconCheckCircle } from './Icons'

const API_BASE = 'http://localhost:4000/api'

interface LeadFormModalProps {
    open: boolean
    onClose: () => void
}

export default function LeadFormModal({ open, onClose }: LeadFormModalProps) {
    const [visible, setVisible] = useState(false)
    const [step, setStep] = useState<'form' | 'success'>('form')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        restaurant_name: '',
        city: '',
        message: '',
    })

    useEffect(() => {
        if (open) requestAnimationFrame(() => setVisible(true))
        else { setVisible(false); setTimeout(() => setStep('form'), 300) }
    }, [open])

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
            setForm({ full_name: '', email: '', phone: '', restaurant_name: '', city: '', message: '' })
            setError(null)
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(f => ({ ...f, [field]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim() || !form.restaurant_name.trim() || !form.city.trim()) {
            setError('Please fill in all required fields')
            return
        }
        setSaving(true)
        setError(null)
        try {
            await axios.post(`${API_BASE}/leads`, form)
            setStep('success')
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to submit')
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    return (
        <>
            <div className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose} />
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300
                            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-6 text-white">
                        <button onClick={onClose}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center
                                       hover:bg-black/60 transition-colors text-white text-lg font-bold leading-none">
                            ✕
                        </button>
                        <h2 className="text-xl font-bold">Become a Partner</h2>
                        <p className="text-sm text-white/80 mt-1">Join our restaurant chain family</p>
                    </div>

                    {step === 'form' ? (
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                    <input value={form.full_name} onChange={handleChange('full_name')}
                                        placeholder="John Doe"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none" />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input type="email" value={form.email} onChange={handleChange('email')}
                                        placeholder="john@restaurant.com"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                                    <input type="tel" value={form.phone} onChange={handleChange('phone')}
                                        placeholder="+91 98765 43210"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                    <input value={form.city} onChange={handleChange('city')}
                                        placeholder="Mumbai"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Restaurant Name <span className="text-red-500">*</span></label>
                                <input value={form.restaurant_name} onChange={handleChange('restaurant_name')}
                                    placeholder="My Restaurant"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-primary-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Message (optional)</label>
                                <textarea value={form.message} onChange={handleChange('message')}
                                    placeholder="Tell us about your vision..."
                                    rows={2}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:border-primary-500 focus:outline-none" />
                            </div>
                            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                            <button type="submit" disabled={saving}
                                className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm
                                           hover:bg-primary-600 disabled:opacity-50 transition-all active:scale-[0.98]">
                                {saving ? 'Submitting...' : 'Submit Inquiry'}
                            </button>
                        </form>
                    ) : (
                        <div className="p-6 text-center">
                            {/* <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"> */}
                            <IconCheckCircle className="w-8 h-8" />
                            {/* </div> */}
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Thank You!</h3>
                            <p className="text-sm text-gray-500 mb-6">We'll review your inquiry and get back to you within 48 hours.</p>
                            <button onClick={onClose}
                                className="px-6 py-2.5 rounded-xl bg-primary-500 text-white font-medium text-sm
                                           hover:bg-primary-600 transition-all">
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
