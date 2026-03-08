import { createClient } from '@supabase/supabase-js'
import { SchemaMarkup } from '../agents/schema-builder'

/**
 * Generated page record from database
 */
export interface GeneratedPage {
  id: string
  user_id: string
  queue_item_id: string
  video_url: string
  slug: string
  headline: string
  meta_description: string
  content: string
  faqs: Array<{ question: string; answer: string }> | null
  schema_markup: SchemaMarkup
  published_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Data required to create a new generated page
 */
export interface CreatePageData {
  userId: string
  queueItemId: string
  videoUrl: string
  headline: string
  metaDescription: string
  content: string
  faqs: Array<{ question: string; answer: string }>
  schemaMarkup: SchemaMarkup
}

/**
 * Get Supabase client instance
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Generates URL-friendly slug from headline.
 * Converts to lowercase, replaces spaces with hyphens, removes special characters.
 *
 * @param headline - Article headline text
 * @returns URL-friendly slug
 */
export function generateSlug(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
}

/**
 * Creates a new generated page record in the database.
 * Automatically generates slug from headline.
 * Handles slug conflicts by appending random suffix.
 *
 * @param data - Page data to create
 * @returns Created page record
 * @throws Error if creation fails
 */
export async function createPage(data: CreatePageData): Promise<GeneratedPage> {
  const supabase = getSupabaseClient()

  let slug = generateSlug(data.headline)
  let attempts = 0
  const maxAttempts = 5

  while (attempts < maxAttempts) {
    const { data: page, error } = await supabase
      .from('generated_pages')
      .insert({
        user_id: data.userId,
        queue_item_id: data.queueItemId,
        video_url: data.videoUrl,
        slug,
        headline: data.headline,
        meta_description: data.metaDescription,
        content: data.content,
        faqs: data.faqs,
        schema_markup: data.schemaMarkup,
      })
      .select()
      .single()

    if (!error) {
      return page as GeneratedPage
    }

    // Handle slug conflict
    if (error.code === '23505') {
      // Unique constraint violation
      attempts++
      const randomSuffix = Math.random().toString(36).substring(2, 6)
      slug = `${generateSlug(data.headline)}-${randomSuffix}`
      continue
    }

    throw new Error(`Failed to create page: ${error.message}`)
  }

  throw new Error('Failed to create page: too many slug conflicts')
}

/**
 * Retrieves a generated page by user ID and slug.
 *
 * @param userId - User ID who owns the page
 * @param slug - URL-friendly page slug
 * @returns Page record or null if not found
 */
export async function getPage(
  userId: string,
  slug: string
): Promise<GeneratedPage | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('generated_pages')
    .select('*')
    .eq('user_id', userId)
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    throw new Error(`Failed to get page: ${error.message}`)
  }

  return data as GeneratedPage
}

/**
 * Updates the schema markup for an existing page.
 *
 * @param pageId - Page ID to update
 * @param schemaMarkup - New schema markup object
 * @throws Error if update fails
 */
export async function updatePageSchema(
  pageId: string,
  schemaMarkup: SchemaMarkup
): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('generated_pages')
    .update({ schema_markup: schemaMarkup })
    .eq('id', pageId)

  if (error) {
    throw new Error(`Failed to update page schema: ${error.message}`)
  }
}
