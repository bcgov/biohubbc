import Typography from '@mui/material/Typography';
import { GridOverlay } from '@mui/x-data-grid';

const StyledDataGridOverlay = (props: { message?: string }) => (
  <GridOverlay sx={{ background: '#fff' }}>
    <Typography variant="body2" color="textSecondary" data-testid="data-grid-table-empty">
      {props.message ?? 'No records found'}
    </Typography>
  </GridOverlay>
);

export default StyledDataGridOverlay;
