import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import AutocompleteField from 'components/fields/AutocompleteField';
import { useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateEditMortalityRequest } from 'interfaces/useCritterApi.interface';

export const CauseOfDeathForm = () => {
  const { setFieldValue } = useFormikContext<ICreateEditMortalityRequest>();
  const critterbaseApi = useCritterbaseApi();

  const causeOfDeathDataLoader = useDataLoader(() => critterbaseApi.mortality.getCauseOfDeathOptions());

  causeOfDeathDataLoader.load();

  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AutocompleteField
            id={`mortality.proximate_cause_of_death_id`}
            name={`mortality.proximate_cause_of_death_id`}
            label="Cause of death"
            options={causeOfDeathDataLoader.data?.map((cause) => ({ value: cause.id, label: cause.value })) ?? []}
            onChange={(_, option) => {
              if (option?.value) {
                setFieldValue(`mortality.proximate_cause_of_death_id`, option.value);
              }
            }}
            required
            sx={{
              flex: '0.5'
            }}
          />
          {/* <AutocompleteField
            id={`mortality.proximate_cause_of_death_confidence`}
            name={`mortality.proximate_cause_of_death_confidence`}
            label="Proximate cause of death"
            options={CritterbaseCauseOfDeathConfidence.map((cause) => ({ value: cause.id, label: cause.value })) ?? []}
            onChange={(_, option) => {
              if (option?.value) {
                setFieldValue(`mortality.proximate_cause_of_death_confidence`, option.value);
              }
            }}
            required
            sx={{
              flex: '0.5'
            }}
          /> */}
        </Grid>
      </Grid>
    </Box>
  );
};
