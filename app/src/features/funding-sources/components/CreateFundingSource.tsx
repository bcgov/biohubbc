import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateFundingSourceI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import FundingSourceForm, { IFundingSourceData } from './FundingSourceForm';

interface ICreateFundingSourceProps {
  isModalOpen: boolean;
  closeModal: (refresh?: boolean) => void;
}

const CreateFundingSource: React.FC<ICreateFundingSourceProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  // This is placed inside the `CreateFundingSource` component to make use of an API call to check for used names
  // The API call would violate the rules of react hooks if placed in an object outside of the component
  // Reference: https://react.dev/warnings/invalid-hook-call-warning
  const FundingSourceYupSchema = yup.object().shape({
    name: yup
      .string()
      .required('Name is required')
      .test('nameUsed', 'Name has already been used', async (val) => {
        let hasBeenUsed = false;
        if (val) {
          hasBeenUsed = await biohubApi.funding.hasFundingSourceNameBeenUsed(val);
        }
        return !hasBeenUsed;
      }),
    description: yup.string().max(200).required('Description is required'),
    start_date: yup.string().isValidDateString().nullable(),
    end_date: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date').nullable()
  });

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };
  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateFundingSourceI18N.createErrorTitle,
      dialogText: CreateFundingSourceI18N.createErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitFundingService = async (values: IFundingSourceData) => {
    setIsSubmitting(true);
    try {
      await biohubApi.funding.postFundingSource(values);

      // creation was a success, tell parent to refresh
      props.closeModal(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              Funding Source: <strong>{values.name}</strong> has been created.
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
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <EditDialog
        dialogTitle="Add New Funding Source"
        dialogText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed."
        open={props.isModalOpen}
        dialogLoading={isSubmitting}
        component={{
          element: <FundingSourceForm />,
          initialValues: {
            funding_source_id: null,
            name: '',
            description: '',
            start_date: null,
            end_date: null
          },
          validationSchema: FundingSourceYupSchema
        }}
        dialogSaveButtonLabel="Add"
        onCancel={() => props.closeModal()}
        onSave={(formValues) => {
          handleSubmitFundingService(formValues);
        }}
      />
    </>
  );
};

export default CreateFundingSource;
