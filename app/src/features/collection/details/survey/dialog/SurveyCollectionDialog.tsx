import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateCollectionSurveyI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import SurveyCollectionForm, { ISurveyCollectionData } from './form/SurveyCollectionForm';

interface ISurveyCollectionDialogProps {
  collectionId: number;
  open: boolean;
  onSubmit: () => void;
  onClose?: (refresh?: boolean) => void;
}

/**
 * Dialog for sharing a survey to multiple collections
 *
 * NOTE: On naming conventions, SurveyCollectionForm is from the perspective of a survey (adding one survey to multiple collections).
 * Whereas CollectionSurveyForm is from the perspective of a collection (adding multiple surveys to one collection)
 *
 * @param {ISurveyCollectionDialogProps} props
 * @returns
 */
const SurveyCollectionDialog = (props: ISurveyCollectionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

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

  const handleSubmitCollectionService = async (values: ISurveyCollectionData) => {
    try {
      setIsSubmitting(true);

      await biohubApi.collection.addSurveys({ ...values, collection_id: props.collectionId });

      props.onSubmit();

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
    }
    setIsSubmitting(false);
  };

  return (
    <EditDialog
      dialogTitle="Add Survey to Collection"
      dialogText="Select surveys to add to the collection"
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <SurveyCollectionForm />,
        initialValues: {
          surveys: []
        },
        validationSchema: CollectionSurveyYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose && props.onClose()}
      onSave={(formValues) => {
        handleSubmitCollectionService(formValues);
      }}
    />
  );
};

export default SurveyCollectionDialog;
