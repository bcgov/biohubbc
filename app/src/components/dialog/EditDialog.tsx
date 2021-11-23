import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Formik, FormikValues } from 'formik';
import React, { PropsWithChildren } from 'react';

export interface IEditDialogComponentProps<T> {
  element: any;
  initialValues: T;
  validationSchema: any;
}

export interface IEditDialogProps<T> {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IEditDialogProps
   */
  dialogTitle: string;

  /**
   * The label of the `onSave` button.
   *
   * Defaults to `Save Changes` if not specified.
   *
   * @type {string}
   * @memberof IEditDialogProps
   */
  dialogSaveButtonLabel?: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IEditDialogProps
   */
  open: boolean;

  /**
   * @type {IEditDialogComponentProps}
   * @memberof IEditDialogProps
   */
  component: IEditDialogComponentProps<T>;

  /**
   * Error message to display when an error exists
   */
  dialogError?: string;

  /**
   * Callback fired if the 'No' button is clicked.
   *
   * @memberof IEditDialogProps
   */
  onCancel: () => void;
  /**
   * Callback fired if the 'Yes' button is clicked.
   *
   * @memberof IEditDialogProps
   */
  onSave: (values: T) => void;
}

/**
 * A dialog for displaying a component for editing purposes and giving the user the option to say
 * `Yes`(Save) or `No`.
 *
 * @template T
 * @param {PropsWithChildren<IEditDialogProps<T>>} props
 * @return {*}
 */
export const EditDialog = <T extends FormikValues>(props: PropsWithChildren<IEditDialogProps<T>>) => {
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!props.open) {
    return <></>;
  }

  return (
    <Formik
      initialValues={props.component.initialValues}
      enableReinitialize={true}
      validationSchema={props.component.validationSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={(values) => {
        props.onSave(values);
      }}>
      {(formikProps) => (
        <Dialog
          fullScreen={fullScreen}
          maxWidth="xl"
          open={props.open}
          aria-labelledby="edit-dialog-title"
          aria-describedby="edit-dialog-description">
          <DialogTitle id="edit-dialog-title">{props.dialogTitle}</DialogTitle>
          <DialogContent>{props.component.element}</DialogContent>
          <DialogActions>
            <Button onClick={formikProps.submitForm} color="primary" variant="contained" autoFocus>
              {props.dialogSaveButtonLabel || 'Save Changes'}
            </Button>
            <Button onClick={props.onCancel} color="primary" variant="outlined">
              Cancel
            </Button>
          </DialogActions>
          {props.dialogError && <DialogContent>{props.dialogError}</DialogContent>}
        </Dialog>
      )}
    </Formik>
  );
};

export default EditDialog;
