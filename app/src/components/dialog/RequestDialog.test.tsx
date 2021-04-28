import { fireEvent, render, waitFor } from '@testing-library/react';
import { useFormikContext } from 'formik';
import React from 'react';
import RequestDialog from './RequestDialog';

const TestComponent: React.FC = () => {
  const formikProps = useFormikContext();
  const { handleSubmit } = formikProps;
  return <form onSubmit={handleSubmit}>A Child Component!</form>;
};

describe('RequestDialog', () => {
  it('Renders correctly and calls the onApprove, onDeny, and onCancel prop', async () => {
    const approve = jest.fn();
    const onClose = jest.fn();
    const onDeny = jest.fn();

    const { getByText } = render(
      <div id="root">
        <RequestDialog
          component={{
            element: <TestComponent />,
            initialValues: {},
            validationSchema: null
          }}
          dialogTitle="This is dialog title"
          open={true}
          onClose={onClose}
          onApprove={approve}
          onDeny={onDeny}
        />
      </div>
    );

    expect(getByText('A Child Component!')).toBeVisible();

    await waitFor(() => {
      fireEvent.click(getByText('Approve'));
      expect(approve).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      fireEvent.click(getByText('Deny'));
      expect(onDeny).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      fireEvent.click(getByText('Cancel'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
