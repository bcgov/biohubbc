import { DialogContent, DialogContentText } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Formik, FormikProps, FormikValues } from 'formik';
import React, { PropsWithChildren, useRef, useState } from 'react';
import yup from 'utils/YupSchema';
import { ErrorDialog, IErrorDialogProps } from './ErrorDialog';
import { SubmitBiohubI18N } from 'constants/i18n';
import LoadingButton from 'components/buttons/LoadingButton';
import ComponentDialog from './ComponentDialog';

/**
 *
 *
 * @export
 * @interface ISubmitBiohubDialogProps
 */
export interface ISubmitBiohubDialogProps<V> {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof ISubmitBiohubDialogProps
   */
  dialogTitle: string;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof ISubmitBiohubDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof ISubmitBiohubDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired when submission is made to Biohub
   *
   * @memberof ISubmitBiohubDialogProps
   */
  onSubmit: (values: V) => Promise<void>;
  /**
   * Formik props for setup
   *
   * @type {{ initialValues: V; validationSchema: yup.ObjectSchema<any> }}
   * @memberof ISubmitBiohubDialogProps
   */
  formikProps: { initialValues: V; validationSchema: yup.ObjectSchema<any> };

  submissionSuccessDialogTitle: string;
  submissionSuccessDialogText: string;
  noSubmissionDataDialogTitle: string;
  noSubmissionDataDialogText: string;
  hasSubmissionData: boolean;
}

/**
 * A dialog to wrap any component(s) that need to be displayed as a modal.
 *
 * Any component(s) passed in `props.children` will be rendered as the content of the dialog.
 *
 * @param {*} props
 * @return {*}
 */
const SubmitBiohubDialog = <V extends FormikValues>(props: PropsWithChildren<ISubmitBiohubDialogProps<V>>) => {
  const { initialValues, validationSchema } = props.formikProps;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formikRef] = useState(useRef<FormikProps<any>>(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNoInformationDialog, setShowNoInformationDialog] = useState(false);

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: SubmitBiohubI18N.noInformationDialogText,
    dialogText: SubmitBiohubI18N.noInformationDialogText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const handleSubmit = (values: V) => {
    if (JSON.stringify(values) === JSON.stringify(initialValues)) {
      showErrorDialog({
        dialogTitle: SubmitBiohubI18N.noInformationDialogTitle,
        dialogText: SubmitBiohubI18N.noInformationDialogText
      });

      return;
    }

    setIsSubmitting(true);
    props.onSubmit(values)
      .then(() => {
        setShowSuccessDialog(true);
      })
      .catch(() => {
        setShowSuccessDialog(false);
        showErrorDialog({
          dialogTitle: SubmitBiohubI18N.submitBiohubErrorTitle,
          dialogText: SubmitBiohubI18N.submitBiohubErrorText
        });
      })
      .finally(() => {
        setIsSubmitting(false);
        props.onClose();
      });
  };

  return (
    <>
      <ErrorDialog {...errorDialogProps} />

      <ComponentDialog
        dialogTitle={props.submissionSuccessDialogTitle}
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}>
        <DialogContentText id="alert-dialog-description">
          {props.submissionSuccessDialogText}
        </DialogContentText>
      </ComponentDialog>

      <ComponentDialog
        dialogTitle={props.noSubmissionDataDialogTitle}
        open={showNoInformationDialog}
        onClose={() => setShowNoInformationDialog(false)}>
        <DialogContentText id="alert-dialog-description">
          {props.noSubmissionDataDialogText}
        </DialogContentText>
      </ComponentDialog>

      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={props.open}
        aria-labelledby="component-dialog-title"
        aria-describedby="component-dialog-description">
        <Formik<V>
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={handleSubmit}>
          {(formikProps) => (
            <>
              <DialogTitle id="component-dialog-title">{props.dialogTitle}</DialogTitle>
              <DialogContent>{props.children}</DialogContent>
              <DialogActions>
                <LoadingButton
                  onClick={formikProps.submitForm}
                  color="primary"
                  variant="contained"
                  disabled={formikProps.values === initialValues || isSubmitting}
                  loading={isSubmitting}>
                  <strong>Submit</strong>
                </LoadingButton>
                <Button onClick={props.onClose} color="primary" variant="outlined" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogActions>
            </>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default SubmitBiohubDialog;
