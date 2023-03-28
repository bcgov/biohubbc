import Box from '@material-ui/core/Box';
import { grey } from '@material-ui/core/colors';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import AttachmentsListItemMenuButton from './AttachmentsListItemMenuButton';

const useStyles = makeStyles(() => ({
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

  function getArtifactSubmissionStatus(attachment: T): BioHubSubmittedStatusType {
    if (attachment.supplementaryAttachmentData?.event_timestamp) {
      return BioHubSubmittedStatusType.SUBMITTED;
    }
    return BioHubSubmittedStatusType.UNSUBMITTED;
  }

  function AttachmentsTableRow(props: { attachment: T }) {
    const { attachment } = props;

    return (
      <TableRow key={`${attachment.fileName}-${attachment.id}`}>
        <TableCell scope="row" className={classes.attachmentNameCol}>
          <Link style={{ fontWeight: 'bold' }} underline="always" onClick={() => handleDownload(attachment)}>
            {attachment.fileName}
          </Link>
        </TableCell>
        <TableCell>{attachment.fileType}</TableCell>
        <TableCell align="right">
          <SubmitStatusChip status={getArtifactSubmissionStatus(attachment)} />
        </TableCell>
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

  function NoAttachmentsTableRow() {
    return (
      <TableRow>
        <TableCell colSpan={3} align="center">
          <Typography component="strong" color="textSecondary" variant="body2">
            No Documents
          </Typography>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell width="80px"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(attachments.length &&
              attachments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                return <AttachmentsTableRow attachment={row} />;
              })) || <></>}
            {(!attachments.length && <NoAttachmentsTableRow />) || <></>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttachmentsList;
