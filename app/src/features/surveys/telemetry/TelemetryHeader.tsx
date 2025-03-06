import { mdiEye, mdiPaw } from '@mdi/js';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { BreadcrumbNavButton } from 'components/buttons/BreadcrumbNavButton';
import PageHeader from 'components/layout/PageHeader';
import { Link as RouterLink } from 'react-router-dom';
export interface TelemetryHeaderProps {
  project_id: number;
  project_name: string;
  survey_id: number;
  survey_name: string;
}

export const TelemetryHeader = (props: TelemetryHeaderProps) => {
  const { project_id, project_name, survey_id, survey_name } = props;

  const menuItems = [
    {
      label: 'Animals',
      to: `/admin/projects/${project_id}/surveys/${survey_id}/animals`,
      icon: mdiPaw
    },
    {
      label: 'Observations',
      to: `/admin/projects/${project_id}/surveys/${survey_id}/observations`,
      icon: mdiEye
    }
  ];

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
          <BreadcrumbNavButton menuItems={menuItems}>Telemetry</BreadcrumbNavButton>
        </Breadcrumbs>
      }
    />
  );
};
