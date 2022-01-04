import { render } from '@testing-library/react';
import React from 'react';
import { useInterval } from './useInterval';

interface ITestComponentProps {
  callback: Function | null | undefined;
  period: number | null | undefined;
  timeout: number;
}

const TestComponent: React.FC<ITestComponentProps> = (props) => {
  useInterval(props.callback, props.period, props.timeout);

  return <></>;
};

describe('useInterval', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('calls the callback 5 times: once every 50 milliseconds for 250 milliseconds', async () => {
    const callbackMock = jest.fn();

    render(<TestComponent callback={callbackMock} period={50} timeout={250} />);

    expect(callbackMock.mock.calls.length).toEqual(0); // 0 milliseconds

    jest.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(0); // 49 milliseconds

    jest.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(1); // 50 milliseconds

    jest.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(1); // 99 milliseconds

    jest.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(2); // 100 milliseconds

    jest.advanceTimersByTime(50);
    expect(callbackMock.mock.calls.length).toEqual(3); // 150 milliseconds

    jest.advanceTimersByTime(850);
    expect(callbackMock.mock.calls.length).toEqual(5); // 1000 milliseconds
  });

  it('stops calling the callback if the callback is updated to be falsy', async () => {
    const callbackMock = jest.fn();

    const { rerender } = render(<TestComponent callback={callbackMock} period={50} timeout={250} />);

    expect(callbackMock.mock.calls.length).toEqual(0); // 0 milliseconds

    jest.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(0); // 49 milliseconds

    jest.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(1); // 50 milliseconds

    jest.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(1); // 99 milliseconds

    jest.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(2); // 100 milliseconds

    rerender(<TestComponent callback={null} period={50} timeout={250} />);

    jest.advanceTimersByTime(900);
    expect(callbackMock.mock.calls.length).toEqual(2); // 1000 milliseconds
  });

  it('stops calling the callback if the period is updated to be falsy', async () => {
    const callbackMock = jest.fn();

    const { rerender } = render(<TestComponent callback={callbackMock} period={50} timeout={250} />);

    expect(callbackMock.mock.calls.length).toEqual(0); // 0 milliseconds

    jest.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(0); // 49 milliseconds

    jest.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(1); // 50 milliseconds

    jest.advanceTimersByTime(49);
    expect(callbackMock.mock.calls.length).toEqual(1); // 99 milliseconds

    jest.advanceTimersByTime(1);
    expect(callbackMock.mock.calls.length).toEqual(2); // 100 milliseconds

    rerender(<TestComponent callback={callbackMock} period={null} timeout={250} />);

    jest.advanceTimersByTime(900);
    expect(callbackMock.mock.calls.length).toEqual(2); // 1000 milliseconds
  });
});
