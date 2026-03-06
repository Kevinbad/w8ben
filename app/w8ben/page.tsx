import W8BenWizard from '@/components/w8ben/W8BenWizard'

export const metadata = {
    title: 'W-8BEN Form & Onboarding',
    description: 'Complete your W-8BEN tax form and onboarding details.',
}

export default function W8BenPage() {
    return (
        <div className="min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Contractor Onboarding & W-8BEN
                    </h1>
                    <p className="text-slate-400">
                        Please provide your details to automatically generate your W-8BEN tax form and complete your onboarding.
                    </p>
                </div>

                <W8BenWizard />
            </div>
        </div>
    )
}
