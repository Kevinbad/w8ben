const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manual env loading
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const NEW_USER_EMAIL = 'esterdelduca@hotmail.com';
const NEW_USER_PASSWORD = 'TemporaryPassword123!';
const NEW_USER_NAME = 'Ester Del Duca'; // Adjust as needed
const NEW_USER_SALARY = '350'; // Default, adjust if needed

async function main() {
    console.log(`Creating user: ${NEW_USER_EMAIL}`);

    // 1. Create Auth User
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: NEW_USER_EMAIL,
        password: NEW_USER_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: NEW_USER_NAME }
    });

    if (createError) {
        console.error('Error creating Auth user:', createError.message);
        return;
    }

    console.log(`✅ Auth User created. ID: ${user.id}`);

    // 2. Check/Create Profile
    // (If triggers are active, profile might exist. If not, we insert.)
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (existingProfile) {
        console.log('✅ Profile already created by trigger.');
        // Ensure salary is set if it was missing
        if (!existingProfile.salary) {
            await supabase.from('profiles').update({ salary: NEW_USER_SALARY }).eq('id', user.id);
            console.log('Updated salary on existing profile.');
        }
    } else {
        console.log('⚠️ Profile not found (trigger inactive?). Manual insertion...');
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: NEW_USER_NAME,
                salary: NEW_USER_SALARY,
                onboarding_status: 'started',
                role: 'user',
                // Check if date_of_birth is needed/schema updated
                date_of_birth: '1990-01-01' // Placeholder: User will update this in profile step
            });

        if (profileError) {
            console.error('Error creating profile:', profileError.message);
        } else {
            console.log('✅ Profile manually created.');
        }
    }
}

main();
