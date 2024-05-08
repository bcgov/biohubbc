import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import MeasurementsSearchAutocomplete from 'features/surveys/observations/observations-table/configure-table/measurements/search/MeasurementsSearchAutocomplete';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useAnimalPageContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';

/**
 * Returns the control for applying measurements to an animal on the animal capture form
 *
 * @returns
 */
const CaptureMeasurementsForm = () => {
  const critterbaseApi = useCritterbaseApi();
  const { critterDataLoader } = useAnimalPageContext();

  const { values, setFieldValue } = useFormikContext<ICreateCaptureRequest>();

  const measurementsDataLoader = useDataLoader((tsn: number) => critterbaseApi.xref.getTaxonMeasurements(tsn));

  if (!measurementsDataLoader.data) {
    const tsn = critterDataLoader.data?.itis_tsn;
    if (tsn) {
      measurementsDataLoader.load(tsn);
    }
  }

  const onSelectOption = (value: any, index: number) => {
    setFieldValue(`measurements.[${index}]`, value);
  };

  return (
    <>
      <FieldArray
        name="measurements"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            {values.measurements?.qualitative.map((measurement, index) => {
              return (
                <Card
                  key={`${measurement.measurement_qualitative_id}-${index}`}
                  component={Stack}
                  variant="outlined"
                  flexDirection="row"
                  alignItems="flex-start"
                  gap={2}
                  sx={{
                    width: '100%',
                    p: 2,
                    backgroundColor: grey[100]
                  }}>
                  <MeasurementsSearchAutocomplete
                    selectedOptions={[]} //[values.measurements?.qualitative, values.measurements?.quantitative]}
                    getOptions={async () => {
                      const response = await measurementsDataLoader.data;
                      return (response && [...response.qualitative, ...response.quantitative]) || [];
                    }}
                    onSelectOptions={(value) => {
                      onSelectOption(value, index);
                    }}
                  />
                  {/* <AutocompleteField
                id={`ecological_units.[${index}].value`}
                name={`ecological_units.[${index}].value`}
                label={
                  units.find(
                    (unit) => unit.collection_category_id === values.ecological_units[index].ecological_collection_category_id
                  )?.category_name ?? ''
                } // Need to get codes for displaying name
                options={
                  units
                    .find(
                      (option) => option.collection_category_id === values.ecological_units[index].ecological_collection_category_id
                    )
                    ?.options.map((option) => ({
                      value: option.id,
                      label: option.name
                    })) ?? []
                }
                // loading={fundingSourcesDataLoader.isLoading}
                disabled={Boolean(!values.ecological_units[index].ecological_collection_category_id)}
                required
                // loading={ecologicalUnitsDataLoader.isLoading}
                sx={{
                  flex: '1 1 auto'
                }}
              /> */}

                  <IconButton
                    data-testid={`ecological-unit-delete-button-${index}`}
                    title="Remove Ecological Unit"
                    aria-label="Remove Ecological Unit"
                    onClick={() => arrayHelpers.remove(index)}
                    sx={{ mt: 1.125 }}>
                    <Icon path={mdiClose} size={1} />
                  </IconButton>
                </Card>
              );
            })}
          </>
        )}
      />

      <Button
        color="primary"
        variant="outlined"
        startIcon={<Icon path={mdiPlus} size={1} />}
        aria-label="add marking"
        onClick={() => {}}>
        Add Measurement
      </Button>
    </>
  );
};

export default CaptureMeasurementsForm;
