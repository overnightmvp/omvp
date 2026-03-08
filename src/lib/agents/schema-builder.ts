import { SEOArticle } from './transformer'

/**
 * Schema markup collection for a generated page
 */
export interface SchemaMarkup {
  article: any
  person: any
  organization: any
  faq: any
}

/**
 * Creator profile data for Person schema
 */
export interface CreatorProfile {
  name: string
  subdomain: string
  socialMedia?: {
    youtube?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
}

/**
 * Generates complete JSON-LD schema markup for SEO article.
 * Includes Article, Person, Organization, and FAQPage schemas.
 *
 * @param article - SEO article data with headline, content, FAQs
 * @param creator - Creator profile for Person schema
 * @returns Complete schema markup object with all 4 schema types
 */
export function generateSchemaMarkup(
  article: SEOArticle,
  creator: CreatorProfile
): SchemaMarkup {
  const now = new Date().toISOString()
  const baseUrl = 'https://authority-platform.com'
  const creatorUrl = `${baseUrl}/${creator.subdomain}`

  // Build sameAs array from social media URLs
  const sameAsUrls: string[] = []
  if (creator.socialMedia) {
    if (creator.socialMedia.youtube) sameAsUrls.push(creator.socialMedia.youtube)
    if (creator.socialMedia.twitter) sameAsUrls.push(creator.socialMedia.twitter)
    if (creator.socialMedia.instagram) sameAsUrls.push(creator.socialMedia.instagram)
    if (creator.socialMedia.linkedin) sameAsUrls.push(creator.socialMedia.linkedin)
  }

  // Person schema (article author)
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: creator.name,
    url: creatorUrl,
    sameAs: sameAsUrls,
  }

  // Organization schema (publisher)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Authority Platform',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
    },
  }

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.metaDescription || article.content.substring(0, 160),
    image: `${baseUrl}/placeholder-image.jpg`, // Placeholder - will be replaced with actual image
    datePublished: now,
    dateModified: now,
    author: personSchema,
    publisher: organizationSchema,
  }

  // FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return {
    article: articleSchema,
    person: personSchema,
    organization: organizationSchema,
    faq: faqSchema,
  }
}

/**
 * Validates that a schema object has required JSON-LD fields.
 *
 * @param schema - Schema object to validate
 * @returns True if schema has @context and @type fields
 */
export function validateSchema(schema: any): boolean {
  if (!schema || typeof schema !== 'object') {
    return false
  }

  // Must have @context and @type
  if (!schema['@context'] || !schema['@type']) {
    return false
  }

  return true
}
