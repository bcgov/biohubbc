import { renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('it should call the callback after the delay', () => {
    const callback = jest.fn();
    const delayMs = 100;
    const { result } = renderHook(() => useDebounce(callback, delayMs));

    result.current();

    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(delayMs);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('it should call the callback only once after multiple calls', () => {
    const callback = jest.fn();
    const delayMs = 100;
    const { result } = renderHook(() => useDebounce(callback, delayMs));

    result.current();
    result.current();
    result.current();

    jest.advanceTimersByTime(delayMs);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('it should call the callback after the delay with the last arguments', () => {
    const callback = jest.fn();
    const delayMs = 100;
    const { result } = renderHook(() => useDebounce(callback, delayMs));

    result.current(1);
    result.current(2);
    result.current(3);

    jest.advanceTimersByTime(delayMs);

    expect(callback).toHaveBeenCalledWith(3);
  });

  it('it should not call the callback after the delay if the hook is unmounted', () => {
    const callback = jest.fn();
    const delayMs = 100;
    const { result, unmount } = renderHook(() => useDebounce(callback, delayMs));

    result.current();

    unmount();

    jest.advanceTimersByTime(delayMs);

    expect(callback).not.toHaveBeenCalled();
  });

  it('it should not call the callback until the delay has passed', () => {
    const callback = jest.fn();
    const delayMs = 100;
    const { result } = renderHook(() => useDebounce(callback, delayMs));

    result.current();

    jest.advanceTimersByTime(delayMs - 1);

    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
