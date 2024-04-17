import { mdiTableEdit } from '@mdi/js';
import Icon from '@mdi/react';
import { Button } from '@mui/material';
import { getSurveySessionStorageKey, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS } from 'constants/session-storage';
import { useObservationsTableContext, useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import ConfigureColumnsDialog from './dialog/ConfigureColumnsDialog';

export enum ConfigureColumnsViewEnum {
  MEASUREMENTS = 'MEASUREMENTS',
  GENERAL = 'GENERAL',
  ENVIRONMENT = 'ENVIRONMENT'
}

interface IConfigureColumnsContainerProps {
  isSaving: boolean
}

const ConfigureColumnsContainer = (props: IConfigureColumnsContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const surveyId = useSurveyContext().surveyId;
  const { stagedMeasurementColumns, setStagedMeasurementColumns, measurementColumns, setMeasurementColumns } =
    useObservationsTableContext();

  const handleSave = () => {
    setMeasurementColumns(stagedMeasurementColumns);

    // Store all remaining measurement definitions in local storage
    sessionStorage.setItem(
      getSurveySessionStorageKey(surveyId, SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS),
      JSON.stringify(measurementColumns)
    );

    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setStagedMeasurementColumns(measurementColumns);
  };

  return (
    <>
      <Button
        color="primary"
        variant="outlined"
        data-testid="observation-measurements-button"
        onClick={handleOpen}
        startIcon={<Icon style={{ marginTop: '2px' }} path={mdiTableEdit} size={1} />}
        aria-label="Add Measurements">
        Configure
      </Button>
      <ConfigureColumnsDialog onClose={handleClose} open={isOpen} onSave={handleSave} />
    </>
  );
};

export default ConfigureColumnsContainer;
