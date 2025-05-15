import Grid from '@mui/material/Grid';
import { NameDescriptionCard } from 'components/card/NameDescriptionCard';
import AutocompleteSearchField, { WithIdAndName } from 'components/fields/AutocompleteSearch/AutocompleteSearchField';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { CreateSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';
import { useCallback, useState } from 'react';

export type ISelectedTechniqueData = Pick<IGetTechniqueResponse, 'method_technique_id' | 'name' | 'description'>;

export interface ISamplePeriodTechniqueFormProps {
  /**
   * Additional data (display name, description, etc) to pre-populate the UI with in the case of an edit.
   *
   * @type {ISelectedTechniqueData}
   * @memberof ISamplePeriodTechniqueFormProps
   */
  editData?: ISelectedTechniqueData | null;
}

/**
 * Sampling period form - technique field
 *
 * @return {*}
 */
export const SamplePeriodTechniqueForm = (props: ISamplePeriodTechniqueFormProps) => {
  const { editData } = props;

  const { errors, setFieldValue } = useFormikContext<CreateSamplingPeriod>();

  const { surveyId } = useSurveyContext();

  const biohubApi = useBiohubApi();

  // The technique record for the selected method_technique_id, if any
  const [selectedTechnique, setSelectedTechnique] = useState<ISelectedTechniqueData | undefined>(editData ?? undefined);

  /**
   * Search for techniques.
   *
   * TODO: Currently does not take in any search terms, and just returns all techniques for the survey, regardless of
   * what the user may have entered in the UI.
   *
   * @return {*}  {Promise<WithIdAndName<ISelectedTechniqueData>[]>}
   */
  const searchTechniques = useCallback(async (): Promise<WithIdAndName<ISelectedTechniqueData>[]> => {
    const response = await biohubApi.technique.getTechniquesForSurvey(surveyId);

    return response.techniques.map((technique) => {
      return {
        id: technique.method_technique_id,
        method_technique_id: technique.method_technique_id,
        description: technique.description,
        name: technique.name
      };
    });
  }, [biohubApi.technique, surveyId]);

  /**
   * Handle when a technique is removed (unselected).
   */
  const onDelete = () => {
    setFieldValue('method_technique_id', '');
    setSelectedTechnique(undefined);
  };

  /**
   * Handle when a technique is selected from the autocomplete control.
   *
   * @param {ISelectedTechniqueData} technique
   */
  const onSelect = (technique: ISelectedTechniqueData) => {
    setFieldValue('method_technique_id', technique.method_technique_id);
    setSelectedTechnique({
      method_technique_id: technique.method_technique_id,
      name: technique.name,
      description: technique.description
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {/* Find and select a technique */}
        <AutocompleteSearchField<WithIdAndName<ISelectedTechniqueData>>
          fieldName="method_technique"
          label="Technique"
          onSelect={onSelect}
          onSearch={searchTechniques}
          searchOnMount={true}
          getOptionLabel={(option) => option.name}
          placeholder="Search for a technique"
          clearOnSelect={true}
          error={errors.method_technique_id}
        />
        {/* Display the selected technique card */}
        {selectedTechnique && (
          <NameDescriptionCard
            sx={{ mt: 2 }}
            label={selectedTechnique?.name}
            description={selectedTechnique?.description}
            onDelete={onDelete}
          />
        )}
      </Grid>
    </Grid>
  );
};
