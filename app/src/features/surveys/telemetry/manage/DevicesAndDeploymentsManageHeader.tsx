import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { Link as RouterLink } from 'react-router-dom';

export interface DevicesAndDeploymentsManageHeaderProps {
  project_id: number;
  project_name: string;
  survey_id: number;
  survey_name: string;
}

/**
 * Header for the telemetry device and deployment manage page.
 *
 * @param {DevicesAndDeploymentsManageHeaderProps} props
 * @return {*}
 */
export const DevicesAndDeploymentsManageHeader = (props: DevicesAndDeploymentsManageHeaderProps) => {
  const { project_id, project_name, survey_id, survey_name } = props;

  return (
    <PageHeader
      title="Manage Sampling Information"
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
            Manage Telemetry Device and Deployment Information
          </Typography>
        </Breadcrumbs>
      }
    />
  );
};
