import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { mdiAlertCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { IGetSummarySubmissionResponseMessages } from 'interfaces/useSummaryResultsApi.interface';
import React from 'react';
import { ClassGrouping } from '../SurveySummaryResults';

interface IFileErrorResultsProps {
  messages: IGetSummarySubmissionResponseMessages[];
}
const SummaryResultsErrors = (props: IFileErrorResultsProps) => {
  const { messages } = props;
  const errorGrouping = new Map<string, IGetSummarySubmissionResponseMessages[]>();
  const warningGrouping = new Map<string, IGetSummarySubmissionResponseMessages[]>();
  const noticeGrouping = new Map<string, IGetSummarySubmissionResponseMessages[]>();

  const groupMessages = () => {
    messages.forEach((item) => {
      switch (item.class) {
        case ClassGrouping.ERROR:
          if (!errorGrouping.has(item.type)) {
            errorGrouping.set(item.type, [item]);
          } else {
            errorGrouping.get(item.type)?.push(item);
          }
          break;
        case ClassGrouping.WARNING:
          if (!warningGrouping.has(item.type)) {
            warningGrouping.set(item.type, [item]);
          } else {
            warningGrouping.get(item.type)?.push(item);
          }
          break;
        case ClassGrouping.NOTICE:
          if (!noticeGrouping.has(item.type)) {
            noticeGrouping.set(item.type, [item]);
          } else {
            noticeGrouping.get(item.type)?.push(item);
          }
          break;
        default:
          break;
      }
    });
  };
  groupMessages();

  const buildMessages = (group: Map<string, IGetSummarySubmissionResponseMessages[]>) => {
    return (
      <Box>
        {[...group].map((item) => {
          return (
            <Box key={`key-${item[0]}`} mt={3} pl={0.25}>
              <Typography variant="body2">
                <strong>{item[0]}</strong>
              </Typography>
              <Box component="ul" mt={1} mb={0} pl={4}>
                {item[1].map((message) => {
                  return (
                    <li key={`${message.class}-${message.type}-${message.id}`}>
                      <Typography variant="body2" component="span">
                        {message.message}
                      </Typography>
                    </li>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <>
      <Box mb={3}>
        {errorGrouping.size > 0 && (
          <Box>
            <Alert severity="error" icon={<Icon path={mdiAlertCircle} size={1} />}>
              <AlertTitle>Failed to import summary results</AlertTitle>
              One or more errors occurred while attempting to import your summary results file.
              {buildMessages(errorGrouping)}
            </Alert>
          </Box>
        )}

        {/* {warningGrouping.size > 0 && (
          <Box>
            <Alert severity="warning" icon={<Icon path={mdiAlertCircle} size={1} />}>
              <AlertTitle>Imported Summary Results</AlertTitle>
              One or more warnings occurred while attempting to import your summary results file.
              {buildMessages(warningGrouping)}
            </Alert>
          </Box>
        )} */}

        {/* {noticeGrouping.size > 0 && (
          <Box>
            <Alert severity="info" icon={<Icon path={mdiAlertCircle} size={1} />}>
              <AlertTitle>Imported Summary Results</AlertTitle>
              {buildMessages(noticeGrouping)}
            </Alert>
          </Box>
        )} */}
      </Box>
    </>
  );
};

export default SummaryResultsErrors;
