import { mdiAlertCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  IGetObservationSubmissionResponse,
  IGetObservationSubmissionResponseMessages
} from 'interfaces/useObservationApi.interface';

export interface IObservationMessagesCardProps {
  observationRecord: IGetObservationSubmissionResponse;
}

const ObservationMessagesCard = (props: IObservationMessagesCardProps) => {
  if (!props.observationRecord.surveyObservationData.messageTypes.length) {
    // No messages to display
    return <></>;
  }

  const errorMessageTypes = props.observationRecord.surveyObservationData.messageTypes
    .filter((item) => item.severityLabel === 'Error')
    .sort(alphabetizeSubmissionMessageTypes);

  const warningMessageTypes = props.observationRecord.surveyObservationData.messageTypes
    .filter((item) => item.severityLabel === 'Warning')
    .sort(alphabetizeSubmissionMessageTypes);

  const noticeMessageTypes = props.observationRecord.surveyObservationData.messageTypes
    .filter((item) => item.severityLabel === 'Notice')
    .sort(alphabetizeSubmissionMessageTypes);

  function alphabetizeSubmissionMessageTypes(
    messageA: IGetObservationSubmissionResponseMessages,
    messageB: IGetObservationSubmissionResponseMessages
  ) {
    // Message A is sorted before B
    if (messageA.messageTypeLabel < messageB.messageTypeLabel) {
      return -1;
    }
    // Message B is sorted before A
    if (messageA.messageTypeLabel > messageB.messageTypeLabel) {
      return 1;
    }
    // Items are already in order
    return 0;
  }

  return (
    <Box mb={3}>
      <ErrorMessages messageTypes={errorMessageTypes} />
      <WarningMessages messageTypes={warningMessageTypes} />
      <NoticeMessages messageTypes={noticeMessageTypes} />
    </Box>
  );
};

function SubmissionMessage(props: { messageObject: { id: number; message: string } }) {
  return (
    <li key={props.messageObject.id}>
      <Typography variant="body2" component="span">
        {props.messageObject.message}
      </Typography>
    </li>
  );
}

function SubmissionMessageType(props: { messageType: IGetObservationSubmissionResponseMessages }) {
  return (
    <Box mt={3}>
      <Box component="section">
        <Typography variant="body2">
          <strong>{props.messageType.messageTypeLabel}</strong>
        </Typography>
        <Box component="ul" mt={1} mb={0} pl={4}>
          {props.messageType.messages.map((messageObject) => (
            <SubmissionMessage messageObject={messageObject} key={messageObject.id} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function ErrorMessages(props: { messageTypes: IGetObservationSubmissionResponseMessages[] }) {
  if (!props.messageTypes.length) {
    return <></>;
  }

  return (
    <Box>
      <Alert severity="error" icon={<Icon path={mdiAlertCircleOutline} size={1} />}>
        <AlertTitle>Failed to import observations</AlertTitle>
        One or more errors occurred while attempting to import your observations file.
        {props.messageTypes.map((messageType) => {
          return <SubmissionMessageType messageType={messageType} key={messageType.messageTypeLabel} />;
        })}
      </Alert>
    </Box>
  );
}

function WarningMessages(props: { messageTypes: IGetObservationSubmissionResponseMessages[] }) {
  if (!props.messageTypes.length) {
    return <></>;
  }

  return (
    <Box mt={1}>
      <Alert severity="warning" icon={<Icon path={mdiAlertCircleOutline} size={1} />}>
        <AlertTitle>Warning</AlertTitle>
        {props.messageTypes.map((messageType) => {
          return <SubmissionMessageType messageType={messageType} key={messageType.messageTypeLabel} />;
        })}
      </Alert>
    </Box>
  );
}

function NoticeMessages(props: { messageTypes: IGetObservationSubmissionResponseMessages[] }) {
  if (!props.messageTypes.length) {
    return <></>;
  }

  return (
    <Box mt={1}>
      <Alert severity="info" icon={<Icon path={mdiAlertCircleOutline} size={1} />}>
        <AlertTitle>Notice</AlertTitle>
        {props.messageTypes.map((messageType) => {
          return <SubmissionMessageType messageType={messageType} key={messageType.messageTypeLabel} />;
        })}
      </Alert>
    </Box>
  );
}

export default ObservationMessagesCard;
