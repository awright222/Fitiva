require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function createUserProfile() {
  try {
    console.log('Creating user profile...');
    
    const userId = '47a9510d-2c60-4ad4-b086-32ed0e36748c';
    
    // Insert the user profile with client role for testing
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: 'your-email@example.com', // Replace with actual email if you know it
        name: 'Test User',
        role: 'client', // Setting as client to test the Client Dashboard
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
    } else {
      console.log('User profile created successfully!');
      console.log('Profile:', JSON.stringify(data, null, 2));
    }

  } catch (e) {
    console.error('Exception:', e);
  }
}

createUserProfile();