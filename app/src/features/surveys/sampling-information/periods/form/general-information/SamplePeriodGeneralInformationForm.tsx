import Grid from '@mui/material/Grid';
import AutocompleteSearchField from 'components/fields/AutocompleteSearch/AutocompleteSearchField';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { IFindSampleSiteRecord } from 'interfaces/useSamplingSiteApi.interface';
import { IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';

/**
 * Create sampling period - general information fields
 *
 * @return {*}
 */
const SamplePeriodGeneralInformationForm = () => {
  const { setFieldValue } = useFormikContext<ICreateSamplingPeriodRequest>();
  const biohubApi = useBiohubApi();

  const { projectId, surveyId } = useSurveyContext();

  const sampleSiteSearch = async ({ keyword }: { keyword: string }) => {
    const response = await biohubApi.samplingSite.findSampleSites({
      survey_id: surveyId,
      keyword
    });
    return response.sites;
  };

  const techniqueSearch = async () => {
    const response = await biohubApi.technique.getTechniquesForSurvey(projectId, surveyId);
    return response.techniques
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AutocompleteSearchField<IFindSampleSiteRecord>
          formikFieldName="survey_sample_site_id"
          label="Sampling Site"
          handleSelect={(site) => setFieldValue('survey_sample_site_id', site.survey_sample_site_id)}
          searchApi={sampleSiteSearch}
          getOptionLabel={(option) => option.name}
          placeholder="Search for a sampling site"
        />
      </Grid>
      <Grid item xs={12}>
        <AutocompleteSearchField<IGetTechniqueResponse>
          formikFieldName="method_technique_id"
          label="Technique"
          handleSelect={(technique) => setFieldValue('method_technique_id', technique.method_technique_id)}
          searchApi={techniqueSearch}
          getOptionLabel={(option) => option.name}
          placeholder="Search for a technique"
        />
      </Grid>
    </Grid>
  );
};

export default SamplePeriodGeneralInformationForm;
