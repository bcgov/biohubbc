import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { DualAutocompleteField } from 'components/fields/DualAutocompleteField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { GetVantageReferenceRecord } from 'interfaces/useReferenceApi.interface';
import { TransitionGroup } from 'react-transition-group';
import { v4 } from 'uuid';
import {
  CreateTechniqueFormValues,
  TechniqueVantagesFormValues,
  UpdateTechniqueFormValues
} from '../TechniqueFormContainer';

const initialVantagesFormValues: Partial<Pick<TechniqueVantagesFormValues, 'vantage_method_id'>> = {
  vantage_method_id: undefined
};

interface ITechniqueVantageFormProps {
  vantageReferenceRecords: GetVantageReferenceRecord[];
}

export const TechniqueVantageForm = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>(
  props: ITechniqueVantageFormProps
) => {
  const { vantageReferenceRecords } = props;
  const { values } = useFormikContext<FormValues>();

  const getUnitOptions = (vantageMethodId: number, categoryId: number) => {
    const selectedVantage = vantageReferenceRecords.find((record) => record.vantage_category_id === categoryId);

    if (!selectedVantage || !selectedVantage.vantages) {
      return [];
    }

    // Filter out already selected vantages
    const availableModes = selectedVantage.vantages.filter((mode) => {
      const isAlreadySelected = values.vantage_methods.some(
        (existing) => existing.vantage_method_id === mode.vantage_method_id
      );

      // Keep the option if not already selected, or if it's the one currently being edited
      return !isAlreadySelected || vantageMethodId === mode.vantage_method_id;
    });

    return availableModes.map((mode) => ({
      value: mode.vantage_method_id,
      label: mode.name
    }));
  };

  return (
    <FieldArray
      name="vantage_methods"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.vantage_methods.map((vantage, index) => (
              <Collapse key={vantage._id}>
                <Box mb={2}>
                  <DualAutocompleteField
                    label="Vantage"
                    categoryOptions={vantageReferenceRecords.map((record) => ({
                      value: record.vantage_category_id,
                      label: record.name
                    }))}
                    getUnitOptions={(categoryId: number) => getUnitOptions(vantage.vantage_method_id, categoryId)}
                    formikCategoryFieldName={`vantage_methods.[${index}].vantage_category_id`}
                    formikUnitFieldName={`vantage_methods.[${index}].vantage_method_id`}
                    onDelete={() => arrayHelpers.remove(index)}
                  />
                </Box>
              </Collapse>
            ))}
          </TransitionGroup>

          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add vantage"
            onClick={() => {
              arrayHelpers.push({ ...initialVantagesFormValues, _id: v4() });
            }}>
            Add Vantage
          </Button>
        </>
      )}
    />
  );
};
