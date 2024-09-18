import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import FileUploadWithMeta from 'components/attachments/FileUploadWithMeta';
import { Formik, FormikProps } from 'formik';
import React, { useRef, useState } from 'react';
import {
  IReportMetaForm,
  ReportMetaFormInitialValues,
  ReportMetaFormYupSchema
} from '../../attachments/ReportMetaForm';

/**
 *
 *
 * @export
 * @interface IReportFileUploadDialogProps
 */
export interface IReportFileUploadDialogProps {
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IReportFileUploadDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is submitted (user clicks 'Save' or 'Submit', etc).
   *
   * @memberof IReportFileUploadDialogProps
   */
  onSubmit: (reportMeta: IReportMetaForm) => Promise<void>;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IReportFileUploadDialogProps
   */
  onClose: () => void;
}

/**
 * Wraps the `FileUploadWithMeta` component in a dialog.
 *
 * @param {*} props
 * @return {*}
 */
export const ReportFileUploadDialog: React.FC<IReportFileUploadDialogProps> = (props) => {
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const formikRef = useRef<FormikProps<any>>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (values: IReportMetaForm) => {
    setIsSubmitting(true);

    props.onSubmit(values).finally(() => {
      setIsSubmitting(false);
    });
  };

  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={props.open}
      aria-labelledby="component-dialog-title"
      aria-describedby="component-dialog-description">
      <Formik
        innerRef={formikRef}
        initialValues={ReportMetaFormInitialValues}
        validationSchema={ReportMetaFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={onSubmit}>
        {(formikProps) => (
          <>
            <DialogTitle id="component-dialog-title">Upload Report</DialogTitle>
            <DialogContent>
              <FileUploadWithMeta />
            </DialogContent>
            <DialogActions>
              <LoadingButton
                loading={isSubmitting}
                onClick={formikProps.submitForm}
                color="primary"
                variant="contained">
                <strong>Save and Exit</strong>
              </LoadingButton>
              <Button onClick={props.onClose} color="primary" variant="outlined" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};
