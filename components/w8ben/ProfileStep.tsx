'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { W8BenData } from './W8BenWizard'

const profileSchema = z.object({
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Valid email is required"),
    date_of_birth: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Required format: MM-DD-YYYY"),
    citizenship_country: z.string().min(2, "Country of citizenship is required"),
    address_line1: z.string().min(5, "Address is required"),
    address_city: z.string().min(2, "City is required"),
    address_state: z.string().min(2, "State/Province is required"),
    address_postal_code: z.string().min(2, "Postal code is required"),
    foreign_tin: z.string().min(4, "Foreign TIN is required"),
    us_tin: z.string().optional(),
    phone: z.string().min(6, "Phone number is required"),
    company: z.string().min(1, "Company is required"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileStepProps {
    initialData?: W8BenData
    onComplete: (data: W8BenData) => void
}

export function ProfileStep({ initialData, onComplete }: ProfileStepProps) {
    const defaultValues: Partial<ProfileFormValues> = {
        full_name: initialData?.full_name || '',
        email: initialData?.email || '',
        date_of_birth: initialData?.date_of_birth || '',
        citizenship_country: initialData?.citizenship_country || '',
        address_line1: initialData?.address_line1 || '',
        address_city: initialData?.address_city || '',
        address_state: initialData?.address_state || '',
        address_postal_code: initialData?.address_postal_code || '',
        foreign_tin: initialData?.foreign_tin || '',
        us_tin: initialData?.us_tin || '',
        phone: initialData?.phone || '',
        company: initialData?.company || '',
    }

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues,
    })

    function onSubmit(data: ProfileFormValues) {
        // Collect data and go next step without hitting DB yet
        onComplete(data)
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Personal details & W-8BEN setup</CardTitle>
                <CardDescription>
                    Please provide your details exactly as they appear on your legal documents and tax filings. This is required for your W-8BEN form.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                            <Input
                                {...form.register('full_name')}
                                type="text"
                                error={form.formState.errors.full_name?.message}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                            <Input
                                {...form.register('email')}
                                type="email"
                                error={form.formState.errors.email?.message}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Date of Birth</label>
                            <Input
                                {...form.register('date_of_birth')}
                                type="text"
                                placeholder="MM-DD-YYYY"
                                error={form.formState.errors.date_of_birth?.message}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                            <Input
                                {...form.register('phone')}
                                type="tel"
                                error={form.formState.errors.phone?.message}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Company</label>
                            <Input
                                {...form.register('company')}
                                type="text"
                                placeholder="e.g. Flex Global"
                                error={form.formState.errors.company?.message}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-foreground mb-1">Country of Citizenship</label>
                            <Input
                                {...form.register('citizenship_country')}
                                type="text"
                                error={form.formState.errors.citizenship_country?.message}
                            />
                        </div>

                        <div className="sm:col-span-6 border-b border-border pb-2 pt-4">
                            <h3 className="text-lg font-medium">Permanent Resident Address</h3>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-foreground mb-1">Street Address, Apt or Suite</label>
                            <Input
                                {...form.register('address_line1')}
                                type="text"
                                error={form.formState.errors.address_line1?.message}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">City or Town</label>
                            <Input
                                {...form.register('address_city')}
                                type="text"
                                error={form.formState.errors.address_city?.message}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">State / Province</label>
                            <Input
                                {...form.register('address_state')}
                                type="text"
                                error={form.formState.errors.address_state?.message}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Postal Code</label>
                            <Input
                                {...form.register('address_postal_code')}
                                type="text"
                                error={form.formState.errors.address_postal_code?.message}
                            />
                        </div>

                        <div className="sm:col-span-6 border-b border-border pb-2 pt-4">
                            <h3 className="text-lg font-medium">Tax Identification</h3>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-foreground mb-1">Foreign Tax Identifying Number (TIN)</label>
                            <Input
                                {...form.register('foreign_tin')}
                                type="text"
                                placeholder="Your national ID or tax number"
                                error={form.formState.errors.foreign_tin?.message}
                            />
                            <p className="text-xs text-muted-foreground mt-1">DNI, Cédula, RFC, etc.</p>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-foreground mb-1">US Taxpayer ID (If any)</label>
                            <Input
                                {...form.register('us_tin')}
                                type="text"
                                placeholder="SSN or ITIN (Optional)"
                                error={form.formState.errors.us_tin?.message}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Leave blank if you don't have one.</p>
                        </div>

                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit">
                            Continue
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
