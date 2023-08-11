import YesNoDialog from 'components/dialog/YesNoDialog';
import { DialogContext } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
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

  const showDeleteErrorDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: "You can't delete this record",
      dialogText:
        'This funding source has been referenced by one or more surveys. To delete this record, you will first have to remove it from all related surveys.',
      yesButtonProps: { color: 'primary' },
      yesButtonLabel: 'View Details',
      noButtonProps: { color: 'primary', variant: 'outlined' },
      noButtonLabel: 'Close',
      open: true,
      onYes: async () => {
        dialogContext.setYesNoDialog({ open: false });
        openViewModal(fundingSourceId);
      },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  const deleteFundingSource = async () => {
    try {
      await biohubApi.funding.deleteFundingSourceById(fundingSourceId);
      // delete was a success, tell parent to refresh
      onClose(true);
    } catch (error) {
      // error deleting, show dialog that says you need to remove references
      onClose(false);
      showDeleteErrorDialog();
    }
  };

  return (
    <>
      <YesNoDialog
        dialogTitle={'Delete Funding Source?'}
        dialogText={'Are you sure you want to permanently delete this funding source? This action cannot be undone.'}
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
    </>
  );
};

export default DeleteFundingSource;
