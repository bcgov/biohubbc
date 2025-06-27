// SubcollectionListItem.tsx
import { mdiChevronRight, mdiFolderOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Menu } from '@mui/material';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { useCallback, useEffect, useState } from 'react';

interface SubcollectionListItemProps {
  collection: ICollection;
  openMenuPath: number[];
  onHover: (collectionId: number, parentId: number | null) => void;
  onNavigate: (collectionId: number) => void;
  onClose?: () => void;
  parentId: number | null;
}

export const SubcollectionListItem = ({
  collection,
  openMenuPath,
  onHover,
  onNavigate,
  onClose,
  parentId
}: SubcollectionListItemProps) => {
  const [nestedAnchorEl, setNestedAnchorEl] = useState<HTMLElement | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const isSubmenuOpen = openMenuPath.includes(collection.collection_id);

  const biohubApi = useBiohubApi();

  const subcollectionsLoader = useDataLoader(() =>
    biohubApi.collection.findCollections(undefined, {
      parent_collection_id: collection.collection_id,
      include_children: true
    })
  );

  const subcollections = subcollectionsLoader.data?.collections ?? [];
  const hasSubcollections = collection.subcollections && collection.subcollections.length > 0;

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        setCloseTimeout(null);
      }

      if (hasSubcollections) {
        onHover(collection.collection_id, parentId);
        subcollectionsLoader.load();
        if (!nestedAnchorEl) {
          setNestedAnchorEl(event.currentTarget);
        }
      } else {
        onHover(collection.collection_id, parentId);
      }
    },
    [closeTimeout, hasSubcollections, onHover, collection.collection_id, parentId, subcollectionsLoader, nestedAnchorEl]
  );

  const handleCloseNestedMenu = useCallback(() => {
    onHover(parentId ?? 0, null);
  }, [onHover, parentId]);

  const handleDelayedClose = useCallback(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
    const timeout = setTimeout(handleCloseNestedMenu, 100);
    setCloseTimeout(timeout);
  }, [handleCloseNestedMenu, closeTimeout]);

  const handleCancelClose = useCallback(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
  }, [closeTimeout]);

  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  const handleNavigate = useCallback(() => {
    onNavigate(collection.collection_id);
    onClose?.();
  }, [onNavigate, collection.collection_id, onClose]);

  const handleNestedNavigate = useCallback(
    (collectionId: number) => {
      onNavigate(collectionId);
      handleCloseNestedMenu();
      onClose?.();
    },
    [onNavigate, handleCloseNestedMenu, onClose]
  );

  return (
    <>
      <ListItem
        disablePadding
        color="primary"
        onClick={handleNavigate}
        onMouseEnter={handleMouseEnter}
        sx={{
          pl: 2,
          pr: 1,
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 999999,
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}>
        <ListItemIcon sx={{ minWidth: 36 }}>
          <Icon path={mdiFolderOutline} size={0.9} color="currentColor" />
        </ListItemIcon>

        <ListItemText
          primary={collection.name}
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: 400,
            noWrap: true
          }}
        />

        {hasSubcollections && (
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 2, opacity: 0.6 }}>
            <Icon path={mdiChevronRight} size={0.85} />
          </Box>
        )}
      </ListItem>

      {isSubmenuOpen && hasSubcollections && (
        <Menu
          anchorEl={nestedAnchorEl}
          open={isSubmenuOpen}
          onClose={handleCloseNestedMenu}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              elevation: 8,
              onMouseLeave: handleDelayedClose,
              onMouseEnter: handleCancelClose,
              sx: {
                zIndex: 99999,
                minWidth: 320,
                maxWidth: 480,
                maxHeight: 500,
                overflow: 'auto',
                mt: -1,
                ml: 0.2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }
            }
          }}>
          <LoadingGuard
            isLoading={subcollectionsLoader.isLoading}
            isLoadingFallback={<SkeletonList numberOfLines={1} />}>
            <List disablePadding>
              {subcollections.map((subcollection) => (
                <SubcollectionListItem
                  key={subcollection.collection_id}
                  collection={subcollection}
                  openMenuPath={openMenuPath}
                  onHover={onHover}
                  onNavigate={handleNestedNavigate}
                  onClose={onClose}
                  parentId={collection.collection_id}
                />
              ))}
            </List>
          </LoadingGuard>
        </Menu>
      )}
    </>
  );
};
