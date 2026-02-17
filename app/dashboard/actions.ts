'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getVerifiedProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Use Admin Client to bypass RLS and ensure we get the salary/contract data
    const adminSupabase = createAdminClient()
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}
