import Alert, { AlertProps } from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import React, { useState } from 'react';

interface SubmissionAlertBarProps {
  submitted: boolean;
}

const SubmissionAlertBar: React.FC<SubmissionAlertBarProps> = (props) => {
  const [alertOpen, setAlertOpen] = useState(true);

  const alertProps: AlertProps = {
    severity: props.submitted ? 'success' : 'info',
    onClose: () => setAlertOpen(false)
  };

  return (
    <>
      {alertOpen && (
        <Alert {...alertProps}>
          <AlertTitle>
            {props.submitted ? 'All data submitted' : 'This survey contains unsubmitted information'}
          </AlertTitle>
          {props.submitted
            ? ''
            : 'Please ensure that any information uploaded to this survey is promptly submitted for review.'}
        </Alert>
      )}
    </>
  );
};

export default SubmissionAlertBar;
