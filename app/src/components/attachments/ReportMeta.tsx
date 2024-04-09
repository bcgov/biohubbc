import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import useTheme from '@mui/material/styles/useTheme';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetReportDetails } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

const useStyles = () => {
  const theme = useTheme();

  return {
    docDL: {
      margin: 0,
      '& dt': {
        flex: '0 0 200px',
        margin: '0',
        color: theme.palette.text.secondary
      },
      '& dd': {
        flex: '1 1 auto'
      }
    },
    docMetaRow: {
      display: 'flex'
    }
  };
};

export interface IViewReportDetailsProps {
  onEdit?: () => void;
  onSave?: () => void;

  reportDetails: IGetReportDetails | null;
}

const ReportMeta: React.FC<IViewReportDetailsProps> = (props) => {
  const classes = useStyles();

  const reportDetails = props.reportDetails;

  return (
    <>
      <Paper variant="outlined">
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h3">
            General Information
          </Typography>
        </Toolbar>
        <Divider></Divider>
        <Box p={3}>
          <Box component="dl" sx={classes.docDL}>
            <Box sx={classes.docMetaRow}>
              <Typography component="dt" variant="body1" color="textSecondary">
                Report Title
              </Typography>
              <Typography variant="body1">{reportDetails?.metadata?.title}</Typography>
            </Box>
            <Box mt={1} sx={classes.docMetaRow}>
              <Typography component="dt" variant="body1" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">{reportDetails?.metadata?.description}</Typography>
            </Box>
            <Box mt={1} sx={classes.docMetaRow}>
              <Typography component="dt" variant="body1" color="textSecondary">
                Year Published
              </Typography>
              <Typography component="dd">{reportDetails?.metadata?.year_published}</Typography>
            </Box>
            <Box mt={1} sx={classes.docMetaRow}>
              <Typography component="dt" variant="body1" color="textSecondary">
                Last Modified
              </Typography>
              <Typography component="dd">
                {getFormattedDateRangeString(
                  DATE_FORMAT.ShortMediumDateFormat,
                  reportDetails?.metadata?.last_modified || ''
                )}
              </Typography>
            </Box>
            <Box mt={1} sx={classes.docMetaRow}>
              <Typography component="dt" variant="body1" color="textSecondary">
                Authors
              </Typography>
              <Typography component="dd">
                {reportDetails?.authors?.map((author) => [author.first_name, author.last_name].join(' ')).join(', ')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default ReportMeta;
