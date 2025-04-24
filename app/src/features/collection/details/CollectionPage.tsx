import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { CodesContext } from 'contexts/codesContext';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';
import { useContext, useEffect } from 'react';
import { useParams } from 'react-router';
import CollectionAbout from './about/CollectionAbout';
import CollectionHeader from './header/CollectionHeader';
import CollectionSurveyContainer from './survey/CollectionSurveyContainer';
import { CollectionDataContainer } from './survey/data/CollectionDataContainer';
/**
 * Page to display a single Collection.
 *
 * @return {*}
 */
const CollectionPage = () => {
  const codesContext = useContext(CodesContext);
  const biohubApi = useBiohubApi();

  const { id: collectionId } = useParams<{ id: string }>();

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

  return (
    <>
      <CollectionHeader collection={collectionDataLoader.data} />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.SURVEYS]} />
        <Stack flexDirection="row" alignItems="flex-start" gap={2}>
          <Paper sx={{ width: '400px', alignSelf: 'flex-start' }}>
            <CollectionAbout collection={collectionDataLoader.data} />
          </Paper>
          <Box flex="1 1 auto">
            <Paper sx={{ flex: '1 1 auto' }}>
              <CollectionSurveyContainer collectionId={collectionDataLoader.data.collection_id} showSearch={false} />
            </Paper>

            <Paper sx={{ flex: '1 1 auto', mt: 3 }}>
              <CollectionDataContainer collection={collectionDataLoader.data} />
            </Paper>
          </Box>
        </Stack>
      </Container>
    </>
  );
};

export default CollectionPage;
