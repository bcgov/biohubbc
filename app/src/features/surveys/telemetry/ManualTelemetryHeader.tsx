import Breadcrumbs from '@mui/material/Breadcrumbs';
import { grey } from '@mui/material/colors';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export interface ManualTelemetryHeaderProps {
  project_id: number;
  survey_id: number;
  survey_name: string;
}

const ManualTelemetryHeader: React.FC<ManualTelemetryHeaderProps> = (props) => {
  const { project_id, survey_id, survey_name } = props;
  return (
    <Paper
      square
      elevation={0}
      sx={{
        py: 3,
        px: 3,
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: grey[300]
      }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link
          component={RouterLink}
          underline="hover"
          to={`/admin/projects/${project_id}/surveys/${survey_id}/details`}>
          {survey_name}
        </Link>
        <Typography component="span" color="textSecondary">
          Manage Telemetry
        </Typography>
      </Breadcrumbs>
      <Typography
        component="h1"
        variant="h2"
        sx={{
          ml: '-2px'
        }}>
        Manage Telemetry
      </Typography>
    </Paper>
  );
};

export default ManualTelemetryHeader;
