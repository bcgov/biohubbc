import DialogContentText from '@mui/material/DialogContentText';
import ComponentDialog from 'components/dialog/ComponentDialog';
import React from 'react';

export interface IPublishDialogs {
  failureTitle: string;
  failureMessage: string;
  failureBody?: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Publish button.
 *
 * @return {*}
 */
const FailureDialog: React.FC<IPublishDialogs> = (props) => {
  const { failureTitle, failureMessage, failureBody, open, onClose } = props;

  if (!open) {
    return <></>;
  }

  return (
    <>
      <ComponentDialog
        dialogTitle={failureTitle}
        open={open}
        onClose={() => {
          onClose();
        }}>
        <DialogContentText id="alert-dialog-description">{failureMessage}</DialogContentText>
        <DialogContentText id="alert-dialog-description">{failureBody}</DialogContentText>
      </ComponentDialog>
    </>
  );
};

export default FailureDialog;
