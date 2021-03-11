import { render } from '@testing-library/react';
import React from 'react';
import { ErrorDialog } from './ErrorDialog';

describe('ErrorDialog', () => {
  it('matches the snapshot with no error message', () => {
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

  it('matches the snapshot with an error message', () => {
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
});
