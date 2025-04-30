import {
  mdiAccountMultipleOutline,
  mdiChartBoxOutline,
  mdiClipboardOutline,
  mdiDatabaseSearchOutline,
  mdiLabelOutline
} from '@mdi/js';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { CodesContext } from 'contexts/codesContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CollectionDataContainer } from './data/CollectionDataContainer';
import CollectionHeader from './header/CollectionHeader';
import CollectionParticipantsContainer from './members/CollectionMembersContainer';
import CollectionSurveyContainer from './survey/CollectionSurveyContainer';
import { CollectionTagContainer } from './tags/CollectionTagContainer';

enum CollectionView {
  Surveys = 'surveys',
  Data = 'data',
  Tags = 'Tags',
  Queries = 'Queries',
  Participants = 'participants'
}

const CollectionPage = () => {
  const codesContext = useContext(CodesContext);
  const biohubApi = useBiohubApi();

  const { id: collectionId } = useParams<{ id: string }>();
  const [activeView, setActiveView] = useState<CollectionView>(CollectionView.Surveys);

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
    { value: CollectionView.Tags, label: 'Tags', icon: mdiLabelOutline },
    { value: CollectionView.Data, label: 'Data', icon: mdiDatabaseSearchOutline },
    { value: CollectionView.Queries, label: 'Queries', icon: mdiChartBoxOutline },
    { value: CollectionView.Participants, label: 'Members', icon: mdiAccountMultipleOutline }
  ];

  return (
    <>
      <CollectionHeader collection={collection} />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <SidebarLayout
            sidebar={
              <CustomToggleButtonGroup
                views={views}
                activeView={activeView}
                onViewChange={(view) => setActiveView(view)}
                orientation="vertical"
              />
            }>
            {activeView === CollectionView.Surveys && (
              <Box>
                <CollectionSurveyContainer collectionId={collection.collection_id} showSearch={false} />
              </Box>
            )}

            {activeView === CollectionView.Tags && (
              <Box>
                <CollectionTagContainer collectionId={collection.collection_id} showSearch={false} />
              </Box>
            )}

            {activeView === CollectionView.Data && (
              <Box>
                <CollectionDataContainer collection={collection} />
              </Box>
            )}

            {activeView === CollectionView.Participants && (
              <Box>
                <CollectionParticipantsContainer collectionId={collection.collection_id} showSearch={true} />
              </Box>
            )}
          </SidebarLayout>
        </Paper>
      </Container>
    </>
  );
};

export default CollectionPage;
