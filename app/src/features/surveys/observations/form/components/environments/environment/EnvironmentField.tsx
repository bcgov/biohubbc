import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { getEnvironmentCategoryOptions } from 'features/surveys/observations/form/components/environments/environment/utils';
import {
  CreateObservationFormData,
  UpdateObservationFormData
} from 'features/surveys/observations/form/components/ObservationForm.interface';
import { useFormikContext } from 'formik';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition,
  EnvironmentType
} from 'interfaces/useReferenceApi.interface';
import get from 'lodash-es/get';
import { useMemo } from 'react';

export type EnvironmentFormData = {
  // UI helper value to satisfy react keys
  _id?: string;
  // UI helper value to indicate the type of environment field.
  _type?: 'qualitative' | 'quantitative';
  // Qualitative values
  environment_qualitative_id: string | null;
  environment_qualitative_option_id: string | null;
  // Quantitative values
  environment_quantitative_id: string | null;
  value: number | null;
};

export const initialEnvironmentFormData: EnvironmentFormData = {
  environment_qualitative_id: null,
  environment_qualitative_option_id: null,
  environment_quantitative_id: null,
  value: null
};

export interface IEnvironmentFormProps {
  /**
   * The formik field name.
   */
  formikFieldName: string;
  /**
   * The environment type definitions.
   */
  environmentTypeDefinitions: EnvironmentType;
  /**
   * Callback fired when the delete button is clicked.
   */
  onDelete: () => void;
}

type EnvironmentQuantitativeCategoryOption = EnvironmentQuantitativeTypeDefinition & {
  _type: 'quantitative';
} & IAutocompleteFieldOption<string>;

type EnvironmentQualitativeCategoryOption = EnvironmentQualitativeTypeDefinition & {
  _type: 'qualitative';
} & IAutocompleteFieldOption<string>;

export type EnvironmentCategoryOption = EnvironmentQuantitativeCategoryOption | EnvironmentQualitativeCategoryOption;

/**
 * Subcount Measurement Field component.
 *
 * @param {IEnvironmentFormProps} props
 * @return {*}
 */
export const EnvironmentField = (props: IEnvironmentFormProps) => {
  const { formikFieldName, environmentTypeDefinitions, onDelete } = props;

  const { values, setFieldValue } = useFormikContext<CreateObservationFormData | UpdateObservationFormData>();

  // UI helper field to indicate the type of the environment field.
  const environmentUnitTypeFieldName = `${formikFieldName}._type`;

  // Quantitative field names
  const environmentQuantitativeCategoryFieldName = `${formikFieldName}.environment_quantitative_id`;
  const environmentQuantitativeUnitFieldName = `${formikFieldName}.value`;

  // Qualitative field names
  const environmentQualitativeCategoryFieldName = `${formikFieldName}.environment_qualitative_id`;
  const environmentQualitativeUnitFieldName = `${formikFieldName}.environment_qualitative_option_id`;

  const environmentCategoryValue: EnvironmentFormData | undefined = useMemo(
    () => get(values, formikFieldName),
    [formikFieldName, values]
  );

  const environmentCategoryFieldName = useMemo(() => {
    if (!environmentCategoryValue) {
      return '';
    }

    if (environmentCategoryValue._type === 'quantitative') {
      return environmentQuantitativeCategoryFieldName;
    }

    return environmentQualitativeCategoryFieldName;
  }, [environmentCategoryValue, environmentQualitativeCategoryFieldName, environmentQuantitativeCategoryFieldName]);

  const environmentCategoryOptions = useMemo(
    (): EnvironmentCategoryOption[] => getEnvironmentCategoryOptions(environmentTypeDefinitions),
    [environmentTypeDefinitions]
  );

  const selectedEnvironmentTypeDefinition = useMemo(() => {
    return environmentCategoryOptions.find(
      (item) =>
        item.value === environmentCategoryValue?.environment_qualitative_id ||
        item.value === environmentCategoryValue?.environment_quantitative_id
    );
  }, [environmentCategoryValue, environmentCategoryOptions]);

  const categoryDataType = environmentCategoryValue?._type ?? 'quantitative';

  const environmentUnitFieldLabel = useMemo(() => {
    if (!selectedEnvironmentTypeDefinition) {
      return 'Value';
    }

    if (selectedEnvironmentTypeDefinition._type === 'quantitative') {
      return `${selectedEnvironmentTypeDefinition.name} ${
        selectedEnvironmentTypeDefinition.unit ? `(${selectedEnvironmentTypeDefinition.unit})` : ''
      }`;
    }

    return selectedEnvironmentTypeDefinition.name;
  }, [selectedEnvironmentTypeDefinition]);

  const environmentQualitativeUnitOptions = useMemo(() => {
    if (!environmentCategoryValue) {
      return [];
    }

    const qualitativeTypeDefinitions = (environmentTypeDefinitions.qualitative_environments ?? []).find(
      (item) => item.environment_qualitative_id === environmentCategoryValue.environment_qualitative_id
    );

    return (
      qualitativeTypeDefinitions?.options.map((option) => ({
        value: option.environment_qualitative_option_id,
        label: option.name
      })) ?? []
    );
  }, [environmentCategoryValue, environmentTypeDefinitions.qualitative_environments]);

  /**
   * Clear the environment field values to their default initial state.
   */
  const resetField = () => {
    setFieldValue(environmentQuantitativeCategoryFieldName, null);
    setFieldValue(environmentQualitativeCategoryFieldName, null);

    setFieldValue(environmentQuantitativeUnitFieldName, null);
    setFieldValue(environmentQualitativeUnitFieldName, null);

    setFieldValue(environmentUnitTypeFieldName, 'quantitative');
  };

  /**
   * Set the formik field values when a quantitative category option is selected.
   */
  const onSelectQuantitativeCategoryOption = (option: EnvironmentQuantitativeCategoryOption) => {
    setFieldValue(environmentQuantitativeCategoryFieldName, option?.value ?? null);
    setFieldValue(environmentQuantitativeUnitFieldName, null);

    setFieldValue(environmentQualitativeCategoryFieldName, null);
    setFieldValue(environmentQualitativeUnitFieldName, null);

    setFieldValue(environmentUnitTypeFieldName, 'quantitative');
  };

  /**
   * Set the formik field values when a qualitative category option is selected.
   */
  const onSelectQualitativeCategoryOption = (option: EnvironmentQualitativeCategoryOption) => {
    setFieldValue(environmentQualitativeCategoryFieldName, option?.value ?? null);
    setFieldValue(environmentQualitativeUnitFieldName, null);

    setFieldValue(environmentQuantitativeCategoryFieldName, null);
    setFieldValue(environmentQuantitativeUnitFieldName, null);

    setFieldValue(environmentUnitTypeFieldName, 'qualitative');
  };

  return (
    <Card
      component={Stack}
      variant="outlined"
      flexDirection="row"
      alignItems="flex-start"
      gap={2}
      sx={{ width: '100%', p: 2, backgroundColor: grey[100] }}>
      <AutocompleteField
        id={environmentCategoryFieldName}
        name={environmentCategoryFieldName}
        label="Environmental Condition"
        options={environmentCategoryOptions}
        showValue
        required
        onChange={(_, option) => {
          if (!option) {
            resetField();
            return;
          }

          if (option._type === 'quantitative') {
            onSelectQuantitativeCategoryOption(option);
          } else if (option._type === 'qualitative') {
            onSelectQualitativeCategoryOption(option);
          }
        }}
      />
      {categoryDataType === 'quantitative' ? (
        <CustomTextField
          label={environmentUnitFieldLabel}
          name={environmentQuantitativeUnitFieldName}
          other={{ type: 'number' }}
        />
      ) : (
        <AutocompleteField
          label={environmentUnitFieldLabel}
          name={environmentQualitativeUnitFieldName}
          id={environmentQualitativeUnitFieldName}
          options={environmentQualitativeUnitOptions}
        />
      )}

      <IconButton data-testid="delete-button" title="Remove" aria-label="Remove" onClick={onDelete} sx={{ mt: 1.125 }}>
        <Icon path={mdiClose} size={1} />
      </IconButton>
    </Card>
  );
};
