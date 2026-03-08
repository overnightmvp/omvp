-- Migration: Create generated_pages table for storing published SEO articles
-- This table stores complete page data including article content and JSON-LD schema markup

CREATE TABLE generated_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  queue_item_id UUID NOT NULL REFERENCES generation_queue(id),
  video_url TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly slug from headline
  headline TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown article content
  faqs JSONB, -- Array of {question, answer}
  schema_markup JSONB NOT NULL, -- Complete SchemaMarkup object
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

-- Enable RLS for user data isolation
ALTER TABLE generated_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own pages
CREATE POLICY "Users can read own pages" ON generated_pages
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own pages
CREATE POLICY "Users can insert own pages" ON generated_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own pages
CREATE POLICY "Users can update own pages" ON generated_pages
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for efficient subdomain lookups (user_id + slug)
CREATE INDEX idx_generated_pages_user_slug ON generated_pages(user_id, slug);

-- Index for queue item lookups
CREATE INDEX idx_generated_pages_queue_item ON generated_pages(queue_item_id);

-- Trigger for automatic updated_at timestamp
CREATE TRIGGER update_generated_pages_updated_at
  BEFORE UPDATE ON generated_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
