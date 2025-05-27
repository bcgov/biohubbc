import { mdiEye, mdiPaw, mdiPineTree, mdiWifiMarker } from '@mdi/js';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { BreadcrumbNavButton, IBreadcrumbNavButtonProps } from 'components/buttons/BreadcrumbNavButton';
import PageHeader from 'components/layout/PageHeader';
import { Link as RouterLink } from 'react-router-dom';

export enum SurveyManagePageEnum {
  OBSERVATIONS = 'Observations',
  ANIMALS = 'Animals',
  TELEMETRY = 'Telemetry',
  HABITAT_FEATURES = 'Habitat Features'
}

type SurveyMangePageMenuItems = IBreadcrumbNavButtonProps['menuItems'];

interface SurveyManagePageHeaderProps {
  page: SurveyManagePageEnum;
  survey_id: number;
  survey_name: string;
}

/**
 * Returns the header for a `Survey Manage page`.
 * Currently supports: Observations, Animals, Telemetry, and Habitat Features.
 *
 * @param {SurveyManagePageHeaderProps} props
 * @return {*} {JSX.Element}
 */
export const SurveyManagePageHeader = (props: SurveyManagePageHeaderProps): JSX.Element => {
  const menuItems: SurveyMangePageMenuItems = [
    {
      label: SurveyManagePageEnum.OBSERVATIONS,
      to: `/admin/surveys/${props.survey_id}/observations`,
      icon: mdiEye
    },
    {
      label: SurveyManagePageEnum.ANIMALS,
      to: `/admin/surveys/${props.survey_id}/animals/details`,
      icon: mdiPaw
    },
    {
      label: SurveyManagePageEnum.TELEMETRY,
      to: `/admin/surveys/${props.survey_id}/telemetry`,
      icon: mdiWifiMarker
    },
    {
      label: SurveyManagePageEnum.HABITAT_FEATURES,
      to: `/admin/surveys/${props.survey_id}/habitat-features`,
      icon: mdiPineTree
    }
  ];

  return (
    <PageHeader
      title={`Manage ${props.page}`}
      breadCrumbJSX={
        <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
          <Link component={RouterLink} underline="hover" to={`/admin/surveys/${props.survey_id}/details`}>
            {props.survey_name}
          </Link>
          <BreadcrumbNavButton menuItems={menuItems}>{props.page}</BreadcrumbNavButton>
        </Breadcrumbs>
      }
    />
  );
};
