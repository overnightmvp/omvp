import Anthropic from '@anthropic-ai/sdk'

export interface FAQ {
  question: string
  answer: string
}

export interface SEOArticle {
  headline: string
  metaDescription: string
  content: string
  faqs: FAQ[]
}

export interface VideoMetadata {
  title: string
  description: string
}

/**
 * Generates SEO-optimized article from YouTube transcript using Claude Sonnet API.
 * 
 * @param transcript - Cleaned transcript text
 * @param videoMetadata - Video title and description
 * @returns SEO article with headline, meta description, content, and FAQs
 */
export async function generateSEOArticle(
  transcript: string,
  videoMetadata: VideoMetadata
): Promise<SEOArticle> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const systemPrompt = `You are an expert SEO content writer. Transform YouTube video transcripts into comprehensive, well-structured SEO articles (1500-2500 words).

Requirements:
- Compelling H1 headline (50-60 characters, includes primary keyword)
- Meta description (150-160 characters, compelling call-to-action)
- Introduction paragraph (150 words, hooks reader)
- 5-7 H2 sections with supporting paragraphs
- FAQ section with 5-7 common questions and detailed answers
- Conclusion with clear call-to-action
- Use markdown formatting
- Natural keyword integration (avoid keyword stuffing)
- Conversational yet authoritative tone

Format the article exactly as follows:
# [Headline]

**Meta Description:** [Your meta description here]

## Introduction
[Introduction content...]

## [Section 1]
[Content...]

## [Section 2]
[Content...]

[Continue with 5-7 total H2 sections]

## FAQ

**Q: [Question 1]?**
A: [Answer 1]

**Q: [Question 2]?**
A: [Answer 2]

[Continue with 5-7 FAQ items]`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Video Title: ${videoMetadata.title}

Video Description: ${videoMetadata.description}

Transcript:
${transcript}

Generate a comprehensive SEO article based on this content.`,
      },
    ],
  })

  const articleText = response.content[0].type === 'text' 
    ? response.content[0].text 
    : ''

  // Parse the article
  const headlineMatch = articleText.match(/^# (.+)$/m)
  const headline = headlineMatch ? headlineMatch[1] : videoMetadata.title

  const metaMatch = articleText.match(/\*\*Meta Description:\*\* (.+)$/m)
  const metaDescription = metaMatch ? metaMatch[1] : ''

  const faqs = extractFAQs(articleText)

  return {
    headline,
    metaDescription,
    content: articleText,
    faqs,
  }
}

/**
 * Extracts FAQ items from article markdown content.
 * 
 * @param article - Markdown article content
 * @returns Array of FAQ objects with question and answer
 */
export function extractFAQs(article: string): FAQ[] {
  const faqs: FAQ[] = []

  // Find FAQ section
  const faqSectionMatch = article.match(/## FAQ\s+([\s\S]*?)(?=\n##|$)/i)
  if (!faqSectionMatch) {
    return faqs
  }

  const faqSection = faqSectionMatch[1]

  // Extract Q&A pairs
  const qaPattern = /\*\*Q:\s*(.+?)\?\*\*\s+A:\s*(.+?)(?=\*\*Q:|$)/gs
  let match

  while ((match = qaPattern.exec(faqSection)) !== null) {
    faqs.push({
      question: match[1].trim() + '?',
      answer: match[2].trim(),
    })
  }

  return faqs
}
