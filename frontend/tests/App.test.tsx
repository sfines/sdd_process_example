import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('should render without errors', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });
});
