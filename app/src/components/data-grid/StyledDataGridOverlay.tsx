import Typography from '@mui/material/Typography';
import { GridOverlay } from '@mui/x-data-grid';

const StyledDataGridOverlay = () => (
  <GridOverlay>
    <Typography variant="body2" color="textSecondary" data-testid="data-grid-table-empty">
      No records found
    </Typography>
  </GridOverlay>
);

export default StyledDataGridOverlay;