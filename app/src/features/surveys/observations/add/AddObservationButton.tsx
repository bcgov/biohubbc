import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SubmitBiohubI18N } from 'constants/i18n';
import { defaultErrorDialogProps, DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { IObservationTableRowToSave } from 'hooks/api/useObservationApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import AddObservationDialog from './dialog/AddObservationDialog';

export const AddObservationButton = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);
  const { projectId, surveyId } = surveyContext;

  const dialogContext = useContext(DialogContext);

  const [open, setOpen] = useState<boolean>(false);

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const handleSubmitObservation = async (values: IObservationTableRowToSave) => {
    setIsSubmitting(true);

    return biohubApi.observation
      .insertUpdateObservationRecords(projectId, surveyId, [values])
      .then(() => {})
      .catch(() => {
        showErrorDialog({
          dialogTitle: SubmitBiohubI18N.submitBiohubErrorTitle,
          dialogText: SubmitBiohubI18N.submitBiohubErrorText
        });
      })
      .finally(() => {
        surveyContext.surveyDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
        setIsSubmitting(false);
        // props.onClose();
      });
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Icon path={mdiPlus} size={1} />}
        onClick={() => setOpen(true)}
        disabled={isSubmitting}>
        Add Row
      </Button>
      <AddObservationDialog open={open} onClose={() => setOpen(false)} onSave={handleSubmitObservation} />
    </>
  );
};
