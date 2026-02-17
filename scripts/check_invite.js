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

async function main() {
    const email = 'esterdelduca@hotmail.com';
    console.log(`Checking invites for: ${email}`);

    // Check Invites
    const { data: invite, error } = await supabase
        .from('user_invites')
        .select('*')
        .ilike('email', `%${email}%`); // usage of ilike for partial match just in case

    if (error) {
        console.error(error);
        return;
    }

    console.log('--- INVITE RESULTS ---');
    if (invite && invite.length > 0) {
        console.log(invite);
    } else {
        console.log('No invite found.');
    }
}

main();
