import { DialogContentText } from '@material-ui/core';
import ComponentDialog from 'components/dialog/ComponentDialog';
import React from 'react';

export interface IPublishDialogs {
  failureTitle: string;
  failureMessage: string;
  failureBody?: string;
  open: boolean;
  setOpen: (isEmpty: boolean) => void;
}

/**
 * Publish button.
 *
 * @return {*}
 */
const FailureDialog: React.FC<IPublishDialogs> = (props) => {
  const { failureTitle, failureMessage, failureBody, open, setOpen } = props;

  if (!open) {
    return <></>;
  }

  return (
    <>
      <ComponentDialog
        dialogTitle={failureTitle}
        open={open}
        onClose={() => {
          setOpen(false);
        }}>
        <DialogContentText id="alert-dialog-description">{failureMessage}</DialogContentText>
        <DialogContentText id="alert-dialog-description">{failureBody}</DialogContentText>
      </ComponentDialog>
    </>
  );
};

export default FailureDialog;
