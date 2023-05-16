import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import FileUploadWithMeta from 'components/attachments/FileUploadWithMeta';
import LoadingButton from 'components/buttons/LoadingButton';
import { IFileHandler, IUploadHandler } from 'components/file-upload/FileUploadItem';
import { AttachmentType } from 'constants/attachments';
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
   * The type of attachment.
   *
   * @type {('Report' | 'Other')}
   * @memberof IFileUploadWithMetaDialogProps
   */
  attachmentType: AttachmentType.REPORT | AttachmentType.OTHER;
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
  onFinish: (fileMeta: IReportMetaForm) => Promise<any>;
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
  /**
   * Callback fired if a file is added (via browser or drag/drop).
   *
   * @type {IFileHandler}
   * @memberof IFileUploadWithMetaDialogProps
   */
  fileHandler?: IFileHandler;
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

  const [isFinishing, setIsFinishing] = useState(false);

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
        onSubmit={(values) => {
          setIsFinishing(true);
          props.onFinish(values).finally(() => {
            setIsFinishing(false);
            props.onClose();
          });
        }}>
        {(formikProps) => (
          <>
            <DialogTitle id="component-dialog-title">{props.dialogTitle}</DialogTitle>
            <DialogContent>
              <FileUploadWithMeta attachmentType={props.attachmentType} uploadHandler={props.uploadHandler} />
            </DialogContent>
            <DialogActions>
              {props.attachmentType === AttachmentType.REPORT && (
                <LoadingButton
                  loading={isFinishing}
                  onClick={formikProps.submitForm}
                  color="primary"
                  variant="contained">
                  <strong>Finish</strong>
                </LoadingButton>
              )}
              {(props.attachmentType === AttachmentType.REPORT && (
                <Button onClick={props.onClose} color="primary" variant="outlined" disabled={isFinishing}>
                  Cancel
                </Button>
              )) || (
                <Button onClick={props.onClose} color="primary" variant="contained" autoFocus>
                  <strong>Close</strong>
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

export default FileUploadWithMetaDialog;
