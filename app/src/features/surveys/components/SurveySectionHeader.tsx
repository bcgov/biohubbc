import Breadcrumbs from '@mui/material/Breadcrumbs';
import grey from '@mui/material/colors/grey';
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
        p: { xs: 2, sm: 3 },
        borderBottom: '1px solid' + grey[300]
      }}>
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          typography: 'body2'
        }}>
        <Link
          component={RouterLink}
          underline="hover"
          to={`/admin/projects/${project_id}/surveys/${survey_id}/details`}>
          {survey_name}
        </Link>
        <Typography component="span" variant="inherit" color="textSecondary">
          {title}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h1">{title}</Typography>
    </Paper>
  );
};

export default SurveySectionHeader;
