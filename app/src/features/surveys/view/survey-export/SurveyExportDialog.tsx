import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/system/useTheme';
import { SurveyExportI18N } from 'constants/i18n';
import { SurveyExportConfig, SurveyExportForm } from 'features/surveys/view/survey-export/SurveyExportForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';

export interface ISurveyExportDialogProps {
  open: boolean;
  onCancel: () => void;
}

export const SurveyExportDialog = (props: ISurveyExportDialogProps) => {
  const { open, onCancel } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const biohubApi = useBiohubApi();

  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const [exportConfig, setExportConfig] = useState<SurveyExportConfig>({} as any);
  const [isExporting, setIsExporting] = useState(false);

  const isDisabled = Object.values(exportConfig).every((value) => value === false);

  /**
   * Handle the export of the survey data, including downloading the file to the users device.
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await biohubApi.survey.exportData(surveyContext.projectId, surveyContext.surveyId, exportConfig);

      setIsExporting(false);

      if (!response) {
        return;
      }

      response.presignedS3Urls.forEach((url) => {
        window.open(url);
      });
    } catch (error) {
      const apiError = error as APIError;
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: SurveyExportI18N.exportErrorTitle,
        dialogText: SurveyExportI18N.exportErrorText,
        dialogErrorDetails: apiError.errors,
        onOk: () => dialogContext.setErrorDialog({ open: false }),
        onClose: () => dialogContext.setErrorDialog({ open: false })
      });
    }
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="xl"
      open={open}
      aria-labelledby="export-dialog-title"
      aria-describedby="export-dialog-description">
      <DialogTitle id="export-dialog-title">{'Export Survey Data'}</DialogTitle>
      <DialogContent>
        <SurveyExportForm onExportConfig={setExportConfig} />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={isExporting}
          disabled={isExporting || isDisabled}
          onClick={handleExport}
          color="primary"
          variant="contained"
          data-testid="export-dialog-save">
          Start Export
        </LoadingButton>
        <Button
          onClick={onCancel}
          color="primary"
          variant="outlined"
          data-testid="export-dialog-cancel"
          disabled={isExporting}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
