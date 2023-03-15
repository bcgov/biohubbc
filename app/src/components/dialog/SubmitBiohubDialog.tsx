import { CircularProgress, DialogContent } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Formik, FormikProps } from 'formik';
import React, { useRef, useState } from 'react';
import yup from 'utils/YupSchema';
import { ErrorDialog } from './ErrorDialog';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative'
  },
  buttonProgress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

/**
 *
 *
 * @export
 * @interface ISubmitBiohubDialogProps
 */
export interface ISubmitBiohubDialogProps {
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
   * submit to biohub
   *
   * @memberof ISubmitBiohubDialogProps
   */
  onSubmit: (values: any) => any;

  /**
   * Formik props for setup
   *
   * @type {{ initialValues: any; validationSchema: yup.ObjectSchema<any> }}
   * @memberof ISubmitBiohubDialogProps
   */
  formikProps: { initialValues: any; validationSchema: yup.ObjectSchema<any> };
}

/**
 * A dialog to wrap any component(s) that need to be displayed as a modal.
 *
 * Any component(s) passed in `props.children` will be rendered as the content of the dialog.
 *
 * @param {*} props
 * @return {*}
 */
const SubmitBiohubDialog: React.FC<ISubmitBiohubDialogProps> = (props) => {
  const theme = useTheme();

  const classes = useStyles();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { dialogTitle, open, onClose, onSubmit, formikProps } = props;

  const { initialValues, validationSchema } = formikProps;

  const [formikRef] = useState(useRef<FormikProps<any>>(null));
  const [isFinishing, setIsFinishing] = useState(false);
  const [noSubmission, setNoSubmission] = useState(false);

  const onSubmitForm = (values: any) => {
    setIsFinishing(true);
    if (JSON.stringify(values) === JSON.stringify(initialValues)) {
      setIsFinishing(false);
      setNoSubmission(true);
      return;
    }

    onSubmit(values).finally(() => {
      setIsFinishing(false);
      onClose();
    });
  };

  if (!open) {
    return <></>;
  }

  return (
    <>
      <ErrorDialog
        dialogTitle="No Information to Submit"
        dialogText=" No information has been uploaded to Biohub for submission."
        open={noSubmission}
        onClose={() => {
          setNoSubmission(false);
          onClose();
        }}
        onOk={() => {
          setNoSubmission(false);
          onClose();
        }}></ErrorDialog>

      <Dialog
        fullScreen={fullScreen}
        maxWidth="xl"
        open={open}
        aria-labelledby="component-dialog-title"
        aria-describedby="component-dialog-description">
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={(values) => {
            onSubmitForm(values);
          }}>
          {(formikProps) => (
            <>
              <DialogTitle id="component-dialog-title">{dialogTitle}</DialogTitle>
              <DialogContent>{props.children}</DialogContent>
              <DialogActions>
                <Box className={classes.wrapper}>
                  <Button
                    onClick={formikProps.submitForm}
                    color="primary"
                    variant="contained"
                    disabled={formikProps.values === initialValues}>
                    <strong>Submit</strong>
                  </Button>
                  {isFinishing && <CircularProgress size={24} className={classes.buttonProgress} />}
                </Box>
                <Button onClick={onClose} color="primary" variant="outlined" disabled={isFinishing}>
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
