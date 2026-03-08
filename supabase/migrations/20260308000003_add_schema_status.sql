-- Add 'schema_generated' status to generation_queue status constraint
-- This status indicates that schema markup has been generated and page has been created

ALTER TABLE public.generation_queue
  DROP CONSTRAINT IF EXISTS generation_queue_status_check;

ALTER TABLE public.generation_queue
  ADD CONSTRAINT generation_queue_status_check
    CHECK (status IN ('pending', 'processing', 'scraped', 'transforming', 'transformed', 'schema_generated', 'publishing', 'published', 'failed'));
