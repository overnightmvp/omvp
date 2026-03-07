import { describe, it, expect } from 'vitest'
import { cleanTranscript } from '@/lib/agents/cleaner'

describe('cleanTranscript', () => {
  it('removes timestamp patterns [00:12] and 0:12 format', () => {
    const input = `[00:12] Hello world. This is a test at 1:30 in the video.
    [02:45] Another timestamp here.
    At 5:12 we discuss something important.`

    const result = cleanTranscript(input)

    expect(result).not.toContain('[00:12]')
    expect(result).not.toContain('[02:45]')
    expect(result).toContain('Hello world')
    expect(result).toContain('This is a test')
    expect(result).toContain('in the video')
    expect(result).toContain('we discuss something important')
  })

  it('removes excessive filler words (um, uh, you know) when repeated', () => {
    const input = `Um, well, uh, I think that, you know, this is um important.
    You know, uh, we need to um, you know, understand this concept.`

    const result = cleanTranscript(input)

    // Filler words should be removed
    expect(result).not.toContain('Um,')
    expect(result).not.toContain('uh,')
    expect(result).not.toContain('um,')
    expect(result).toContain('this is important')
    expect(result).toContain('we need to understand this concept')
  })

  it('preserves meaningful use of "like" (e.g., "tools like Photoshop")', () => {
    const input = `I like, you know, like, tools like Photoshop and like Illustrator.
    It's, like, really good for design.`

    const result = cleanTranscript(input)

    // Meaningful "like" should be preserved
    expect(result).toContain('tools like Photoshop')
    expect(result).toContain('like Illustrator')
    // Filler "like" should be removed
    expect(result).not.toContain('like, you know')
    expect(result).not.toContain("It's, like,")
  })

  it('normalizes whitespace (multiple newlines → double newline)', () => {
    const input = `First paragraph.




Second paragraph.    Multiple    spaces    here.



Third paragraph.`

    const result = cleanTranscript(input)

    // Should not have more than 2 consecutive newlines
    expect(result).not.toMatch(/\n{3,}/)
    // Should not have multiple consecutive spaces on same line
    expect(result).not.toMatch(/[ \t]{2,}/)
    expect(result).toContain('First paragraph')
    expect(result).toContain('Second paragraph')
    expect(result).toContain('Multiple spaces here')
    expect(result).toContain('Third paragraph')
  })

  it('returns original if transcript is already clean', () => {
    const input = `This is a clean transcript.
It has proper formatting.
No filler words or timestamps.
Just natural language.`

    const result = cleanTranscript(input)

    expect(result).toContain('This is a clean transcript')
    expect(result).toContain('It has proper formatting')
    expect(result).toContain('No filler words or timestamps')
    expect(result).toContain('Just natural language')
  })

  it('handles complex real-world transcript', () => {
    const input = `[00:00] Um, hey everyone! Uh, welcome to this, you know, tutorial.
    [00:15] Today we're gonna, like, talk about React hooks.
    [00:30] So, um, React hooks are, you know, like, really powerful tools like useState and useEffect.
    [01:00] You know, they let you, uh, manage state and, like, side effects.



    [01:30] Let me show you, um, an example.`

    const result = cleanTranscript(input)

    // No timestamps
    expect(result).not.toMatch(/\[\d{2}:\d{2}\]/)
    // Reduced filler words
    expect(result).not.toContain('Um,')
    expect(result).not.toContain('Uh,')
    // Meaningful content preserved
    expect(result).toContain('hey everyone')
    expect(result).toContain('React hooks')
    expect(result).toContain('tools like useState and useEffect')
    expect(result).toContain('manage state')
    // Normalized whitespace
    expect(result).not.toMatch(/\n{3,}/)
  })
})
