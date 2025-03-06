import { mdiPaw, mdiWifiMarker } from '@mdi/js';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { BreadcrumbNavButton } from 'components/buttons/BreadcrumbNavButton';
import PageHeader from 'components/layout/PageHeader';
import { Link as RouterLink } from 'react-router-dom';

export interface SurveyObservationHeaderProps {
  project_id: number;
  project_name: string;
  survey_id: number;
  survey_name: string;
}

const SurveyObservationHeader: React.FC<SurveyObservationHeaderProps> = (props) => {
  const { project_id, project_name, survey_id, survey_name } = props;

  const menuItems = [
    {
      label: 'Animals',
      to: `/admin/projects/${project_id}/surveys/${survey_id}/animals/details`,
      icon: mdiPaw
    },
    {
      label: 'Telemetry',
      to: `/admin/projects/${project_id}/surveys/${survey_id}/telemetry`,
      icon: mdiWifiMarker
    }
  ];

  return (
    <PageHeader
      title="Manage Observations"
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
          <BreadcrumbNavButton menuItems={menuItems}>Observations</BreadcrumbNavButton>
        </Breadcrumbs>
      }
    />
  );
};

export default SurveyObservationHeader;
