/**
 * Setup Demo Users Script
 * 
 * This script creates demo Admin and Dealer accounts in Supabase Authentication
 * and inserts their profiles into the database.
 * 
 * IMPORTANT: This script requires Supabase service role key to create auth users.
 * Never commit service role keys to version control.
 * 
 * Usage:
 * 1. Copy .env.example to .env.local
 * 2. Add your Supabase URL and SERVICE ROLE KEY (not anon key)
 * 3. Run: npx tsx scripts/setup-demo-users.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const demoUsers = [
  {
    email: 'admin@feenixrepair.com',
    password: 'Admin@123',
    role: 'ADMIN',
    name: 'Admin User',
    phone: '+919876543210',
    business_name: 'Feenix Repair',
    gst_number: 'GSTIN12345678',
    address: '123 Business Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
  },
  {
    email: 'dealer@feenixrepair.com',
    password: 'Dealer@123',
    role: 'DEALER',
    name: 'Demo Dealer',
    phone: '+919876543211',
    business_name: 'Demo Electronics',
    gst_number: 'GSTIN87654321',
    address: '456 Market Road',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110001',
  },
]

async function setupDemoUsers() {
  console.log('🚀 Setting up demo users...\n')

  for (const user of demoUsers) {
    console.log(`Creating user: ${user.email}`)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email for demo
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      })

      if (authError) {
        console.error(`  ❌ Failed to create auth user: ${authError.message}`)
        continue
      }

      const userId = authData.user?.id

      if (!userId) {
        console.error(`  ❌ No user ID returned`)
        continue
      }

      // Insert/update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: user.role,
          name: user.name,
          email: user.email,
          phone: user.phone,
          business_name: user.business_name,
          gst_number: user.gst_number,
          address: user.address,
          city: user.city,
          state: user.state,
          country: user.country,
          pincode: user.pincode,
          is_active: true,
        })

      if (profileError) {
        console.error(`  ❌ Failed to create profile: ${profileError.message}`)
      } else {
        console.log(`  ✅ User created successfully`)
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error}`)
    }
  }

  console.log('\n✨ Demo users setup complete!')
  console.log('\nLogin Credentials:')
  console.log('\nAdmin:')
  console.log('  Email: admin@feenixrepair.com')
  console.log('  Password: Admin@123')
  console.log('  URL: http://localhost:3000/auth/login')
  console.log('\nDealer:')
  console.log('  Email: dealer@feenixrepair.com')
  console.log('  Password: Dealer@123')
  console.log('  URL: http://localhost:3000/auth/login')
}

setupDemoUsers().catch(console.error)
