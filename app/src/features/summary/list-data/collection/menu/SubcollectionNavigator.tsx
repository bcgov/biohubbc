import { mdiChevronDown, mdiFolderOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, List, Menu, Typography } from '@mui/material';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { SubcollectionListItem } from './item/SubcollectionListItem';

interface SubcollectionNavigatorProps {
  collectionId: number;
}

export const SubcollectionNavigator = ({ collectionId }: SubcollectionNavigatorProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const collectionsLoader = useDataLoader(() =>
    biohubApi.collection.findCollections(undefined, {
      parent_collection_id: collectionId,
      include_children: false
    })
  );

  useEffect(() => {
    return () => {
      setAnchorEl(null);
    };
  }, []);

  const handleOpenMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
      if (!collectionsLoader.data) {
        collectionsLoader.load();
      }
    },
    [collectionsLoader]
  );

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigate = useCallback(
    (collectionId: number) => {
      history.push(`/admin/collection/${collectionId}`);
      setAnchorEl(null);
    },
    [history]
  );

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <Button
        onClick={handleOpenMenu}
        endIcon={<Icon path={mdiChevronDown} size={0.8} style={{ marginLeft: '-5px' }} />}
        sx={{ minWidth: 'auto', mx: 1 }}>
        <Icon path={mdiFolderOutline} size={0.75} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleCloseMenu}
        onMouseLeave={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              minWidth: 320,
              maxWidth: 480,
              maxHeight: 500,
              overflow: 'auto',
              mt: 1,
              borderRadius: 2
            }
          }
        }}>
        <Box sx={{ p: 2, pt: 1, borderBottom: '1px solid', borderColor: 'divider', fontWeight: 700 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Subprojects
          </Typography>
        </Box>

        <LoadingGuard isLoading={collectionsLoader.isLoading} isLoadingFallback={<SkeletonList numberOfLines={1} />}>
          <List disablePadding>
            {collectionsLoader.data?.collections.map((collection) => (
              <SubcollectionListItem
                key={collection.collection_id}
                collection={collection}
                onNavigate={handleNavigate}
              />
            ))}
          </List>
        </LoadingGuard>
      </Menu>
    </>
  );
};
