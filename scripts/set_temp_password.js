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
    console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const USERS = [
    'rbarros963@hotmail.com',
    'esterdelduca@hotmail.com'
];

const TEMP_PASSWORD = 'TemporaryPassword123!';

async function main() {
    console.log(`Setting temporary password: "${TEMP_PASSWORD}" for users:\n`, USERS);

    // Fetch all users to find IDs
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    for (const email of USERS) {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            console.error(`❌ User NOT FOUND: ${email}`);
            continue;
        }

        console.log(`Found user ${email} (ID: ${user.id}). Updating password...`);

        const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: TEMP_PASSWORD }
        );

        if (updateError) {
            console.error(`❌ Failed to update ${email}: ${updateError.message}`);
        } else {
            console.log(`✅ Success: Password updated for ${email}`);
        }
    }
}

main();
