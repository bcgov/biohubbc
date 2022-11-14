import { DialogTitle } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
// import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiLockOutline, mdiPencilOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetReportMetaData } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';
import SecurityDialog from './SecurityDialog';

const useStyles = makeStyles((theme: Theme) => ({
  docTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden'
  },
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
}));

export interface IViewFileWithMetaDialogProps {
  open: boolean;
  onEdit?: () => void;
  onClose: () => void;
  onDownload: () => void;
  reportMetaData: IGetReportMetaData | null;
  attachmentSize: string;
  dialogProps?: DialogProps;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ViewFileWithMetaDialog: React.FC<IViewFileWithMetaDialogProps> = (props) => {
  const classes = useStyles();
  const { reportMetaData } = props;

  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [showEditButton] = useState<boolean>(!!props.onEdit);

  if (!props.open) {
    return <></>;
  }

  return (
    <>
      <SecurityDialog
        open={securityDialogOpen}
        onAccept={() => alert('accepted')}
        onClose={() => setSecurityDialogOpen(false)}
      />

      <Dialog open={props.open} onClose={props.onClose} {...props.dialogProps} data-testid="view-meta-dialog">
        <DialogTitle data-testid="view-meta-dialog-title">
          <Typography variant="body2" color="textSecondary" style={{ fontWeight: 700 }}>
            VIEW DOCUMENT DETAILS
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="space-between">
            <Box style={{ maxWidth: '120ch' }}>
              <Typography variant="h2" component="h1" className={classes.docTitle}>
                {reportMetaData?.title}
              </Typography>
            </Box>
            <Box flex="0 0 auto">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Icon path={mdiTrayArrowDown} size={0.8} />}
                onClick={props.onDownload}>
                Download ({props.attachmentSize})
              </Button>
            </Box>
          </Box>
          <Box mt={5}>
            <Paper variant="outlined">
              <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" component="h3">
                  General Information
                </Typography>
                <Box>
                  {showEditButton && (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Icon path={mdiPencilOutline} size={0.8} />}
                      onClick={props.onEdit}>
                      Edit Details
                    </Button>
                  )}
                </Box>
              </Toolbar>
              <Divider></Divider>
              <Box p={3}>
                <Box component="dl" className={classes.docDL}>
                  <Box className={classes.docMetaRow}>
                    <Typography component="dt" variant="body1" color="textSecondary">
                      Report Title
                    </Typography>
                    <Typography variant="body1">{reportMetaData?.title}</Typography>
                  </Box>
                  <Box mt={1} className={classes.docMetaRow}>
                    <Typography component="dt" variant="body1" color="textSecondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{reportMetaData?.description}</Typography>
                  </Box>
                  <Box mt={1} className={classes.docMetaRow}>
                    <Typography component="dt" variant="body1" color="textSecondary">
                      Year Published
                    </Typography>
                    <Typography component="dd">{reportMetaData?.year_published}</Typography>
                  </Box>
                  <Box mt={1} className={classes.docMetaRow}>
                    <Typography component="dt" variant="body1" color="textSecondary">
                      Last Modified
                    </Typography>
                    <Typography component="dd">
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortMediumDateFormat,
                        reportMetaData?.last_modified || ''
                      )}
                    </Typography>
                  </Box>
                  <Box mt={1} className={classes.docMetaRow}>
                    <Typography component="dt" variant="body1" color="textSecondary">
                      Authors
                    </Typography>
                    <Typography component="dd">
                      {reportMetaData?.authors
                        ?.map((author) => [author.first_name, author.last_name].join(' '))
                        .join(', ')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
          <Paper variant="outlined" style={{ marginTop: '24px' }}>
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h5" component="h3">
                Security Reasons
              </Typography>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Icon path={mdiLockOutline} size={0.8} />}
                  style={{ marginRight: '8px' }}
                  onClick={() => setSecurityDialogOpen(true)}>
                  Add Security
                </Button>
                <Button variant="contained" color="primary" startIcon={<Icon path={mdiLockOutline} size={0.8} />}>
                  Remove Security
                </Button>
              </Box>
            </Toolbar>
            <Divider></Divider>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="200">Category</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell width="160">Dates</TableCell>
                    <TableCell width="160">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Security Administration</TableCell>
                    <TableCell>
                      <Typography style={{ fontWeight: 700 }}>Awaiting Security Review</Typography>
                      <Typography variant="body1" color="textSecondary">
                        Awaiting review to determine if security-reasons should be assigned
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" component="div">
                        Submitted
                      </Typography>
                      <Typography variant="body2" component="div" color="textSecondary">
                        YYYY-MM-DD
                      </Typography>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewFileWithMetaDialog;
