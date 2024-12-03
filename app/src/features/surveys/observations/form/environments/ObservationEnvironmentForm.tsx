import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { DualAutocompleteField } from 'components/fields/dual-autocomplete-field/DualAutocompleteField';
import { IObservationForm } from 'features/surveys/observations/form/ObservationForm.interface';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import {
  ObservationSubcountQualitativeEnvironmentObject,
  ObservationSubcountQuantitativeEnvironmentObject
} from 'interfaces/useObservationApi.interface';
import { get } from 'lodash-es';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { v4 } from 'uuid';

const initialEnvironmentValues = {
  environment_quantitative_id: undefined,
  environment_qualitative_option_id: undefined,
  value: undefined,
  environment_qualitative_id: undefined
};

interface IObservationEnvironmentFormProps {
  formikFieldName: string; // Accept formikFieldName as a prop
}

/**
 * Returns form controls for adding environments to the observation subcount.
 *
 * @template FormikValuesType
 * @return {*}
 */
export const ObservationEnvironmentForm = (props: IObservationEnvironmentFormProps) => {
  const { formikFieldName } = props;
  const { values } = useFormikContext<IObservationForm>();

  const biohubApi = useBiohubApi();

  const environmentsDataLoader = useDataLoader(() => biohubApi.reference.findSubcountEnvironments(''));

  useEffect(() => {
    environmentsDataLoader.load();
  }, [environmentsDataLoader]);

  const environments: (
    | ObservationSubcountQualitativeEnvironmentObject
    | ObservationSubcountQuantitativeEnvironmentObject
  )[] = get(values, formikFieldName) ?? [];

  return (
    <FieldArray
      name={formikFieldName}
      render={(arrayHelpers: FieldArrayRenderProps) => {
        return (
          <>
            <TransitionGroup>
              {environments.map((environment, index) => (
                <Collapse key={environment._id}>
                  <Box mb={2}>
                    <DualAutocompleteField
                      categoryLabel="Environmental Condition"
                      categoryOptions={[
                        ...(environmentsDataLoader.data?.quantitative_environments ?? []).map((item) => ({
                          value: item.environment_quantitative_id,
                          label: item.name
                        })),
                        ...(environmentsDataLoader.data?.qualitative_environments ?? []).map((item) => ({
                          value: item.environment_qualitative_id,
                          label: item.name
                        }))
                      ]}
                      categoryFormikFieldName={`${formikFieldName}[${index}].environment_quantitative_id`}
                      getCategoryDataType={(categoryId) => {
                        const quantitative = (environmentsDataLoader.data?.quantitative_environments ?? []).find(
                          (item) => item.environment_quantitative_id === categoryId
                        );
                        return quantitative ? 'quantitative' : 'qualitative';
                      }}
                      getUnitOptions={(categoryId) => {
                        const qualitative = (environmentsDataLoader.data?.qualitative_environments ?? []).find(
                          (item) => item.environment_qualitative_id === categoryId
                        );
                        return (
                          qualitative?.options.map((option) => ({
                            value: option.environment_qualitative_option_id,
                            label: option.name
                          })) ?? []
                        );
                      }}
                      getUnitAutocompleteLabel={(categoryId) => {
                        const quantitative = [
                          ...(environmentsDataLoader.data?.qualitative_environments ?? []),
                          ...(environmentsDataLoader.data?.quantitative_environments ?? [])
                        ].find((item) =>
                          'environment_quantitative_id' in item
                            ? item.environment_quantitative_id === categoryId
                            : item.environment_qualitative_id === categoryId
                        );

                        if (quantitative && 'unit' in quantitative) {
                          return `${quantitative.name} (${quantitative.unit})`;
                        }
                        return quantitative?.name ?? 'Value';
                      }}
                      getUnitFormikFieldName={(categoryId) => {
                        const quantitative = (environmentsDataLoader.data?.quantitative_environments ?? []).find(
                          (item) => item.environment_quantitative_id === categoryId
                        );
                        return quantitative
                          ? `${formikFieldName}[${index}].value`
                          : `${formikFieldName}[${index}].environment_qualitative_option_id`;
                      }}
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
              aria-label="add condition"
              onClick={(e) => {
                e.stopPropagation();
                arrayHelpers.push({ ...initialEnvironmentValues, _id: v4() });
              }}>
              Add Condition
            </Button>
          </>
        );
      }}
    />
  );
};
