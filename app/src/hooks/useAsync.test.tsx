import { renderHook } from '@testing-library/react-hooks';
import { Deferred } from 'test-helpers/promises';
import { useAsync } from './useAsync';

describe.skip('useAsync', () => {
  it('should mount and return a wrapped async function', () => {
    const deferred = new Deferred();
    const asyncFunction = () => deferred.promise;

    const { result } = renderHook(() => useAsync(asyncFunction));

    expect(result.current).toBeDefined();
  });

  describe('on success response', () => {
    it('should call wrapped async function and return the result', async () => {
      const deferred = new Deferred<string>();
      const asyncFunction = jest.fn(() => deferred.promise);

      const { result } = renderHook(() => useAsync<[number], string>(asyncFunction));

      const pendingPromise = result.current(11);

      deferred.resolve('resolve1');

      const response = await pendingPromise;

      expect(response).toEqual('resolve1');

      expect(asyncFunction).toBeCalledTimes(1);
    });

    it('should not call wrapped async function if a previous call is pending', async () => {
      const deferred = new Deferred<string, string>();
      const asyncFunction = jest.fn(() => deferred.promise);

      const { result } = renderHook(() => useAsync<[number], string>(asyncFunction));

      result.current(11);
      const pendingPromise = result.current(22);
      result.current(33);

      deferred.resolve('resolve1');

      const response = await pendingPromise;

      expect(response).toEqual('resolve1');
      expect(asyncFunction).toBeCalledTimes(1);
    });

    it('should call wrapped async function again if a previous call has resolved', async () => {
      const deferred1 = new Deferred<string, string>();
      const deferred2 = new Deferred<string, string>();

      // return different mock promises for each call, to emulate the sever returning different results for each call
      const asyncFunction = jest
        .fn()
        .mockImplementationOnce(() => deferred1.promise)
        .mockImplementationOnce(() => deferred2.promise);

      const { result } = renderHook(() => useAsync<[number], string>(asyncFunction));

      // first call, repeats should be ignored
      result.current(11);
      const pendingPromise1 = result.current(22);
      result.current(33);

      deferred1.resolve('resolve1');

      const response1 = await pendingPromise1;

      expect(response1).toEqual('resolve1');

      expect(asyncFunction).toBeCalledTimes(1);
      expect(asyncFunction).toHaveBeenNthCalledWith(1, 11);

      // second call, repeats should be ignored
      result.current(44);
      const pendingPromise2 = result.current(55);
      result.current(66);

      deferred2.resolve('resolve2');

      const response2 = await pendingPromise2;

      expect(response2).toEqual('resolve2');

      expect(asyncFunction).toBeCalledTimes(2);
      expect(asyncFunction).toHaveBeenNthCalledWith(1, 11);
      expect(asyncFunction).toHaveBeenNthCalledWith(2, 44);
    });

    it('should call wrapped async function again if a previous call has rejected', async () => {
      const deferred1 = new Deferred<string, string>();
      const deferred2 = new Deferred<string, string>();

      // return different mock promises for each call, to emulate the sever returning different results for each call
      const asyncFunction = jest
        .fn()
        .mockImplementationOnce(() => deferred1.promise)
        .mockImplementationOnce(() => deferred2.promise);

      const { result } = renderHook(() => useAsync<[number], string>(asyncFunction));

      // first call, repeats should be ignored
      result.current(11);
      const pendingPromise1 = result.current(22);
      result.current(33);

      deferred1.reject('reject1');

      try {
        await pendingPromise1;
        fail();
      } catch (error) {
        expect(error).toEqual('reject1');
      }

      expect(asyncFunction).toBeCalledTimes(1);
      expect(asyncFunction).toHaveBeenNthCalledWith(1, 11);

      // second call, repeats should be ignored
      result.current(44);
      const pendingPromise2 = result.current(55);
      result.current(66);

      deferred2.resolve('resolve2');

      const response2 = await pendingPromise2;

      expect(response2).toEqual('resolve2');

      expect(asyncFunction).toBeCalledTimes(2);
      expect(asyncFunction).toHaveBeenNthCalledWith(1, 11);
      expect(asyncFunction).toHaveBeenNthCalledWith(2, 44);
    });

    it('should call wrapped async function and re-throw a rejection error', async () => {
      const deferred = new Deferred<string, string>();
      const asyncFunction = jest.fn(() => deferred.promise);

      const { result } = renderHook(() => useAsync<[number], string>(asyncFunction));

      const pendingPromise = result.current(11);

      deferred.reject('reject1');
      try {
        await pendingPromise;
        fail();
      } catch (error) {
        expect(error).toEqual('reject1');
      }

      expect(asyncFunction).toBeCalledTimes(1);
    });
  });
});
