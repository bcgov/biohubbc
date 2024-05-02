import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { EnvironmentType, EnvironmentTypeIds } from 'interfaces/useReferenceApi.interface';

export interface IConfigureGeneralColumnsProps {
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
  onRemoveEnvironmentColumns: (environmentColumnIds: EnvironmentTypeIds) => void;
  environmentColumns: EnvironmentType;
}

/**
 * Renders a list of measurement cards.
 *
 * @param {IConfigureGeneralColumnsProps} props
 * @return {*}
 */
export const ConfigureGeneralColumns = (props: IConfigureGeneralColumnsProps) => {
  const {
    disabled,
    hiddenFields,
    hideableColumns,
    onToggleShowHideAll,
    onToggleColumnVisibility,
    onRemoveMeasurements,
    measurementColumns,
    onRemoveEnvironmentColumns,
    environmentColumns
  } = props;

  const GeneralColumnsSecondaryAction = (props: { field: string }) => {
    const { field } = props;

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

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Configure Columns
      </Typography>
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        py={0.5}
        pl={2.5}
        pr={1.5}
        minWidth={400}>
        <FormControlLabel
          control={
            <Checkbox
              indeterminate={hiddenFields.length > 0 && hiddenFields.length < hideableColumns.length}
              checked={hiddenFields.length === 0}
              onClick={() => onToggleShowHideAll()}
              disabled={disabled}
            />
          }
          label={
            <Typography variant="body2" sx={{ ml: 1 }}>
              Show/Hide all
            </Typography>
          }
        />
      </Stack>

      <List
        component={Stack}
        gap={0.5}
        sx={{
          p: 0.5,
          maxHeight: { sm: 300, md: 500 },
          overflowY: 'auto'
        }}
        disablePadding>
        {hideableColumns.map((column) => {
          return (
            <ListItem
              key={column.field}
              secondaryAction={<GeneralColumnsSecondaryAction field={column.field} />}
              disablePadding>
              <ListItemButton
                dense
                onClick={() => onToggleColumnVisibility(column.field)}
                disabled={disabled}
                sx={{ background: grey[50] }}>
                <ListItemIcon>
                  <Checkbox edge="start" checked={!hiddenFields.includes(column.field)} />
                </ListItemIcon>
                <ListItemText>{column.headerName}</ListItemText>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
