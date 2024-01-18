import { mdiFileOutline, mdiLockOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { makeStyles } from '@mui/styles';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { SystemRoleGuard } from 'components/security/Guards';
import { PublishStatus } from 'constants/attachments';
import { SYSTEM_ROLE } from 'constants/roles';
import NoSurveySectionData from 'features/surveys/components/NoSurveySectionData';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';
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
  }
}));

export interface IAttachmentsListProps<T extends IGetProjectAttachment | IGetSurveyAttachment> {
  attachments: T[];
  handleDownload: (attachment: T) => void;
  handleDelete: (attachment: T) => void;
  handleViewDetails: (attachment: T) => void;
  handleRemoveOrResubmit: (attachment: T) => void;
  emptyStateText?: string
}

const AttachmentsList = <T extends IGetProjectAttachment | IGetSurveyAttachment>(props: IAttachmentsListProps<T>) => {
  const classes = useStyles();

  const { attachments, handleDownload, handleDelete, handleViewDetails, handleRemoveOrResubmit } = props;

  const [rowsPerPage] = useState(10);
  const [page] = useState(0);

  if (!attachments.length) {
    return <NoSurveySectionData text={props.emptyStateText ?? 'No Documents'} />;
  }

  return (
    <TableContainer>
      <Table className={classes.attachmentsTable} aria-label="attachments-list-table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell width="130">Type</TableCell>
            <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
              <TableCell width="150">Status</TableCell>
            </SystemRoleGuard>
            <TableCell width="75"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attachments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((attachment) => {
            const attachmentStatus = attachment.supplementaryAttachmentData?.event_timestamp
              ? PublishStatus.SUBMITTED
              : PublishStatus.UNSUBMITTED;

            const icon: string = attachmentStatus === PublishStatus.SUBMITTED ? mdiLockOutline : mdiFileOutline;

            return (
              <TableRow key={`${attachment.fileName}-${attachment.id}`}>
                <TableCell scope="row" className={classes.attachmentNameCol}>
                  <Box display="flex" alignItems="center">
                    <Icon
                      path={icon}
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
                    <SubmitStatusChip status={attachmentStatus} />
                  </TableCell>
                </SystemRoleGuard>
                <TableCell align="right">
                  <AttachmentsListItemMenuButton
                    attachmentFileType={attachment.fileType}
                    attachmentStatus={attachmentStatus}
                    onDownloadFile={() => handleDownload(attachment)}
                    onDeleteFile={() => handleDelete(attachment)}
                    onViewDetails={() => handleViewDetails(attachment)}
                    onRemoveOrResubmit={() => handleRemoveOrResubmit(attachment)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttachmentsList;
