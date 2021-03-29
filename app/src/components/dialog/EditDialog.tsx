import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import React from 'react';
import { Formik } from 'formik';

export interface IEditDialogComponentProps {
  element: any;
  initialValues: any;
  validationSchema: any;
}

export interface IEditDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IEditDialogProps
   */
  dialogTitle: string;
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
  component: IEditDialogComponentProps;

  /**
   * Error message to display when an error exists
   */
  dialogError?: string;

  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IEditDialogProps
   */
  onClose: () => void;
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
  onSave: (values: any) => void;
}

/**
 * A dialog for displaying a component for editing purposes and giving the user the option to say
 * `Yes`(Save) or `No`.
 *
 * @param {*} props
 * @return {*}
 */
export const EditDialog: React.FC<IEditDialogProps> = (props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
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
            onClose={props.onClose}
            aria-labelledby="edit-dialog-title"
            aria-describedby="edit-dialog-description">
            <DialogTitle id="edit-dialog-title">{props.dialogTitle}</DialogTitle>
            <DialogContent>
              <Box py={2}>{props.component.element}</Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={formikProps.submitForm} color="primary" variant="contained" autoFocus>
                Save Changes
              </Button>
              <Button onClick={props.onCancel} color="primary" variant="outlined">
                Cancel
              </Button>
            </DialogActions>
            {props.dialogError && <DialogContent>{props.dialogError}</DialogContent>}
          </Dialog>
        )}
      </Formik>
    </Box>
  );
};

export default EditDialog;
