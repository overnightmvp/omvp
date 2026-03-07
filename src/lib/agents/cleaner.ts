/**
 * Cleans YouTube transcripts by removing timestamps, filler words, and normalizing whitespace.
 * 
 * @param transcript - Raw transcript text
 * @returns Cleaned transcript with timestamps and filler words removed
 */
export function cleanTranscript(transcript: string): string {
  let cleaned = transcript

  // Step 1: Remove timestamp patterns
  // Matches [00:12] format
  cleaned = cleaned.replace(/\[\d{1,2}:\d{2}\]/g, '')
  // Matches standalone 0:12 or 1:30 format at start of line or after "at"
  cleaned = cleaned.replace(/\b\d{1,2}:\d{2}\b/g, '')

  // Step 2: Remove standalone filler words (um, uh, hmm)
  cleaned = cleaned.replace(/\b(um|uh|hmm)\b,?\s*/gi, '')

  // Step 3: Remove repetitive filler phrases
  cleaned = cleaned.replace(/\b(you know|I mean|kind of|sort of),?\s+/gi, '')

  // Step 4: Remove filler usage of "like" (but preserve meaningful ones)
  // Remove "like" at start of sentence or after comma followed by filler
  cleaned = cleaned.replace(/,\s+like,\s+/gi, ', ')
  cleaned = cleaned.replace(/\b(like),\s+(you know|well|uh|um)\b/gi, '')
  cleaned = cleaned.replace(/It's,\s+like,/gi, "It's")
  cleaned = cleaned.replace(/I\s+like,\s+you know,\s+like,/gi, 'I ')

  // Step 5: Remove well/so/basically at sentence starts
  cleaned = cleaned.replace(/^\s*(well|so|basically),?\s+/gim, '')

  // Step 6: Normalize whitespace
  // Replace 3+ newlines with double newline first
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  // Trim each line and replace multiple spaces with single space
  cleaned = cleaned.split('\n')
    .map(line => line.trim().replace(/[ \t]{2,}/g, ' '))
    .join('\n')
  // Remove leading/trailing whitespace
  cleaned = cleaned.trim()

  return cleaned
}
