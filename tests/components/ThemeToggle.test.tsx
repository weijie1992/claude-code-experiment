import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import ThemeToggle from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'dark';
    localStorage.clear();
  });

  it('renders a button with an accessible label', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: /switch to/i })
    ).toBeInTheDocument();
  });

  it('toggles data-theme on the html element when clicked', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('persists the selected theme to localStorage', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('toggles back to dark from light', async () => {
    document.documentElement.dataset.theme = 'light';
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
