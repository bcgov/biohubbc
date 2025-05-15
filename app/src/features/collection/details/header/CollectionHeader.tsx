import { mdiChevronDown, mdiCogOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { DialogContext } from 'contexts/dialogContext';
import { SUMMARY_ACTIVE_VIEW_KEY, SUMMARY_ACTIVE_VIEW_VALUE } from 'features/summary/list-data/ListDataTableContainer';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

interface ICollection {
  collection_id: number;
  name: string;
  parent_collection_id?: number;
  subcollections?: ICollection[];
}

interface ICollectionHeaderProps {
  collection: ICollection;
}

const CollectionHeader = (props: ICollectionHeaderProps) => {
  const { collection } = props;
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const parentsDataLoader = useDataLoader((collectionId: number) =>
    biohubApi.collection.getCollectionParents(collectionId)
  );

  // Get the parents of the given collection to display as breadcrumbs
  useEffect(() => {
    if (collection.parent_collection_id) {
      parentsDataLoader.load(collection.parent_collection_id);
    }
  }, [parentsDataLoader, collection.parent_collection_id]);

  const showDeleteCollectionDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Collection',
      dialogText: 'Are you sure you want to delete this collection?',
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
      dialogTitle: 'Error Deleting Collection',
      dialogText: 'An error occurred while trying to delete the collection.',
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

  const gatherCollectionIdsAndNames = useCallback(
    (collections: ICollection[]): { collection_id: number; name: string }[] => {
      let collectionData: { collection_id: number; name: string }[] = [];

      collections.forEach((collection) => {
        collectionData.push({
          collection_id: collection.collection_id,
          name: collection.name
        });

        if (collection.subcollections?.length) {
          collectionData = collectionData.concat(gatherCollectionIdsAndNames(collection.subcollections));
        }
      });

      return collectionData;
    },
    []
  );

  const breadcrumb = useMemo(() => {
    const hierarchy = parentsDataLoader?.data?.hierarchy;

    if (!hierarchy) {
      return [];
    }

    const collected = gatherCollectionIdsAndNames([hierarchy]);

    return collected.map((item) => (
      <Link
        key={item.collection_id}
        component={RouterLink}
        underline="hover"
        to={`/admin/collections/${item.collection_id}`}>
        {item.name}
      </Link>
    ));
  }, [parentsDataLoader?.data?.hierarchy, gatherCollectionIdsAndNames]);

  return (
    <>
      <PageHeader
        title={collection.name ?? ''}
        isLoading={parentsDataLoader.isLoading || (!!collection.parent_collection_id && !breadcrumb.length)}
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator=">">
            <Link
              component={RouterLink}
              to={`/admin/summary?${SUMMARY_ACTIVE_VIEW_KEY}=${SUMMARY_ACTIVE_VIEW_VALUE.collections}`}
              underline="hover">
              Collections
            </Link>

            {collection.parent_collection_id && <>{breadcrumb}</>}

            {/* Render the current collection as plain text */}
            <Typography variant="body2" component="span" color="textSecondary" aria-current="page">
              {collection.name}
            </Typography>
          </Breadcrumbs>
        }
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
                <Typography variant="inherit">Edit Collection Details</Typography>
              </MenuItem>
              <MenuItem onClick={showDeleteCollectionDialog} data-testid="delete-collection-button">
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
