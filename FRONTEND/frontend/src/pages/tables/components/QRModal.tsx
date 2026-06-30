/* ============================================
   QRModal — Displays a QR code for a table's order page
   ============================================ */

import { useEffect, useState, useCallback } from 'react'
import QRCode from 'react-qr-code'
import { type TableData } from '../constants'

interface QRModalProps {
    table: TableData | null
    open: boolean
    onClose: () => void
}

/**
 * Slide-up modal showing a large QR code for the table's order page.
 * Customers scan this to view the menu and place orders.
 */
export default function QRModal({ table, open, onClose }: QRModalProps) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (open) {
            requestAnimationFrame(() => setVisible(true))
        } else {
            setVisible(false)
        }
    }, [open])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [open, handleKeyDown])

    if (!open || !table) return null

    const qrValue = table.qrCode || `${window.location.origin}/order/${table.id}`

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-300
                            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-auto text-center">
                    {/* Close button */}
                    <div className="flex justify-end -mt-3 -mr-3">
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full
                                       bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center mb-4">
                        <QRCode value={qrValue} size={220} />
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Table {table.number}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {table.floor}{table.section ? ` · ${table.section}` : ''}
                    </p>

                    <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
                        <p className="text-xs text-gray-400 font-mono break-all select-all">
                            {qrValue}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(qrValue)
                            // Simple feedback without toast library
                            const btn = document.getElementById('copy-qr-btn')
                            if (btn) btn.textContent = '✓ Copied!'
                            setTimeout(() => {
                                if (btn) btn.textContent = 'Copy Link'
                            }, 2000)
                        }}
                        id="copy-qr-btn"
                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl
                                   bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    >
                        Copy Link
                    </button>

                    <p className="text-xs text-gray-400 mt-3">
                        Scan to view menu &amp; place orders
                    </p>
                </div>
            </div>
        </>
    )
}
