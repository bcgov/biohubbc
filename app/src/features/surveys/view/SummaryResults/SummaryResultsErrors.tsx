import { ListItemIcon } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Alert, AlertTitle } from '@material-ui/lab';
import { mdiAlertCircle, mdiDotsVertical, mdiFileAlertOutline, mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import React from 'react';

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

interface IFileErrorResultsProps {
  fileName: string;
  downloadFile: () => void;
  showDelete: () => void;
}
const SummaryResultsErrors: React.FC<IFileErrorResultsProps> = ({ fileName, downloadFile, showDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const classes = useStyles();
  return (
    <>
      <Box>
        <Alert severity="error" icon={<Icon path={mdiAlertCircle} size={1} />}>
          <AlertTitle>Failed to import summary results</AlertTitle>
          One or more errors occurred while attempting to import your summary results file.
          {/* {displayMessages(submissionErrors, messageGrouping, mdiAlertCircleOutline)} */}
          {/* {displayMessages(submissionWarnings, messageGrouping, mdiInformationOutline)} */}
        </Alert>

        <Box mt={3}>
          <Paper variant="outlined" className={clsx(classes.importFile, 'error')}>
            <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
              <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
                <Box display="flex" alignItems="center" flex="0 0 auto" className="importFile-icon" mr={2}>
                  <Icon path={mdiFileAlertOutline} size={1} />
                </Box>
                <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
                  <Typography className={classes.fileDownload} variant="body2" component="div" onClick={downloadFile}>
                    <strong>{fileName}</strong>
                  </Typography>
                </Box>
              </Box>
              <Box flex="0 0 auto" display="flex" alignItems="center">
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
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}>
                  <MenuItem onClick={downloadFile}>
                    <ListItemIcon>
                      <Icon path={mdiTrayArrowDown} size={1} />
                    </ListItemIcon>
                    Download
                  </MenuItem>
                  <MenuItem onClick={showDelete}>
                    <ListItemIcon>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </ListItemIcon>
                    Delete
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default SummaryResultsErrors;
