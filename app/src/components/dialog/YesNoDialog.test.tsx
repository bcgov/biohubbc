import { fireEvent, render, waitFor } from '@testing-library/react';
import YesNoDialog from 'components/dialog/YesNoDialog';
import React from 'react';

const handleOnYes = jest.fn();
const handleOnNo = jest.fn();
const handleOnClose = jest.fn();

const renderContainer = ({
  dialogTitle,
  dialogText,
  open = true
}: {
  dialogTitle: string;
  dialogText: string;
  open?: boolean;
}) => {
  return render(
    <div id="root">
      <YesNoDialog
        dialogTitle={dialogTitle}
        dialogText={dialogText}
        open={open}
        onClose={handleOnClose}
        onNo={handleOnNo}
        onYes={handleOnYes}
      />
    </div>
  );
};

describe('EditDialog', () => {
  it('matches the snapshot when not open', () => {
    const { baseElement } = renderContainer({ dialogTitle: 'this is a test', dialogText: 'this is text', open: false });

    expect(baseElement).toMatchSnapshot();
  });

  it('matches the snapshot when open, with no error message', () => {
    const { baseElement } = renderContainer({ dialogTitle: 'this is a test', dialogText: 'this is text' });

    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot when open, with error message', () => {
    const { baseElement } = renderContainer({ dialogTitle: 'this is a test', dialogText: 'This is an error' });

    expect(baseElement).toMatchSnapshot();
  });

  it('calls the onYes prop when `Yes` button is clicked', async () => {
    const { findByText } = renderContainer({ dialogTitle: 'this is a test', dialogText: 'this is text' });

    const YesButton = await findByText('Yes', { exact: false });

    fireEvent.click(YesButton);

    await waitFor(() => {
      expect(handleOnYes).toHaveBeenCalledTimes(1);
    });
  });

  it('calls the onNo prop when `No` button is clicked', async () => {
    const { findByText } = renderContainer({
      dialogTitle: 'this is a test',
      dialogText: 'this is text'
    });

    const NoButton = await findByText('No', { exact: false });

    fireEvent.click(NoButton);

    await waitFor(() => {
      expect(handleOnNo).toHaveBeenCalledTimes(1);
    });
  });
});
