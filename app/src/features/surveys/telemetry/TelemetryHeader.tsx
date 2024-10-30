import { mdiPaw } from '@mdi/js';
import Icon from '@mdi/react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { useSurveyContext } from 'hooks/useContext';
import { Link as RouterLink } from 'react-router-dom';

export interface TelemetryHeaderProps {
  project_id: number;
  project_name: string;
  survey_id: number;
  survey_name: string;
}

export const TelemetryHeader = (props: TelemetryHeaderProps) => {
  const { project_id, project_name, survey_id, survey_name } = props;
  const surveyContext = useSurveyContext();
  return (
    <PageHeader
      title="Manage Telemetry"
      breadCrumbJSX={
        <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
          <Link component={RouterLink} underline="hover" to={`/admin/projects/${project_id}`}>
            {project_name}
          </Link>
          <Link
            component={RouterLink}
            underline="hover"
            to={`/admin/projects/${project_id}/surveys/${survey_id}/details`}>
            {survey_name}
          </Link>
          <Typography component="span" variant="inherit" color="textSecondary">
            Manage Telemetry
          </Typography>
        </Breadcrumbs>
      }
      buttonJSX={
        <Button
          component={RouterLink}
          to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals/details`}
          variant="outlined"
          color="primary"
          startIcon={<Icon path={mdiPaw} size={1} />}>
          Manage Animals
        </Button>
      }
    />
  );
};
