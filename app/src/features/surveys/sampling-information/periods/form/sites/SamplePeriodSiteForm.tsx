import { mdiMinusCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AutocompleteSearchField from 'components/fields/AutocompleteSearch/AutocompleteSearchField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { IFindSampleSiteRecord, IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import { useState } from 'react';
import {
    SamplePeriodPeriodForm,
    SurveySampleMethodPeriodArrayItemInitialValues
} from './periods/SamplePeriodPeriodForm';

interface ISamplingPeriodSiteFormProps {
  sampleSites: IGetSampleLocationNonSpatialDetails[];
}

export const SamplingPeriodSiteForm = (props: ISamplingPeriodSiteFormProps) => {
  const { sampleSites } = props;

  const { values, setFieldValue } = useFormikContext<ICreateSamplingPeriodRequest>();

  const { surveyId } = useSurveyContext();
  const biohubApi = useBiohubApi();
  const [refreshKey, setRefreshKey] = useState(0);

  const sampleSiteSearch = async ({ keyword }: { keyword: string }) => {
    const response = await biohubApi.samplingSite.findSampleSites({
      survey_id: surveyId,
      keyword
    });

    // Remove already selected options
    return response.sites.filter(
      (site) => !values.sample_sites.some((existing) => existing.survey_sample_site_id === site.survey_sample_site_id)
    );
  };

  const handleRemoveSite = (arrayHelpers: FieldArrayRenderProps, index: number) => {
    arrayHelpers.remove(index);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <FieldArray
      name="sample_sites"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AutocompleteSearchField<IFindSampleSiteRecord>
                formikFieldName="survey_sample_site_id"
                label="Sampling Site"
                handleSelect={(site) =>
                  setFieldValue('sample_sites', [
                    ...values.sample_sites,
                    {
                      survey_sample_site_id: site.survey_sample_site_id,
                      sample_periods: [SurveySampleMethodPeriodArrayItemInitialValues]
                    }
                  ])
                }
                searchApi={sampleSiteSearch}
                getOptionLabel={(option) => option.name}
                placeholder="Search for a sampling site"
                clearOnSelect
                refreshKey={refreshKey}
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
                      <Paper variant="outlined" key={siteDetails.survey_sample_site_id} sx={{ mt: 2 }}>
                        <ListItem
                          alignItems="flex-start"
                          disablePadding
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            p: 2,
                            px: 3,
                            mb: 2
                          }}>
                          <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" mb={1}>
                            <ListItemText
                              primary={
                                <Typography fontWeight={700} variant="subtitle1">
                                  {siteDetails.name}
                                </Typography>
                              }
                            />
                            <IconButton color="error" onClick={() => handleRemoveSite(arrayHelpers, index)}>
                              <Icon path={mdiMinusCircleOutline} size={1} />
                            </IconButton>
                          </Box>

                          {/* Show periods if the site is expanded */}
                          <Box width="100%">
                            <SamplePeriodPeriodForm
                              index={index}
                              formikFieldName={`sample_sites[${index}].sample_periods`}
                            />
                          </Box>
                        </ListItem>
                      </Paper>
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
