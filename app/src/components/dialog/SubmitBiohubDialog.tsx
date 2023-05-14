import { DialogContent } from '@material-ui/core';
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
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { dialogTitle, open, onClose, onSubmit, formikProps } = props;

  const { initialValues, validationSchema } = formikProps;

  const [formikRef] = useState(useRef<FormikProps<any>>(null));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: SubmitBiohubI18N.submitBiohubErrorTitle,
    dialogText: SubmitBiohubI18N.submitBiohubErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    console.log('setErrorDialogProps()', { ...errorDialogProps, ...textDialogProps, open: true })
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
    onSubmit(values)
      .catch(() => {
        showErrorDialog({
          dialogTitle: SubmitBiohubI18N.submitBiohubErrorTitle,
          dialogText: SubmitBiohubI18N.submitBiohubErrorText
        });
      })
      .finally(() => {
        setIsSubmitting(false);
        onClose();
      });
  };

  return (
    <>
      <ErrorDialog {...errorDialogProps} />

      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={open}
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
              <DialogTitle id="component-dialog-title">{dialogTitle}</DialogTitle>
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
                <Button onClick={onClose} color="primary" variant="outlined" disabled={isSubmitting}>
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
