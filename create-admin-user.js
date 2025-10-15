// Simple test script to create admin user via Supabase Auth
// Run this in the browser console when the app is loaded
// or create a user manually through the signup form

async function createAdminUser() {
  const { createClient } = window.supabase || {};
  
  if (!createClient) {
    console.log('Supabase not available. Creating user manually through signup form...');
    return;
  }

  const supabase = createClient(
    'https://kqnbottvwcnfwdjyyawr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbmJvdHR2d2NuZndkanlleWF3ciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI4NzQwNDMyLCJleHAiOjIwNDQzMTY0MzJ9.Tc4jZ6WHTzMhJ8mqpKr1OfVz-nOD7CfV8VyQo_0pJkg'
  );

  try {
    // Sign up the admin user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@fitiva.com',
      password: 'FitivaAdmin2024!',
      options: {
        data: {
          name: 'Platform Admin',
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      return;
    }

    console.log('Admin user created:', signUpData);

    // Update the user profile with admin role
    if (signUpData.user) {
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: signUpData.user.id,
          name: 'Platform Admin',
          email: 'admin@fitiva.com',
          role: 'admin'
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
      } else {
        console.log('Admin profile created successfully!');
      }
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run the function
createAdminUser();