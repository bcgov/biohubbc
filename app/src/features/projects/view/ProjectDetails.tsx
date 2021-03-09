import { Box, Paper, Typography } from '@material-ui/core';
//import React, { useState } from 'react';
import React from 'react';
//import { IProject } from 'interfaces/project-interfaces';
//import { useParams } from 'react-router';

export interface IProjectDetailsProps {
  projectData: any;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {

  const projectData= props.projectData;

  // TODO this is using IProject in the mean time, but will eventually need something like IProjectRecord
  //const [project ] = useState<IProject | null>(null);


  return (
    <>
      <Box mb={5}>
        <Typography variant="h2">Project Details</Typography>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>Project objectives placeholder</Box>
        </Paper>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>{JSON.stringify(projectData)}</Box>
          <Box p={3}>General Information</Box>
          <Box p={3}>Name: {projectData?.name}</Box>
          <Box p={3}>Type: placeholder</Box>
          <Box p={3}>Timeline: {projectData?.start_date?.substring(0,10)} - {projectData?.end_date?.substring(0,10)}</Box>
          <Box p={3}>Activities: placeholder</Box>
          <Box p={3}>Climate change initiatives: placeholder</Box>

        </Paper>
      </Box>
    </>
  );
};

export default ProjectDetails;
