import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabRestore } from '../hooks/useTabRestore';

describe('useTabRestore', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns default tab when no stored value', () => {
    const { result } = renderHook(() => useTabRestore('test-page', 0));
    expect(result.current[0]).toBe(0);
  });

  it('returns custom default tab', () => {
    const { result } = renderHook(() => useTabRestore('test-page', 2));
    expect(result.current[0]).toBe(2);
  });

  it('persists tab selection to sessionStorage', () => {
    const { result } = renderHook(() => useTabRestore('test-page', 0));

    act(() => {
      result.current[1](3);
    });

    expect(result.current[0]).toBe(3);
    expect(sessionStorage.getItem('benetrack-tab-test-page')).toBe('3');
  });

  it('restores persisted tab on re-mount', () => {
    sessionStorage.setItem('benetrack-tab-restore-test', '2');
    const { result } = renderHook(() => useTabRestore('restore-test', 0));
    expect(result.current[0]).toBe(2);
  });

  it('uses different keys for different pages', () => {
    const { result: r1 } = renderHook(() => useTabRestore('page-a', 0));
    const { result: r2 } = renderHook(() => useTabRestore('page-b', 0));

    act(() => { r1.current[1](1); });
    act(() => { r2.current[1](4); });

    expect(sessionStorage.getItem('benetrack-tab-page-a')).toBe('1');
    expect(sessionStorage.getItem('benetrack-tab-page-b')).toBe('4');
  });
});
