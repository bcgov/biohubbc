import assert from 'assert';
import ReadMoreField from 'components/fields/ReadMoreField';
import { ProjectContext } from 'contexts/projectContext';
import React, { useContext } from 'react';

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives = () => {
  const projectContext = useContext(ProjectContext);

  assert(projectContext.projectDataLoader.data);

  const projectData = projectContext.projectDataLoader.data.projectData;

  return (
    <ReadMoreField
      text={projectData.objectives.objectives}
      maxCharLength={200}
      TypographyProps={{ color: 'textSecondary' }}
    />
  );
};

export default ProjectObjectives;
