import { DialogContentText } from '@material-ui/core';
import ComponentDialog from 'components/dialog/ComponentDialog';
import React from 'react';

export interface IPublishDialogs {
  finishSubmissionTitle: string;
  finishSubmissionMessage: string;
  finishSubmissionBody?: string;
  finishSubmission: boolean;
  setFinishSubmission: (isEmpty: boolean) => void;
  noSubmissionTitle: string;
  noSubmissionMessage: string;
  noSubmissionBody?: string;
  noSubmissionData: boolean;
  setNoSubmissionData: (isFinished: boolean) => void;
}

/**
 * Publish button.
 *
 * @return {*}
 */
const PublishDialogs: React.FC<IPublishDialogs> = (props) => {
  const {
    finishSubmissionTitle,
    finishSubmissionMessage,
    finishSubmissionBody,
    finishSubmission,
    setFinishSubmission,
    noSubmissionTitle,
    noSubmissionMessage,
    noSubmissionBody,
    noSubmissionData,
    setNoSubmissionData
  } = props;

  return (
    <>
      <ComponentDialog
        dialogTitle={finishSubmissionTitle}
        open={finishSubmission}
        onClose={() => {
          setFinishSubmission(false);
        }}>
        <DialogContentText id="alert-dialog-description">{finishSubmissionMessage}</DialogContentText>
        <DialogContentText id="alert-dialog-description">{finishSubmissionBody}</DialogContentText>
      </ComponentDialog>

      <ComponentDialog
        dialogTitle={noSubmissionTitle}
        open={noSubmissionData}
        onClose={() => {
          setNoSubmissionData(false);
        }}>
        <DialogContentText id="alert-dialog-description">{noSubmissionMessage}</DialogContentText>
        <DialogContentText id="alert-dialog-description">{noSubmissionBody}</DialogContentText>
      </ComponentDialog>
    </>
  );
};

export default PublishDialogs;
