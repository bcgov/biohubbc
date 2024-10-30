import { mdiWifiMarker } from '@mdi/js';
import { Icon } from '@mdi/react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { useSurveyContext } from 'hooks/useContext';
import { Link as RouterLink } from 'react-router-dom';

export interface IAnimalHeaderProps {
  project_id: number;
  project_name: string;
  survey_id: number;
  survey_name: string;
}

/**
 * Returns the header for the Survey Animals page.
 *
 * @param {IAnimalHeaderProps} props
 * @return {*}
 */
export const AnimalHeader = (props: IAnimalHeaderProps) => {
  const { project_id, project_name, survey_id, survey_name } = props;
  const surveyContext = useSurveyContext();
  return (
    <PageHeader
      title="Manage Animals"
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
            Manage Animals
          </Typography>
        </Breadcrumbs>
      }
      buttonJSX={
        <Button
          component={RouterLink}
          to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry`}
          variant="outlined"
          color="primary"
          startIcon={<Icon path={mdiWifiMarker} size={1} />}>
          Manage Telemetry
        </Button>
      }
    />
  );
};
