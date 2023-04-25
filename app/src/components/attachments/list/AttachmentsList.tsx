import { Paper } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { grey } from '@material-ui/core/colors';
import Link from '@material-ui/core/Link';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { SystemRoleGuard } from 'components/security/Guards';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import AttachmentsListItemMenuButton from './AttachmentsListItemMenuButton';

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>

const useStyles = makeStyles((theme: Theme) => ({
  attachmentsTable: {
    tableLayout: 'fixed'
  },
  attachmentsTableLockIcon: {
    marginTop: '3px',
    color: grey[600]
  },
  attachmentNameCol: {
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  fileIcon: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(3),
    color: '#1a5a96'
  },
  noDocuments: {
    height: '66px',
    color: theme.palette.text.secondary,
    fontWeight: 700
  },
  importFile: {
    display: 'flex',
    minHeight: '66px',
    fontWeight: 700,
    color: theme.palette.text.secondary
  }
}));

export interface IAttachmentsListProps<T extends IGetProjectAttachment | IGetSurveyAttachment> {
  attachments: T[];
  handleDownload: (attachment: T) => void;
  handleDelete: (attachment: T) => void;
  handleViewDetails: (attachment: T) => void;
}

const AttachmentsList = <T extends IGetProjectAttachment | IGetSurveyAttachment>(props: IAttachmentsListProps<T>) => {
  const classes = useStyles();

  const { attachments, handleDownload, handleDelete, handleViewDetails } = props;

  const [rowsPerPage] = useState(10);
  const [page] = useState(0);

  if (!attachments.length) {
    return <NoAttachments />;
  }

  return (
    <TableContainer>
      <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell width="130">Type</TableCell>
            <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
              <TableCell width="130">Status</TableCell>
            </SystemRoleGuard>
            <TableCell width="75"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attachments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
            return (
              <AttachmentsTableRow
                key={`${row.fileType}-${row.id}`}
                attachment={row}
                handleDownload={handleDownload}
                handleDelete={handleDelete}
                handleViewDetails={handleViewDetails}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function AttachmentsTableRow<T extends IGetProjectAttachment | IGetSurveyAttachment>(props: {
  attachment: T;
  handleDownload: (attachment: T) => void;
  handleDelete: (attachment: T) => void;
  handleViewDetails: (attachment: T) => void;
}) {
  const classes = useStyles();
  const { attachment, handleDownload, handleDelete, handleViewDetails } = props;

  function getArtifactSubmissionStatus(attachment: T): BioHubSubmittedStatusType {
    if (attachment.supplementaryAttachmentData?.event_timestamp) {
      return BioHubSubmittedStatusType.SUBMITTED;
    }
    return BioHubSubmittedStatusType.UNSUBMITTED;
  }

  return (
    <TableRow key={`${attachment.fileName}-${attachment.id}`}>
      <TableCell scope="row" className={classes.attachmentNameCol}>
        <Box display="flex" alignItems="center">
          <Icon
            path={mdiFileOutline}
            size={1}
            className={classes.fileIcon}
            style={{ marginRight: '16px', marginLeft: '4px' }}
          />
          <Link
            style={{ fontWeight: 'bold' }}
            underline="always"
            onClick={() => handleDownload(attachment)}
            tabIndex={0}>
            {attachment.fileName}
          </Link>
        </Box>
      </TableCell>
      <TableCell>{attachment.fileType}</TableCell>
      <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
        <TableCell>
          <SubmitStatusChip status={getArtifactSubmissionStatus(attachment)} />
        </TableCell>
      </SystemRoleGuard>
      <TableCell align="right">
        <AttachmentsListItemMenuButton
          attachment={attachment}
          handleDownloadFile={() => handleDownload(attachment)}
          handleDeleteFile={() => handleDelete(attachment)}
          handleViewDetails={() => handleViewDetails(attachment)}
        />
      </TableCell>
    </TableRow>
  );
}

function NoAttachments() {
  const classes = useStyles();
  return (
    <Paper variant="outlined" className={classes.importFile}>
      <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" p={2}>
        <span data-testid="observations-nodata">No Documents</span>
      </Box>
    </Paper>
  );
}

export default AttachmentsList;
