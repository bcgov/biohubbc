import DialogContentText from '@material-ui/core/DialogContentText';
import React from 'react';
import ComponentDialog, { IComponentDialogProps } from './ComponentDialog';

export interface ISuccessDialogProps extends IComponentDialogProps {
  /**
   * The dialog window body text.
   *
   * @type {string}
   * @memberof IBaseDialogProps
   */
  dialogText: string;
}

/**
 * A dialog for displaying a title + message, and just giving the user an `Ok` button to
 * acknowledge it.
 *
 * @param {*} props
 * @return {*}
 */
export const SuccessDialog: React.FC<ISuccessDialogProps> = (props) => {
  const { dialogText, ...rest } = props
  return (
    <ComponentDialog {...rest}>
      <DialogContentText id="alert-dialog-description">{dialogText}</DialogContentText>
    </ComponentDialog>
  )
};
