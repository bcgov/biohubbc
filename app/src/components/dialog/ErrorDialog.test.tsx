import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { ErrorDialog } from './ErrorDialog';

describe('ErrorDialog', () => {
  it('renders correctly with no error message', () => {
    const { baseElement } = render(
      <div id="root">
        <ErrorDialog
          dialogTitle="This is dialog title"
          dialogText="This is dialog text"
          open={true}
          onClose={() => jest.fn()}
          onOk={() => jest.fn()}
        />
      </div>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('renders correctly with a non-detailed error message', () => {
    const { baseElement } = render(
      <div id="root">
        <ErrorDialog
          dialogTitle="This is dialog title"
          dialogText="This is dialog text"
          dialogError="This is dialog error"
          open={true}
          onClose={() => jest.fn()}
          onOk={() => jest.fn()}
        />
      </div>
    );

    expect(baseElement).toMatchSnapshot();
  });

  it('renders correctly with a detailed error message', async () => {
    const { baseElement, getByText } = render(
      <div id="root">
        <ErrorDialog
          dialogTitle="This is dialog title"
          dialogText="This is dialog text"
          dialogErrorDetails={['an error', { error: 'another error' }]}
          dialogError="This is dialog error"
          open={true}
          onClose={() => jest.fn()}
          onOk={() => jest.fn()}
        />
      </div>
    );

    fireEvent.click(getByText('Show detailed error message'));

    await waitFor(() => {
      expect(getByText('an error')).toBeVisible();
      expect(getByText('{"error":"another error"}')).toBeVisible();
    });

    expect(baseElement).toMatchSnapshot();

    fireEvent.click(getByText('Hide detailed error message'));

    await waitFor(() => {
      expect(getByText('an error')).not.toBeVisible();
      expect(getByText('{"error":"another error"}')).not.toBeVisible();
    });
  });
});
