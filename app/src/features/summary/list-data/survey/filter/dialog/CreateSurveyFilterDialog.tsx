import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSurveyFilterSurveyI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IPostSurveyFilter } from 'interfaces/useFilterApi.interface';
import { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import SurveyFilterForm from './form/SurveyFilterForm';

interface ICreateSurveyFilterDialogProps {
  open: boolean;
  onSubmit: () => void;
  onClose?: (refresh?: boolean) => void;
}

/**
 * Dialog for sharing a survey to multiple collections
 *
 * NOTE: On naming conventions, SurveySurveyFilterForm is from the perspective of a survey (adding one survey to multiple collections).
 * Whereas SurveyFilterSurveyForm is from the perspective of a collection (adding multiple surveys to one collection)
 *
 * @param {ICreateSurveyFilterDialogProps} props
 * @returns
 */
const CreateSurveyFilterDialog = (props: ICreateSurveyFilterDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const SurveyFilterSurveyYupSchema = yup.object().shape({
    name: yup.string().required('Name is required').max(25, 'Name must be less than 25 characters'),
    description: yup.string().nullable().max(25, 'Description must be less than 250 characters'),
    conditions: yup.object()
  });

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateSurveyFilterSurveyI18N.createErrorTitle,
      dialogText: CreateSurveyFilterSurveyI18N.createErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmit = async (values: IPostSurveyFilter) => {
    try {
      setIsSubmitting(true);

      await biohubApi.filter.createSurveyFilter(values);

      props.onSubmit();

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Created new filter
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
      dialogTitle="Create Filter"
      dialogText="Add a custom filter to quickly find Surveys"
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <SurveyFilterForm />,
        initialValues: {
          name: '',
          description: null,
          conditions: {}
        },
        validationSchema: SurveyFilterSurveyYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose && props.onClose()}
      onSave={(formValues) => {
        handleSubmit(formValues);
      }}
    />
  );
};

export default CreateSurveyFilterDialog;
