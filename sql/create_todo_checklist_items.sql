-- =====================================================
-- Create Todo Checklist Items Table
-- =====================================================
-- This script creates the todo_checklist_items table
-- for tracking subtasks/checklist items within todos
-- =====================================================

-- Create todo_checklist_items table
CREATE TABLE IF NOT EXISTS todo_checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on todo_id for faster queries
CREATE INDEX IF NOT EXISTS idx_todo_checklist_items_todo_id ON todo_checklist_items(todo_id);

-- Create index on position for ordering
CREATE INDEX IF NOT EXISTS idx_todo_checklist_items_position ON todo_checklist_items(position);

-- Enable Row Level Security
ALTER TABLE todo_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own checklist items (through todos)
CREATE POLICY "Users can view their own checklist items"
  ON todo_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_checklist_items.todo_id
      AND todos.user_id = auth.uid()
    )
  );

-- Create policy to allow users to insert their own checklist items
CREATE POLICY "Users can insert their own checklist items"
  ON todo_checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_checklist_items.todo_id
      AND todos.user_id = auth.uid()
    )
  );

-- Create policy to allow users to update their own checklist items
CREATE POLICY "Users can update their own checklist items"
  ON todo_checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_checklist_items.todo_id
      AND todos.user_id = auth.uid()
    )
  );

-- Create policy to allow users to delete their own checklist items
CREATE POLICY "Users can delete their own checklist items"
  ON todo_checklist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM todos
      WHERE todos.id = todo_checklist_items.todo_id
      AND todos.user_id = auth.uid()
    )
  );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todo_checklist_items_updated_at
  BEFORE UPDATE ON todo_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the table was created successfully:
-- SELECT * FROM todo_checklist_items WHERE todo_id IN (SELECT id FROM todos WHERE user_id = auth.uid());
-- =====================================================
