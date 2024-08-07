import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import blueGrey from '@mui/material/colors/blueGrey';
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
  /**
   * Callback fired on toggling the visibility of all columns.
   *
   * @memberof IConfigureGeneralColumnsProps
   */
  onToggleShowHideAll: () => void;
  /**
   * Callback fired on toggling the visibility of a column.
   *
   * @memberof IConfigureGeneralColumnsProps
   */
  onToggleColumnVisibility: (field: string) => void;
  /**
   * Callback fired on removing measurements.
   *
   * @memberof IConfigureGeneralColumnsProps
   */
  onRemoveMeasurements: (measurementColumnsToRemove: string[]) => void;
  /**
   * The measurement columns.
   *
   * @type {CBMeasurementType[]}
   * @memberof IConfigureGeneralColumnsProps
   */
  measurementColumns: CBMeasurementType[];
  /**
   * Callback fired on removing environment columns.
   *
   * @memberof IConfigureGeneralColumnsProps
   */
  onRemoveEnvironmentColumns: (environmentColumnIds: EnvironmentTypeIds) => void;
  /**
   * The environment columns.
   *
   * @type {EnvironmentType}
   * @memberof IConfigureGeneralColumnsProps
   */
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
    <Box height='100%'>
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between" minWidth={400}>
        <Typography variant="h5" mb={2}>
          Select Columns to Show
        </Typography>
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
          maxHeight: '90%',
          overflowY: 'auto'
        }}
        disablePadding>
        {hideableColumns.map((column) => {
          const isSelected = !hiddenFields.includes(column.field);
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
                sx={{
                  background: isSelected ? blueGrey[50] : '#fff',
                  borderRadius: '5px',
                  alignItems: 'flex-start',
                  '& .MuiListItemText-root': { my: 0 }
                }}>
                <ListItemIcon>
                  <Checkbox edge="start" checked={isSelected} />
                </ListItemIcon>
                <Box my={1}>
                  <ListItemText sx={{ '& .MuiTypography-root': { fontWeight: 700 } }}>{column.headerName}</ListItemText>
                  <ListItemText sx={{ '& .MuiTypography-root': { color: grey[600] } }}>
                    {column.description}
                  </ListItemText>
                </Box>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
