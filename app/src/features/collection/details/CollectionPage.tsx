import { mdiAccountMultipleOutline, mdiClipboardOutline, mdiDatabaseSearchOutline, mdiLabelOutline } from '@mdi/js';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import CustomToggleButtonGroup from 'components/toggle/CustomToggleButtonGroup';
import { CodesContext } from 'contexts/codesContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CollectionDataContainer } from './data/CollectionDataContainer';
import CollectionHeader from './header/CollectionHeader';
import { CollectionMembersTableContainer } from './members/CollectionMembersTableContainer';
import CollectionSurveyContainer from './survey/CollectionSurveyContainer';
import { SubcollectionContainer } from './tags/SubcollectionContainer';

const COLLECTION_ACTIVE_VIEW_KEY = 'cvk';

export enum CollectionView {
  Surveys = 'surveys',
  Data = 'data',
  Subcollections = 'subprojects',
  Members = 'members'
}

type CollectionPageURLParams = {
  [COLLECTION_ACTIVE_VIEW_KEY]: CollectionView;
};

const CollectionPage = () => {
  const codesContext = useContext(CodesContext);
  const biohubApi = useBiohubApi();

  const { id: collectionId } = useParams<{ id: string }>();
  const { searchParams, setSearchParams } = useSearchParams<CollectionPageURLParams>();

  // Get initial view from URL or fallback
  const initialView = (searchParams.get(COLLECTION_ACTIVE_VIEW_KEY) as CollectionView) ?? CollectionView.Surveys;
  const [activeView, setActiveView] = useState<CollectionView>(initialView);

  // Sync URL and state when view changes
  const handleViewChange = (view: CollectionView) => {
    setSearchParams(searchParams.set(COLLECTION_ACTIVE_VIEW_KEY, view));
    setActiveView(view);
  };

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const collectionDataLoader = useDataLoader((collectionId: number) =>
    biohubApi.collection.getCollection(collectionId)
  );

  useEffect(() => {
    if (collectionId) {
      collectionDataLoader.load(Number(collectionId));
    }
  }, [collectionDataLoader, collectionId]);

  if (!collectionDataLoader.data) {
    return <></>;
  }

  const collection = collectionDataLoader.data;

  const views = [
    { value: CollectionView.Surveys, label: 'Surveys', icon: mdiClipboardOutline },
    { value: CollectionView.Subcollections, label: 'Subprojects', icon: mdiLabelOutline },
    { value: CollectionView.Data, label: 'Data', icon: mdiDatabaseSearchOutline },
    { value: CollectionView.Members, label: 'Members', icon: mdiAccountMultipleOutline }
  ];

  return (
    <>
      <CollectionHeader collection={collection} />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SidebarLayout
          sidebar={
            <Box p={2} sx={{ minWidth: '300px', overflowY: 'auto', height: '100%', flexShrink: 0 }}>
              <CustomToggleButtonGroup
                views={views}
                activeView={activeView}
                onViewChange={handleViewChange}
                orientation="vertical"
              />
            </Box>
          }>
          <ComponentSwitch
            switch={activeView}
            components={{
              [CollectionView.Surveys]: <CollectionSurveyContainer collection={collection} showSearch={false} />,
              [CollectionView.Subcollections]: <SubcollectionContainer collection={collection} showSearch={false} />,
              [CollectionView.Data]: <CollectionDataContainer collection={collection} />,
              [CollectionView.Members]: <CollectionMembersTableContainer collectionId={collection.collection_id} />
            }}
          />
        </SidebarLayout>
      </Container>
    </>
  );
};

export default CollectionPage;
