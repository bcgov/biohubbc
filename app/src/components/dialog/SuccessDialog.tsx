import { DialogContentText } from '@material-ui/core';
import ComponentDialog from 'components/dialog/ComponentDialog';
import React from 'react';

export interface IPublishDialogs {
  successTitle: string;
  successMessage: string;
  successBody?: string;
  open: boolean;
  setOpen: (isEmpty: boolean) => void;
}

/**
 * Publish button.
 *
 * @return {*}
 */
const SuccessDialog: React.FC<IPublishDialogs> = (props) => {
  const { successTitle, successMessage, successBody, open, setOpen } = props;

  if (!open) {
    return <></>;
  }

  return (
    <>
      <ComponentDialog
        dialogTitle={successTitle}
        open={open}
        onClose={() => {
          setOpen(false);
        }}>
        <DialogContentText id="alert-dialog-description">{successMessage}</DialogContentText>
        <DialogContentText id="alert-dialog-description">{successBody}</DialogContentText>
      </ComponentDialog>
    </>
  );
};

export default SuccessDialog;
