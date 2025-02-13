import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { IHideableColumn } from '../../ConfigureColumnsButton';

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
   * @type {IHideableColumn[]}
   * @memberof IConfigureColumnsProps
   */
  hideableColumns: IHideableColumn[];
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
}

/**
 * Renders a list of measurement cards.
 *
 * @param {IConfigureGeneralColumnsProps} props
 * @return {*}
 */
export const ConfigureGeneralColumns = (props: IConfigureGeneralColumnsProps) => {
  const { disabled, hiddenFields, hideableColumns, onToggleShowHideAll, onToggleColumnVisibility } = props;

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Stack flexDirection="row" alignItems="center" justifyContent="space-between" minWidth={400}>
        <Typography variant="h5">Select Columns to Show</Typography>
        <FormControlLabel
          control={
            <Checkbox
              indeterminate={hiddenFields.length > 0 && hiddenFields.length < hideableColumns.length}
              checked={hiddenFields.length === 0}
              onClick={() => onToggleShowHideAll()}
              disabled={disabled}
              sx={{ m: 0, p: 0 }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{ ml: 0.5 }}
              color="textSecondary"
              textTransform="uppercase"
              fontWeight={700}>
              Show/Hide all
            </Typography>
          }
        />
      </Stack>

      <List
        component={Stack}
        gap={0.5}
        sx={{
          my: 2,
          py: 0.5,
          pr: 1,
          maxHeight: '100%',
          overflowY: 'auto'
        }}
        disablePadding>
        {hideableColumns.map((column) => {
          const isSelected = !hiddenFields.includes(column.field);

          return (
            <ListItem key={column.field} sx={{ p: 0 }}>
              <AccordionStandardCard
                key={column.field}
                label={column.headerName ?? column.field}
                colour={isSelected ? grey[100] : grey[50]}
                subtitle={column.description}
                handleCheckboxChange={() => onToggleColumnVisibility(column.field)}
                checkboxDisabled={disabled}
                checkboxSelected={isSelected}>
                {column.options.length > 0 && (
                  <Stack gap={1} my={2}>
                    {column.options.map((option) => (
                      <AccordionStandardCard
                        key={option.name}
                        label={option.name}
                        subtitle={option.description}
                        colour={grey[200]}
                      />
                    ))}
                  </Stack>
                )}
              </AccordionStandardCard>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
