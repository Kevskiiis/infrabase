import { describe, it, expect } from 'vitest'
import { deriveUserInitials, getAvatarAccessibleLabel } from '../../src/features/navigation/userInitials'

/**
 * Unit tests for user initials derivation.
 * 
 * Coverage areas:
 * - Display name to initials (first/last word rule)
 * - Email fallback when name is absent/blank
 * - Punctuation and whitespace handling
 * - Uppercase normalization
 * - Long identity overflow
 * - Safe `?` fallback
 * - Subject identifier non-disclosure
 * - Two-character limit
 */

describe('User Initials Derivation', () => {
  describe('Display name handling', () => {
    it('should derive initials from single-word display name', () => {
      expect(deriveUserInitials('John')).toBe('J')
    })

    it('should derive initials from two-word display name (first and last)', () => {
      expect(deriveUserInitials('John Smith')).toBe('JS')
    })

    it('should derive initials from multi-word display name (first and last only)', () => {
      expect(deriveUserInitials('Mary Jane Watson')).toBe('MW')
    })

    it('should uppercase all derived initials', () => {
      expect(deriveUserInitials('john smith')).toBe('JS')
      expect(deriveUserInitials('JOHN SMITH')).toBe('JS')
      expect(deriveUserInitials('JoHn SmItH')).toBe('JS')
    })

    it('should trim whitespace before deriving initials', () => {
      expect(deriveUserInitials('  John Smith  ')).toBe('JS')
      expect(deriveUserInitials('\tJohn\t\tSmith\n')).toBe('JS')
    })

    it('should skip punctuation and extract meaningful characters', () => {
      expect(deriveUserInitials("O'Brien")).toBe('O')
      expect(deriveUserInitials("Mary-Jane Watson")).toBe('MW')
    })

    it('should handle accented characters', () => {
      expect(deriveUserInitials('José María')).toBe('JM')
    })

    it('should handle long display names without overflow', () => {
      const result = deriveUserInitials('Alexander Christopher Benjamin Theodore')
      expect(result).toHaveLength(2)
      expect(result).toBe('AT')
    })
  })

  describe('Email fallback handling', () => {
    it('should use email initials when display name is absent', () => {
      expect(deriveUserInitials(undefined, 'ada@example.com')).toBe('A')
      expect(deriveUserInitials(null, 'john.smith@example.com')).toBe('JS')
    })

    it('should use email initials when display name is blank', () => {
      expect(deriveUserInitials('', 'ada@example.com')).toBe('A')
      expect(deriveUserInitials('   ', 'john.smith@example.com')).toBe('JS')
    })

    it('should extract local part before @ symbol', () => {
      expect(deriveUserInitials(undefined, 'ada@example.com')).toBe('A')
      expect(deriveUserInitials(undefined, 'ada@very.long.domain.example.com')).toBe('A')
    })

    it('should handle email with multiple words in local part', () => {
      expect(deriveUserInitials(undefined, 'john.smith@example.com')).toBe('JS')
      expect(deriveUserInitials(undefined, 'mary-jane-watson@example.com')).toBe('MW')
    })

    it('should handle long email addresses without overflow', () => {
      const result = deriveUserInitials(undefined, 'alexander.christopher.benjamin@verylongdomainname.example.com')
      expect(result).toHaveLength(2)
      expect(result).toBe('AB')
    })

    it('should uppercase email-derived initials', () => {
      expect(deriveUserInitials(undefined, 'ada@example.com')).toBe('A')
      expect(deriveUserInitials(undefined, 'john.smith@example.com')).toBe('JS')
    })
  })

  describe('Fallback and edge cases', () => {
    it('should return `?` when both name and email are absent', () => {
      expect(deriveUserInitials(undefined, undefined)).toBe('?')
      expect(deriveUserInitials(null, null)).toBe('?')
    })

    it('should return `?` when both name and email are blank', () => {
      expect(deriveUserInitials('', '')).toBe('?')
      expect(deriveUserInitials('   ', '   ')).toBe('?')
    })

    it('should return `?` when both name and email contain only whitespace', () => {
      expect(deriveUserInitials('   \t\n  ', '  \n  ')).toBe('?')
    })

    it('should return `?` when both name and email contain only punctuation', () => {
      expect(deriveUserInitials('!!!', '...')).toBe('?')
      expect(deriveUserInitials('---', '***')).toBe('?')
    })

    it('should never expose subject identifier or internal ID', () => {
      // Even if accidentally passed, should extract meaningful characters or fallback
      const result = deriveUserInitials('user-12345-subject-identifier', undefined)
      expect(result).not.toContain('12345')
      expect(result).not.toContain('subject')
    })

    it('should never expose session token or credential', () => {
      const result = deriveUserInitials(undefined, 'token-abc123xyz@example.com')
      expect(result).not.toContain('abc123')
      expect(result).not.toContain('xyz')
    })

    it('should limit output to exactly 2 characters maximum', () => {
      const testCases = [
        'J',
        'John',
        'John Smith',
        'Alexander Christopher Benjamin Theodore',
        'ada@example.com',
        'john.smith@example.com',
      ]
      testCases.forEach((input) => {
        const result = deriveUserInitials(input)
        expect(result.length).toBeLessThanOrEqual(2)
      })
    })
  })

  describe('Avatar accessible label', () => {
    it('should generate meaningful label with display name', () => {
      const label = getAvatarAccessibleLabel('JS', 'John Smith', 'john@example.com')
      expect(label).toContain('John Smith')
      expect(label).toContain('JS')
      expect(label).toContain('avatar')
    })

    it('should fall back to email when display name is unavailable', () => {
      const label = getAvatarAccessibleLabel('A', undefined, 'ada@example.com')
      expect(label).toContain('ada@example.com')
      expect(label).toContain('A')
    })

    it('should use "Unknown user" when both name and email are unavailable', () => {
      const label = getAvatarAccessibleLabel('?', undefined, undefined)
      expect(label).toContain('Unknown user')
      expect(label).toContain('?')
    })
  })
})
