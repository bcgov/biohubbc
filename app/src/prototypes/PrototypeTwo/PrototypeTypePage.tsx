import { Container, Dialog } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Header from 'components/layout/Header';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import BlockListPage from './BlockListPage';
import NewBlockCondensed, { INewBlockForm } from './NewBlockCondensed';

export interface IObservationData {}

export interface IBlockData {
  block?: number;
  blockSize?: number;
  strata?: string;
  numObservations?: number;
  start_time?: string;
  end_time?: string;
  blockMeta: INewBlockForm;
}

export interface IPageState {
  page: number;
  block: number;
  blockData: IBlockData[];
}

export interface IPrototypeTypePageProps {
  projectForViewData: IGetProjectForViewResponse;
  surveyForViewData: IGetSurveyForViewResponse;
}

const PrototypeTypePage: React.FC<IPrototypeTypePageProps> = () => {
  const [pageState, setPageState] = useState<IPageState>({
    page: 1,
    block: 2,
    blockData: []
  });

  const goToBlockListPage = () => {
    setPageState({ ...pageState, page: 1 });
  };

  const goToNewBlockPage = () => {
    setPageState({ ...pageState, page: 2 });
  };

  if (pageState.page === 1) {
    return (
      <Box>
        <BlockListPage pageState={pageState} setPageState={setPageState} goToNewBlockPage={goToNewBlockPage} />
      </Box>
    );
  }

  if (pageState.page === 2) {
    return (
      <Dialog open={true} fullScreen={true}>
        <Header />
        <Container maxWidth="xl">
          <NewBlockCondensed pageState={pageState} setPageState={setPageState} goToBlockListPage={goToBlockListPage} />
        </Container>
      </Dialog>
    );
  }

  return <></>;
};

export default PrototypeTypePage;
