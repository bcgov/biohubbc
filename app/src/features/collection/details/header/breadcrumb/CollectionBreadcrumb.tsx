import Breadcrumbs from '@mui/material/Breadcrumbs';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface CollectionBreadcrumbProps {
  collection: ICollection;
  prependProjectLink?: boolean;
}

/**
 * Displays breadcrumbs showing the collection's parent hierarchy
 *
 * @param {CollectionBreadcrumbProps} props
 * @returns
 */
export const CollectionBreadcrumb = (props: CollectionBreadcrumbProps) => {
  const { collection } = props;
  const biohubApi = useBiohubApi();

  const parentsDataLoader = useDataLoader((collectionId: number) =>
    biohubApi.collection.getCollectionParents(collectionId)
  );

  useEffect(() => {
    if (collection.parent_collection_id) {
      parentsDataLoader.load(collection.parent_collection_id);
    }
  }, [collection.parent_collection_id, parentsDataLoader]);

  const breadcrumbLinks = useMemo(() => {
    const hierarchy = parentsDataLoader.data?.hierarchy;

    if (!hierarchy) {
      return [];
    }

    const gatherCollectionIdsAndNames = (collections: ICollection[]): { collection_id: number; name: string }[] => {
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
    };

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
  }, [parentsDataLoader.data?.hierarchy]);

  if (parentsDataLoader.isLoading) {
    return <CircularProgress size={20} />;
  }

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator="/"
      sx={{
        '& .MuiTypography-root': { fontSize: '1.5rem !important', fontWeight: 700 },
        '& .MuiBreadcrumbs-separator': { fontSize: '1.5rem' }
      }}>
      <Stack gap={0.5} flexDirection="row" alignItems="center">
        <Link component={RouterLink} to="/admin/summary?p_view=collections" underline="hover">
          Projects
        </Link>
        {/* <SubcollectionNavigator /> */}
      </Stack>

      {breadcrumbLinks}

      <Typography component="span" color="textSecondary" aria-current="page">
        {collection.name}
      </Typography>
    </Breadcrumbs>
  );
};
