import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

// Создаем фейковый localStorage для тестового окружения
beforeAll(() => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  global.localStorage = localStorageMock;
});

describe('App component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(true).toBe(false);
  });
});