require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUser() {
  try {
    console.log('Checking user: 47a9510d-2c60-4ad4-b086-32ed0e36748c');
    
    // Check if user exists in users table
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', '47a9510d-2c60-4ad4-b086-32ed0e36748c')
      .single();

    if (error) {
      console.error('Error fetching user:', error);
    } else {
      console.log('User found:', JSON.stringify(user, null, 2));
    }

    // Also check all users to see what's in the table
    console.log('\n--- All users in table ---');
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('*');

    if (allError) {
      console.error('Error fetching all users:', allError);
    } else {
      console.log('Total users:', allUsers.length);
      allUsers.forEach(user => {
        console.log(`- ${user.email} (${user.id}) - Role: ${user.role || 'NO ROLE'}`);
      });
    }

  } catch (e) {
    console.error('Exception:', e);
  }
}

checkUser();