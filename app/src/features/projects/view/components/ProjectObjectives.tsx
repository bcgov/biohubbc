import ReadMoreField from 'components/fields/ReadMoreField';
import { ProjectViewObject } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectObjectivesProps {
  projectForViewData: ProjectViewObject;
}

/**
 * Project objectives content for a project.
 *
 * @param {IProjectObjectivesProps} props
 * @return {*}
 */
const ProjectObjectives = (props: IProjectObjectivesProps) => {
  const {
    projectForViewData: { objectives }
  } = props;

  return (
    <ReadMoreField text={objectives.objectives} maxCharLength={200} TypographyProps={{ color: 'textSecondary' }} />
  );
};

export default ProjectObjectives;
