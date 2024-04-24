import { mdiCog, mdiLeaf, mdiRuler } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { ConfigureEnvironmentColumns } from 'features/surveys/observations/observations-table/configure-columns/components/environment/ConfigureEnvironmentColumns';
import { ConfigureGeneralColumns } from 'features/surveys/observations/observations-table/configure-columns/components/general/ConfigureGeneralColumns';
import { ConfigureMeasurementColumns } from 'features/surveys/observations/observations-table/configure-columns/components/measurements/ConfigureMeasurementColumns';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { EnvironmentType } from 'interfaces/useObservationApi.interface';
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
  onToggleShowHideAll: () => void;
  onToggleColumnVisibility: (field: string) => void;
  onRemoveMeasurements: (measurementColumnsToRemove: string[]) => void;
  measurementColumns: CBMeasurementType[];
  onAddMeasurementColumns: (measurementColumns: CBMeasurementType[]) => void;
  onRemoveMeasurementColumns: (fields: string[]) => void;
  environmentColumns: EnvironmentType[];
  onAddEnvironmentColumns: (environmentColumns: EnvironmentType[]) => void;
  onRemoveEnvironmentColumns: (fields: number[]) => void;
}

/**
 * Parent component for the configure columns components.
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
    <Grid container xs={12} justifyContent="space-between" pr={2}>
      <Grid item xs={3}>
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
            value={ConfigureColumnsViewEnum.GENERAL}>
            General
          </ToggleButton>
          <ToggleButton
            key={ConfigureColumnsViewEnum.MEASUREMENTS}
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiRuler} size={0.75} />}
            value={ConfigureColumnsViewEnum.MEASUREMENTS}>
            Measurements
          </ToggleButton>
          <ToggleButton
            key={ConfigureColumnsViewEnum.ENVIRONMENT}
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiLeaf} size={0.75} />}
            value={ConfigureColumnsViewEnum.ENVIRONMENT}>
            Environment
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item xs={8}>
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
