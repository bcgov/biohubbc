import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export interface SurveySectionHeaderProps {
  project_id: number;
  survey_id: number;
  survey_name: string;
  title: string;
}

const SurveySectionHeader = (props: SurveySectionHeaderProps) => {
  const { project_id, survey_id, survey_name, title } = props;
  return (
    <Paper
      square
      elevation={0}
      sx={{
        pt: 3,
        pb: 3.5,
        px: 3
      }}>
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          mb: 1
        }}>
        <Link
          component={RouterLink}
          variant="body2"
          underline="hover"
          to={`/admin/projects/${project_id}/surveys/${survey_id}/details`}>
          {survey_name}
        </Link>
        <Typography component="span" variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Breadcrumbs>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          ml: '-2px'
        }}>
        {title}
      </Typography>
    </Paper>
  );
};

export default SurveySectionHeader;
