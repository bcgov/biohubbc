import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateCollectionSurveyI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import CollectionSurveyForm, { ICollectionSurveyData } from './form/CollectionSurveyForm';

interface ICreateCollectionSurveyDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

/**
 * Dialog for sharing a survey to multiple collections
 *
 * @param {ICreateCollectionSurveyDialogProps} props
 * @returns
 */
const CreateCollectionSurveyDialog = (props: ICreateCollectionSurveyDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const CollectionSurveyYupSchema = yup.object().shape({
    collections: yup
      .array(yup.object({ collection_id: yup.number().required('Collection is required') }))
      .min(1, 'You must select at least one collection')
  });

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateCollectionSurveyI18N.createErrorTitle,
      dialogText: CreateCollectionSurveyI18N.createErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitCollectionService = async (values: ICollectionSurveyData) => {
    try {
      setIsSubmitting(true);

      await biohubApi.collection.addToCollections(surveyContext.surveyId, {
        ...values,
        survey_id: surveyContext.surveyId
      });

      // creation was a success, tell parent to refresh
      props.onClose(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Survey added to collection
            </Typography>
          </>
        ),
        open: true
      });
    } catch (error: any) {
      showCreateErrorDialog({
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EditDialog
      dialogTitle="Add Survey to Collection"
      dialogText="Select collections to add the survey to"
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <CollectionSurveyForm />,
        initialValues: {
          collections: []
        },
        validationSchema: CollectionSurveyYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose()}
      onSave={(formValues) => {
        handleSubmitCollectionService(formValues);
      }}
    />
  );
};

export default CreateCollectionSurveyDialog;
