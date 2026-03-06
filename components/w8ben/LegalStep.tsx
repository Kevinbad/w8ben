'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PDFDocument, rgb } from 'pdf-lib'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { W8BenData } from './W8BenWizard'

interface LegalStepProps {
    formData: W8BenData
    onComplete: () => void
    onBack: () => void
}

export function LegalStep({ formData, onComplete, onBack }: LegalStepProps) {
    const [loading, setLoading] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [signatureText, setSignatureText] = useState('')
    const [agreed, setAgreed] = useState(false)

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (agreed && signatureText.trim().length > 2) {
            setAccepted(true)
        } else {
            setAccepted(false)
        }
    }, [agreed, signatureText])

    // Generate preview PDF on the client
    useEffect(() => {
        async function generatePreview() {
            try {
                // Fetch the blank template from the public folder
                const templateResponse = await fetch('/w8ben.pdf')
                if (!templateResponse.ok) throw new Error('Could not load PDF template')
                const templateBytes = await templateResponse.arrayBuffer()

                const pdfDoc = await PDFDocument.load(templateBytes)
                const form = pdfDoc.getForm()

                try {
                    // Part I
                    form.getTextField('topmostSubform[0].Page1[0].f_1[0]').setText(formData.full_name || '')
                    form.getTextField('topmostSubform[0].Page1[0].f_2[0]').setText(formData.citizenship_country || '')
                    form.getTextField('topmostSubform[0].Page1[0].f_3[0]').setText(formData.address_line1 || '')

                    const cityStateZip = `${formData.address_city || ''}, ${formData.address_state || ''} ${formData.address_postal_code || ''}`
                    form.getTextField('topmostSubform[0].Page1[0].f_4[0]').setText(cityStateZip)
                    form.getTextField('topmostSubform[0].Page1[0].f_5[0]').setText(formData.citizenship_country || '')
                    form.getTextField('topmostSubform[0].Page1[0].f_9[0]').setText(formData.us_tin || '')
                    form.getTextField('topmostSubform[0].Page1[0].f_10[0]').setText(formData.foreign_tin || '')
                    form.getTextField('topmostSubform[0].Page1[0].f_11[0]').setText('')

                    form.getTextField('topmostSubform[0].Page1[0].f_12[0]').setText(formData.date_of_birth || '')

                    // Part II
                    form.getTextField('topmostSubform[0].Page1[0].f_13[0]').setText(formData.citizenship_country || '')

                    // Part III (Signatures) - Live preview as they type
                    form.getTextField('topmostSubform[0].Page1[0].f_21[0]').setText(signatureText || '')

                    try {
                        form.getCheckBox('topmostSubform[0].Page1[0].c1_02[0]').check()
                        const today = new Date()
                        const sigDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}-${today.getFullYear()}`
                        form.getTextField('topmostSubform[0].Page1[0].Date[0]').setText(sigDate)
                    } catch (e) {
                        console.warn("Could not check capacity box or set native date", e)
                    }

                    if (signatureText) {
                        const pages = pdfDoc.getPages()
                        const firstPage = pages[0]
                        firstPage.drawText(signatureText, {
                            x: 160,
                            y: 76,
                            size: 16,
                            color: rgb(0, 0, 0)
                        })
                    }
                } catch (err) {
                    console.log('PDF Field mapping error on preview:', err)
                }

                // Removed form.flatten() here because complex IRS PDFs can crash pdf-lib during flattening.
                // The preview will just show the filled fields un-flattened.
                const pdfBytes = await pdfDoc.save()
                const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
                const blobUrl = URL.createObjectURL(blob)
                setPreviewUrl(blobUrl)

            } catch (error) {
                console.error('Error generating PDF preview', error)
            }
        }

        generatePreview()
    }, [formData, signatureText]) // Re-generate when text changes

    async function handleSubmit() {
        if (!accepted) {
            toast.error('Please accept the agreement and sign with your full name.')
            return
        }

        setLoading(true)
        try {
            // Append signature date to formData
            const finalData = {
                ...formData,
                signature_text: signatureText,
                signature_date: new Date().toISOString()
            }

            // Create form data to send to our API
            const apiFormData = new FormData()
            apiFormData.append('data', JSON.stringify(finalData))

            // Upload via API
            const response = await fetch('/api/upload-w8ben', {
                method: 'POST',
                body: apiFormData
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit W-8BEN form')
            }

            toast.success('Form W-8BEN signed and submitted successfully!')
            onComplete()
        } catch (error: unknown) {
            console.error(error)
            toast.error('Error submitting form: ' + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Form W-8BEN Review & Signature</CardTitle>
                <CardDescription>
                    Please review your generated W-8BEN form to ensure all information is correct before signing.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-8 h-[600px] flex flex-col">
                    <h3 className="font-semibold text-lg mb-2 shrink-0">Form W-8BEN Preview</h3>
                    <p className="text-muted-foreground text-sm mb-4 shrink-0">
                        Review your exact W-8BEN form below. Typing your name in the signature box will update the document in real time.
                    </p>
                    <div className="flex-1 w-full bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden border border-slate-300 dark:border-slate-700">
                        {previewUrl ? (
                            <iframe
                                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full"
                                title="W-8BEN Preview"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="animate-pulse text-muted-foreground">Generating preview...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Signing controls */}
                <div className="mt-8 space-y-6 max-w-lg mx-auto bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start space-x-3">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                            />
                        </div>
                        <div className="text-sm">
                            <label htmlFor="terms" className="font-medium text-foreground cursor-pointer select-none">
                                I certify under penalties of perjury that the information provided is true, correct, and complete.
                            </label>
                            <p className="text-muted-foreground mt-1 text-xs">
                                By checking this box, you acknowledge that you have reviewed the Form W-8BEN and agree to sign it electronically.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="signature" className="block text-sm font-medium text-foreground mb-2">
                            Digital Signature (Type Full Name)
                        </label>
                        <input
                            id="signature"
                            type="text"
                            value={signatureText}
                            onChange={(e) => setSignatureText(e.target.value)}
                            placeholder={`e.g. ${formData.full_name || 'John Doe'}`}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Entering your full name exactly as it appears on the form constitutes your electronic signature.
                        </p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0 mt-4">
                <Button variant="outline" onClick={onBack} disabled={loading}>
                    Back
                </Button>
                <Button onClick={handleSubmit} disabled={!accepted || loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]">
                    {loading ? 'Processing...' : 'Sign & Complete W-8BEN'}
                </Button>
            </CardFooter>
        </Card>
    )
}
