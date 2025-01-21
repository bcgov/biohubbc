import Grid from '@mui/material/Grid';
import { NameDescriptionCard } from 'components/card/NameDescriptionCard';
import AutocompleteSearchField, { WithIdAndName } from 'components/fields/AutocompleteSearch/AutocompleteSearchField';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { CreateSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { IGetSampleSiteRecordExtendedNonSpatial } from 'interfaces/useSamplingSiteApi.interface';
import { useCallback, useState } from 'react';

export type ISelectedSampleSiteData = Pick<IGetSampleSiteRecordExtendedNonSpatial, 'survey_sample_site_id' | 'name'>;

export interface ISamplingPeriodSiteFormProps {
  /**
   * Additional data (display name, description, etc) to pre-populate the UI with in the case of an edit.
   *
   * @type {ISelectedSampleSiteData}
   * @memberof ISamplingPeriodSiteFormProps
   */
  editData?: ISelectedSampleSiteData | null;
}

export const SamplingPeriodSiteForm = (props: ISamplingPeriodSiteFormProps) => {
  const { editData } = props;

  const { setFieldValue, errors } = useFormikContext<CreateSamplingPeriod>();

  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  // The sample site record for the selected sample site, if any
  const [selectedSampleSite, setSelectedSampleSite] = useState<ISelectedSampleSiteData | undefined>(
    editData ?? undefined
  );

  /**
   * Search for sample sites.
   *
   * @param {string} searchTerm
   * @return {*}  {Promise<WithIdAndName<ISelectedSampleSiteData>[]>}
   */
  const searchSampleSites = useCallback(
    async (searchTerm: string): Promise<WithIdAndName<ISelectedSampleSiteData>[]> => {
      const response = await biohubApi.samplingSite.findSampleSites({
        survey_id: surveyContext.surveyId,
        keyword: searchTerm
      });

      return response.sites.map((site) => {
        return {
          id: site.survey_sample_site_id,
          survey_sample_site_id: site.survey_sample_site_id,
          name: site.name
        };
      });
    },
    [biohubApi.samplingSite, surveyContext.surveyId]
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
          searchOnMount={true}
          getOptionLabel={(option) => option.name}
          placeholder="Search for a site"
          clearOnSelect={true}
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
