import { mdiFileOutline, mdiLockOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ProjectRoleGuard } from 'components/security/Guards';
import { PublishStatus } from 'constants/attachments';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import NoSurveySectionData from 'features/surveys/components/NoSurveySectionData';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';
import AttachmentsListItemMenuButton from './AttachmentsListItemMenuButton';

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>

export interface IAttachmentsListProps<T extends IGetProjectAttachment | IGetSurveyAttachment> {
  attachments: T[];
  handleDownload: (attachment: T) => void;
  handleDelete: (attachment: T) => void;
  handleViewDetails: (attachment: T) => void;
  handleRemoveOrResubmit: (attachment: T) => void;
  emptyStateText?: string;
}

const AttachmentsList = <T extends IGetProjectAttachment | IGetSurveyAttachment>(props: IAttachmentsListProps<T>) => {
  const { attachments, handleDownload, handleDelete, handleViewDetails, handleRemoveOrResubmit } = props;

  const [rowsPerPage] = useState(10);
  const [page] = useState(0);

  if (!attachments.length) {
    return <NoSurveySectionData text={props.emptyStateText ?? 'No Documents'} />;
  }

  return (
    <TableContainer>
      <Table
        aria-label="attachments-list-table"
        sx={{
          tableLayout: 'fixed',
        }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
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
              <TableRow hover={false} key={`${attachment.fileName}-${attachment.id}`}>
                <TableCell scope="row"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <Stack flexDirection="row" alignItems="center" gap={2}
                    sx={{
                      '& svg': {
                        color: '#1a5a96',
                      },
                      '& a': {
                        fontWeight: 700
                      }
                    }}
                  >
                    <Icon path={icon} size={1} />
                    <Link
                      underline="always"
                      onClick={() => handleDownload(attachment)}
                      tabIndex={0}>
                      {attachment.fileName}
                    </Link>
                  </Stack>
                </TableCell>
                <TableCell>{attachment.fileType}</TableCell>
                <ProjectRoleGuard
                  validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
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
                </ProjectRoleGuard>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AttachmentsList;
