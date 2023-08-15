import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { FundingSourceI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext } from 'react';

interface IDeleteFundingSource {
  fundingSourceId: number;
  open: boolean;
  onClose: (refresh?: boolean) => void;
  openViewModal: (fundingSourceId: number) => void;
}

const DeleteFundingSource: React.FC<IDeleteFundingSource> = (props) => {
  const { fundingSourceId, open, onClose, openViewModal } = props;
  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

  const fundingSourceDataLoader = useDataLoader(() => biohubApi.funding.getFundingSource(fundingSourceId));
  fundingSourceDataLoader.load();

  // API Error dialog
  const showDeleteErrorDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: FundingSourceI18N.deleteFundingSourceErrorTitle,
      dialogText: FundingSourceI18N.deleteFundingSourceErrorText,
      open: true,
      onYes: async () => dialogContext.setYesNoDialog({ open: false }),
      onClose: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  // Success snack bar
  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const deleteFundingSource = async () => {
    try {
      await biohubApi.funding.deleteFundingSourceById(fundingSourceId);
      // delete was a success, tell parent to refresh
      onClose(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              Funding source '<strong>{fundingSourceDataLoader.data?.funding_source.name}</strong>'' deleted
            </Typography>
          </>
        ),
        open: true
      });
    } catch (error) {
      // error deleting, show dialog that says you need to remove references
      onClose(false);
      showDeleteErrorDialog();
    }
  };

  if (!fundingSourceDataLoader.isReady || !fundingSourceDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  // Checks if the funding source has any associated surveys to see if it can be deleted
  const canDeleteFundingSource = () => {
    // if no survey data is found the funding source can be deleted
    // so the default response is true
    let canDelete = true;

    if (fundingSourceDataLoader.data) {
      canDelete = fundingSourceDataLoader.data.funding_source_survey_references.length === 0;
    }

    return canDelete;
  };

  return (
    <>
      {canDeleteFundingSource() ? (
        <YesNoDialog
          dialogTitle={FundingSourceI18N.deleteFundingSourceDialogTitle}
          dialogText={FundingSourceI18N.deleteFundingSourceDialogText}
          yesButtonProps={{ color: 'error' }}
          yesButtonLabel={'Delete'}
          noButtonProps={{ color: 'primary', variant: 'outlined' }}
          noButtonLabel={'Cancel'}
          open={open}
          onYes={() => {
            deleteFundingSource();
          }}
          onClose={() => {}}
          onNo={() => onClose()}
        />
      ) : (
        <>
          <YesNoDialog
            dialogTitle={FundingSourceI18N.cannotDeleteFundingSourceTitle}
            dialogText={FundingSourceI18N.cannotDeleteFundingSourceText}
            yesButtonProps={{ color: 'primary' }}
            yesButtonLabel={'View Details'}
            noButtonProps={{ color: 'primary', variant: 'contained' }}
            noButtonLabel={'Close'}
            open={open}
            onYes={() => {
              onClose(false);
              openViewModal(fundingSourceId);
            }}
            onClose={() => {}}
            onNo={() => onClose()}
          />
        </>
      )}
    </>
  );
};

export default DeleteFundingSource;
