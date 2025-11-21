import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App', () => {
  it('should render without errors', () => {
    const app = App();
    expect(app).toBeDefined();
  });
});
