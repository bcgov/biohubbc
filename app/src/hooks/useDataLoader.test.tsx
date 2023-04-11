import { act, renderHook } from '@testing-library/react-hooks';
import { Deferred } from 'test-helpers/promises';
import useDataLoader from './useDataLoader';

describe('useDataLoader', () => {
  describe('mounting conditions', () => {
    const deferred = new Deferred();
    const { result } = renderHook(() => useDataLoader(() => deferred.promise));

    it('should mount with an empty data property', () => {
      expect(result.current.data).toBeUndefined();
    });

    it('should mount with an empty error property', () => {
      expect(result.current.error).toBeUndefined();
    });

    it('should mount and not be loading', () => {
      expect(result.current.isLoading).toEqual(false);
    });

    it('should mount and not be ready', () => {
      expect(result.current.isReady).toEqual(false);
    });

    it('should mount and not have loaded', () => {
      expect(result.current.hasLoaded).toEqual(false);
    });
  });

  describe('load', () => {
    describe('with rejecting promise', () => {
      it('should expose an error when the promise rejects', async () => {
        const deferred = new Deferred<string, string>();
        const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

        act(() => result.current.load());
        deferred.reject('promise-rejected');
        await waitForValueToChange(() => result.current.error);

        expect(result.current.error).toEqual('promise-rejected');
      });

      it('should be in a ready state once the promise rejects', async () => {
        const deferred = new Deferred<string, string>();
        const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

        act(() => result.current.load());
        deferred.reject('promise-rejected');
        await waitForValueToChange(() => result.current.error);

        expect(result.current.data).toBeUndefined();
        expect(result.current.isLoading).toEqual(false);
        expect(result.current.isReady).toEqual(true);
        expect(result.current.hasLoaded).toEqual(true);
      });
    });

    describe('with resolved promise', () => {
      it('should expose data when the promise resolves', async () => {
        const deferred = new Deferred<string>();
        const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

        act(() => result.current.load());
        deferred.resolve('promise-resolved');
        await waitForValueToChange(() => result.current.data);

        expect(result.current.data).toEqual('promise-resolved');
      });

      it('should be in a ready state once the promise resolves', async () => {
        const deferred = new Deferred<string>();
        const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

        act(() => result.current.load());
        deferred.resolve('promise-resolved');
        await waitForValueToChange(() => result.current.data);

        expect(result.current.error).toBeUndefined();
        expect(result.current.isLoading).toEqual(false);
        expect(result.current.isReady).toEqual(true);
        expect(result.current.hasLoaded).toEqual(true);
      });
    });
  });

  describe('refresh', () => {
    it('should clear errors when refresh is called', async () => {
      const deferred = new Deferred<string, string>();
      const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

      act(() => result.current.load());
      deferred.reject('reject1');
      await waitForValueToChange(() => result.current.error);

      expect(result.current.error).toEqual('reject1');

      act(() => {
        deferred.reset();
        result.current.refresh();
      });

      expect(result.current.error).toBeUndefined();
    });

    it('should still expose its old data after refresh is called', async () => {
      const deferred = new Deferred<string>();
      const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

      act(() => result.current.load());
      deferred.resolve('test2');
      await waitForValueToChange(() => result.current.data);
      expect(result.current.data).toEqual('test2');

      act(() => {
        deferred.reset();
        result.current.refresh();
      });

      expect(result.current.data).toBe('test2');
    });

    describe('resolves a successful refresh', () => {
      it('should update the data after refresh callback resolves', async () => {
        const deferred = new Deferred<string>();
        const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

        act(() => result.current.load());
        deferred.resolve('test3');
        await waitForValueToChange(() => result.current.data);
        expect(result.current.data).toEqual('test3');

        act(() => {
          deferred.reset();
          result.current.refresh();
        });
        deferred.resolve('test3-refreshed');
        await waitForValueToChange(() => result.current.data);

        expect(result.current.data).toEqual('test3-refreshed');
      });

      it('should be in a ready state after refresh resolves', async () => {
        const deferred = new Deferred<string>();
        const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

        act(() => result.current.load());
        deferred.resolve('test3');
        await waitForValueToChange(() => result.current.data);
        expect(result.current.data).toEqual('test3');

        expect(result.current.error).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isReady).toBe(true);
        expect(result.current.hasLoaded).toBe(true);

        act(() => {
          deferred.reset();
          result.current.refresh();
        });
        deferred.resolve('test3-refreshed');
        await waitForValueToChange(() => result.current.data);

        expect(result.current.error).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isReady).toBe(true);
        expect(result.current.hasLoaded).toBe(true);
      });
    });

    describe('rejects an unsuccessful refresh', () => {
      it('should not update the data after refresh callback rejects', async () => {
        const deferred = new Deferred<string, string>();
        const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

        act(() => result.current.load());
        deferred.resolve('resolve1');
        await waitForValueToChange(() => result.current.data);
        expect(result.current.data).toEqual('resolve1');

        act(() => {
          deferred.reset();
          result.current.refresh();
        });
        deferred.reject('reject1');
        await waitForValueToChange(() => result.current.error);
        expect(result.current.data).toEqual('resolve1');
      });

      it('should be in a ready state after refresh callback rejects', async () => {
        const deferred = new Deferred<string, string>();
        const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

        act(() => result.current.load());
        deferred.resolve('resolve2');
        await waitForValueToChange(() => result.current.data);
        expect(result.current.error).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isReady).toBe(true);
        expect(result.current.hasLoaded).toBe(true);

        act(() => {
          deferred.reset();
          result.current.refresh();
        });
        deferred.reject('reject2');
        await waitForValueToChange(() => result.current.error);

        expect(result.current.error).toEqual('reject2');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isReady).toBe(true);
        expect(result.current.hasLoaded).toBe(true);
      });
    });
  });

  describe('clearError', () => {
    it('should clear errors when clear is called', async () => {
      const deferred = new Deferred<string, string>();
      const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

      act(() => result.current.load());
      deferred.reject('reject1');
      await waitForValueToChange(() => result.current.error);
      expect(result.current.error).toEqual('reject1');

      act(() => {
        deferred.reset();
        result.current.clearError();
      });
      expect(result.current.error).toBeUndefined();
    });

    it('should be in a ready state after clear is called', async () => {
      const deferred = new Deferred<string, string>();
      const { result, waitForValueToChange } = renderHook(() => useDataLoader(() => deferred.promise));

      act(() => result.current.load());
      deferred.reject('reject1');
      await waitForValueToChange(() => result.current.error);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isReady).toBe(true);
      expect(result.current.hasLoaded).toBe(true);

      act(() => {
        deferred.reset();
        result.current.clearError();
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isReady).toBe(true);
      expect(result.current.hasLoaded).toBe(true);
    });
  });
});
