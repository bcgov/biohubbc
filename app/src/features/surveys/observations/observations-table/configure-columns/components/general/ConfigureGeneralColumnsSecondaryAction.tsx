import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';

export interface IGeneralColumnsSecondaryActionProps {
  /**
   * Controls the disabled state of the component controls.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsProps
   */
  disabled: boolean;
  field: string;
  onRemoveMeasurements: (measurementColumnsToRemove: string[]) => void;
  measurementColumns: CBMeasurementType[];
  onRemoveEnvironmentColumns: (environmentColumnIds: EnvironmentTypeIds) => void;
  environmentColumns: EnvironmentType;
}

export const GeneralColumnsSecondaryAction = (props: IGeneralColumnsSecondaryActionProps) => {
  const { field, disabled, measurementColumns, onRemoveMeasurements, environmentColumns, onRemoveEnvironmentColumns } =
    props;

  // If the field matches a measurement definition, render the corresponding remove button.
  if (measurementColumns.some((item) => item.taxon_measurement_id === field)) {
    return (
      <IconButton
        disabled={disabled}
        edge="end"
        aria-label="Remove measurement"
        onClick={() => onRemoveMeasurements([field])}>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  // If the field matches a qualitative environment type definition, render the corresponding remove button.
  const qualitativeEnvironmentTypeDefinition = environmentColumns.qualitative_environments.find(
    (item) => String(item.environment_qualitative_id) === field
  );
  if (qualitativeEnvironmentTypeDefinition) {
    return (
      <IconButton
        disabled={disabled}
        edge="end"
        aria-label="Remove environment"
        onClick={() =>
          onRemoveEnvironmentColumns({
            qualitative_environments: [qualitativeEnvironmentTypeDefinition.environment_qualitative_id],
            quantitative_environments: []
          })
        }>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  // If the field matches a quantitative environment type definition, render the corresponding remove button.
  const quantitativeEnvironmentTypeDefinition = environmentColumns.quantitative_environments.find(
    (item) => String(item.environment_quantitative_id) === field
  );
  if (quantitativeEnvironmentTypeDefinition) {
    return (
      <IconButton
        disabled={disabled}
        edge="end"
        aria-label="Remove environment"
        onClick={() =>
          onRemoveEnvironmentColumns({
            qualitative_environments: [],
            quantitative_environments: [quantitativeEnvironmentTypeDefinition.environment_quantitative_id]
          })
        }>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    );
  }

  return <></>;
};
