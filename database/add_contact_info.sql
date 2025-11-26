-- Add contact_info column to items table if it doesn't exist
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS contact_info TEXT;

