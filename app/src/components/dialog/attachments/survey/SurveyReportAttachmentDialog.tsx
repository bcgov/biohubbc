import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React, useEffect } from 'react';

interface ISurveyReportAttachmentDialogProps {
  surveyId: number;
  attachment: IGetSurveyAttachment | null;
  open: boolean;
  onClose: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const SurveyReportAttachmentDialog: React.FC<ISurveyReportAttachmentDialogProps> = (props) => {
  const biohubApi = useBiohubApi();

  const attachmentId = props.attachment?.id;

  const reportAttachmentDetailsDataLoader = useDataLoader((_attachmentId: number) =>
    biohubApi.survey.getSurveyReportDetails(props.surveyId, _attachmentId)
  );

  useEffect(() => {
    // Load attachment details if attachmentId exists or has changed
    if (!attachmentId) {
      return;
    }

    reportAttachmentDetailsDataLoader.refresh(attachmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachmentId]);

  if (!props.open) {
    return <></>;
  }

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth={true} maxWidth="lg" data-testid="view-meta-dialog">
      <DialogTitle data-testid="view-meta-dialog-title">
        <Typography variant="body2" color="textSecondary" style={{ fontWeight: 700 }}>
          VIEW DOCUMENT DETAILS
        </Typography>
      </DialogTitle>
      <DialogContent></DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyReportAttachmentDialog;
