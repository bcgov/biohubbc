import React from 'react';
import { render } from 'test-helpers/test-utils';
import { useInterval } from './useInterval';

interface ITestComponentProps {
  callback: (() => any) | null | undefined;
  period: number | null | undefined;
  timeout: number;
}

const TestComponent: React.FC<ITestComponentProps> = (props) => {
  useInterval(props.callback, props.period, props.timeout);

  return <></>;
};

describe('useInterval', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('calls the callback 5 times: once every 50 milliseconds for 250 milliseconds', async () => {
    const callbackMock = vi.fn();

    render(<TestComponent callback={callbackMock} period={50} timeout={250} />);

    expect(callbackMock.mock.calls.length).toEqual(0); // 0 milliseconds

    vi.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(0); // 49 milliseconds

    vi.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(1); // 50 milliseconds

    vi.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(1); // 99 milliseconds

    vi.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(2); // 100 milliseconds

    vi.advanceTimersByTime(50);
    expect(callbackMock.mock.calls.length).toEqual(3); // 150 milliseconds

    vi.advanceTimersByTime(850);
    expect(callbackMock.mock.calls.length).toEqual(5); // 1000 milliseconds
  });

  it('stops calling the callback if the callback is updated to be falsy', async () => {
    const callbackMock = vi.fn();

    const { rerender } = render(<TestComponent callback={callbackMock} period={50} timeout={250} />);

    expect(callbackMock.mock.calls.length).toEqual(0); // 0 milliseconds

    vi.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(0); // 49 milliseconds

    vi.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(1); // 50 milliseconds

    vi.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(1); // 99 milliseconds

    vi.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(2); // 100 milliseconds

    rerender(<TestComponent callback={null} period={50} timeout={250} />);

    vi.advanceTimersByTime(900);
    expect(callbackMock.mock.calls.length).toEqual(2); // 1000 milliseconds
  });

  it('stops calling the callback if the period is updated to be falsy', async () => {
    const callbackMock = vi.fn();

    const { rerender } = render(<TestComponent callback={callbackMock} period={50} timeout={250} />);

    expect(callbackMock.mock.calls.length).toEqual(0); // 0 milliseconds

    vi.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(0); // 49 milliseconds

    vi.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(1); // 50 milliseconds

    vi.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(1); // 99 milliseconds

    vi.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(2); // 100 milliseconds

    rerender(<TestComponent callback={callbackMock} period={null} timeout={250} />);

    vi.advanceTimersByTime(900);
    expect(callbackMock.mock.calls.length).toEqual(2); // 1000 milliseconds
  });
});
