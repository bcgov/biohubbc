import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {
  EnvironmentField,
  EnvironmentFormData,
  initialEnvironmentFormData
} from 'features/surveys/observations/form/components/environments/environment/EnvironmentField';
import {
  CreateObservationFormData,
  UpdateObservationFormData
} from 'features/surveys/observations/form/ObservationForm.interface';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import get from 'lodash-es/get';
import { useEffect } from 'react';
import { v4 } from 'uuid';

export type EnvironmentsFormData = {
  environments: EnvironmentFormData[];
};

export const initialEnvironmentsFormData = {
  environments: []
};

/**
 * Returns form controls for adding environments to the observation subcount.
 *
 * @return {*}
 */
export const ObservationEnvironmentsForm = () => {
  const { values } = useFormikContext<CreateObservationFormData | UpdateObservationFormData>();

  const biohubApi = useBiohubApi();

  const environmentsDataLoader = useDataLoader(() => biohubApi.reference.findEnvironmentReferenceData(''));

  useEffect(() => {
    environmentsDataLoader.load();
  }, [environmentsDataLoader]);

  const environmentTypeDefinitions = environmentsDataLoader.data ?? {
    quantitative_environments: [],
    qualitative_environments: []
  };

  const environmentsFormData: EnvironmentFormData[] | undefined = get(values, 'standardColumns.environments');

  return (
    <FieldArray
      name="standardColumns.environments"
      render={(arrayHelpers: FieldArrayRenderProps) => {
        return (
          <>
            {environmentsFormData.length > 0 && (
              <Stack flexDirection="column" gap={2} sx={{ mb: 4 }}>
                {environmentsFormData?.map((environmentFormData, index) => {
                  const environmentsArrayFieldName = `standardColumns.environments[${index}]`;

                  return (
                    <EnvironmentField
                      formikFieldName={environmentsArrayFieldName}
                      environmentTypeDefinitions={environmentTypeDefinitions}
                      onDelete={() => arrayHelpers.remove(index)}
                      key={environmentFormData._id}
                    />
                  );
                })}
              </Stack>
            )}

            <Box>
              <Button
                color="primary"
                variant="outlined"
                startIcon={<Icon path={mdiPlus} size={1} />}
                aria-label="add condition"
                onClick={() => {
                  const item: EnvironmentFormData = {
                    _id: v4(),
                    ...initialEnvironmentFormData
                  };

                  arrayHelpers.push(item);
                }}>
                Add Condition
              </Button>
            </Box>
          </>
        );
      }}
    />
  );
};
