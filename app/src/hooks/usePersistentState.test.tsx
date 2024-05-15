import { renderHook, waitFor } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

const KEY = 'KEY';
const VALUE = 'VALUE';

describe('usePersistentState', () => {
  const lsGetItemMock = jest.spyOn(window.localStorage.__proto__, 'getItem');
  const lsSetItemMock = jest.spyOn(window.localStorage.__proto__, 'setItem');

  beforeEach(() => {
    lsGetItemMock.mockClear();
    lsSetItemMock.mockClear();
  });

  describe('get initial value', () => {
    it('when nothing in local storage should return initial value', () => {
      lsGetItemMock.mockReturnValue(null);

      const { result } = renderHook(() => usePersistentState(KEY, VALUE));
      const [value, setValue] = result.current;

      expect(value).toBe(VALUE);
      expect(setValue).toBeDefined();
    });

    it('when local storage value exists return stored value', () => {
      lsGetItemMock.mockReturnValue('STORAGE');

      const { result } = renderHook(() => usePersistentState(KEY, VALUE));
      const [value] = result.current;

      expect(value).toBe('STORAGE');
    });

    it('handles objects', () => {
      lsGetItemMock.mockReturnValue({ hello: 'world' });

      const { result } = renderHook(() => usePersistentState(KEY, VALUE));
      const [value] = result.current;

      expect(value).toStrictEqual({ hello: 'world' });
    });

    it('handles 0', () => {
      lsGetItemMock.mockReturnValue(0);

      const { result } = renderHook(() => usePersistentState(KEY, VALUE));
      const [value] = result.current;

      expect(value).toBe(0);
    });

    it('handles 1', () => {
      lsGetItemMock.mockReturnValue(1);

      const { result } = renderHook(() => usePersistentState(KEY, VALUE));
      const [value] = result.current;

      expect(value).toBe(1);
    });

    it('handles arrays', () => {
      lsGetItemMock.mockReturnValue([0, 1]);

      const { result } = renderHook(() => usePersistentState(KEY, VALUE));
      const [value] = result.current;

      expect(value).toStrictEqual([0, 1]);
    });
  });
  describe('setValue', () => {
    it('also sets local storage', async () => {
      const { result } = renderHook(() => usePersistentState(KEY, VALUE));
      const [value, setValue] = result.current;

      expect(value).toBe(VALUE);

      await waitFor(() => {
        setValue('NEW');
        expect(lsSetItemMock).toHaveBeenCalledWith(`USE_PERSISTENT_STATE_${KEY}`, 'NEW');
        const [newValue] = result.current;
        expect(newValue).toBe('NEW');
      });
    });

    it('sanity checking it works with objects', async () => {
      const { result } = renderHook(() => usePersistentState(KEY, VALUE));
      const [value, setValue] = result.current;

      expect(value).toBe(VALUE);

      const obj = { hello: 'world' };
      await waitFor(() => {
        setValue(obj as unknown as string);
        expect(lsSetItemMock).toHaveBeenCalledWith(`USE_PERSISTENT_STATE_${KEY}`, JSON.stringify(obj));
        const [newValue] = result.current;
        expect(newValue).toBe(obj);
      });
    });
  });
});
