import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import { GeneralColumnsSecondaryAction } from 'features/surveys/observations/observations-table/configure-columns/components/general/ConfigureGeneralColumnsSecondaryAction';
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

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Select Columns to Show
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
            <Typography variant="body2" sx={{ ml: 1 }} color="textSecondary" textTransform="uppercase" fontWeight={700}>
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
              secondaryAction={
                <GeneralColumnsSecondaryAction
                  disabled={disabled}
                  field={column.field}
                  onRemoveMeasurements={onRemoveMeasurements}
                  measurementColumns={measurementColumns}
                  onRemoveEnvironmentColumns={onRemoveEnvironmentColumns}
                  environmentColumns={environmentColumns}
                />
              }
              disablePadding>
              <ListItemButton
                dense
                onClick={() => onToggleColumnVisibility(column.field)}
                disabled={disabled}
                sx={{ background: grey[50], borderRadius: '5px' }}>
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
