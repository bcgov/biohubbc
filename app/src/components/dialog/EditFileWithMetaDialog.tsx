import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import EditFileWithMeta from 'components/attachments/EditFileWithMeta';
import { Formik, FormikProps } from 'formik';
import React, { useRef, useState } from 'react';
import {
  EditReportMetaFormInitialValues,
  EditReportMetaFormYupSchema,
  IEditReportMetaForm
} from '../attachments/EditReportMetaForm';
import { IGetReportMetaData } from 'interfaces/useProjectApi.interface';

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
 * @interface IEditFileWithMetaDialogProps
 */
export interface IEditFileWithMetaDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IEditFileWithMetaDialogProps
   */
  dialogTitle: string;
  /**
   * Report meta data
   *
   * @type {IGetReportMetaData | null}
   * @memberof IEditFileWithMetaDialogProps
   */
  reportMetaData: IGetReportMetaData | null;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IEditFileWithMetaDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IEditFileWithMetaDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired if the dialog save is clicked.
   *
   * @memberof IEditFileWithMetaDialogProps
   */
  onSave: (fileMeta: IEditReportMetaForm) => Promise<any>;
}

/**
 * A dialog to wrap any component(s) that need to be displayed as a modal.
 *
 * Any component(s) passed in `props.children` will be rendered as the content of the dialog.
 *
 * @param {*} props
 * @return {*}
 */
const EditFileWithMetaDialog: React.FC<IEditFileWithMetaDialogProps> = (props) => {
  const theme = useTheme();

  const classes = useStyles();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  const [isSaving, setIsSaving] = useState(false);

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
        initialValues={props.reportMetaData || EditReportMetaFormInitialValues}
        validationSchema={EditReportMetaFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values) => {
          setIsSaving(true);
          props.onSave(values).finally(() => {
            setIsSaving(false);
            props.onClose();
          });
        }}>
        {(formikProps) => (
          <>
            <DialogTitle id="component-dialog-title">{props.dialogTitle}</DialogTitle>
            <DialogContent>
              <EditFileWithMeta />
            </DialogContent>
            <DialogActions>
              <Box className={classes.wrapper}>
                <Button onClick={formikProps.submitForm} color="primary" variant="contained" disabled={isSaving}>
                  <strong>Save</strong>
                </Button>
                {isSaving && <CircularProgress size={24} className={classes.buttonProgress} />}
              </Box>
              <Button onClick={props.onClose} color="primary" variant="outlined" disabled={isSaving}>
                Cancel
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditFileWithMetaDialog;
