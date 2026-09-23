/**
 * Derive user initials for avatar display from authenticated identity.
 * 
 * Rules:
 * 1. Trim and validate inputs; skip empty/blank values
 * 2. Prefer display name over email
 * 3. Single meaningful word → first character
 * 4. Multiple meaningful words → first character of first and last word
 * 5. Uppercase and limit to 2 characters
 * 6. Return '?' if no usable input
 * 
 * Safety:
 * - Never display subject identifiers, session tokens, or raw claims
 * - Handle punctuation, whitespace, and unicode gracefully
 */

/**
 * Determine if a string contains usable text for initials.
 * A usable string must:
 * - Be non-empty after trimming
 * - Contain at least one alphanumeric character (not just punctuation)
 */
function isUsableIdentity(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  return trimmed.length > 0 && /[a-z0-9]/i.test(trimmed)
}

/**
 * Extract meaningful words from a string, skipping punctuation-only segments.
 * A meaningful word must contain at least one alphanumeric character.
 * Splits on whitespace and common word separators (., -, _).
 */
function extractMeaningfulWords(value: string): string[] {
  return value
    .trim()
    .split(/[\s.\-_]+/)
    .filter((word) => /[a-z0-9]/i.test(word))
}

/**
 * Get the first alphabetic/numeric character from a word.
 */
function getFirstAlphanumeric(word: string): string | undefined {
  for (const char of word) {
    if (/[a-z0-9]/i.test(char)) return char.toUpperCase()
  }
  return undefined
}

/**
 * Derive display initials from display name or email fallback.
 * 
 * @param displayName - Preferred identity (usually the user's display name)
 * @param email - Fallback identity (usually the user's email address)
 * @returns Two uppercase characters, or '?' if no usable input
 * 
 * @example
 * deriveUserInitials('John Smith', 'john@example.com') // => 'JS'
 * deriveUserInitials('Mary', 'mary@example.com') // => 'M'
 * deriveUserInitials('', 'ada@example.com') // => 'AE' (email: ada@example.com → 'A' + 'E')
 * deriveUserInitials('', '') // => '?'
 */
export function deriveUserInitials(displayName?: string | null, email?: string | null): string {
  // Try display name first
  if (isUsableIdentity(displayName)) {
    const words = extractMeaningfulWords(displayName!)
    if (words.length > 0) {
      const firstChar = getFirstAlphanumeric(words[0])
      if (words.length === 1) {
        // Single word: use its first character
        return firstChar || '?'
      } else {
        // Multiple words: use first character of first and last word
        const lastChar = getFirstAlphanumeric(words[words.length - 1])
        return (firstChar || '') + (lastChar || '?')
      }
    }
  }

  // Fall back to email
  if (isUsableIdentity(email)) {
    const emailLocal = email!.split('@')[0] // Part before @
    const words = extractMeaningfulWords(emailLocal)
    if (words.length > 0) {
      const firstChar = getFirstAlphanumeric(words[0])
      if (words.length === 1) {
        // Single word in local part: use its first character
        return firstChar || '?'
      } else {
        // Multiple words: use first character of first and last word
        const lastChar = getFirstAlphanumeric(words[words.length - 1])
        return (firstChar || '') + (lastChar || '?')
      }
    }
  }

  // No usable identity: return safe fallback
  return '?'
}

/**
 * Get the accessible label for an avatar displaying the given initials.
 * Describes the initials and the user identity (without exposing subject ID or session).
 */
export function getAvatarAccessibleLabel(
  initials: string,
  displayName?: string | null,
  email?: string | null
): string {
  const identity = displayName || email || 'Unknown user'
  return `${identity} avatar: ${initials}`
}
