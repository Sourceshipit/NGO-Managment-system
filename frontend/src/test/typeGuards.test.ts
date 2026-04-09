import { describe, it, expect } from 'vitest';
import {
  isObject,
  isNonEmptyArray,
  safeJsonParse,
  safeGet,
  hasRequiredFields,
  toNumber,
  toString,
} from '../utils/typeGuards';

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject(42)).toBe(false);
    expect(isObject('hello')).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });
});

describe('isNonEmptyArray', () => {
  it('returns true for non-empty arrays', () => {
    expect(isNonEmptyArray([1, 2, 3])).toBe(true);
  });

  it('returns false for empty arrays', () => {
    expect(isNonEmptyArray([])).toBe(false);
  });

  it('returns false for non-arrays', () => {
    expect(isNonEmptyArray('hello')).toBe(false);
    expect(isNonEmptyArray(null)).toBe(false);
  });
});

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('["a","b"]', [])).toEqual(['a', 'b']);
    expect(safeJsonParse('{"key":"val"}', {})).toEqual({ key: 'val' });
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('not json', [])).toEqual([]);
  });

  it('returns fallback for null', () => {
    expect(safeJsonParse(null, 'default')).toBe('default');
  });

  it('returns fallback for undefined', () => {
    expect(safeJsonParse(undefined, [])).toEqual([]);
  });
});

describe('safeGet', () => {
  it('gets nested property', () => {
    const obj = { a: { b: { c: 42 } } };
    expect(safeGet(obj, 'a.b.c', 0)).toBe(42);
  });

  it('returns fallback for missing path', () => {
    const obj = { a: 1 };
    expect(safeGet(obj, 'a.b.c', 'nope')).toBe('nope');
  });

  it('returns fallback for null input', () => {
    expect(safeGet(null, 'a.b', 0)).toBe(0);
  });
});

describe('hasRequiredFields', () => {
  it('returns true when all fields present', () => {
    const obj = { id: 1, name: 'test', email: 'a@b.com' };
    expect(hasRequiredFields(obj, ['id', 'name'])).toBe(true);
  });

  it('returns false when field missing', () => {
    const obj = { id: 1 };
    expect(hasRequiredFields(obj, ['id', 'name'])).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(hasRequiredFields(null, ['id'])).toBe(false);
    expect(hasRequiredFields('string', ['length'])).toBe(false);
  });
});

describe('toNumber', () => {
  it('returns number for number input', () => {
    expect(toNumber(42)).toBe(42);
  });

  it('parses string number', () => {
    expect(toNumber('3.14')).toBeCloseTo(3.14);
  });

  it('returns fallback for NaN', () => {
    expect(toNumber(NaN, -1)).toBe(-1);
  });

  it('returns fallback for non-numeric string', () => {
    expect(toNumber('abc', 0)).toBe(0);
  });

  it('returns fallback for null', () => {
    expect(toNumber(null)).toBe(0);
  });
});

describe('toString', () => {
  it('returns string as-is', () => {
    expect(toString('hello')).toBe('hello');
  });

  it('converts number to string', () => {
    expect(toString(42)).toBe('42');
  });

  it('returns fallback for null', () => {
    expect(toString(null, 'N/A')).toBe('N/A');
  });

  it('returns fallback for undefined', () => {
    expect(toString(undefined, 'N/A')).toBe('N/A');
  });
});
