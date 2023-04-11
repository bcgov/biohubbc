import { DialogContent, DialogContentText } from '@material-ui/core';
import ComponentDialog from 'components/dialog/ComponentDialog';
import React from 'react';

export interface IPublishDialogs {
  finishSubmissionTitle: string;
  finishSubmissionMessage: string;
  finishSubmission: boolean;
  setFinishSubmission: (value: boolean) => void;
  noSubmissionData: boolean;
  setNoSubmissionData: (value: boolean) => void;
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
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{finishSubmissionMessage}</DialogContentText>
        </DialogContent>
      </ComponentDialog>

      <ComponentDialog
        dialogTitle="No Data to Submit"
        open={noSubmissionData}
        onClose={() => {
          setNoSubmissionData(false);
        }}>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Thank you!</DialogContentText>
        </DialogContent>
      </ComponentDialog>
    </>
  );
};

export default PublishDialogs;
