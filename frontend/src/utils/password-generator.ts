import { randomInt } from 'mathjs'

function fisherYatesShuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Password generator utility class
export interface PasswordGeneratorOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

export class PasswordGenerator {
  static #UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  static #LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
  static #NUMBERS = '0123456789'
  static #SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  static #SIMILAR = 'il1Lo0O'
  static #AMBIGUOUS = '{}[]()/\\\'"`~,;.<>'

  static generate(options: PasswordGeneratorOptions): string {
    let charset = ''

    if (options.includeUppercase) {
      charset += this.#UPPERCASE
    }
    if (options.includeLowercase) {
      charset += this.#LOWERCASE
    }
    if (options.includeNumbers) {
      charset += this.#NUMBERS
    }
    if (options.includeSymbols) {
      charset += this.#SYMBOLS
    }

    if (options.excludeSimilar) {
      charset = charset.replace(new RegExp(`[${this.#SIMILAR}]`, 'g'), '')
    }
    if (options.excludeAmbiguous) {
      charset = charset.replace(new RegExp(`[${this.#AMBIGUOUS.replace(/[[\]\\]/g, '\\$&')}]`, 'g'), '')
    }

    if (charset.length === 0) {
      throw new Error('No character set selected')
    }

    const shuffledCharset = fisherYatesShuffle(charset.split('')).join('')

    let password = ''
    for (let i = 0; i < options.length; i++) {
      const randomIndex = randomInt(0, shuffledCharset.length)
      password += shuffledCharset[randomIndex]
    }

    return password
  }

  static checkStrength(password: string): {
    score: number
    feedback: string[]
    strength: 'weak' | 'fair' | 'good' | 'strong'
  } {
    const feedback: string[] = []
    let score = 0

    // Length check
    if (password.length >= 8)
      score += 1
    if (password.length >= 12)
      score += 1
    if (password.length >= 16)
      score += 1

    // Character type check
    if (/[a-z]/.test(password))
      score += 1
    if (/[A-Z]/.test(password))
      score += 1
    if (/\d/.test(password))
      score += 1
    if (/[^A-Z0-9]/i.test(password))
      score += 1

    // Feedback suggestions
    if (password.length < 8)
      feedback.push('Password is too short')
    if (!/[a-z]/.test(password))
      feedback.push('Add lowercase letters')
    if (!/[A-Z]/.test(password))
      feedback.push('Add uppercase letters')
    if (!/\d/.test(password))
      feedback.push('Add numbers')
    if (!/[^A-Z0-9]/i.test(password))
      feedback.push('Add symbols')

    // Common pattern check
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Avoid repeating characters')
      score -= 1
    }
    if (/123|abc|qwe/i.test(password)) {
      feedback.push('Avoid common sequences')
      score -= 1
    }

    // Strength classification
    let strength: 'weak' | 'fair' | 'good' | 'strong'
    if (score <= 2)
      strength = 'weak'
    else if (score <= 4)
      strength = 'fair'
    else if (score <= 6)
      strength = 'good'
    else strength = 'strong'

    return { score: Math.max(0, score), feedback, strength }
  }
}
