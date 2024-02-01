import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { debounce } from 'lodash-es';
import React, { useMemo } from 'react';

export interface ISpeciesForm {
  species: {
    focal_species: number[];
    ancillary_species: number[];
  };
}

export const SpeciesInitialValues: ISpeciesForm = {
  species: {
    focal_species: [],
    ancillary_species: []
  }
};

export interface ISpeciesFormProps {
  type: IMultiAutocompleteFieldOption[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const SpeciesForm: React.FC<ISpeciesFormProps> = (props) => {
  //   const formikProps = useFormikContext<ISpeciesForm>();

  const biohubApi = useBiohubApi();

  const convertOptions = (value: any): IMultiAutocompleteFieldOption[] =>
    value.map((item: any) => {
      return { value: parseInt(item.id), label: item.label };
    });

  const handleGetInitList = async (initialvalues: number[]) => {
    const response = await biohubApi.taxonomy.getSpeciesFromIds(initialvalues);

    return convertOptions(response.searchResponse);
  };

  const handleSearch = useMemo(
    () =>
      debounce(
        async (
          inputValue: string,
          existingValues: (string | number)[],
          callback: (searchedValues: IMultiAutocompleteFieldOption[]) => void
        ) => {
          const response = await biohubApi.taxonomy.searchSpecies(inputValue);
          const newOptions = convertOptions(response.searchResponse).filter(
            (item: any) => !existingValues?.includes(item.value)
          );
          callback(newOptions);
        },
        500
      ),
    [biohubApi.taxonomy]
  );

  return (
    <Box component="fieldset">
      <Typography component="legend" variant="h5">
        Species
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id="species.focal_species"
            label="Focal Species"
            required={true}
            type="api-search"
            getInitList={handleGetInitList}
            search={handleSearch}
          />
        </Grid>
        <Grid item xs={12}>
          <MultiAutocompleteFieldVariableSize
            id="species.ancillary_species"
            label="Ancillary Species"
            required={false}
            type="api-search"
            getInitList={handleGetInitList}
            search={handleSearch}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SpeciesForm;
