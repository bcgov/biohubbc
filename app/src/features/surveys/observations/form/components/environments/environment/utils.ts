import { EnvironmentCategoryOption } from 'features/surveys/observations/form/components/environments/environment/EnvironmentField';
import { ObservationEnvironmentData } from 'interfaces/useObservationApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition,
  EnvironmentType
} from 'interfaces/useReferenceApi.interface';

const getEnvironmentQuantitativeCategoryOption = (
  data: EnvironmentQuantitativeTypeDefinition
): EnvironmentCategoryOption => {
  return {
    ...data,
    label: data.unit ? `${data.name} (${data.unit})` : data.name,
    value: data.environment_quantitative_id,
    _type: 'quantitative' as const
  };
};

const getEnvironmentQualitativeCategoryOption = (
  data: EnvironmentQualitativeTypeDefinition
): EnvironmentCategoryOption => {
  return {
    ...data,
    label: data.name,
    value: data.environment_qualitative_id,
    _type: 'qualitative' as const
  };
};

export const getEnvironmentCategoryOptions = (data: EnvironmentType) => {
  return [
    ...(data.qualitative_environments.map((item) => getEnvironmentQualitativeCategoryOption(item)) ?? []),
    ...(data.quantitative_environments.map((item) => getEnvironmentQuantitativeCategoryOption(item)) ?? [])
  ];
};

export const getEnvironmentFormData = (data: ObservationEnvironmentData) => {
  return [
    ...data.quantitative_environments.map((item) => {
      return {
        _id: item.environment_quantitative_id,
        _type: 'quantitative' as const,
        environment_quantitative_id: item.environment_quantitative_id,
        value: item.value,
        environment_qualitative_id: null,
        environment_qualitative_option_id: null
      };
    }),
    ...data.qualitative_environments.map((item) => {
      return {
        _id: item.environment_qualitative_id,
        _type: 'qualitative' as const,
        environment_qualitative_id: item.environment_qualitative_id,
        environment_qualitative_option_id: item.environment_qualitative_option_id,
        environment_quantitative_id: null,
        value: null
      };
    })
  ];
};
