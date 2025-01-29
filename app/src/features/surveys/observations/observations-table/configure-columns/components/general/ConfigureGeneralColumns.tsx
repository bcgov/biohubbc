import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { IHideableColumn } from '../../ConfigureColumnsButton';

export interface IConfigureGeneralColumnsProps {
  disabled: boolean;
  hiddenFields: string[];
  hideableColumns: IHideableColumn[];
  onToggleShowHideAll: () => void;
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
          p: 0.5,
          maxHeight: '100%',
          overflowY: 'auto',
          textAlign: 'left'
        }}
        disablePadding>
        {hideableColumns.map((column) => {
          const isSelected = !hiddenFields.includes(column.field);

          return (
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
          );
        })}
      </List>
    </Box>
  );
};
