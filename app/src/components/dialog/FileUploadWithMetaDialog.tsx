import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';
import React, { useState, useRef } from 'react';
import FileUploadWithMeta from 'components/attachments/FileUploadWithMeta';
import { IUploadHandler } from '../attachments/FileUploadItem';
import { Formik, FormikProps } from 'formik';
import { ReportMetaFormInitialValues,
  ReportMetaFormYupSchema
} from '../attachments/ReportMetaForm';
import { IReportMetaForm } from '../attachments/ReportMetaForm';

/**
 *
 *
 * @export
 * @interface IFileUploadWithMetaDialogProps
 */
export interface IFileUploadWithMetaDialogProps {
  /**
   * The dialog window title text.
   *
   * @type {string}
   * @memberof IFileUploadWithMetaDialogProps
   */
  dialogTitle: string;
  /**
   *
   *
   * @type {boolean}
   * @memberof IFileUploadWithMetaDialogProps
   */
  isUploadingReport: boolean;
  /**
   * Set to `true` to open the dialog, `false` to close the dialog.
   *
   * @type {boolean}
   * @memberof IFileUploadWithMetaDialogProps
   */
  open: boolean;
  /**
   * Callback fired if the dialog is finished.
   *
   * @memberof IFileUploadWithMetaDialogProps
   */
  onFinish: (fileMeta: IReportMetaForm) => void;
  /**
   * Callback fired if the dialog is closed.
   *
   * @memberof IFileUploadWithMetaDialogProps
   */
  onClose: () => void;
  /**
   * Callback fired if an upload request is initiated.
   *
   * @memberof IFileUploadWithMetaDialogProps
   */
  uploadHandler: IUploadHandler;
}

/**
 * A dialog to wrap any component(s) that need to be displayed as a modal.
 *
 * Any component(s) passed in `props.children` will be rendered as the content of the dialog.
 *
 * @param {*} props
 * @return {*}
 */
const FileUploadWithMetaDialog: React.FC<IFileUploadWithMetaDialogProps> = (props) => {
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  if (!props.open) {
    return <></>;
  }

  console.log('props.children', props.children);

  const validateAndFinish = async () => {
    if (!formikRef?.current) {
      return;
    }

    await formikRef.current?.submitForm();

    props.onFinish(formikRef.current.values);
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={props.open}
      aria-labelledby="component-dialog-title"
      aria-describedby="component-dialog-description">
      <DialogTitle id="component-dialog-title">{props.dialogTitle}</DialogTitle>
      <DialogContent>
        <Box>
          <Formik
            innerRef={formikRef}
            initialValues={ReportMetaFormInitialValues}
            validationSchema={ReportMetaFormYupSchema}
            validateOnBlur={false}
            validateOnChange={true}
            onSubmit={() => {}}
            onChange={() => {}}>
            <>
              <FileUploadWithMeta isUploadingReport={props.isUploadingReport} uploadHandler={props.uploadHandler} />
            </>
          </Formik>
        </Box>
      </DialogContent>
      <DialogActions>
        {props.isUploadingReport &&
          <Button onClick={validateAndFinish} color="primary" variant="contained" autoFocus>
            Finish
          </Button>
        }
        <Button onClick={props.onClose} color="primary" variant="contained" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadWithMetaDialog;
