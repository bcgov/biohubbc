import Typography from '@mui/material/Typography';
import { GridOverlay } from '@mui/x-data-grid';

const NoRowsOverlay = (props: { className: string }) => (
  <GridOverlay>
    <Typography className={props.className} color="textSecondary" data-testid="funding-source-table-empty">
      No funding sources found
    </Typography>
  </GridOverlay>
);

export default NoRowsOverlay;
