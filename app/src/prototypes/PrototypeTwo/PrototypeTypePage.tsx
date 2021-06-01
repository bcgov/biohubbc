import Box from '@material-ui/core/Box';
import React, { useState } from 'react';
import BlockListPage from './BlockListPage';
import NewBlockCondensed, { INewBlockForm } from './NewBlockCondensed';

export interface IObservationData {}

export interface IBlockData {
  block?: number;
  blockSize?: number;
  strata?: string;
  numObservations?: number;
  date?: string;
  blockMeta: INewBlockForm;
}

export interface IPageState {
  page: number;
  block: number;
  blockData: IBlockData[];
}

const PrototypeTypePage: React.FC = () => {
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
      <Box>
        <NewBlockCondensed pageState={pageState} setPageState={setPageState} goToBlockListPage={goToBlockListPage} />
      </Box>
    );
  }

  return <></>;
};

export default PrototypeTypePage;
