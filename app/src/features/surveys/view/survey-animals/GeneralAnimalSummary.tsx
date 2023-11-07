import { mdiContentCopy } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/system/Box';
import CustomTextField from 'components/fields/CustomTextField';
import { DialogContext } from 'contexts/dialogContext';
import { useFormikContext } from 'formik';
import { useContext } from 'react';
import { setMessageSnackbar } from 'utils/Utils';
import { getAnimalFieldName, IAnimal, IAnimalGeneral } from './animal';

interface GeneralAnimalSummaryProps {
  handleEdit: () => void;
}

const GeneralAnimalSummary = (props: GeneralAnimalSummaryProps) => {
  const dialogContext = useContext(DialogContext);

  const {
    initialValues: { general, markings, collectionUnits, device, measurements, mortality, family }
  } = useFormikContext<IAnimal>();

  return (
    <Box>
      {/* Temp just showing the available properties */}
      <CustomTextField
        label="Critter ID"
        name={getAnimalFieldName<IAnimalGeneral>('general', 'critter_id')}
        other={{
          InputProps: {
            endAdornment: (
              <IconButton
                aria-label={`Copy Critter ID`}
                onClick={() => {
                  navigator.clipboard.writeText(general.critter_id ?? '');
                  setMessageSnackbar('Copied Critter ID', dialogContext);
                }}>
                <Icon path={mdiContentCopy} size={0.8} />
              </IconButton>
            )
          },
          disabled: true
        }}
      />
      <Button onClick={props.handleEdit} variant="contained">
        Edit
      </Button>
      <div>{general.sex}</div>
      <div>{general.wlh_id}</div>
      <div>{general.animal_id}</div>
      <div>{general.taxon_name}</div>
      <div>{general.critter_id}</div>
      <div>{`markings: ${markings.length}`}</div>
      <div>{`ecological units: ${collectionUnits.length}`}</div>
      <div>{`device's: ${device.length}`}</div>
      <div>{`measurements: ${measurements.length}`}</div>
      <div>{`mortality: ${mortality.length} ?`}</div>
      <div>{`family / relationships: ${family.length}`}</div>
    </Box>
  );
};

export default GeneralAnimalSummary;
