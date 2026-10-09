import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '../src/components/ui/Button.jsx';
import { Badge } from '../src/components/ui/Badge.jsx';
import { MetricCard } from '../src/components/dashboard/MetricCard.jsx';
import { formatMinutesToHours, formatDate } from '../src/utils/formatters.js';

describe('Frontend Component & Formatter Unit Tests', () => {
  it('formats minutes to hours and minutes correctly', () => {
    expect(formatMinutesToHours(125)).toBe('2h 5m');
    expect(formatMinutesToHours(60)).toBe('1h');
    expect(formatMinutesToHours(45)).toBe('45m');
    expect(formatMinutesToHours(0)).toBe('0m');
  });

  it('formats calendar dates accurately', () => {
    expect(formatDate('2026-10-09')).toBe('Oct 9, 2026');
  });

  it('renders Button component with children and primary styling', () => {
    render(<Button variant="primary">Click Me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders Badge component with correct variant', () => {
    render(<Badge variant="emerald">Balanced</Badge>);
    expect(screen.getByText('Balanced')).toBeInTheDocument();
  });

  it('renders MetricCard with title and formatted value', () => {
    render(
      <MetricCard
        title="Screen Time Today"
        value="3h 45m"
        subvalue="Goal: 6h"
      />
    );
    expect(screen.getByText('Screen Time Today')).toBeInTheDocument();
    expect(screen.getByText('3h 45m')).toBeInTheDocument();
    expect(screen.getByText('Goal: 6h')).toBeInTheDocument();
  });
});
