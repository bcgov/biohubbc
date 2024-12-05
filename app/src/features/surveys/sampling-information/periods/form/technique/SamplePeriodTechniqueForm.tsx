import Grid from '@mui/material/Grid';
import { NameDescriptionCard } from 'components/card/NameDescriptionCard';
import AutocompleteSearchField from 'components/fields/AutocompleteSearch/AutocompleteSearchField';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';
import { useState } from 'react';

/**
 * Create sampling period - technique field
 *
 * @return {*}
 */
const SamplePeriodTechniqueForm = () => {
  const { setFieldValue, values } = useFormikContext<ICreateSamplingPeriodRequest>();
  const biohubApi = useBiohubApi();
  const [selectedTechnique, setSelectedTechnique] = useState<IGetTechniqueResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { projectId, surveyId } = useSurveyContext();

  const techniqueSearch = async () => {
    const response = await biohubApi.technique.getTechniquesForSurvey(projectId, surveyId);

    // Remove already selected option
    return response.techniques.filter((technique) => technique.method_technique_id !== values.method_technique_id);
  };

  const handleRemove = () => {
    setFieldValue('method_technique_id', '');
    setSelectedTechnique(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSelect = (technique: IGetTechniqueResponse) => {
    setFieldValue('method_technique_id', technique.method_technique_id);
    setSelectedTechnique(technique);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AutocompleteSearchField<IGetTechniqueResponse>
          formikFieldName="method_technique_id"
          label="Technique"
          handleSelect={handleSelect}
          searchApi={techniqueSearch}
          getOptionLabel={(option) => option.name}
          placeholder="Search for a technique"
          clearOnSelect
          // Refresh the results using a refreshKey, which is an abritrary number that changes to force a refresh
          refreshKey={refreshKey}
        />
        {selectedTechnique && values.method_technique_id && (
          <NameDescriptionCard
            sx={{ mt: 2 }}
            label={selectedTechnique.name}
            description={selectedTechnique.description}
            handleRemove={handleRemove}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default SamplePeriodTechniqueForm;
