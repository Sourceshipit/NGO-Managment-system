import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCountUp } from '../hooks/useCountUp';

describe('useCountUp', () => {
  const rafCallbacks: FrameRequestCallback[] = [];
  let frameId = 0;

  beforeEach(() => {
    frameId = 0;
    rafCallbacks.length = 0;

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return ++frameId;
    });

    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a string value', () => {
    const { result } = renderHook(() => useCountUp(500));
    expect(typeof result.current).toBe('string');
  });

  it('handles target of 0', () => {
    const { result } = renderHook(() => useCountUp(0));
    expect(result.current).toBe('0');
  });

  it('handles decimal places parameter', () => {
    const { result } = renderHook(() => useCountUp(0, 1200, 2));
    expect(result.current).toBe('0.00');
  });

  it('registers a requestAnimationFrame callback for non-zero target', () => {
    renderHook(() => useCountUp(100));
    expect(rafCallbacks.length).toBeGreaterThan(0);
  });

  it('cancels animation on unmount', () => {
    const { unmount } = renderHook(() => useCountUp(100));
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
