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
  fundingSourceId: number;
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

const EditFundingSource: React.FC<IEditFundingSourceProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const fundingSourceDataLoader = useDataLoader(() => biohubApi.funding.getFundingSource(props.fundingSourceId));
  fundingSourceDataLoader.load();

  // This is placed inside the `EditFundingSource` component to make use of an API call to check for used names
  // The API call would violate the rules of react hooks if placed in an object outside of the component
  // Reference: https://react.dev/warnings/invalid-hook-call-warning
  const FundingSourceYupSchema = yup.object().shape({
    name: yup
      .string()
      .trim()
      .required('Name is required')
      .test('nameUsed', 'Name has already been used', async (val) => {
        let hasBeenUsed = false;
        if (val) {
          const fundingSources = await biohubApi.funding.getFundingSources(val);
          // name matches and id matches return false
          // name matches and id no match return true
          // no name matches return false

          fundingSources.forEach((item) => {
            if (item.name.toLowerCase() === val.toLowerCase() && item.funding_source_id !== props.fundingSourceId) {
              hasBeenUsed = true;
            }
          });
        }
        return !hasBeenUsed;
      }),
    description: yup.string().max(200, 'Description cannot exceed 200 characters').required('Description is required'),
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
    try {
      setIsSubmitting(true);

      await biohubApi.funding.putFundingSource(values);

      // creation was a success, tell parent to refresh
      props.onClose(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              Funding source '<strong>{values.name}</strong>' saved
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

  if (!fundingSourceDataLoader.isReady || !fundingSourceDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <EditDialog
      dialogTitle={FundingSourceI18N.updateFundingSourceDialogTitle}
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <FundingSourceForm />,
        initialValues: {
          funding_source_id: fundingSourceDataLoader.data.funding_source.funding_source_id,
          name: fundingSourceDataLoader.data.funding_source.name,
          description: fundingSourceDataLoader.data.funding_source.description,
          start_date: fundingSourceDataLoader.data.funding_source.start_date,
          end_date: fundingSourceDataLoader.data.funding_source.end_date,
          revision_count: fundingSourceDataLoader.data.funding_source.revision_count
        },
        validationSchema: FundingSourceYupSchema
      }}
      dialogSaveButtonLabel="Save"
      onCancel={() => props.onClose()}
      onSave={(formValues) => {
        handleSubmitFundingService(formValues);
      }}
    />
  );
};

export default EditFundingSource;
