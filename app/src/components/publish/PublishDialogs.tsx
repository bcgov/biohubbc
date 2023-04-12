import { DialogContentText } from '@material-ui/core';
import ComponentDialog from 'components/dialog/ComponentDialog';
import React from 'react';

export interface IPublishDialogs {
  finishSubmissionTitle: string;
  finishSubmissionMessage: string;
  finishSubmission: boolean;
  setFinishSubmission: (isEmpty: boolean) => void;
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
    finishSubmission,
    setFinishSubmission,
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
      </ComponentDialog>

      <ComponentDialog
        dialogTitle="Submit Survey Information"
        open={noSubmissionData}
        onClose={() => {
          setNoSubmissionData(false);
        }}>
        <DialogContentText id="alert-dialog-description">
          You have not imported or uploaded any information to this survey to submit.
        </DialogContentText>
      </ComponentDialog>
    </>
  );
};

export default PublishDialogs;
