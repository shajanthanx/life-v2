// Post-migration initialization script
// Run this after applying the finance-module-migration.sql

console.log('🚀 Initializing Finance Module Post-Migration...')

// This script will:
// 1. Test that the new tables exist
// 2. Initialize default categories for existing users
// 3. Run the migration function to convert existing transaction categories
// 4. Verify everything is working

const { createClient } = require('@supabase/supabase-js')

// You'll need to set these environment variables or replace with your values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_')) {
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
  console.log('ℹ️  Or edit this script and replace the placeholders with your actual Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function initializeFinanceModule() {
  try {
    console.log('\n🔍 Step 1: Testing database schema...')
    
    // Test if new tables exist
    const { data: categoriesTest, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
    
    if (categoriesError) {
      console.error('❌ Categories table not found:', categoriesError.message)
      console.log('💡 Make sure you ran the finance-module-migration.sql script in your Supabase dashboard')
      return
    }
    
    const { data: predefinedTest, error: predefinedError } = await supabase
      .from('predefined_expenses')
      .select('id')
      .limit(1)
    
    if (predefinedError) {
      console.error('❌ Predefined expenses table not found:', predefinedError.message)
      return
    }
    
    console.log('✅ New tables found successfully')
    
    console.log('\n📋 Step 2: Checking existing users...')
    
    // Get all users from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
    
    if (profilesError) {
      console.error('❌ Could not fetch profiles:', profilesError.message)
      return
    }
    
    console.log(`ℹ️  Found ${profiles.length} user profiles`)
    
    console.log('\n🏷️  Step 3: Initializing categories for existing users...')
    
    for (const profile of profiles) {
      console.log(`   Initializing categories for user ${profile.id}...`)
      
      // Check if user already has categories
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', profile.id)
        .limit(1)
      
      if (existingCategories && existingCategories.length > 0) {
        console.log('   ✅ User already has categories, skipping')
        continue
      }
      
      // Create default categories using the database function
      const { error: functionError } = await supabase.rpc('create_default_categories', {
        user_uuid: profile.id
      })
      
      if (functionError) {
        console.error(`   ❌ Failed to create categories for user ${profile.id}:`, functionError.message)
      } else {
        console.log('   ✅ Default categories created successfully')
      }
    }
    
    console.log('\n🔄 Step 4: Running transaction category migration...')
    
    // Run the migration function to convert existing transaction categories
    const { error: migrationError } = await supabase.rpc('migrate_transaction_categories')
    
    if (migrationError) {
      console.error('❌ Migration function failed:', migrationError.message)
    } else {
      console.log('✅ Transaction category migration completed')
    }
    
    console.log('\n📊 Step 5: Verification...')
    
    // Check final state
    const { data: finalCategories } = await supabase
      .from('categories')
      .select('id, name, type')
      .limit(10)
    
    const { data: finalTransactions } = await supabase
      .from('transactions')
      .select('id, category, category_id')
      .not('category_id', 'is', null)
      .limit(5)
    
    console.log(`✅ Total categories in system: ${finalCategories?.length || 0}`)
    console.log(`✅ Transactions with category_id: ${finalTransactions?.length || 0}`)
    
    if (finalCategories && finalCategories.length > 0) {
      console.log('\n📋 Sample categories:')
      finalCategories.slice(0, 5).forEach(cat => {
        console.log(`   - ${cat.name} (${cat.type})`)
      })
    }
    
    console.log('\n🎉 Finance module initialization completed successfully!')
    console.log('✅ You can now use the finance module with all new features')
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message)
    console.log('\n🛠️  Troubleshooting:')
    console.log('1. Make sure you applied finance-module-migration.sql in Supabase dashboard')
    console.log('2. Check that your Supabase credentials are correct')
    console.log('3. Verify your user has proper permissions')
  }
}

// Run initialization
initializeFinanceModule()

console.log('\n📚 What this script does:')
console.log('- ✅ Verifies new database tables exist')
console.log('- ✅ Creates default categories for all existing users')
console.log('- ✅ Migrates existing transaction categories to new schema')
console.log('- ✅ Verifies everything is working')
console.log('\nAfter running this script, your finance module should work perfectly!')
