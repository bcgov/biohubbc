import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { ConfigureGeneralColumns } from 'features/surveys/observations/observations-table/configure-columns/components/general/ConfigureGeneralColumns';
import { IHideableColumn } from '../ConfigureColumnsButton';

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
  const { disabled, hiddenFields, hideableColumns, onToggleShowHideAll, onToggleColumnVisibility } = props;

  return (
    <Stack direction="row" justifyContent="space-between" pr={2} mt={1} height="100%" spacing={5}>
      <Box height="100%" width="100%">
        <ConfigureGeneralColumns
          disabled={disabled}
          hiddenFields={hiddenFields}
          hideableColumns={hideableColumns}
          onToggleShowHideAll={onToggleShowHideAll}
          onToggleColumnVisibility={onToggleColumnVisibility}
        />
      </Box>
    </Stack>
  );
};
