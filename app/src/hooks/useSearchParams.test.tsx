import { renderHook } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { TypedURLSearchParams, useSearchParams } from 'hooks/useSearchParams';
import { PropsWithChildren } from 'react';
import { Router } from 'react-router';

describe('useSearchParams', () => {
  it('updates history with new params', () => {
    const history = createMemoryHistory();

    const { result } = renderHook(() => useSearchParams(), {
      wrapper: ({ children }: PropsWithChildren) => <Router history={history}>{children}</Router>
    });

    result.current.setSearchParams(result.current.searchParams.set('key1', 'value1').set('key2', 'value2'));

    expect(history.location.search).toBe('?key1=value1&key2=value2');
  });
});

describe('TypedURLSearchParams', () => {
  describe('set', () => {
    it('sets a key/value', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');
    });
  });

  describe('setOrDelete', () => {
    it('deletes a key if the value is null', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');

      typedURLSearchParams.setOrDelete('key2', null);
      const stringValue3 = typedURLSearchParams.toString();
      expect(stringValue3).toBe('key1=value1');
    });

    it('deletes a key if the value is undefined', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');

      typedURLSearchParams.setOrDelete('key2', undefined);
      const stringValue3 = typedURLSearchParams.toString();
      expect(stringValue3).toBe('key1=value1');
    });

    it('deletes a key if the value is an empty string', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');

      typedURLSearchParams.setOrDelete('key2', '');
      const stringValue3 = typedURLSearchParams.toString();
      expect(stringValue3).toBe('key1=value1');
    });

    it('stringifies and sets the value if it is not a string', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.setOrDelete('key2', {
        key3: 'value3',
        key4: {
          Key5: 'value5'
        }
      });
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=key3%3Dvalue3%26key4%255BKey5%255D%3Dvalue5');
    });

    it('sets a key/value', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.setOrDelete('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');
    });
  });

  describe('get', () => {
    it('returns null if key does not exist', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      const value = typedURLSearchParams.get('key2');
      expect(value).toBeNull();
    });

    it('returns the value if the key exists', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const value = typedURLSearchParams.get('key2');
      expect(value).toBe('value2');
    });
  });

  describe('delete', () => {
    it('does nothing if the key does not exist', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.delete('key2');
      const stringValue3 = typedURLSearchParams.toString();
      expect(stringValue3).toBe('key1=value1');
    });

    it('deletes a key', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');

      typedURLSearchParams.delete('key2');
      const stringValue3 = typedURLSearchParams.toString();
      expect(stringValue3).toBe('key1=value1');
    });
  });

  describe('toString', () => {
    it('returns the params as a string', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');
    });
  });

  describe('append', () => {
    it('appends a key/value', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.append('key1', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key1=value2');
    });
  });

  describe('entries', () => {
    it('returns the entries', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');

      const entries = typedURLSearchParams.entries();
      const entry1 = entries.next().value;
      expect(entry1).toEqual(['key1', 'value1']);
      const entry2 = entries.next().value;
      expect(entry2).toEqual(['key2', 'value2']);
    });
  });

  describe('forEach', () => {
    it('calls a callback on each param', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');

      const callback = vi.fn();
      typedURLSearchParams.forEach(callback);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith('value1', 'key1', typedURLSearchParams);
      expect(callback).toHaveBeenCalledWith('value2', 'key2', typedURLSearchParams);
    });
  });

  describe('getAll', () => {
    it('returns all params', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.append('key1', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key1=value2');

      const all = typedURLSearchParams.getAll('key1');
      expect(all).toEqual(['value1', 'value2']);
    });
  });

  describe('has', () => {
    it('returns true if the key exists', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      const hasKey1 = typedURLSearchParams.has('key1');
      expect(hasKey1).toBe(true);
    });

    it('returns false if the key does not exist', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      const hasKey1 = typedURLSearchParams.has('key2');
      expect(hasKey1).toBe(false);
    });
  });

  describe('keys', () => {
    it('returns all keys', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');

      const keys = typedURLSearchParams.keys();
      const key1 = keys.next().value;
      expect(key1).toBe('key1');
      const key2 = keys.next().value;
      expect(key2).toBe('key2');
    });
  });

  describe('sort', () => {
    it('sorts all of the keys', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('keyB', 'value2');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('keyB=value2');

      typedURLSearchParams.set('keyA', 'value3');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('keyB=value2&keyA=value3');

      typedURLSearchParams.set('keyC', 'value4');
      const stringValue3 = typedURLSearchParams.toString();
      expect(stringValue3).toBe('keyB=value2&keyA=value3&keyC=value4');

      typedURLSearchParams.append('keyB', 'value1');
      const stringValue4 = typedURLSearchParams.toString();
      expect(stringValue4).toBe('keyB=value2&keyA=value3&keyC=value4&keyB=value1');

      typedURLSearchParams.sort();
      const stringValue5 = typedURLSearchParams.toString();
      expect(stringValue5).toBe('keyA=value3&keyB=value2&keyB=value1&keyC=value4');
    });
  });

  describe('values', () => {
    it('returns all the values', async () => {
      const typedURLSearchParams = new TypedURLSearchParams();

      typedURLSearchParams.set('key1', 'value1');
      const stringValue1 = typedURLSearchParams.toString();
      expect(stringValue1).toBe('key1=value1');

      typedURLSearchParams.set('key2', 'value2');
      const stringValue2 = typedURLSearchParams.toString();
      expect(stringValue2).toBe('key1=value1&key2=value2');

      const values = typedURLSearchParams.values();
      const value1 = values.next().value;
      expect(value1).toBe('value1');
      const value2 = values.next().value;
      expect(value2).toBe('value2');
    });
  });
});
