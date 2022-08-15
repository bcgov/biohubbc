/**
 * A class used to wrap a generic, empty promise, which can be resolved or rejected
 * programmatically with a given value, thus "deferring" the promise.
 *
 * @example
 *
 * const deferred = new Deferred();
 *
 * const someDataFetcher = (callback: () => Promise<any>) => {
 *   callback().then((res) => {
 *     // res = 'some response data'
 *   });
 * };
 *
 * someDataFetcher(() => deferred.promise)
 *
 * deferred.resolve({ data: 'some response data' });
 *
 * @export
 * @class
 * @template R The type of the Promise.
 * @template Q The type of the reject reason.
 */
export class Deferred<R = void, Q extends any = void> {
  /**
   * Resolves the deferred promise with the given value.
   *
   * @param {R = void} value The value that the promise will resolve to.
   * @default
   * @returns {void}
   */
  resolve: (value: R) => void = () => null;

  /**
   * Rejects the deferred promise with the given reason.
   * @param {Q extends any = void} [reason] The reason that the promise rejects.
   * @returns {void}
   */
  reject: (reason?: Q) => void = () => null;

  /**
   * @property The promise being deferred.
   * @type {Promise<R>}
   */
  promise: Promise<R>;

  /**
   * Constructs a deferred promise.
   *
   * @constructor
   * @returns {Deffered} The deferred promise.
   */
  constructor() {
    this.promise = new Promise<R>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  /**
   * Resets the Deferred instance with a new unfulfilled promise.
   *
   * @returns {Deferred} The deferred promise.
   */
  reset() {
    this.promise = new Promise<R>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    return this;
  }
}
