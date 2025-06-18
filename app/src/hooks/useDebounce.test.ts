import { renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should call the callback after the delay', () => {
    const callback = vi.fn();
    const delayMs = 100;
    const { result } = renderHook(() => useDebounce(callback, delayMs));

    result.current();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(delayMs);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call the callback only once after multiple calls', () => {
    const callback = vi.fn();
    const delayMs = 100;
    const { result } = renderHook(() => useDebounce(callback, delayMs));

    result.current();
    result.current();
    result.current();

    vi.advanceTimersByTime(delayMs);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call the callback after the delay with the last arguments', () => {
    const callback = vi.fn();
    const delayMs = 100;
    const { result } = renderHook(() => useDebounce(callback, delayMs));

    result.current(1);
    result.current(2);
    result.current(3);

    vi.advanceTimersByTime(delayMs);

    expect(callback).toHaveBeenCalledWith(3);
  });

  it('should not call the callback after the delay if the hook is unmounted', () => {
    const callback = vi.fn();
    const delayMs = 100;
    const { result, unmount } = renderHook(() => useDebounce(callback, delayMs));

    result.current();

    unmount();

    vi.advanceTimersByTime(delayMs);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call the callback until the delay has passed', () => {
    const callback = vi.fn();
    const delayMs = 100;
    const { result } = renderHook(() => useDebounce(callback, delayMs));

    result.current();

    vi.advanceTimersByTime(delayMs - 1);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
