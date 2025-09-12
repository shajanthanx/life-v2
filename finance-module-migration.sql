-- Finance Module Restructure Migration
-- This migration adds categories and predefined expenses tables
-- and updates the transactions table to use normalized categories

-- 1. Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT FALSE,
  icon TEXT, -- Optional icon for UI
  color TEXT, -- Optional color for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique category names per user and type
  UNIQUE(user_id, name, type)
);

-- 2. Create Predefined Expenses Table
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
  auto_add BOOLEAN DEFAULT FALSE, -- Whether to automatically add to transactions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add category_id to transactions table (nullable for migration)
ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- 4. Create indexes for performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_predefined_expenses_user_id ON predefined_expenses(user_id);
CREATE INDEX idx_predefined_expenses_category_id ON predefined_expenses(category_id);
CREATE INDEX idx_predefined_expenses_next_due ON predefined_expenses(next_due) WHERE is_active = TRUE;
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

-- 5. Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE predefined_expenses ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
CREATE POLICY "Users can access own categories" ON categories 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own predefined expenses" ON predefined_expenses 
  FOR ALL USING (auth.uid() = user_id);

-- 7. Insert default categories for new users
-- This function will be called when a user first accesses the finance module
CREATE OR REPLACE FUNCTION create_default_categories(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Default Expense Categories
  INSERT INTO categories (user_id, name, type, is_default, icon, color) VALUES
    (user_uuid, 'Food & Dining', 'expense', TRUE, '🍽️', '#ef4444'),
    (user_uuid, 'Transportation', 'expense', TRUE, '🚗', '#3b82f6'),
    (user_uuid, 'Housing', 'expense', TRUE, '🏠', '#8b5cf6'),
    (user_uuid, 'Utilities', 'expense', TRUE, '⚡', '#f59e0b'),
    (user_uuid, 'Healthcare', 'expense', TRUE, '🏥', '#10b981'),
    (user_uuid, 'Entertainment', 'expense', TRUE, '🎬', '#ec4899'),
    (user_uuid, 'Shopping', 'expense', TRUE, '🛍️', '#6366f1'),
    (user_uuid, 'Education', 'expense', TRUE, '📚', '#14b8a6'),
    (user_uuid, 'Personal Care', 'expense', TRUE, '💄', '#f97316'),
    (user_uuid, 'Subscriptions', 'expense', TRUE, '📱', '#84cc16'),
    (user_uuid, 'Insurance', 'expense', TRUE, '🛡️', '#06b6d4'),
    (user_uuid, 'Other Expenses', 'expense', TRUE, '📝', '#6b7280')
  ON CONFLICT (user_id, name, type) DO NOTHING;

  -- Default Income Categories  
  INSERT INTO categories (user_id, name, type, is_default, icon, color) VALUES
    (user_uuid, 'Salary', 'income', TRUE, '💼', '#22c55e'),
    (user_uuid, 'Freelance', 'income', TRUE, '💻', '#3b82f6'),
    (user_uuid, 'Business', 'income', TRUE, '🏢', '#8b5cf6'),
    (user_uuid, 'Investment', 'income', TRUE, '📈', '#f59e0b'),
    (user_uuid, 'Bonus', 'income', TRUE, '🎁', '#ec4899'),
    (user_uuid, 'Gift', 'income', TRUE, '🎉', '#f97316'),
    (user_uuid, 'Other Income', 'income', TRUE, '💰', '#6b7280')
  ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to auto-create categories for new users
CREATE OR REPLACE FUNCTION auto_create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_create_default_categories'
  ) THEN
    CREATE TRIGGER trigger_create_default_categories
      AFTER INSERT ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION auto_create_default_categories();
  END IF;
END
$$;

-- 9. Migration script to convert existing transaction categories to category_id
-- This will be run after the schema changes are deployed

CREATE OR REPLACE FUNCTION migrate_transaction_categories()
RETURNS VOID AS $$
DECLARE
  transaction_record RECORD;
  category_record RECORD;
  user_uuid UUID;
BEGIN
  -- Process each unique user and category combination
  FOR transaction_record IN 
    SELECT DISTINCT user_id, category 
    FROM transactions 
    WHERE category_id IS NULL AND category IS NOT NULL
  LOOP
    user_uuid := transaction_record.user_id;
    
    -- First ensure the user has default categories
    PERFORM create_default_categories(user_uuid);
    
    -- Try to find existing category
    SELECT id INTO category_record
    FROM categories 
    WHERE user_id = user_uuid 
      AND LOWER(name) = LOWER(transaction_record.category)
      AND type = 'expense'  -- Assume expense for existing transactions
    LIMIT 1;
    
    -- If category doesn't exist, create it
    IF category_record.id IS NULL THEN
      INSERT INTO categories (user_id, name, type, is_default, icon, color)
      VALUES (user_uuid, transaction_record.category, 'expense', FALSE, '📝', '#6b7280')
      ON CONFLICT (user_id, name, type) DO NOTHING
      RETURNING id INTO category_record;
      
      -- If still null due to conflict, fetch the existing one
      IF category_record.id IS NULL THEN
        SELECT id INTO category_record
        FROM categories 
        WHERE user_id = user_uuid 
          AND LOWER(name) = LOWER(transaction_record.category)
          AND type = 'expense'
        LIMIT 1;
      END IF;
    END IF;
    
    -- Update all transactions with this category
    UPDATE transactions 
    SET category_id = category_record.id
    WHERE user_id = user_uuid 
      AND category = transaction_record.category 
      AND category_id IS NULL;
  END LOOP;
  
  -- Handle income transactions separately
  FOR transaction_record IN 
    SELECT DISTINCT user_id, category 
    FROM transactions 
    WHERE category_id IS NULL AND category IS NOT NULL AND type = 'income'
  LOOP
    user_uuid := transaction_record.user_id;
    
    -- Try to find existing income category
    SELECT id INTO category_record
    FROM categories 
    WHERE user_id = user_uuid 
      AND LOWER(name) = LOWER(transaction_record.category)
      AND type = 'income'
    LIMIT 1;
    
    -- If category doesn't exist, create it
    IF category_record.id IS NULL THEN
      INSERT INTO categories (user_id, name, type, is_default, icon, color)
      VALUES (user_uuid, transaction_record.category, 'income', FALSE, '💰', '#22c55e')
      ON CONFLICT (user_id, name, type) DO NOTHING
      RETURNING id INTO category_record;
      
      -- If still null due to conflict, fetch the existing one
      IF category_record.id IS NULL THEN
        SELECT id INTO category_record
        FROM categories 
        WHERE user_id = user_uuid 
          AND LOWER(name) = LOWER(transaction_record.category)
          AND type = 'income'
        LIMIT 1;
      END IF;
    END IF;
    
    -- Update all income transactions with this category
    UPDATE transactions 
    SET category_id = category_record.id
    WHERE user_id = user_uuid 
      AND category = transaction_record.category 
      AND category_id IS NULL
      AND type = 'income';
  END LOOP;
  
  RAISE NOTICE 'Transaction category migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to auto-add predefined expenses
CREATE OR REPLACE FUNCTION process_predefined_expenses()
RETURNS VOID AS $$
DECLARE
  expense_record RECORD;
  next_date DATE;
BEGIN
  -- Process all active predefined expenses that are due
  FOR expense_record IN 
    SELECT * FROM predefined_expenses 
    WHERE is_active = TRUE 
      AND auto_add = TRUE 
      AND next_due <= CURRENT_DATE
  LOOP
    -- Add transaction
    INSERT INTO transactions (
      user_id, 
      type, 
      amount, 
      category_id, 
      description, 
      date, 
      is_recurring,
      recurring_pattern
    ) VALUES (
      expense_record.user_id,
      'expense',
      expense_record.amount,
      expense_record.category_id,
      expense_record.name,
      expense_record.next_due,
      TRUE,
      expense_record.frequency
    );
    
    -- Calculate next due date
    CASE expense_record.frequency
      WHEN 'weekly' THEN 
        next_date := expense_record.next_due + INTERVAL '1 week';
      WHEN 'monthly' THEN 
        next_date := expense_record.next_due + INTERVAL '1 month';
      WHEN 'yearly' THEN 
        next_date := expense_record.next_due + INTERVAL '1 year';
    END CASE;
    
    -- Update next due date
    UPDATE predefined_expenses 
    SET next_due = next_date 
    WHERE id = expense_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Update Supabase types (for reference)
COMMENT ON TABLE categories IS 'User-defined categories for income and expenses';
COMMENT ON TABLE predefined_expenses IS 'Recurring expenses that can be auto-added to transactions';
COMMENT ON COLUMN transactions.category_id IS 'Foreign key to categories table, replaces category text field';
