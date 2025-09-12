# 🏦 Finance Module Migration Guide

This guide will help you apply the new finance module database changes to your Supabase instance.

## 🚨 Important Notice

The finance module has been restructured with new database tables and improved functionality. You need to apply database migrations to use the new features.

## ✅ Migration Status

**Before Migration:**
- ❌ Adding expenses fails with "null value in column 'category'" error
- ❌ No categories or predefined expenses
- ❌ Limited finance functionality

**After Migration:**
- ✅ Full categories system with icons and colors  
- ✅ Predefined expenses for recurring bills
- ✅ Enhanced transaction tracking
- ✅ Financial analytics and insights

## 📝 Migration Steps

### Option 1: Apply Full Migration (Recommended)

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project dashboard
   - Go to **SQL Editor**

2. **Run Migration Script**
   ```sql
   -- Copy and paste the contents of finance-module-migration.sql
   -- This includes all tables, functions, and default data
   ```

3. **Verify Migration**
   - Check that new tables exist: `categories`, `predefined_expenses`
   - Verify existing transactions still work
   - Test adding new expenses

### Option 2: Manual Table Creation (If Migration Fails)

If the full migration script fails, create tables manually:

1. **Create Categories Table**
   ```sql
   CREATE TABLE categories (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
     name TEXT NOT NULL,
     type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
     is_default BOOLEAN DEFAULT FALSE,
     icon TEXT,
     color TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, name, type)
   );

   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can access own categories" ON categories 
     FOR ALL USING (auth.uid() = user_id);
   ```

2. **Create Predefined Expenses Table**
   ```sql
   CREATE TABLE predefined_expenses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
     name TEXT NOT NULL,
     category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
     amount NUMERIC NOT NULL,
     frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
     next_due DATE,
     is_active BOOLEAN DEFAULT TRUE,
     description TEXT,
     auto_add BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   ALTER TABLE predefined_expenses ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can access own predefined expenses" ON predefined_expenses 
     FOR ALL USING (auth.uid() = user_id);
   ```

3. **Update Transactions Table**
   ```sql
   -- Add category_id column (nullable for backward compatibility)
   ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

   -- Make category column nullable (for new schema)
   ALTER TABLE transactions ALTER COLUMN category DROP NOT NULL;
   ```

### Option 3: Quick Fix (Minimal Changes)

If you just want to fix the immediate error without full migration:

```sql
-- Make category column nullable in transactions table
ALTER TABLE transactions ALTER COLUMN category DROP NOT NULL;
```

This allows the app to work but you won't get the new categories features.

## 🧪 Testing After Migration

1. **Open Finance Module**
   - Navigate to Finance → Recording
   - Try adding an expense
   - Should work without errors

2. **Test New Features**
   - Go to Finance → Configuration
   - View/edit categories
   - Set up recurring expenses

3. **Run API Tests** (Optional)
   - Open browser dev tools console
   - Copy and paste `test-finance-apis.js` content
   - Run `testFinanceAPIs()` to verify all APIs work

## 🔄 Data Migration

The migration automatically:
- ✅ Preserves all existing transactions
- ✅ Creates default categories for new users
- ✅ Converts existing transaction categories to the new system
- ✅ Maintains backward compatibility

## 🐛 Troubleshooting

### Error: "null value in column 'category'"
**Solution:** Apply Option 3 (Quick Fix) or full migration

### Error: "relation 'categories' does not exist"
**Solution:** Apply Option 1 or 2 to create missing tables

### Error: "function 'create_default_categories' does not exist"
**Solution:** The app will create categories manually, this is normal

### Categories not showing up
**Solution:** 
1. Refresh the page
2. Navigate to Finance → Configuration
3. Categories should auto-initialize

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify migration was applied in Supabase SQL Editor
3. Try the Quick Fix option first
4. Use the API test script to identify specific issues

## 🎉 After Migration

Once migration is complete, you'll have access to:
- 🏷️ **Custom Categories** with icons and colors
- 📅 **Recurring Expenses** that auto-add when due  
- 📊 **Financial Analytics** with spending insights
- ⚡ **Quick Recording** interface for daily use
- 🔧 **Configuration** panel for setup

The finance module will now be a complete personal finance management system!
