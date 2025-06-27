import { mdiChevronDown, mdiFolderOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Link, List, ListItem, ListItemIcon, ListItemText, Menu, Stack, Typography } from '@mui/material';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import appTheme from 'themes/appTheme';

interface SubcollectionNavigatorProps {
  collectionId: number;
}

export const SubcollectionNavigator = ({ collectionId }: SubcollectionNavigatorProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [expandedCollections, setExpandedCollections] = useState<number[]>([]);
  const biohubApi = useBiohubApi();

  const collectionsLoader = useDataLoader(() =>
    biohubApi.collection.findCollections(undefined, {
      parent_collection_id: collectionId,
      include_children: true
    })
  );

  useEffect(() => {
    return () => {
      setExpandedCollections([]);
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

  const handleHover = async (collection: ICollection) => {
    if (collection.subcollections.length < 1) {
      return;
    }

    setExpandedCollections((prev) => [...prev, collection.collection_id]);
  };

  const isOpen = Boolean(anchorEl);

  const renderCollectionItems = (items: ICollection[], depth = 0): JSX.Element[] => {
    const result: JSX.Element[] = [];

    for (const item of items) {
      result.push(
        <ListItem key={item.collection_id} sx={{ pl: 2 + depth * 2 }} onMouseEnter={() => handleHover(item)} button>
          <ListItemIcon>
            <Icon path={mdiFolderOutline} size={0.9} />
          </ListItemIcon>

          <ListItemText
            primary={
              <Stack flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
                <Link
                  component={RouterLink}
                  to={`/admin/collections/${item.collection_id}`}
                  underline="always"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexGrow: 1
                  }}
                  title={item.name}>
                  {item.name}
                </Link>

                {item.subcollections.length > 0 && (
                  <Icon path={mdiChevronDown} size={0.85} color={appTheme.palette.primary.main} />
                )}
              </Stack>
            }
            sx={{ pr: 1 }}
          />
        </ListItem>
      );

      // Insert children if expanded
      if (expandedCollections.includes(item.collection_id) && item.subcollections?.length) {
        result.push(...renderCollectionItems(item.subcollections, depth + 1));
      }
    }

    return result;
  };

  return (
    <>
      <Button
        onClick={handleOpenMenu}
        endIcon={<Icon path={mdiChevronDown} size={0.8} style={{ marginLeft: '-5px' }} />}
        sx={{ minWidth: 'auto', mx: 1 }}>
        <Icon path={mdiFolderOutline} size={0.9} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleCloseMenu}
        onMouseLeave={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
            {collectionsLoader.data?.collections ? renderCollectionItems(collectionsLoader.data.collections) : null}
          </List>
        </LoadingGuard>
      </Menu>
    </>
  );
};
