import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { Link as RouterLink } from 'react-router-dom';

export interface DevicesAndDeploymentsManageHeaderProps {
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
  const { survey_id, survey_name } = props;

  return (
    <PageHeader
      title="Manage Devices and Deployments"
      breadCrumbJSX={
        <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
          <Link component={RouterLink} underline="hover" to={`/admin/surveys/${survey_id}/details`}>
            {survey_name}
          </Link>
          <Link component={RouterLink} underline="hover" to={`/admin/surveys/${survey_id}/telemetry/details`}>
            Manage Telemetry
          </Link>
          <Typography component="span" variant="inherit" color="textSecondary">
            Manage Devices and Deployments
          </Typography>
        </Breadcrumbs>
      }
    />
  );
};
