import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle2 } from 'lucide-react'

const API_BASE = 'http://localhost:4000/api'

interface LeadFormModalProps {
    open: boolean
    onClose: () => void
}

export default function LeadFormModal({ open, onClose }: LeadFormModalProps) {
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
        if (open) {
            setForm({ full_name: '', email: '', phone: '', restaurant_name: '', city: '', message: '' })
            setError(null)
            setStep('form')
        }
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

    return (
        <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-6 text-primary-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-primary-foreground">Become a Partner</DialogTitle>
                        <DialogDescription className="text-sm text-primary-foreground/80">
                            Join our restaurant chain family
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {step === 'form' ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-semibold text-text-primary mb-1">
                                    Full Name <span className="text-status-occupied">*</span>
                                </label>
                                <Input value={form.full_name} onChange={handleChange('full_name')}
                                    placeholder="John Doe" />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-xs font-semibold text-text-primary mb-1">
                                    Email <span className="text-status-occupied">*</span>
                                </label>
                                <Input type="email" value={form.email} onChange={handleChange('email')}
                                    placeholder="john@restaurant.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-text-primary mb-1">
                                    Phone <span className="text-status-occupied">*</span>
                                </label>
                                <Input type="tel" value={form.phone} onChange={handleChange('phone')}
                                    placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-primary mb-1">
                                    City <span className="text-status-occupied">*</span>
                                </label>
                                <Input value={form.city} onChange={handleChange('city')}
                                    placeholder="Mumbai" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-primary mb-1">
                                Restaurant Name <span className="text-status-occupied">*</span>
                            </label>
                            <Input value={form.restaurant_name} onChange={handleChange('restaurant_name')}
                                placeholder="My Restaurant" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Message (optional)
                            </label>
                            <Textarea value={form.message} onChange={handleChange('message')}
                                placeholder="Tell us about your vision..."
                                rows={2} />
                        </div>
                        {error && (
                            <p className="text-sm text-status-occupied bg-red-50 rounded-lg px-3 py-2" role="alert">
                                {error}
                            </p>
                        )}
                        <Button type="submit" disabled={saving} className="w-full" size="lg">
                            {saving && <Loader2 className="animate-spin" />}
                            {saving ? 'Submitting...' : 'Submit Inquiry'}
                        </Button>
                    </form>
                ) : (
                    <div className="p-6 text-center space-y-4">
                        <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                        <div>
                            <h3 className="text-lg font-bold text-foreground mb-1">Thank You!</h3>
                            <p className="text-sm text-muted-foreground">
                                We&apos;ll review your inquiry and get back to you within 48 hours.
                            </p>
                        </div>
                        <Button variant="default" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
