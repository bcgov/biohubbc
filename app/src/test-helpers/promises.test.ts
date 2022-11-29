import { Deferred } from './promises';

describe('Deffered', () => {
  it('constructs', () => {
    const deferred = new Deferred();
    expect(deferred).toBeInstanceOf(Deferred);
  });

  it('should resolve with the given value', async () => {
    const deferred = new Deferred<string, any>();
    deferred.resolve('test1');
    await deferred.promise.then((value) => {
      expect(value).toEqual('test1');
    });
  });

  it('should reject with the given reason', async () => {
    const deferred = new Deferred<string, string>();
    deferred.reject('test2');
    await deferred.promise
      .then((value) => {
        throw new Error('Rejected promise should not resolve:', value as any);
      })
      .catch((error: any) => {
        expect(error).toEqual('test2');
      });
  });

  it('should retain a fullfilled value when resolved successively', async () => {
    const deferred = new Deferred<string, any>();
    deferred.resolve('testA');
    deferred.resolve('testB');
    await deferred.promise.then((value) => {
      expect(value).toEqual('testA');
    });
  });

  it('should retain a fullfilled value when rejected successively', async () => {
    const deferred = new Deferred<string, any>();
    deferred.reject('testX');
    deferred.reject('testY');
    await deferred.promise
      .then((value) => {
        throw new Error('Rejected promise should not resolve:', value as any);
      })
      .catch((error: any) => {
        expect(error).toEqual('testX');
      });
  });

  it('should retain a fullfilled value when resolved and then rejected', async () => {
    const deferred = new Deferred<string, any>();
    deferred.resolve('resolve1');
    deferred.reject('reject1');
    await deferred.promise.then((value) => {
      expect(value).toEqual('resolve1');
    });
  });

  it('should retain a fullfilled value when rejected and then resolved', async () => {
    const deferred = new Deferred<string, any>();
    deferred.reject('reject2');
    deferred.resolve('resolve2');
    await deferred.promise
      .then((value) => {
        throw new Error('Rejected promise should not resolve:', value as any);
      })
      .catch((error: any) => {
        expect(error).toEqual('reject2');
      });
  });

  describe('with reset promise', () => {
    it('should fulfill a new value when reset is called after resolve', async () => {
      const deferred = new Deferred<string, any>();
      deferred.resolve('resolveA');
      deferred.reset();
      deferred.resolve('resolveB');
      await deferred.promise.then((value) => {
        expect(value).toEqual('resolveB');
      });
    });

    // it('should fulfill a new value when reset is called after reject', async () => {
    //   const deferred = new Deferred<string, any>();
    //   deferred.reject('rejectA');
    //   deferred.reset();
    //   deferred.reject('rejectB');
    //   await deferred.promise
    //     .then((value) => {
    //       throw new Error('Rejected promise should not resolve:', value as any);
    //     })
    //     .catch((error: any) => {
    //       expect(error).toEqual('rejectB');
    //     });
    // });
  });
});
