import { mdiCog, mdiLeaf, mdiRuler } from '@mdi/js';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { ConfigureEnvironmentColumns } from 'features/surveys/observations/observations-table/configure-columns/components/environment/ConfigureEnvironmentColumns';
import { ConfigureGeneralColumns } from 'features/surveys/observations/observations-table/configure-columns/components/general/ConfigureGeneralColumns';
import { ConfigureMeasurementColumns } from 'features/surveys/observations/observations-table/configure-columns/components/measurements/ConfigureMeasurementColumns';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';
import { useState } from 'react';
import { IHideableColumn } from '../ConfigureColumnsButton';

export enum ConfigureColumnsViewEnum {
  MEASUREMENTS = 'MEASUREMENTS',
  GENERAL = 'GENERAL',
  ENVIRONMENT = 'ENVIRONMENT'
}

export interface IConfigureColumnsPageProps {
  /**
   * Controls the disabled state of the component controls.
   *
   * @type {boolean}
   * @memberof IConfigureColumnsProps
   */
  disabled: boolean;
  /**
   * The column field names of the hidden columns.
   *
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof IConfigureColumnsProps
   */
  hiddenFields: string[];
  /**
   * The column definitions of the columns that may be toggled to hidden or visible.
   *
   * @type {IHideableColumn[]}
   * @memberof IConfigureColumnsProps
   */
  hideableColumns: IHideableColumn[];
  /**
   * Callback fired on toggling the visibility of all columns.
   *
   * @memberof IConfigureColumnsPageProps
   */
  onToggleShowHideAll: () => void;
  /**
   * Callback fired on toggling the visibility of a column.
   *
   * @memberof IConfigureColumnsPageProps
   */
  onToggleColumnVisibility: (field: string) => void;
  /**
   * The measurement columns.
   *
   * @type {CBMeasurementType[]}
   * @memberof IConfigureColumnsPageProps
   */
  measurementColumns: CBMeasurementType[];
  /**
   * Callback fired on adding measurement columns.
   *
   * @memberof IConfigureColumnsPageProps
   */
  onAddMeasurementColumns: (measurementColumns: CBMeasurementType[]) => void;
  /**
   * Callback fired on removing measurement columns.
   *
   * @memberof IConfigureColumnsPageProps
   */
  onRemoveMeasurementColumns: (fields: string[]) => void;
  /**
   * The environment columns.
   *
   * @type {EnvironmentType}
   * @memberof IConfigureColumnsPageProps
   */
  environmentColumns: EnvironmentType;
  /**
   * Callback fired on adding environment columns.
   *
   * @memberof IConfigureColumnsPageProps
   */
  onAddEnvironmentColumns: (environmentColumns: EnvironmentType) => void;
  /**
   * Callback fired on removing environment columns.
   *
   * @memberof IConfigureColumnsPageProps
   */
  onRemoveEnvironmentColumns: (environmentColumnIds: EnvironmentTypeIds) => void;
}

/**
 * Parent component for the configure columns components.
 *
 * This component manages the state of the active view (tab) and renders the appropriate child component.
 *
 * @param {IConfigureColumnsPageProps} props
 * @return {*}
 */
export const ConfigureColumnsPage = (props: IConfigureColumnsPageProps) => {
  const {
    disabled,
    hiddenFields,
    hideableColumns,
    onToggleShowHideAll,
    onToggleColumnVisibility,
    measurementColumns,
    onAddMeasurementColumns,
    onRemoveMeasurementColumns,
    environmentColumns,
    onAddEnvironmentColumns,
    onRemoveEnvironmentColumns
  } = props;

  const [activeView, setActiveView] = useState(ConfigureColumnsViewEnum.GENERAL);

  const views = [
    { value: ConfigureColumnsViewEnum.GENERAL, label: 'General', icon: mdiCog },
    { value: ConfigureColumnsViewEnum.MEASUREMENTS, label: 'Species Attributes', icon: mdiRuler },
    { value: ConfigureColumnsViewEnum.ENVIRONMENT, label: 'Environment', icon: mdiLeaf }
  ];

  return (
    <Stack direction="row" justifyContent="space-between" pr={2} mt={1} height="100%" spacing={5}>
      <Box sx={{ minWidth: '250px', flex: 0.2 }}>
        <CustomToggleButtonGroup
          views={views}
          activeView={activeView}
          onViewChange={(view) => setActiveView(view)}
          orientation="vertical"
        />
      </Box>
      <Box height="100%" flex={0.8}>
        <ComponentSwitch
          switch={activeView}
          components={{
            [ConfigureColumnsViewEnum.GENERAL]: (
              <ConfigureGeneralColumns
                key={ConfigureColumnsViewEnum.GENERAL}
                disabled={disabled}
                hiddenFields={hiddenFields}
                hideableColumns={hideableColumns}
                onToggleShowHideAll={onToggleShowHideAll}
                onToggleColumnVisibility={onToggleColumnVisibility}
              />
            ),
            [ConfigureColumnsViewEnum.MEASUREMENTS]: (
              <ConfigureMeasurementColumns
                key={ConfigureColumnsViewEnum.MEASUREMENTS}
                measurementColumns={measurementColumns}
                onAddMeasurementColumns={onAddMeasurementColumns}
                onRemoveMeasurementColumns={onRemoveMeasurementColumns}
              />
            ),
            [ConfigureColumnsViewEnum.ENVIRONMENT]: (
              <ConfigureEnvironmentColumns
                key={ConfigureColumnsViewEnum.MEASUREMENTS}
                environmentColumns={environmentColumns}
                onAddEnvironmentColumns={onAddEnvironmentColumns}
                onRemoveEnvironmentColumns={onRemoveEnvironmentColumns}
              />
            )
          }}
        />
      </Box>
    </Stack>
  );
};
