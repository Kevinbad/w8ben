'use client'

import { useState } from 'react'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { WelcomeStep } from './WelcomeStep'
import { ProfileStep } from './ProfileStep'
import { LegalStep } from './LegalStep'
import { CompletionStep } from '@/components/onboarding/CompletionStep'

const STEPS = ['Introduction', 'Personal & Address', 'W-8BEN & Sign', 'Complete']

export interface W8BenData {
    email?: string;
    full_name?: string;
    date_of_birth?: string;
    company?: string;
    government_id?: string;
    address_line1?: string;
    address_city?: string;
    address_state?: string;
    address_postal_code?: string;
    citizenship_country?: string;
    foreign_tin?: string;
    us_tin?: string;
    phone?: string;
    dolar_tag?: string;
}

export default function W8BenWizard() {
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState<W8BenData>({})

    const handleNext = (stepData?: Partial<W8BenData>) => {
        if (stepData) {
            setFormData(prev => ({ ...prev, ...stepData }))
        }
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8">
            <StepIndicator currentStep={currentStep} steps={STEPS} />

            <div className="mt-8 transition-all duration-500 ease-in-out">
                {currentStep === 0 && (
                    <WelcomeStep onNext={() => handleNext({})} />
                )}

                {currentStep === 1 && (
                    <ProfileStep
                        initialData={formData}
                        onComplete={handleNext}
                    />
                )}

                {currentStep === 2 && (
                    <LegalStep
                        formData={formData}
                        onComplete={handleNext}
                        onBack={handleBack}
                    />
                )}

                {currentStep === 3 && (
                    <CompletionStep />
                )}
            </div>
        </div>
    )
}
