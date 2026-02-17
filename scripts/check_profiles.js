const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log('Listing recent profiles...');
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, salary, onboarding_status, created_at') // Note: email isn't in profiles table usually, but let's check what fields exist.
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) console.error(error);
    else {
        console.log('--- RECENT PROFILES ---');
        // Retrieve emails for these IDs if possible, but profiles table doesn't have email usually.
        // We can just show the profile data.
        profiles.forEach(p => console.log(JSON.stringify(p, null, 2)));
        console.log('-----------------------');
    }
}

main();
