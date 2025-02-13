import { mdiFileDocumentPlusOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, ButtonProps, Tooltip } from '@mui/material';

// TODO: Invesitgate why the `to` prop is not working for the `Button` component.
interface IDualImportButtonProps {
  /**
   * Props for the single import button.
   *
   * @type {ButtonProps & { to?: string }}
   */
  singleImportButtonProps: ButtonProps & { to?: string };
  /**
   * Props for the bulk import button.
   *
   * @type {ButtonProps & { to?: string }}
   */
  bulkImportButtonProps: ButtonProps & { to?: string };
}

/**
 * A styled dual import button that allows the user to import a single item or multiple items.
 *
 * @param {IDualImportButtonProps} props
 * @return {*} {JSX.Element}
 */
export const DualImportButton = (props: IDualImportButtonProps) => {
  return (
    <Box>
      <Tooltip title="Single import">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Icon path={mdiPlus} size={1} />}
          sx={{ mr: 0.2, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          {...props.singleImportButtonProps}>
          {props.singleImportButtonProps.children ?? 'Add'}
        </Button>
      </Tooltip>
      <Tooltip title="Bulk import">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Icon path={mdiFileDocumentPlusOutline} size={1} />}
          sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, '& .MuiButton-startIcon': { mx: 0 } }}
          {...props.bulkImportButtonProps}
        />
      </Tooltip>
    </Box>
  );
};
