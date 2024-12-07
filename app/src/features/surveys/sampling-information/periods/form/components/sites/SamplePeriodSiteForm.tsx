import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import AutocompleteSearchField, { WithIdAndName } from 'components/fields/AutocompleteSearch/AutocompleteSearchField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { IFindSampleSiteRecord, IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import { useState } from 'react';
import { InitialSurveySamplePeriodValues } from './periods/SamplePeriodPeriodForm';
import SamplePeriodPeriodFormContainer from './periods/SamplePeriodPeriodFormContainer';

interface ISamplingPeriodSiteFormProps {
  sampleSites: IGetSampleLocationNonSpatialDetails[];
}

export const SamplingPeriodSiteForm = (props: ISamplingPeriodSiteFormProps) => {
  const { sampleSites } = props;

  const { values, setFieldValue, errors } = useFormikContext<ICreateSamplingPeriodRequest>();

  const { surveyId } = useSurveyContext();
  const biohubApi = useBiohubApi();
  const [refreshKey, setRefreshKey] = useState(0);

  const sampleSiteSearch = async ({ keyword }: { keyword: string }) => {
    const response = await biohubApi.samplingSite.findSampleSites({
      survey_id: surveyId,
      keyword
    });

    // Remove already selected options
    return response.sites
      .map((site) => ({
        ...site,
        id: site.survey_sample_site_id,
        name: site.name
      }))
      .filter(
        (site) => !values.sample_sites.some((existing) => existing.survey_sample_site_id === site.survey_sample_site_id)
      );
  };

  const handleRemoveSite = (arrayHelpers: FieldArrayRenderProps, index: number) => {
    arrayHelpers.remove(index);
    setRefreshKey((prev) => prev + 1);
  };

  console.log(errors);

  return (
    <FieldArray
      name="sample_sites"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AutocompleteSearchField<WithIdAndName<IFindSampleSiteRecord>>
                formikFieldName="survey_sample_site_id"
                label="Sampling Site"
                handleSelect={(site) => {
                  setFieldValue('sample_sites', [
                    ...values.sample_sites,
                    {
                      survey_sample_site_id: site.survey_sample_site_id,
                      sample_periods: [InitialSurveySamplePeriodValues]
                    }
                  ]);
                }}
                searchApi={sampleSiteSearch}
                getOptionLabel={(option) => option.name}
                placeholder="Search for a sampling site"
                clearOnSelect
                refreshKey={refreshKey}
                error={errors.sample_sites && !Array.isArray(errors.sample_sites) ? errors.sample_sites : undefined}
              />
            </Grid>
            <Grid item xs={12}>
              <List>
                {values.sample_sites.map((existing, index) => {
                  const siteDetails = sampleSites.find(
                    (site) => site.survey_sample_site_id === existing.survey_sample_site_id
                  );
                  if (siteDetails) {
                    return (
                      <SamplePeriodPeriodFormContainer
                        formikFieldName={`sample_sites[${index}].sample_periods`}
                        key={siteDetails.survey_sample_site_id}
                        site={siteDetails}
                        index={index}
                        samplePeriods={values.sample_sites[index].sample_periods}
                        handleRemoveSite={(index: number) => handleRemoveSite(arrayHelpers, index)}
                        disableAdd
                      />
                    );
                  }
                })}
              </List>
            </Grid>
          </Grid>
        </>
      )}
    />
  );
};
