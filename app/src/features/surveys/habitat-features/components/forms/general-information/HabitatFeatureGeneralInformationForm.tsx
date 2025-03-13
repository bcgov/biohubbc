import { mdiCalendar } from '@mdi/js';
import Grid from '@mui/material/Grid';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { DateTimeFields } from 'components/fields/DateTimeFields';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { CreateHabitatFeatureFormValues, UpdateHabitatFeatureFormValues } from '../HabitatFeatureFormContainer';

/**
 * Habitat Feature general information form.
 *
 * @return {*} {JSX.Element}
 */
export const HabitatFeatureGeneralInformationForm = <
  HabitatFeatureFormValuesType extends CreateHabitatFeatureFormValues | UpdateHabitatFeatureFormValues
>(): JSX.Element => {
  const codesContext = useCodesContext();
  const formikProps = useFormikContext<HabitatFeatureFormValuesType>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} display="flex" gap={1}>
        <Grid item xs={8}>
          <AutocompleteField
            id="habitat_feature_type_id"
            name="habitat_feature_type_id"
            label="Habitat feature"
            showValue
            required
            loading={codesContext.codesDataLoader.isLoading}
            options={
              codesContext.codesDataLoader.data?.habitat_feature_types.map((featureType) => ({
                value: featureType.id,
                label: featureType.name,
                description: featureType.description
              })) ?? []
            }
          />
        </Grid>

        <Grid item xs={4}>
          <CustomTextField name="count" label="Observed count" other={{ type: 'number', required: true }} />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <DateTimeFields
          formikProps={formikProps}
          date={{
            dateLabel: 'Observed date',
            dateName: 'observed_date',
            dateId: 'observed_date',
            dateRequired: true,
            dateIcon: mdiCalendar
          }}
          time={{
            timeLabel: 'Observed time',
            timeName: 'observed_time',
            timeId: 'observed_time',
            timeRequired: true,
            timeIcon: mdiCalendar
          }}
        />
      </Grid>
    </Grid>
  );
};
