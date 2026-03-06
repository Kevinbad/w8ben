'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { W8BenData } from './W8BenWizard'

const financialSchema = z.object({
    dolar_tag: z.string().min(2, "Tag is required").regex(/^[\$a-zA-Z0-9_]+$/, "Invalid format. Use $tag or username"),
})

type FinancialFormValues = z.infer<typeof financialSchema>

interface FinancialStepProps {
    initialData?: W8BenData
    onComplete: (data: W8BenData) => void
    onBack: () => void
}

export function FinancialStep({ initialData, onComplete, onBack }: FinancialStepProps) {
    const defaultValues: Partial<FinancialFormValues> = {
        dolar_tag: initialData?.dolar_tag || '',
    }

    const form = useForm<FinancialFormValues>({
        resolver: zodResolver(financialSchema),
        defaultValues,
    })

    function onSubmit(data: FinancialFormValues) {
        let tag = data.dolar_tag
        if (!tag.startsWith('$')) {
            tag = '$' + tag
        }

        // Pass data to parent, no DB save yet
        onComplete({ dolar_tag: tag })
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>
                    We use DolarApp for payments. Please provide your DolarApp tag.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6 w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/Y66gZK0Ac6Q"
                        title="DolarApp Tutorial"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="dolar_tag" className="block text-sm font-medium text-foreground mb-1">DolarApp Tag</label>
                        <Input
                            {...form.register('dolar_tag')}
                            type="text"
                            placeholder="$username"
                            error={form.formState.errors.dolar_tag?.message}
                        />
                        <p className="mt-2 text-sm text-muted-foreground">
                            Enter your unique DolarApp $tag so we can process your payments.
                        </p>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                        >
                            Back
                        </Button>
                        <Button type="submit">
                            Continue
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
