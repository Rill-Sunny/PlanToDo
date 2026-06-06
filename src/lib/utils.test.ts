import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn function', () => {
  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle falsy values', () => {
    expect(cn('class1', false, null, undefined, 'class2')).toBe('class1 class2')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })
})