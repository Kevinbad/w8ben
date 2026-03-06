import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, FileText, ShieldCheck } from 'lucide-react'

interface WelcomeStepProps {
    onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <Card className="shadow-lg max-w-2xl mx-auto">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">Form W-8BEN Registration</CardTitle>
                <CardDescription className="text-base mt-2">
                    Certificate of Foreign Status of Beneficial Owner for United States Tax Withholding
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-300">What is this form?</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-400/90 mt-1">
                            The W-8BEN is an official IRS form used by foreign individuals receiving income from U.S. sources. It certifies that you are not a U.S. citizen or resident, and establishes your eligibility for reduced tax withholding rates.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-medium">Why do I need to sign this?</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                            <span><strong>Legal Compliance:</strong> We are required by U.S. tax law to collect this certificate before issuing any payments to you.</span>
                        </li>
                        <li className="flex gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                            <span><strong>Tax Withholding:</strong> Without this form, the IRS mandates a 30% tax withholding on all your earnings. Submitting this form prevents unnecessary withholding.</span>
                        </li>
                    </ul>
                </div>

                <div className="text-sm text-muted-foreground pt-4 border-t">
                    <p><strong>What you will need:</strong></p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Your full legal name and date of birth</li>
                        <li>Your permanent resident address</li>
                        <li>Your Foreign Tax Identifying Number (National ID, DNI, RFC, etc.)</li>
                    </ul>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end pt-2 pb-6 px-6">
                <Button onClick={onNext} className="w-full sm:w-auto min-w-[150px] bg-blue-600 hover:bg-blue-700 text-white">
                    Start Form
                </Button>
            </CardFooter>
        </Card>
    )
}
