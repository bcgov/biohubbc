import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {
  mdiDotsVertical,
  mdiFileAlertOutline,
  mdiFileOutline,
  mdiInformationOutline,
  mdiTrashCanOutline,
  mdiTrayArrowDown
} from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { IGetSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import React from 'react';

interface IFileResultsProps {
  fileData: IGetSummaryResultsResponse;
  downloadFile: () => void;
  showDelete: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '82px',
    padding: theme.spacing(2),
    paddingLeft: '20px',
    overflow: 'hidden',
    '& .importFile-icon': {
      color: theme.palette.text.secondary
    },
    '&.error': {
      borderColor: theme.palette.error.main,
      '& .importFile-icon': {
        color: theme.palette.error.main
      }
    }
  },
  browseLink: {
    cursor: 'pointer'
  },
  fileDownload: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}));
const FileSummaryResults: React.FC<IFileResultsProps> = ({ fileData, downloadFile, showDelete }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const checkSubmissionStatus = (data: IGetSummaryResultsResponse): BioHubSubmittedStatusType => {
    if (data.surveySummarySupplementaryData?.event_timestamp) {
      return BioHubSubmittedStatusType.SUBMITTED;
    }
    return BioHubSubmittedStatusType.UNSUBMITTED;
  };

  let icon: string = mdiFileOutline;
  let severity: 'error' | 'info' | 'success' | 'warning' = 'info';

  if (fileData.surveySummaryData.messages.some((item) => item.class.toUpperCase() == 'ERROR')) {
    icon = mdiFileAlertOutline;
    severity = 'error';
  } else if (fileData.surveySummaryData.messages.some((item) => item.class.toUpperCase() == 'WARNING')) {
    icon = mdiFileAlertOutline;
    severity = 'warning';
  } else if (fileData.surveySummaryData.messages.some((item) => item.class.toUpperCase() == 'INFO')) {
    icon = mdiInformationOutline;
    severity = 'info';
  }

  return (
    <>
      <Paper variant="outlined" className={clsx(classes.importFile, severity)}>
        <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
          <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
            <Box display="flex" alignItems="center" flex="0 0 auto" className="importFile-icon" mr={2}>
              <Icon path={icon} size={1} />
            </Box>
            <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
              <Typography
                className={classes.fileDownload}
                variant="body2"
                component="div"
                onClick={() => downloadFile()}>
                <strong>{fileData.surveySummaryData.fileName}</strong>
              </Typography>
            </Box>
          </Box>

          <Box flex="0 0 auto" display="flex" alignItems="center">
            <Box mr={2}>
              <SubmitStatusChip status={checkSubmissionStatus(fileData)} />
            </Box>

            <Box>
              <IconButton
                aria-controls="context-menu"
                aria-haspopup="true"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                }}>
                <Icon path={mdiDotsVertical} size={1} />
              </IconButton>
              <Menu
                keepMounted
                id="context-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => {
                  setAnchorEl(null);
                }}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}>
                <MenuItem
                  onClick={() => {
                    downloadFile();
                    setAnchorEl(null);
                  }}>
                  <ListItemIcon>
                    <Icon path={mdiTrayArrowDown} size={1} />
                  </ListItemIcon>
                  Download
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    showDelete();
                    setAnchorEl(null);
                  }}>
                  <ListItemIcon>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </ListItemIcon>
                  Delete
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default FileSummaryResults;
