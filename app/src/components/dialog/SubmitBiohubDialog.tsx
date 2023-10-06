import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SubmitBiohubI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps, FormikValues } from 'formik';
import { PropsWithChildren, useContext, useRef, useState } from 'react';
import yup from 'utils/YupSchema';
import ComponentDialog from './ComponentDialog';
import { IErrorDialogProps } from './ErrorDialog';

/**
 *
 *
 * @export
 * @interface ISubmitBiohubDialogProps
 */
export interface ISubmitBiohubDialogProps<Values> {
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
  onSubmit: (values: Values) => Promise<void>;
  /**
   * Formik props for setup
   *
   * @type {{ initialValues: Values; validationSchema: yup.ObjectSchema<any> }}
   * @memberof ISubmitBiohubDialogProps
   */
  formikProps: { initialValues: Values; validationSchema: yup.ObjectSchema<any> };

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
const SubmitBiohubDialog = <Values extends FormikValues>(
  props: PropsWithChildren<ISubmitBiohubDialogProps<Values>>
) => {
  const { initialValues, validationSchema } = props.formikProps;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const [formikRef] = useState(useRef<FormikProps<any>>(null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNoInformationDialog, setShowNoInformationDialog] = useState(false);

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const handleSubmit = (values: Values) => {
    if (JSON.stringify(values) === JSON.stringify(initialValues)) {
      showErrorDialog({
        dialogTitle: SubmitBiohubI18N.noInformationDialogTitle,
        dialogText: SubmitBiohubI18N.noInformationDialogText
      });

      return;
    }

    setIsSubmitting(true);
    props
      .onSubmit(values)
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
      <ComponentDialog
        dialogTitle={props.submissionSuccessDialogTitle}
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}>
        <DialogContentText id="alert-dialog-description">{props.submissionSuccessDialogText}</DialogContentText>
      </ComponentDialog>

      <ComponentDialog
        dialogTitle={props.noSubmissionDataDialogTitle}
        open={showNoInformationDialog}
        onClose={() => setShowNoInformationDialog(false)}>
        <DialogContentText id="alert-dialog-description">{props.noSubmissionDataDialogText}</DialogContentText>
      </ComponentDialog>

      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={props.open}
        aria-labelledby="component-dialog-title"
        aria-describedby="component-dialog-description">
        <Formik<Values>
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
