/**
 * Verification tests for global mock setup
 * Ensures all external service mocks are properly initialized
 */

import { describe, it, expect } from 'vitest'
import {
  mockApifyClient,
  mockAnthropicClient,
  mockSupabaseClient,
  mockQStashClient,
  mockResendClient
} from '../setup'

describe('Mock Setup Verification', () => {
  it('should have Apify client mocked with actor and dataset methods', () => {
    expect(mockApifyClient.actor).toBeDefined()
    expect(typeof mockApifyClient.actor).toBe('function')
    expect(mockApifyClient.dataset).toBeDefined()
    expect(typeof mockApifyClient.dataset).toBe('function')
  })

  it('should have Anthropic client mocked with messages.create method', () => {
    expect(mockAnthropicClient.messages).toBeDefined()
    expect(mockAnthropicClient.messages.create).toBeDefined()
    expect(typeof mockAnthropicClient.messages.create).toBe('function')
  })

  it('should have Supabase client mocked with database and auth methods', () => {
    expect(mockSupabaseClient.from).toBeDefined()
    expect(typeof mockSupabaseClient.from).toBe('function')
    expect(mockSupabaseClient.auth).toBeDefined()
    expect(mockSupabaseClient.auth.getUser).toBeDefined()
    expect(typeof mockSupabaseClient.auth.getUser).toBe('function')
  })

  it('should have QStash client mocked with publishJSON method', () => {
    expect(mockQStashClient.publishJSON).toBeDefined()
    expect(typeof mockQStashClient.publishJSON).toBe('function')
  })

  it('should have Resend client mocked with emails.send method', () => {
    expect(mockResendClient.emails).toBeDefined()
    expect(mockResendClient.emails.send).toBeDefined()
    expect(typeof mockResendClient.emails.send).toBe('function')
  })

  it('should prevent real API calls by returning mock data', async () => {
    // Test Apify mock
    const apifyActor = mockApifyClient.actor()
    const actorResult = await apifyActor.call()
    expect(actorResult).toHaveProperty('defaultDatasetId')
    expect(actorResult.defaultDatasetId).toBe('mock-dataset-id')

    // Test Anthropic mock
    const claudeResult = await mockAnthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: 'test' }],
    } as any)
    expect(claudeResult).toHaveProperty('content')
    expect(Array.isArray(claudeResult.content)).toBe(true)

    // Test Supabase mock
    const supabaseResult = await mockSupabaseClient.from('test').select().single()
    expect(supabaseResult).toHaveProperty('data')
    expect(supabaseResult).toHaveProperty('error')
    expect(supabaseResult.error).toBeNull()

    // Test QStash mock
    const qstashResult = await mockQStashClient.publishJSON({
      url: 'https://test.com',
      body: { test: 'data' },
    })
    expect(qstashResult).toHaveProperty('messageId')
    expect(qstashResult.messageId).toBe('mock-qstash-message-id')

    // Test Resend mock
    const resendResult = await mockResendClient.emails.send({
      from: 'test@example.com',
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    })
    expect(resendResult).toHaveProperty('id')
    expect(resendResult.id).toBe('mock-resend-email-id')
  })

  it('should have environment variables set for testing', () => {
    expect(process.env.APIFY_API_TOKEN).toBe('mock-apify-token')
    expect(process.env.ANTHROPIC_API_KEY).toBe('mock-anthropic-key')
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://mock-supabase.supabase.co')
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('mock-supabase-anon-key')
    expect(process.env.QSTASH_TOKEN).toBe('mock-qstash-token')
    expect(process.env.RESEND_API_KEY).toBe('mock-resend-key')
  })
})
