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
  /**
   * The field name of the column.
   *
   * @type {string}
   * @memberof IGeneralColumnsSecondaryActionProps
   */
  field: string;
  /**
   * Callback fired on removing measurements.
   *
   * @memberof IGeneralColumnsSecondaryActionProps
   */
  onRemoveMeasurements: (measurementColumnsToRemove: string[]) => void;
  /**
   * The measurement columns.
   *
   * @type {CBMeasurementType[]}
   * @memberof IGeneralColumnsSecondaryActionProps
   */
  measurementColumns: CBMeasurementType[];
  /**
   * Callback fired on removing environment columns.
   *
   * @memberof IGeneralColumnsSecondaryActionProps
   */
  onRemoveEnvironmentColumns: (environmentColumnIds: EnvironmentTypeIds) => void;
  /**
   * The environment columns.
   *
   * @type {EnvironmentType}
   * @memberof IGeneralColumnsSecondaryActionProps
   */
  environmentColumns: EnvironmentType;
}

/**
 * Renders a secondary action for the general columns.
 *
 * @param {IGeneralColumnsSecondaryActionProps} props
 * @return {*}
 */
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
