import { mdiChevronDown, mdiCogOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { DeleteCollectionI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';

interface ICollectionHeaderProps {
  collection: ICollection;
}

/**
 * Collection header for a single-collection view.
 *
 * @return {*}
 */
const CollectionHeader = (props: ICollectionHeaderProps) => {
  const { collection } = props;

  const history = useHistory();
  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const showDeleteCollectionDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: DeleteCollectionI18N.deleteTitle,
      dialogText: DeleteCollectionI18N.deleteText,
      yesButtonProps: { color: 'error' },
      yesButtonLabel: 'Delete',
      noButtonProps: { color: 'primary', variant: 'outlined' },
      noButtonLabel: 'Cancel',
      open: true,
      onYes: async () => {
        await deleteCollection();
        dialogContext.setYesNoDialog({ open: false });
      },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  const deleteCollection = async () => {
    try {
      const response = await biohubApi.collection.deleteCollection(collection.collection_id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push(`/admin/summary`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogErrorDetails: [apiError.message], open: true });
      return error;
    }
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: DeleteCollectionI18N.deleteErrorTitle,
      dialogText: DeleteCollectionI18N.deleteErrorText,
      open: true,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps
    });
  };

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <PageHeader
        title={collection.name ?? ''}
        buttonJSX={
          <>
            <Button
              id="collection_settings-button"
              variant="outlined"
              color="primary"
              startIcon={<Icon path={mdiCogOutline} size={0.75} />}
              endIcon={<Icon path={mdiChevronDown} size={0.75} />}
              aria-label="Collection Settings"
              aria-controls="collectionSettingsMenu"
              aria-haspopup="true"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => setMenuAnchorEl(event.currentTarget)}>
              Settings
            </Button>
            <Menu
              id="collectionSettingsMenu"
              aria-labelledby="collection_settings_button"
              style={{ marginTop: '8px' }}
              anchorEl={menuAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}>
              <MenuItem onClick={() => history.push('edit')}>
                <ListItemIcon>
                  <Icon path={mdiPencilOutline} size={1} />
                </ListItemIcon>
                <Typography variant="inherit">Edit Collection Details</Typography>
              </MenuItem>
              <MenuItem onClick={showDeleteCollectionDialog} data-testid={'delete-collection-button'}>
                <ListItemIcon>
                  <Icon path={mdiTrashCanOutline} size={1} />
                </ListItemIcon>
                <Typography variant="inherit">Delete Collection</Typography>
              </MenuItem>
            </Menu>
          </>
        }
      />
    </>
  );
};

export default CollectionHeader;
