import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { mdiInformationOutline, mdiLockOpenVariantOutline, mdiLockOutline } from '@mdi/js';
import Icon from '@mdi/react';
import ViewFileWithMetaDialog from 'components/dialog/ViewFileWithMetaDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectAttachment, IGetReportMetaData } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedDate, getFormattedFileSize } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  attachmentsTable: {
    '& .MuiTableCell-root': {
      verticalAlign: 'middle'
    }
  }
}));

export interface IPublicAttachmentsListProps {
  projectId: number;
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

const PublicAttachmentsList: React.FC<IPublicAttachmentsListProps> = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const restorationTrackerApi = useRestorationTrackerApi();
  const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();
  const [reportMetaData, setReportMetaData] = useState<IGetReportMetaData | null>(null);
  const [showViewFileWithMetaDialog, setShowViewFileWithMetaDialog] = useState<boolean>(false);
  const [currentAttachment, setCurrentAttachment] = useState<IGetProjectAttachment | null>(null);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const showRequestAccessDialog = () => {
    setOpen(true);
  };

  const hideRequestAccessDialog = () => {
    setOpen(false);
  };

  const openAttachmentFromReportMetaDialog = async () => {
    if (currentAttachment) {
      openAttachment(currentAttachment);
    }
  };

  const handleReportMetaDialog = async (attachment: IGetProjectAttachment) => {
    setCurrentAttachment(attachment);
    try {
      const response = await restorationTrackerApi.public.project.getPublicProjectReportMetadata(
        props.projectId,
        attachment.id
      );

      if (!response) {
        return;
      }

      setReportMetaData(response);
      setShowViewFileWithMetaDialog(true);
    } catch (error) {
      return error;
    }
  };

  const openAttachment = async (attachment: IGetProjectAttachment) => {
    try {
      const response = await restorationTrackerApi.public.project.getAttachmentSignedURL(
        props.projectId,
        attachment.id,
        attachment.fileType
      );

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      return error;
    }
  };
  return (
    <>
      <ViewFileWithMetaDialog
        open={showViewFileWithMetaDialog}
        onClose={() => {
          setShowViewFileWithMetaDialog(false);
        }}
        onDownload={openAttachmentFromReportMetaDialog}
        reportMetaData={reportMetaData}
        attachmentSize={(currentAttachment && getFormattedFileSize(currentAttachment.size)) || '0 KB'}
      />
      <TableContainer>
        <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>File Size</TableCell>
              <TableCell width="150px">Security Status</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.attachmentsList.length > 0 &&
              props.attachmentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={`${row.fileName}-${index}`}>
                  <TableCell scope="row">
                    <Link
                      underline="always"
                      component="button"
                      variant="body2"
                      onClick={() => {
                        if (row.securityToken) {
                          showRequestAccessDialog();
                        } else {
                          openAttachment(row);
                        }
                      }}>
                      {row.fileName}
                    </Link>
                  </TableCell>
                  <TableCell>{row.fileType}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, row.lastModified)}</TableCell>
                  <TableCell>{getFormattedFileSize(row.size)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Icon path={row.securityToken ? mdiLockOutline : mdiLockOpenVariantOutline} size={1} />
                      <Box ml={0.5}>{row.securityToken ? 'Secured' : 'Unsecured'}</Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {!row.securityToken && (
                      <IconButton
                        color="primary"
                        aria-label="view report"
                        onClick={() => {
                          handleReportMetaDialog(row);
                        }}
                        data-testid="attachment-view-meta">
                        <Icon path={mdiInformationOutline} size={1} />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {!props.attachmentsList.length && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Attachments
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {props.attachmentsList.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 20]}
          component="div"
          count={props.attachmentsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
          onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChangeRowsPerPage(event, setPage, setRowsPerPage)
          }
        />
      )}

      <Dialog open={open}>
        <DialogTitle>Access Denied</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="textSecondary">
            To access secure documents, please submit your request to{' '}
            <Link
              href="mailto:retoration-tracker@gov.bc.ca?subject=Restoration Tracker - Secure Document Access Request"
              underline="always"
              onClick={preventDefault}>
              restoation-tracker@gov.bc.ca
            </Link>
            . A data manager will review your request and contact you as soon as possible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={hideRequestAccessDialog}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PublicAttachmentsList;
