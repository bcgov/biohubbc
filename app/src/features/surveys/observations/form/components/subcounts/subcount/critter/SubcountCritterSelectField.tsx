import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HelpButtonStack from 'components/buttons/HelpButtonStack';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IFindAnimalObj } from 'interfaces/useAnimalApi.interface';
import { get } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

export interface ICritterSelectFieldProps {
  /**
   * The formik field name for the critter selection.
   */
  formikFieldName: string;
  /**
   * Whether to display the header label.
   */
  displayHeader?: boolean;
}

/**
 * Form field component for selecting a critter (individual animal) from Critterbase.
 *
 * @param {ICritterSelectFieldProps} props
 * @return {*}
 */
export const CritterSelectField = (props: ICritterSelectFieldProps) => {
  const { formikFieldName, displayHeader } = props;

  const { values, setFieldValue, setFieldTouched } = useFormikContext();
  const biohubApi = useBiohubApi();

  // Data loader for fetching animals available to the user
  const animalsDataLoader = useDataLoader(() => biohubApi.animal.findAnimals());

  // Local state for the selected animal
  const [selectedAnimal, setSelectedAnimal] = useState<IFindAnimalObj | null>(null);

  // Get the current critterbase_critter_id value from formik
  const currentCritterbaseId = get(values, formikFieldName);

  // Load animals when component mounts
  useEffect(() => {
    animalsDataLoader.load();
  }, [animalsDataLoader]);

  // Set the selected animal when the formik value changes (for editing existing subcounts)
  useEffect(() => {
    if (!currentCritterbaseId || !animalsDataLoader.data?.animals) {
      setSelectedAnimal(null);
      return;
    }

    const animal = animalsDataLoader.data.animals.find(
      (a: IFindAnimalObj) => a.critterbase_critter_id === currentCritterbaseId
    );
    setSelectedAnimal(animal || null);
  }, [currentCritterbaseId, animalsDataLoader.data]);

  // Options for the autocomplete (animals available to the user)
  const animalOptions = useMemo(() => {
    return animalsDataLoader.data?.animals || [];
  }, [animalsDataLoader.data]);

  /**
   * Handle animal selection change.
   *
   * @param {IFindAnimalObj | null} animal
   */
  const handleAnimalChange = (animal: IFindAnimalObj | null) => {
    setSelectedAnimal(animal);
    setFieldValue(formikFieldName, animal?.critterbase_critter_id || null);
    setFieldTouched(formikFieldName, true);
  };

  /**
   * Get display label for an animal option.
   *
   * @param {IFindAnimalObj} animal
   * @return {string}
   */
  const getAnimalLabel = (animal: IFindAnimalObj): string => {
    // Use animal_id (alias) if available, otherwise use wlh_id, otherwise use critter_id
    const displayName = animal.animal_id || animal.wlh_id || `Animal ${animal.critter_id}`;
    return `${displayName} (${animal.itis_scientific_name})`;
  };

  return (
    <>
      {displayHeader && (
        <HelpButtonStack
          sx={{ my: 0.5 }}
          helpText="Select a specific individual animal to associate with this subcount. When an animal is selected, the count will automatically be set to 1 since you're observing that specific individual.">
          <Typography variant="body2" fontWeight={700} textTransform="uppercase">
            Observed Animal
          </Typography>
        </HelpButtonStack>
      )}
      {animalsDataLoader.isLoading ? (
        <TextField
          fullWidth
          placeholder="Loading animals..."
          disabled
          variant="outlined"
          InputProps={{
            readOnly: true
          }}
        />
      ) : (
        <Autocomplete
          options={animalOptions}
          value={selectedAnimal}
          onChange={(_, newValue) => handleAnimalChange(newValue)}
          getOptionLabel={getAnimalLabel}
          isOptionEqualToValue={(option, value) => option.critterbase_critter_id === value.critterbase_critter_id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Observed Animal"
              placeholder={animalOptions.length === 0 ? 'No animals available' : 'Select an animal'}
              variant="outlined"
              fullWidth
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {option.animal_id || option.wlh_id || `Animal ${option.critter_id}`}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {option.itis_scientific_name}
                </Typography>
              </Box>
            </Box>
          )}
          noOptionsText="No animals found"
        />
      )}
    </>
  );
};
