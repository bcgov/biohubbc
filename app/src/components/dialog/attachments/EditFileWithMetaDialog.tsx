import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import LoadingButton from 'components/buttons/LoadingButton';
import { Formik, FormikProps } from 'formik';
import { IGetReportDetails } from 'interfaces/useProjectApi.interface';
import React, { useRef, useState } from 'react';
import EditReportMetaForm, {
  EditReportMetaFormInitialValues,
  EditReportMetaFormYupSchema,
  IEditReportMetaForm
} from '../../attachments/EditReportMetaForm';

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
   * @type {IGetReportDetails | null}
   * @memberof IEditFileWithMetaDialogProps
   */
  reportMetaData: IGetReportDetails | null;
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
  onSave: (fileMeta: IEditReportMetaForm) => Promise<void>;
  /**
   *
   *
   * @memberof IEditFileWithMetaDialogProps
   */
  refresh: () => void;
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
        initialValues={
          // TODO currently spreading data here to match the old format expected by the `EditReportMetaForm`. Update
          // this, and related code/endpoints, to accept the data in its new object structure.
          (props.reportMetaData && { ...props.reportMetaData.metadata, authors: props.reportMetaData.authors }) ||
          EditReportMetaFormInitialValues
        }
        validationSchema={EditReportMetaFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={(values) => {
          setIsSaving(true);
          props.onSave(values).finally(() => {
            props.refresh();
            setIsSaving(false);
            props.onClose();
          });
        }}>
        {(formikProps) => (
          <>
            <DialogTitle id="component-dialog-title">{props.dialogTitle}</DialogTitle>
            <DialogContent>
              <Box mb={3}>
                <EditReportMetaForm />
              </Box>
            </DialogContent>
            <DialogActions>
              <LoadingButton loading={isSaving} onClick={formikProps.submitForm} color="primary" variant="contained">
                <strong>Save</strong>
              </LoadingButton>
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
