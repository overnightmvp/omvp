-- Add indexed_at timestamp to generated_pages
-- Tracks when page was submitted to Google Search Console for indexing

ALTER TABLE generated_pages
ADD COLUMN indexed_at TIMESTAMPTZ;

-- Add index for querying recently indexed pages
CREATE INDEX idx_generated_pages_indexed_at ON generated_pages(indexed_at)
WHERE indexed_at IS NOT NULL;

COMMENT ON COLUMN generated_pages.indexed_at IS 'Timestamp when page was submitted to Google Search Console for indexing (MVP: logged submission only)';
