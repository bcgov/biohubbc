import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';

/**
 * Dialog service hook - use this inside React components
 * @returns Dialog service object with methods for showing dialogs
 */
export const useDialogService = () => {
  const dialogContext = useDialogContext();
  return {
    /**
     * Show a Yes/No dialog
     */
    showYesNoDialog: (props: {
      title: string;
      message: string;
      yesLabel?: string;
      noLabel?: string;
      yesColor?: 'primary' | 'error';
      onYes?: () => Promise<void> | void;
      onNo?: () => void;
    }) => {
      dialogContext.setYesNoDialog({
        dialogTitle: props.title,
        dialogText: props.message,
        yesButtonLabel: props.yesLabel || 'Yes',
        noButtonLabel: props.noLabel || 'No',
        yesButtonProps: { color: props.yesColor || 'primary' },
        onClose: () => {
          dialogContext.setYesNoDialog({ open: false });
        },
        onNo: () => {
          if (props.onNo) {
            props.onNo();
          }
          dialogContext.setYesNoDialog({ open: false });
        },
        open: true,
        onYes: async () => {
          try {
            if (props.onYes) {
              await props.onYes();
            }
          } catch (error) {
            console.error('Error in dialog onYes handler:', error);
          } finally {
            dialogContext.setYesNoDialog({ open: false });
          }
        }
      });
    },
    /**
     * Show a snackbar notification
     */
    showSnackbar: (message: string) => {
      dialogContext.setSnackbar({
        snackbarMessage: message,
        open: true
      });
    }
  };
};

/**
 * API service hook - use this inside React components
 * @returns API service object with methods for making API calls
 */
export const useApiService = () => {
  const biohubApi = useBiohubApi();
  return {
    /**
     * Collection-related API methods
     */
    collection: {
      /**
       * Update a collection link
       */
      updateLink: async (collectionId: number, linkId: number, updateData: any): Promise<void> => {
        try {
          await biohubApi.collection.updateCollectionLink(collectionId, linkId, updateData);
        } catch (error) {
          console.error('Error updating collection link:', error);
          throw error;
        }
      },

      /**
       * Create a collection link
       */
      createLink: async (collectionId: number, createData: any): Promise<void> => {
        try {
          await biohubApi.collection.createCollectionLink(collectionId, createData);
        } catch (error) {
          console.error('Error creating collection link:', error);
          throw error;
        }
      },

      /**
       * Get collection links
       */
      getLinks: async (collectionId: number, pagination: any) => {
        return await biohubApi.collection.getCollectionLinks(collectionId, pagination);
      }
    }
  };
};
