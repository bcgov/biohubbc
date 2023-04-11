import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core/styles';
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
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingLeft: '20px',
    overflow: 'hidden',
    '& .importFile-icon': {
      color: '#1a5a96'
    },
    '&.error': {
      borderColor: '#ebccd1',
      '& .importFile-icon': {
        color: theme.palette.error.main
      },
      '& .MuiLink-root': {
        color: theme.palette.error.main
      },
      '& .MuiChip-root': {
        display: 'none'
      }
    }
  },
  observationFileName: {
    marginTop: '2px',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}));

export interface IObservationFileCardProps {
  observationRecord: IGetObservationSubmissionResponse;
  onDelete: () => void;
  onDownload: () => void;
}

const ObservationFileCard = (props: IObservationFileCardProps) => {
  const classes = useStyles();

  const [contextMenuAnchorEl, setContextMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleOpenContextMenu = (event: React.MouseEvent<HTMLButtonElement>) =>
    setContextMenuAnchorEl(event.currentTarget);
  const handleCloseContextMenu = () => setContextMenuAnchorEl(null);

  let icon: string = mdiFileOutline;
  let severity: 'error' | 'info' | 'success' | 'warning' = 'info';

  if (
    props.observationRecord.surveyObservationData.messageTypes.some(
      (messageType) => messageType.severityLabel === 'Error'
    )
  ) {
    icon = mdiFileAlertOutline;
    severity = 'error';
  } else if (
    props.observationRecord.surveyObservationData.messageTypes.some(
      (messageType) => messageType.severityLabel === 'Warning'
    )
  ) {
    icon = mdiFileAlertOutline;
    severity = 'warning';
  } else if (
    props.observationRecord.surveyObservationData.messageTypes.some(
      (messageType) => messageType.severityLabel === 'Notice'
    )
  ) {
    icon = mdiInformationOutline;
  }

  const status =
    (props.observationRecord.surveyObservationSupplementaryData?.event_timestamp &&
      BioHubSubmittedStatusType.SUBMITTED) ||
    BioHubSubmittedStatusType.UNSUBMITTED;

  return (
    <Paper variant="outlined" className={clsx(classes.importFile, severity)}>
      <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
        <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
          <Box display="flex" alignItems="center" flex="0 0 auto" mr={2} className="importFile-icon">
            <Icon path={icon} size={1} />
          </Box>
          <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
            <Link className={classes.observationFileName} variant="body2" onClick={props.onDownload}>
              <strong>{props.observationRecord.surveyObservationData.inputFileName}</strong>
            </Link>
          </Box>
        </Box>

        <Box flex="0 0 auto" display="flex" alignItems="center">
          <Box mr={2}>
            <SubmitStatusChip status={status} />
          </Box>
          <Box>
            <IconButton aria-controls="context-menu" aria-haspopup="true" onClick={handleOpenContextMenu}>
              <Icon path={mdiDotsVertical} size={1} />
            </IconButton>
            <Menu
              keepMounted
              id="context-menu"
              anchorEl={contextMenuAnchorEl}
              open={Boolean(contextMenuAnchorEl)}
              onClose={handleCloseContextMenu}
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
                  props.onDownload();
                  handleCloseContextMenu();
                }}>
                <ListItemIcon>
                  <Icon path={mdiTrayArrowDown} size={1} />
                </ListItemIcon>
                Download
              </MenuItem>
              <MenuItem
                onClick={() => {
                  props.onDelete();
                  handleCloseContextMenu();
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
  );
};

export default ObservationFileCard;
