-- Migration: Add campus field and archived_at timestamp
-- Run this after the initial schema.sql

-- Add campus column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'items' AND column_name = 'campus') THEN
        ALTER TABLE items ADD COLUMN campus VARCHAR(50) DEFAULT 'Uniworld 1';
    END IF;
END $$;

-- Add archived_at column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'items' AND column_name = 'archived_at') THEN
        ALTER TABLE items ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add index for campus
CREATE INDEX IF NOT EXISTS idx_items_campus ON items(campus);

-- Add constraint for campus values
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_campus_check;
ALTER TABLE items ADD CONSTRAINT items_campus_check 
    CHECK (campus IN ('Uniworld 1', 'Uniworld 2', 'SST Campus'));

-- Update the search_similar_items function to include campus filter and exclude archived
CREATE OR REPLACE FUNCTION search_similar_items(
    query_embedding vector(512),
    search_type text DEFAULT 'image',
    item_type text DEFAULT NULL,
    location_filter text DEFAULT NULL,
    campus_filter text DEFAULT NULL,
    include_archived boolean DEFAULT FALSE,
    limit_count integer DEFAULT 5
)
RETURNS TABLE (
    id integer,
    title varchar(255),
    description text,
    location varchar(255),
    campus varchar(50),
    type varchar(50),
    image_url text,
    created_at timestamp with time zone,
    status varchar(20),
    similarity_score float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.description,
        i.location,
        i.campus,
        i.type,
        i.image_url,
        i.created_at,
        i.status,
        CASE 
            WHEN search_type = 'image' THEN 1 - (i.image_embedding <=> query_embedding)
            WHEN search_type = 'text' THEN 1 - (i.text_embedding <=> query_embedding)
            ELSE 1 - (i.image_embedding <=> query_embedding)
        END as similarity_score
    FROM items i
    WHERE 
        (include_archived = TRUE OR i.status = 'active')
        AND (item_type IS NULL OR i.type = item_type)
        AND (location_filter IS NULL OR i.location ILIKE '%' || location_filter || '%')
        AND (campus_filter IS NULL OR i.campus = campus_filter)
        AND (
            (search_type = 'image' AND i.image_embedding IS NOT NULL)
            OR (search_type = 'text' AND i.text_embedding IS NOT NULL)
        )
    ORDER BY similarity_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to auto-archive old items (items older than 14 days)
CREATE OR REPLACE FUNCTION auto_archive_old_items()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    UPDATE items 
    SET status = 'archived',
        archived_at = NOW()
    WHERE status = 'active' 
      AND created_at < NOW() - INTERVAL '14 days';
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Update the active_items view to include campus
DROP VIEW IF EXISTS active_items;
CREATE VIEW active_items AS
SELECT 
    id,
    title,
    description,
    location,
    campus,
    type,
    image_url,
    created_at,
    contact_info,
    status
FROM items
WHERE status = 'active'
ORDER BY created_at DESC;

-- Create a view for archived items
CREATE VIEW archived_items AS
SELECT 
    id,
    title,
    description,
    location,
    campus,
    type,
    image_url,
    created_at,
    archived_at,
    contact_info,
    status
FROM items
WHERE status = 'archived'
ORDER BY archived_at DESC;

