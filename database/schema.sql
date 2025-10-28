-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('lost', 'found')),
    image_url TEXT,
    image_embedding vector(512), -- CLIP embeddings are 512-dimensional
    text_embedding vector(512),  -- CLIP text embeddings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contact_info TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(location);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

-- Create vector similarity indexes
CREATE INDEX IF NOT EXISTS idx_items_image_embedding ON items USING ivfflat (image_embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_items_text_embedding ON items USING ivfflat (text_embedding vector_cosine_ops) WITH (lists = 100);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function for similarity search
CREATE OR REPLACE FUNCTION search_similar_items(
    query_embedding vector(512),
    search_type text DEFAULT 'image',
    item_type text DEFAULT NULL,
    location_filter text DEFAULT NULL,
    limit_count integer DEFAULT 5
)
RETURNS TABLE (
    id integer,
    title varchar(255),
    description text,
    location varchar(255),
    type varchar(50),
    image_url text,
    created_at timestamp with time zone,
    similarity_score float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.title,
        i.description,
        i.location,
        i.type,
        i.image_url,
        i.created_at,
        CASE 
            WHEN search_type = 'image' THEN 1 - (i.image_embedding <=> query_embedding)
            WHEN search_type = 'text' THEN 1 - (i.text_embedding <=> query_embedding)
            ELSE 1 - (i.image_embedding <=> query_embedding)
        END as similarity_score
    FROM items i
    WHERE 
        i.status = 'active'
        AND (item_type IS NULL OR i.type = item_type)
        AND (location_filter IS NULL OR i.location ILIKE '%' || location_filter || '%')
        AND (
            (search_type = 'image' AND i.image_embedding IS NOT NULL)
            OR (search_type = 'text' AND i.text_embedding IS NOT NULL)
        )
    ORDER BY similarity_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO items (title, description, location, type, image_url) VALUES
('Black Water Bottle', 'A black insulated water bottle found near the library', 'Library Building', 'found', 'https://example.com/bottle.jpg'),
('Blue Umbrella', 'Navy blue umbrella left in the cafeteria', 'Cafeteria', 'found', 'https://example.com/umbrella.jpg'),
('Sony Headphones', 'Black Sony wireless headphones found in classroom 101', 'Classroom 101', 'found', 'https://example.com/headphones.jpg'),
('Student ID Card', 'Student pass for John Doe found in the gym', 'Gymnasium', 'found', 'https://example.com/id.jpg'),
('Wallet', 'Brown leather wallet found in Uniworld 1', 'Uniworld 1', 'found', 'https://example.com/wallet.jpg');

-- Create a view for active items
CREATE VIEW active_items AS
SELECT 
    id,
    title,
    description,
    location,
    type,
    image_url,
    created_at,
    contact_info
FROM items
WHERE status = 'active'
ORDER BY created_at DESC;
