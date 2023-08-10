import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { FundingSourceI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import FundingSourceForm, { IFundingSourceData } from './FundingSourceForm';

interface IEditFundingSourceProps {
  funding_source_id: number;
  isModalOpen: boolean;
  closeModal: (refresh?: boolean) => void;
}

const EditFundingSource: React.FC<IEditFundingSourceProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const fundingSourceDataLoader = useDataLoader(() => biohubApi.funding.getFundingSource(props.funding_source_id));
  fundingSourceDataLoader.load();

  // This is placed inside the `EditFundingSource` component to make use of an API call to check for used names
  // The API call would violate the rules of react hooks if placed in an object outside of the component
  // Reference: https://react.dev/warnings/invalid-hook-call-warning
  const FundingSourceYupSchema = yup.object().shape({
    name: yup
      .string()
      .required('Name is required')
      .test('nameUsed', 'Name has already been used', async (val) => {
        let hasBeenUsed = false;
        if (val) {
          const fundingSources = await biohubApi.funding.getFundingSources(val);
          // name matches and id matches return false
          // name matches and id no match return true
          // no name matches return false

          fundingSources.forEach((item) => {
            if (item.name === val && item.funding_source_id !== props.funding_source_id) {
              hasBeenUsed = true;
            }
          });
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
      dialogTitle: FundingSourceI18N.updateErrorTitle,
      dialogText: FundingSourceI18N.updateErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitFundingService = async (values: IFundingSourceData) => {
    setIsSubmitting(true);
    try {
      await biohubApi.funding.putFundingSource(values);

      // creation was a success, tell parent to refresh
      props.closeModal(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              Funding Source: <strong>{values.name}</strong> has been updated.
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

  if (!fundingSourceDataLoader.isReady && !fundingSourceDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <EditDialog
        dialogTitle={FundingSourceI18N.updateFundingSourceDialogTitle}
        dialogText={FundingSourceI18N.updateFundingSourceDialogText}
        open={props.isModalOpen}
        dialogLoading={isSubmitting}
        component={{
          element: <FundingSourceForm />,
          initialValues: {
            funding_source_id: fundingSourceDataLoader.data!.funding_source_id,
            name: fundingSourceDataLoader.data!.name,
            description: fundingSourceDataLoader.data!.description,
            start_date: fundingSourceDataLoader.data!.start_date,
            end_date: fundingSourceDataLoader.data!.end_date,
            revision_count: fundingSourceDataLoader.data!.revision_count
          },
          validationSchema: FundingSourceYupSchema
        }}
        dialogSaveButtonLabel="Update"
        onCancel={() => props.closeModal()}
        onSave={(formValues) => {
          handleSubmitFundingService(formValues);
        }}
      />
    </>
  );
};

export default EditFundingSource;
