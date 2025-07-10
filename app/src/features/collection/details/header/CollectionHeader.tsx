import { mdiChevronDown, mdiCogOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { BreadcrumbHeader } from 'components/layout/BreadcrumbHeader';
import { DialogContext } from 'contexts/dialogContext';
import { SUMMARY_ACTIVE_VIEW_KEY, SUMMARY_ACTIVE_VIEW_VALUE } from 'features/summary/list-data/ListDataTableContainer';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { CollectionBreadcrumb } from './breadcrumb/CollectionBreadcrumb';

interface ICollectionHeaderProps {
  collection: ICollection;
}

const CollectionHeader = (props: ICollectionHeaderProps) => {
  const { collection } = props;
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const showDeleteCollectionDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Project',
      dialogText: 'Are you sure you want to delete this project?',
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
      await biohubApi.collection.deleteCollection(collection.collection_id);
      history.push(`/admin/summary?${SUMMARY_ACTIVE_VIEW_KEY}=${SUMMARY_ACTIVE_VIEW_VALUE.collections}`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogErrorDetails: [apiError.message], open: true });
      return error;
    }
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: 'Error Deleting Project',
      dialogText: 'An error occurred while trying to delete the project.',
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
      <BreadcrumbHeader
        breadCrumbJSX={<CollectionBreadcrumb collection={collection} />}
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
              aria-labelledby="collection_settings-button"
              style={{ marginTop: '8px' }}
              anchorEl={menuAnchorEl}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}>
              <MenuItem onClick={() => history.push('edit')}>
                <ListItemIcon>
                  <Icon path={mdiPencilOutline} size={1} />
                </ListItemIcon>
                <Typography variant="inherit">Edit Project Details</Typography>
              </MenuItem>
              <MenuItem onClick={showDeleteCollectionDialog} data-testid="delete-collection-button">
                <ListItemIcon>
                  <Icon path={mdiTrashCanOutline} size={1} />
                </ListItemIcon>
                <Typography variant="inherit">Delete Project</Typography>
              </MenuItem>
            </Menu>
          </>
        }
      />
    </>
  );
};

export default CollectionHeader;
