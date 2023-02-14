import ReadMoreField from 'components/fields/ReadMoreField';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectObjectivesProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectForViewData: { objectives }
  } = props;

  return (
    <ReadMoreField text={objectives.objectives} maxCharLength={200} TypographyProps={{ color: 'textSecondary' }} />
  );
};

export default ProjectObjectives;
