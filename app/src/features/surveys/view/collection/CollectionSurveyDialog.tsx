import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateCollectionSurveyI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useState } from 'react';
import yup from 'utils/YupSchema';
import CollectionSurveyForm, {
  CollectionSurveyFormInitialValues,
  ICollectionSurveyForm
} from './form/CollectionSurveyForm';

interface ICreateCollectionSurveyDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

export const CollectionSurveyYupSchema = yup.object().shape({
  collections: yup
    .array(yup.object({ collection_id: yup.number().required('Project is required') }))
    .min(1, 'You must select at least one project')
});

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

  // Get collections that the survye already belongs to filter out of the autocomplete
  const surveysDataLoader = useDataLoader(() => biohubApi.survey.getCollectionsBySurveyId(surveyContext.surveyId));

  useEffect(() => {
    surveysDataLoader.load();
  }, [surveysDataLoader]);

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

  const handleSubmitCollectionService = async (values: ICollectionSurveyForm) => {
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
      dialogTitle="Add Survey to Project"
      dialogText="Select projects to add the survey to"
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: (
          <CollectionSurveyForm
            formikFieldName="collections"
            existingCollectionIds={
              surveysDataLoader.data?.collections.map((collection) => collection.collection_id) ?? []
            }
          />
        ),
        initialValues: CollectionSurveyFormInitialValues,
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
