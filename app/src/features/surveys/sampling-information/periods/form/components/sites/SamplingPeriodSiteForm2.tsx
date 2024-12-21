import Grid from '@mui/material/Grid';
import { NameDescriptionCard } from 'components/card/NameDescriptionCard';
import AutocompleteSearchField, { WithIdAndName } from 'components/fields/AutocompleteSearch/AutocompleteSearchField';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { CreateSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import { useCallback, useState } from 'react';

export type ISelectedSampleSiteData = Pick<IGetSampleLocationNonSpatialDetails, 'survey_sample_site_id' | 'name'>;

export interface ISamplingPeriodSiteForm2Props {
  editData?: ISelectedSampleSiteData;
}

export const SamplingPeriodSiteForm2 = (props: ISamplingPeriodSiteForm2Props) => {
  const { editData } = props;

  console.log('2', editData);

  const { setFieldValue, errors } = useFormikContext<CreateSamplingPeriod>();

  const { projectId, surveyId } = useSurveyContext();

  const biohubApi = useBiohubApi();

  // The sample site record for the selected sample site, if any
  const [selectedSampleSite, setSelectedSampleSite] = useState<ISelectedSampleSiteData | undefined>(editData);

  /**
   * Search for sample sites.
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<WithIdAndName<ISelectedSampleSiteData>[]>}
   */
  const searchSampleSites = useCallback(
    async (searchTerm: string): Promise<WithIdAndName<ISelectedSampleSiteData>[]> => {
      const response = await biohubApi.samplingSite.getSampleSites(projectId, surveyId, { keyword: searchTerm });

      return response.sampleSites.map((sampleSite) => {
        return {
          id: sampleSite.survey_sample_site_id,
          survey_sample_site_id: sampleSite.survey_sample_site_id,
          name: sampleSite.name
        };
      });
    },
    [biohubApi.samplingSite, projectId, surveyId]
  );

  /**
   * Handle when a sample site is removed (unselected).
   */
  const onDelete = () => {
    setFieldValue('survey_sample_site_id', '');
    setSelectedSampleSite(undefined);
  };

  /**
   * Handle when a sample site is selected from the autocomplete control.
   *
   * @param {ISelectedSampleSiteData} sampleSite
   */
  const onSelect = (sampleSite: ISelectedSampleSiteData) => {
    setFieldValue('survey_sample_site_id', sampleSite.survey_sample_site_id);
    setSelectedSampleSite({
      survey_sample_site_id: sampleSite.survey_sample_site_id,
      name: sampleSite.name
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AutocompleteSearchField<WithIdAndName<ISelectedSampleSiteData>>
          fieldName="survey_sample_site_id"
          label="Sampling Site"
          onSelect={onSelect}
          onSearch={searchSampleSites}
          getOptionLabel={(option) => option.name}
          placeholder="Search for a sampling site"
          clearOnSelect
          error={errors.survey_sample_site_id}
        />
        {/* Display the selected technique card */}
        {selectedSampleSite && (
          <NameDescriptionCard sx={{ mt: 2 }} label={selectedSampleSite?.name} onDelete={onDelete} />
        )}
      </Grid>
    </Grid>
  );
};
