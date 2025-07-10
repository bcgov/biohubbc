import { mdiChevronDown, mdiFolderOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Collapse, Link, List, ListItem, ListItemIcon, ListItemText, Stack } from '@mui/material';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { useCallback, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import appTheme from 'themes/appTheme';

interface SubcollectionListItemProps {
  collection: ICollection;
  depth?: number;
  onNavigate: (collectionId: number) => void;
}

export const SubcollectionListItem = ({ collection, depth = 0, onNavigate }: SubcollectionListItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const biohubApi = useBiohubApi();

  const subcollectionsLoader = useDataLoader(() =>
    biohubApi.collection.findCollections(undefined, {
      parent_collection_id: collection.collection_id,
      include_children: false
    })
  );

  const hasChildren = (collection.subcollections?.length ?? 0) > 0;

  const toggleExpanded = () => {
    if (!expanded && !subcollectionsLoader.data) {
      subcollectionsLoader.load();
    }
    setExpanded((prev) => !prev);
  };

  const handleNavigate = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent toggling expand when clicking the link
      onNavigate(collection.collection_id);
    },
    [collection.collection_id, onNavigate]
  );

  return (
    <>
      <ListItem
        onClick={hasChildren ? toggleExpanded : undefined}
        sx={{
          pl: 2 + depth * 2,
          display: 'flex',
          alignItems: 'center',
          cursor: hasChildren ? 'pointer' : 'default'
        }}>
        <ListItemIcon>
          <Icon path={mdiFolderOutline} size={0.9} />
        </ListItemIcon>

        <ListItemText
          primary={
            <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" spacing={1}>
              <Link
                component={RouterLink}
                to={`/admin/collections/${collection.collection_id}`}
                underline="hover"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={collection.name}
                onClick={handleNavigate}>
                {collection.name}
              </Link>

              {hasChildren && (
                <Icon
                  path={mdiChevronDown}
                  size={0.85}
                  color={appTheme.palette.primary.main}
                  style={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              )}
            </Stack>
          }
          sx={{ pr: 1 }}
        />
      </ListItem>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box>
          <LoadingGuard
            isLoading={subcollectionsLoader.isLoading}
            isLoadingFallback={<SkeletonList numberOfLines={1} />}>
            <List disablePadding>
              {subcollectionsLoader.data?.collections.map((subcollection) => (
                <SubcollectionListItem
                  key={subcollection.collection_id}
                  collection={subcollection}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                />
              ))}
            </List>
          </LoadingGuard>
        </Box>
      </Collapse>
    </>
  );
};
