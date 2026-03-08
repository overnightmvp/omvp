import { describe, it, expect } from 'vitest'
import {
  generateSchemaMarkup,
  validateSchema,
  SchemaMarkup,
} from '../../../src/lib/agents/schema-builder'
import { SEOArticle } from '../../../src/lib/agents/transformer'

describe('schema-builder', () => {
  const mockArticle: SEOArticle = {
    headline: 'How to Master YouTube SEO in 2024',
    metaDescription: 'Learn the proven strategies to rank your videos higher',
    content: '# How to Master YouTube SEO in 2024\n\nFull article content here...',
    faqs: [
      {
        question: 'What is YouTube SEO?',
        answer: 'YouTube SEO is the process of optimizing your videos...',
      },
      {
        question: 'How long does it take to rank?',
        answer: 'It typically takes 2-4 weeks to see initial results...',
      },
    ],
  }

  const mockCreator = {
    name: 'Jane Smith',
    subdomain: 'janesmith',
    socialMedia: {
      youtube: 'https://youtube.com/@janesmith',
      twitter: 'https://twitter.com/janesmith',
    },
  }

  describe('generateSchemaMarkup', () => {
    it('returns Article schema with all required fields', () => {
      const result = generateSchemaMarkup(mockArticle, mockCreator)

      expect(result.article).toBeDefined()
      expect(result.article['@context']).toBe('https://schema.org')
      expect(result.article['@type']).toBe('Article')
      expect(result.article.headline).toBe(mockArticle.headline)
      expect(result.article.description).toBeDefined()
      expect(result.article.datePublished).toBeDefined()
      expect(result.article.dateModified).toBeDefined()
      expect(result.article.author).toBeDefined()
      expect(result.article.publisher).toBeDefined()
    })

    it('returns Person schema for article author', () => {
      const result = generateSchemaMarkup(mockArticle, mockCreator)

      expect(result.person).toBeDefined()
      expect(result.person['@context']).toBe('https://schema.org')
      expect(result.person['@type']).toBe('Person')
      expect(result.person.name).toBe(mockCreator.name)
      expect(result.person.url).toContain(mockCreator.subdomain)
      expect(result.person.sameAs).toBeInstanceOf(Array)
      expect(result.person.sameAs.length).toBeGreaterThan(0)
    })

    it('returns Organization schema for publisher', () => {
      const result = generateSchemaMarkup(mockArticle, mockCreator)

      expect(result.organization).toBeDefined()
      expect(result.organization['@context']).toBe('https://schema.org')
      expect(result.organization['@type']).toBe('Organization')
      expect(result.organization.name).toBe('Authority Platform')
      expect(result.organization.url).toBeDefined()
      expect(result.organization.logo).toBeDefined()
    })

    it('returns FAQPage schema with question/answer pairs', () => {
      const result = generateSchemaMarkup(mockArticle, mockCreator)

      expect(result.faq).toBeDefined()
      expect(result.faq['@context']).toBe('https://schema.org')
      expect(result.faq['@type']).toBe('FAQPage')
      expect(result.faq.mainEntity).toBeInstanceOf(Array)
      expect(result.faq.mainEntity.length).toBe(2)

      const firstQuestion = result.faq.mainEntity[0]
      expect(firstQuestion['@type']).toBe('Question')
      expect(firstQuestion.name).toBe(mockArticle.faqs[0].question)
      expect(firstQuestion.acceptedAnswer).toBeDefined()
      expect(firstQuestion.acceptedAnswer['@type']).toBe('Answer')
      expect(firstQuestion.acceptedAnswer.text).toBe(mockArticle.faqs[0].answer)
    })

    it('validates all generated schemas pass basic validation', () => {
      const result = generateSchemaMarkup(mockArticle, mockCreator)

      expect(validateSchema(result.article)).toBe(true)
      expect(validateSchema(result.person)).toBe(true)
      expect(validateSchema(result.organization)).toBe(true)
      expect(validateSchema(result.faq)).toBe(true)
    })
  })

  describe('validateSchema', () => {
    it('returns true for valid schema with @context and @type', () => {
      const validSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test',
      }
      expect(validateSchema(validSchema)).toBe(true)
    })

    it('returns false for schema missing @context', () => {
      const invalidSchema = {
        '@type': 'Article',
        headline: 'Test',
      }
      expect(validateSchema(invalidSchema)).toBe(false)
    })

    it('returns false for schema missing @type', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        headline: 'Test',
      }
      expect(validateSchema(invalidSchema)).toBe(false)
    })
  })
})
