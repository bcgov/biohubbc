import CircularProgress from '@mui/material/CircularProgress';
import { ObservationsTableContext } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext, useMemo } from 'react';
import ResizableContainer from './ResizableContainer';
import ObservationComponent from '../observations-table/ObservationsTableContainer';
import SubcountTableContainer from '../subcounts/SubcountTableContainer';
import { Stack } from '@mui/material';

export const ObservationPanelContainer = () => {
  const surveyContext = useContext(SurveyContext);

  const observationsTableContext = useContext(ObservationsTableContext);

  const observation = useMemo(() => {
    return observationsTableContext.currentObservation;
  }, [observationsTableContext.currentObservation, observationsTableContext]);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Stack flex='1 1 auto' gap={1}>
      <ObservationComponent />
      {observation && (
        <ResizableContainer>
          <SubcountTableContainer />
        </ResizableContainer>
      )}
    </Stack>
  );
};
