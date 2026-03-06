'use client'

import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CompletionStep() {
    return (
        <Card className="shadow-lg border-green-100 dark:border-green-900">
            <CardContent className="py-12 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold leading-6 text-foreground">W-8BEN Successfully Signed!</h3>
                <div className="mt-4 max-w-xl mx-auto text-base text-muted-foreground">
                    <p className="mb-4">
                        Thank you for completing your registration. Your W-8BEN form has been perfectly generated, digitally signed, and securely saved in our records without any issues.
                    </p>
                    <p className="text-lg font-medium text-foreground">
                        Everything is set up perfectly. Thank you!
                    </p>

                    <p className="mt-6 text-sm italic">
                        Please bookmark this page for future reference.
                    </p>
                </div>

                <div className="mt-8">
                    <Button
                        className="w-full sm:w-auto"
                        size="lg"
                        onClick={() => window.open("https://solvenzainvoices.com", "_blank")}
                    >
                        Go to Solvenza Invoicing Portal
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
