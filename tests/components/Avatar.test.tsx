import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Avatar from '@/components/Avatar'

describe('Avatar', () => {
  it('renders the first letter of a plain name', () => {
    render(<Avatar name="alice" />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders the first two uppercase letters for a PascalCase name', () => {
    render(<Avatar name="PocketHeist" />)
    expect(screen.getByText('PH')).toBeInTheDocument()
  })

  it('renders only one letter when name has a single uppercase', () => {
    render(<Avatar name="John" />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })
})
