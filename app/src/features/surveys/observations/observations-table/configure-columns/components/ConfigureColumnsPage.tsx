import { mdiCog, mdiLeaf, mdiRuler } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { ConfigureEnvironmentColumns } from 'features/surveys/observations/observations-table/configure-columns/components/environment/ConfigureEnvironmentColumns';
import { ConfigureGeneralColumns } from 'features/surveys/observations/observations-table/configure-columns/components/general/ConfigureGeneralColumns';
import { ConfigureMeasurementColumns } from 'features/surveys/observations/observations-table/configure-columns/components/measurements/ConfigureMeasurementColumns';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';
import { useState } from 'react';

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
   * @type {GridColDef<IObservationTableRow>[]}
   * @memberof IConfigureColumnsProps
   */
  hideableColumns: GridColDef<IObservationTableRow>[];
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
   * Callback fired on removing measurements.
   *
   * @memberof IConfigureColumnsPageProps
   */
  onRemoveMeasurements: (measurementColumnsToRemove: string[]) => void;
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
    onRemoveMeasurements,
    measurementColumns,
    onAddMeasurementColumns,
    onRemoveMeasurementColumns,
    environmentColumns,
    onAddEnvironmentColumns,
    onRemoveEnvironmentColumns
  } = props;

  const [activeView, setActiveView] = useState(ConfigureColumnsViewEnum.GENERAL);

  return (
    <Grid container justifyContent="space-between" pr={2} mt={1} height="100%" columnSpacing={5}>
      <Grid item maxWidth="250px">
        <ToggleButtonGroup
          value={activeView}
          onChange={(_, view) => {
            if (!view) {
              // An active view must be selected at all times
              return;
            }

            setActiveView(view);
          }}
          exclusive
          orientation="vertical"
          sx={{
            width: '100%',
            gap: 1,
            '& Button': {
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'flex-start',
              py: 1,
              px: 2,
              border: 'none',
              borderRadius: '4px !important',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.02rem'
            }
          }}>
          <ToggleButton
            key={ConfigureColumnsViewEnum.GENERAL}
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiCog} size={0.75} />}
            disabled={disabled}
            value={ConfigureColumnsViewEnum.GENERAL}>
            General
          </ToggleButton>
          <ToggleButton
            key={ConfigureColumnsViewEnum.MEASUREMENTS}
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiRuler} size={0.75} />}
            disabled={disabled}
            value={ConfigureColumnsViewEnum.MEASUREMENTS}>
            Species Attributes
          </ToggleButton>
          <ToggleButton
            key={ConfigureColumnsViewEnum.ENVIRONMENT}
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiLeaf} size={0.75} />}
            disabled={disabled}
            value={ConfigureColumnsViewEnum.ENVIRONMENT}>
            Environment
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid item height="100%" flex="1 1 auto">
        {activeView === ConfigureColumnsViewEnum.GENERAL && (
          <ConfigureGeneralColumns
            key={ConfigureColumnsViewEnum.GENERAL}
            disabled={disabled}
            hiddenFields={hiddenFields}
            hideableColumns={hideableColumns}
            onToggleShowHideAll={onToggleShowHideAll}
            onToggleColumnVisibility={onToggleColumnVisibility}
            onRemoveMeasurements={onRemoveMeasurements}
            measurementColumns={measurementColumns}
            onRemoveEnvironmentColumns={onRemoveEnvironmentColumns}
            environmentColumns={environmentColumns}
          />
        )}
        {activeView === ConfigureColumnsViewEnum.MEASUREMENTS && (
          <ConfigureMeasurementColumns
            key={ConfigureColumnsViewEnum.MEASUREMENTS}
            measurementColumns={measurementColumns}
            onAddMeasurementColumns={onAddMeasurementColumns}
            onRemoveMeasurementColumns={onRemoveMeasurementColumns}
          />
        )}
        {activeView === ConfigureColumnsViewEnum.ENVIRONMENT && (
          <ConfigureEnvironmentColumns
            key={ConfigureColumnsViewEnum.MEASUREMENTS}
            environmentColumns={environmentColumns}
            onAddEnvironmentColumns={onAddEnvironmentColumns}
            onRemoveEnvironmentColumns={onRemoveEnvironmentColumns}
          />
        )}
      </Grid>
    </Grid>
  );
};
