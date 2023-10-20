import {
  mdiDotsVertical,
  mdiFileAlertOutline,
  mdiFileOutline,
  mdiInformationOutline,
  mdiLockOutline,
  mdiTrashCanOutline,
  mdiTrayArrowDown
} from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import RemoveOrResubmitDialog from 'components/publish/components/RemoveOrResubmitDialog';
import { ProjectRoleGuard, SystemRoleGuard } from 'components/security/Guards';
import { PublishStatus } from 'constants/attachments';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { SurveyContext } from 'contexts/surveyContext';
import { IGetSummaryResultsResponse } from 'interfaces/useSummaryResultsApi.interface';
import React from 'react';

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}> from `SubmitStatusChip` and `Remove or Resubmit` button

interface IFileResultsProps {
  fileData: IGetSummaryResultsResponse;
  downloadFile: () => void;
  showDelete: () => void;
}

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
const FileSummaryResults = (props: IFileResultsProps) => {
  const { fileData, downloadFile, showDelete } = props;
  const classes = useStyles();

  const surveyContext = React.useContext(SurveyContext);
  const surveyName = surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openRemoveOrResubmitDialog, setOpenRemoveOrResubmitDialog] = React.useState(false);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const status = fileData.surveySummarySupplementaryData?.event_timestamp
    ? PublishStatus.SUBMITTED
    : PublishStatus.UNSUBMITTED;

  let icon: string = mdiFileOutline;
  let severity: 'error' | 'info' | 'success' | 'warning' = 'info';

  if (fileData.surveySummaryData.messages.some((item) => item.class.toUpperCase() === 'ERROR')) {
    icon = mdiFileAlertOutline;
    severity = 'error';
  } else if (fileData.surveySummaryData.messages.some((item) => item.class.toUpperCase() === 'WARNING')) {
    icon = mdiFileAlertOutline;
    severity = 'warning';
  } else if (fileData.surveySummaryData.messages.some((item) => item.class.toUpperCase() === 'INFO')) {
    icon = mdiInformationOutline;
  } else if (status === PublishStatus.SUBMITTED) {
    icon = mdiLockOutline;
  }

  return (
    <>
      <RemoveOrResubmitDialog
        projectId={surveyContext.projectId}
        fileName={fileData.surveySummaryData.fileName ?? ''}
        parentName={surveyName ?? ''}
        status={status}
        submittedDate={fileData.surveySummarySupplementaryData?.event_timestamp ?? ''}
        open={openRemoveOrResubmitDialog}
        onClose={() => setOpenRemoveOrResubmitDialog(false)}
      />

      <Paper variant="outlined" className={clsx(classes.importFile, severity)}>
        <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
          <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
            <Box display="flex" alignItems="center" flex="0 0 auto" className="importFile-icon" mr={2}>
              <Icon path={icon} size={1} />
            </Box>
            <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
              <Link className={classes.fileDownload} variant="body2" onClick={() => downloadFile()}>
                <strong>{fileData.surveySummaryData.fileName}</strong>
              </Link>
            </Box>
          </Box>

          <Box flex="0 0 auto" display="flex" alignItems="center">
            <Box mr={2}>
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
                <SubmitStatusChip status={status} />
              </SystemRoleGuard>
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
                  handleClose();
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
                    handleClose();
                  }}>
                  <ListItemIcon>
                    <Icon path={mdiTrayArrowDown} size={1} />
                  </ListItemIcon>
                  Download
                </MenuItem>
                {status === PublishStatus.UNSUBMITTED && (
                  <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <MenuItem
                      onClick={() => {
                        showDelete();
                        handleClose();
                      }}>
                      <ListItemIcon>
                        <Icon path={mdiTrashCanOutline} size={1} />
                      </ListItemIcon>
                      Delete
                    </MenuItem>
                  </SystemRoleGuard>
                )}
                {status === PublishStatus.SUBMITTED && (
                  <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <ProjectRoleGuard
                      validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}>
                      <MenuItem
                        onClick={() => {
                          setOpenRemoveOrResubmitDialog(true);
                          handleClose();
                        }}
                        data-testid="attachment-action-menu-delete">
                        <ListItemIcon>
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </ListItemIcon>
                        Remove or Resubmit
                      </MenuItem>
                    </ProjectRoleGuard>
                  </SystemRoleGuard>
                )}
              </Menu>
            </Box>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default FileSummaryResults;
