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
import { CreateTechniqueFormValues, TechniqueVantagesFormValues, UpdateTechniqueFormValues } from '../../TechniqueFormContainer';

const initialVantagesFormValues: Partial<Pick<TechniqueVantagesFormValues, 'vantage_mode_method_id'>> = {
  vantage_mode_method_id: undefined
};

interface ITechniqueVantageFormProps {
  vantageReferenceRecords: GetVantageReferenceRecord[]
}

export const TechniqueVantageForm = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>(
  props: ITechniqueVantageFormProps
) => {
  const { vantageReferenceRecords } = props;
  const { values } = useFormikContext<FormValues>();

  return (
    <FieldArray
      name="vantages"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.vantages.map((vantage, index) => (
              <Collapse key={vantage._id}>
                <Box mb={2}>
                  <DualAutocompleteField
                    categoryOptions={vantageReferenceRecords.map((record) => ({
                      value: record.vantage_id,
                      label: record.name
                    }))}
                    getUnitOptions={(categoryId: number) => {
                      const selectedVantage = vantageReferenceRecords.find(
                        (record) => record.vantage_id === categoryId
                      );
                      return selectedVantage?.vantage_modes.map((unit) => ({
                        value: unit.vantage_mode_method_id,
                        label: unit.name
                      })) ?? [];
                    }}
                    formikCategoryFieldName={`vantages[${index}].vantage_id`}
                    formikUnitFieldName={`vantages[${index}].vantage_mode_method_id`}
                    filterCategoryIds={values.vantages.map(v => v.vantage_id)}
                    filterUnitIds={values.vantages.map(v => v.vantage_mode_method_id)}
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
