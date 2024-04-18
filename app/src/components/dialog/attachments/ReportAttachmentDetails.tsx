import { mdiPencilOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import ReportMeta from 'components/attachments/ReportMeta';
import { IGetReportDetails } from 'interfaces/useProjectApi.interface';
import { default as React, useState } from 'react';
import EditFileWithMetaDialog from './EditFileWithMetaDialog';

const useStyles = () => {
  const theme = useTheme();

  return {
    docTitle: {
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
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
  };
};

export interface IReportAttachmentDetailsProps {
  title: string;
  onFileDownload: () => void;
  onSave: (fileMeta: IEditReportMetaForm) => Promise<void>;
  reportAttachmentDetails: IGetReportDetails | null;
  attachmentSize: string;
  refresh: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ReportAttachmentDetails: React.FC<IReportAttachmentDetailsProps> = (props) => {
  const classes = useStyles();

  const [showEditFileWithMetaDialog, setShowEditFileWithMetaDialog] = useState<boolean>(false);

  return (
    <>
      <EditFileWithMetaDialog
        open={showEditFileWithMetaDialog}
        dialogTitle={'Edit Upload Report'}
        reportMetaData={props.reportAttachmentDetails}
        onClose={() => {
          setShowEditFileWithMetaDialog(false);
        }}
        onSave={props.onSave}
        refresh={props.refresh}
      />

      <Box display="flex" justifyContent="space-between">
        <Box style={{ maxWidth: '120ch' }}>
          <Typography variant="h2" component="h1" sx={classes.docTitle}>
            {props.title}
          </Typography>
        </Box>

        <Box display="flex" flex="0 0 auto">
          <Box mr={1}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Icon path={mdiPencilOutline} size={0.8} />}
              onClick={() => setShowEditFileWithMetaDialog(true)}>
              Edit Details
            </Button>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiTrayArrowDown} size={0.8} />}
            onClick={() => props.onFileDownload()}>
            Download ({props.attachmentSize})
          </Button>
        </Box>
      </Box>
      <Box mt={5}>
        <ReportMeta reportDetails={props.reportAttachmentDetails} />
      </Box>
    </>
  );
};

export default ReportAttachmentDetails;
