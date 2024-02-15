import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GridColDef } from '@mui/x-data-grid';
import { IObservationTableRow, MeasurementColumn } from 'contexts/observationsTableContext';
import { MeasurementsButton } from 'features/surveys/observations/measurements/dialog/MeasurementsButton';
import { Measurement } from 'hooks/cb_api/useLookupApi';

export interface IConfigureColumnsPopoverContentProps {
  hideableColumns: GridColDef<IObservationTableRow>[];
  hiddenFields: string[];
  onToggleColumnVisibility: (field: string) => void;
  onToggledShowHideAll: () => void;
  disabledAddMeasurements: boolean;
  disabledRemoveMeasurements: boolean;
  measurementColumns: MeasurementColumn[];
  onRemoveMeasurements: (measurementFields: string[]) => void;
  onAddMeasurements: (measurements: Measurement[]) => void;
}

/**
 * Renders a list of columns, with controls for managing their visibility and adding/removing measurement columns.
 *
 * @param {IConfigureColumnsPopoverContentProps} props
 * @return {*}
 */
export const ConfigureColumnsPopoverContent = (props: IConfigureColumnsPopoverContentProps) => {
  const {
    hideableColumns,
    hiddenFields,
    onToggleColumnVisibility,
    onToggledShowHideAll,
    measurementColumns,
    disabledAddMeasurements,
    disabledRemoveMeasurements,
    onRemoveMeasurements,
    onAddMeasurements
  } = props;

  return (
    <Box>
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between" gap={10} px={2.5} py={2}>
        <Typography component="div" variant="body2" fontWeight={700} textTransform={'uppercase'}>
          Configure Observations
        </Typography>
        <MeasurementsButton
          disabled={disabledAddMeasurements}
          selectedMeasurements={measurementColumns.map((item) => item.measurement)}
          onAddMeasurements={onAddMeasurements}
        />
      </Stack>

      <Divider flexItem />

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
              onClick={() => onToggledShowHideAll()}
            />
          }
          label={
            <Typography variant="body2" sx={{ ml: 1 }}>
              Show/Hide all
            </Typography>
          }
        />
      </Stack>

      <Divider flexItem />

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
                measurementColumns.some((item) => item.colDef.field === column.field) && (
                  <IconButton
                    disabled={disabledRemoveMeasurements}
                    edge="end"
                    aria-label="Remove measurement"
                    onClick={() => onRemoveMeasurements([column.field])}>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </IconButton>
                )
              }
              disablePadding>
              <ListItemButton
                dense
                onClick={() => onToggleColumnVisibility(column.field)}
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
