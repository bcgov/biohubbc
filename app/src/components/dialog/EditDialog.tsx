import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import LoadingButton from 'components/buttons/LoadingButton';
import { Formik, FormikValues } from 'formik';
import { PropsWithChildren } from 'react';

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
   * The dialog window content text.
   *
   * @type {string}
   * @memberof IEditDialogProps
   */
  dialogText?: string;

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
   * Boolean to track to show a spinner
   */
  dialogLoading?: boolean;

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
          data-testid="edit-dialog"
          fullScreen={fullScreen}
          maxWidth="xl"
          open={props.open}
          aria-labelledby="edit-dialog-title"
          aria-describedby="edit-dialog-description">
          <DialogTitle id="edit-dialog-title">{props.dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText>{props.dialogText}</DialogContentText>
            {props.component.element}
          </DialogContent>
          <DialogActions>
            <LoadingButton
              sx={{ marginX: 1 }}
              loading={props.dialogLoading || false}
              onClick={formikProps.submitForm}
              color="primary"
              variant="contained"
              autoFocus
              data-testid="edit-dialog-save">
              {props.dialogSaveButtonLabel || 'Save Changes'}
            </LoadingButton>
            <Button onClick={props.onCancel} color="primary" variant="outlined" data-testid="edit-dialog-cancel">
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
