import { mdiEye, mdiWifiMarker } from '@mdi/js';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { BreadcrumbNavButton } from 'components/buttons/BreadcrumbNavButton';
import PageHeader from 'components/layout/PageHeader';
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

  const menuItems = [
    {
      label: 'Telemetry',
      to: `/admin/projects/${project_id}/surveys/${survey_id}/telemetry/details`,
      icon: mdiWifiMarker
    },
    {
      label: 'Observations',
      to: `/admin/projects/${project_id}/surveys/${survey_id}/observations`,
      icon: mdiEye
    }
  ];

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
          <BreadcrumbNavButton menuItems={menuItems}>Animals</BreadcrumbNavButton>
        </Breadcrumbs>
      }
    />
  );
};
