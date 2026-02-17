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
    console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_PASSWORD = 'TemporaryPassword123!';

async function main() {
    console.log('--- Starting Batch Assignment of Invites ---');

    console.log('Fetching invites...');
    // 1. Get all pending invites
    const { data: invites, error: inviteError } = await supabase
        .from('user_invites')
        .select('*');

    if (inviteError) {
        console.error('Error fetching invites:', inviteError.message);
        return;
    }

    if (!invites || invites.length === 0) {
        console.log('No pending invites found.');
        return;
    }

    console.log(`Found ${invites.length} pending invites.`);

    for (const invite of invites) {
        console.log(`\nProcessing invite for: ${invite.email}`);

        let userId = null;

        // 2. Check if Auth user exists (by trying to create one)
        const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
            email: invite.email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: '' }
        });

        if (createError) {
            // Check if user already exists
            if (createError.message.includes('already registered') || createError.status === 422) {
                console.log('  -> User already exists in Auth. Fetching ID...');
                // We need to fetch the user ID
                const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
                if (listError) {
                    console.error('Error listing users:', listError);
                    continue;
                }
                const existingUser = users.find(u => u.email?.toLowerCase() === invite.email.toLowerCase());

                if (existingUser) {
                    userId = existingUser.id;
                    console.log(`  -> Found existing Auth ID: ${userId}`);
                } else {
                    console.error('  -> CRITICAL: Could not find user despite "already registered" error.');
                }
            } else {
                console.error(`  -> Error creating user: ${createError.message}`);
            }
        } else {
            console.log(createdUser);
            if (createdUser && createdUser.user) {
                userId = createdUser.user.id;
                console.log(`  -> ✅ Created new Auth user. ID: ${userId}`);
                console.log(`  -> Password set to: ${DEFAULT_PASSWORD}`);
            }
        }

        if (userId) {
            // 3. Update/Create Profile
            const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            let updateData = {
                salary: invite.salary,
                role: invite.role || 'user',
                onboarding_status: 'started'
            };

            if (!existingProfile) {
                console.log('  -> Creating new profile...');
                // Insert
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        ...updateData,
                        full_name: '' // Placeholder
                    });
                if (insertError) console.error('  -> Error creating profile:', insertError.message);
                else console.log('  -> ✅ Profile created.');
            } else {
                console.log('  -> Updating existing profile...');
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update(updateData)
                    .eq('id', userId);
                if (updateError) console.error('  -> Error updating profile:', updateError.message);
                else console.log('  -> ✅ Profile updated (Salary/Role applied).');
            }

            // 4. Delete invite after successful processing
            const { error: delError } = await supabase.from('user_invites').delete().eq('email', invite.email);
            if (!delError) console.log('  -> Invite consumed/deleted.');
            else console.error('  -> Error deleting invite:', delError.message);
        }
    }

    console.log('\n--- Batch Assignment Complete ---');
}

main();
