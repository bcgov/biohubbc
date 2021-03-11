import { render } from '@testing-library/react';
import React from 'react';
import { ErrorDialog } from './ErrorDialog';

describe('ErrorDialog', () => {
  it('matches the snapshot with no error message', () => {
    const { asFragment } = render(
      <ErrorDialog
        dialogTitle="This is dialog title"
        dialogText="This is dialog text"
        open={true}
        onClose={() => jest.fn()}
        onOk={() => jest.fn()}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches the snapshot with an error message', () => {
    const { asFragment } = render(
      <ErrorDialog
        dialogTitle="This is dialog title"
        dialogText="This is dialog text"
        dialogError="This is dialog error"
        open={true}
        onClose={() => jest.fn()}
        onOk={() => jest.fn()}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
