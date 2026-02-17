'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateUserPassword } from '@/app/admin/actions'

export function ResetPasswordButton({ userId, userEmail }: { userId: string, userEmail?: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    async function handleReset() {
        if (!password || password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        try {
            const result = await updateUserPassword(userId, password)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Password updated successfully')
                setOpen(false)
                setPassword('')
            }
        } catch (error) {
            toast.error('Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-blue-400 hover:bg-blue-900/10"
                onClick={() => setOpen(true)}
            >
                <KeyRound className="h-4 w-4" />
            </Button>

            {mounted && open && createPortal(
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                        style={{ zIndex: 99998 }}
                        onClick={() => setOpen(false)}
                    />

                    {/* Modal Content - Centered independently */}
                    <div
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1f36] border border-blue-500/50 rounded-lg shadow-2xl p-6 animate-in zoom-in-95 duration-200"
                        style={{ zIndex: 99999 }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <KeyRound className="h-5 w-5 text-blue-400" />
                                    Admin Override: Reset Password
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Set a new password for <strong className="text-white">{userEmail}</strong>.<br />
                                    The user can use this password to log in immediately.
                                </p>
                            </div>

                            <div className="py-2">
                                <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1 block">New Password</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Type new password here..."
                                    className="w-full bg-[#0f1225] border border-blue-500/30 rounded-md px-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-lg"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setOpen(false)
                                        setPassword('')
                                    }}
                                    className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                >
                                    {loading ? 'Updating...' : 'Set Password'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    )
}
