import { mdiClose } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField from 'components/fields/AutocompleteField';
import {
  CreateTechniqueFormValues,
  UpdateTechniqueFormValues
} from 'features/surveys/sampling-information/techniques/components/TechniqueFormContainer';
import { TechniqueVantageModeControl } from 'features/surveys/sampling-information/techniques/components/vantages/components/TechniqueVantageModeControl';
import { FieldArrayRenderProps, useFormikContext } from 'formik';
import { GetVantageReferenceRecord } from 'interfaces/useReferenceApi.interface';
import { useMemo } from 'react';

interface ITechniqueVantageFormProps {
  vantageReferenceRecords: GetVantageReferenceRecord[];
  arrayHelpers: FieldArrayRenderProps;
  index: number;
}

/**
 * Technique vantage form.
 *
 * @template FormValues
 * @param {ITechniqueVantageFormProps} props
 * @return {*}
 */
export const TechniqueVantageForm = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>(
  props: ITechniqueVantageFormProps
) => {
  const { arrayHelpers, vantageReferenceRecords, index } = props;

  const { values, setFieldValue } = useFormikContext<FormValues>();

  // The currently selected vantage, if one has been selected
  const selectedVantageReferenceRecord = useMemo(
    () =>
      values.vantages[index]
        ? vantageReferenceRecords.find((vantageReferenceRecord) => {
            return vantageReferenceRecord.vantage_id === values.vantages[index].vantage_id;
          })
        : undefined,
    [index, values.vantages, vantageReferenceRecords]
  );

  // The IDs of the vantage modes that have already been selected, and should not be available for selection again
  const unavailableVantageModeIds = useMemo(() => {
    return values.vantages.map((vantageFormValue) => vantageFormValue.vantage_mode_method_id);
  }, [values.vantages]);

  // The remaining vantage modes that are available for selection under the currently selected vantage
  const remainingVantageModes = useMemo(() => {
    return (
      selectedVantageReferenceRecord?.vantage_modes.filter(
        (item) => !unavailableVantageModeIds.includes(item.vantage_mode_method_id)
      ) ?? []
    );
  }, [selectedVantageReferenceRecord, unavailableVantageModeIds]);

  // The remaining vantage modes that are available for selection under the currently selected vantage, formatted for
  // the autocomplete component
  const remainingVantageModeOptionsForAutocomplete = useMemo(() => {
    return remainingVantageModes.map((vantageMode) => ({
      value: vantageMode.vantage_mode_method_id,
      label: vantageMode.name
    }));
  }, [remainingVantageModes]);

  return (
    <Card
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
      <AutocompleteField
        id={`vantages.[${index}].vantage_mode_method_id`}
        name={`vantages.[${index}].vantage_mode_method_id`}
        label="Attribute"
        options={remainingVantageModeOptionsForAutocomplete}
        onChange={(_, option) => {
          if (!option?.value) {
            return;
          }

          setFieldValue(`vantages.[${index}]`, { ...values.vantages[index], vantage_mode_method_id: option.value });
        }}
        required
        sx={{
          flex: '0.5'
        }}
      />

      <Box flex="0.5">
        <TechniqueVantageModeControl selectedVantageReferenceRecord={selectedVantageReferenceRecord} index={index} />
      </Box>

      <IconButton
        data-testid={`vantage-delete-button-${index}`}
        title="Remove vantage"
        aria-label="Remove vantage"
        onClick={() => arrayHelpers.remove(index)}
        sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
