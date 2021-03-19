import { Box, Grid, IconButton, Typography, Button } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface IProjectObjectivesProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectWithDetailsData: { objectives }
  } = props;

  const [isTruncatedObjectives, setIsTruncatedObjectives] = useState(objectives.objectives.length > 850);

  /*
    Function that finds a nice index (at a period ending a sentence)
    to truncate objectives longer than 850 characters
  */
  const determineTruncatingLength = () => {
    const periodIndices = [];

    for (let i = 0; i < objectives.objectives.length; i++) {
      if (objectives.objectives[i - 1] === '.' && objectives.objectives[i] === ' ') {
        periodIndices.push(i);
      }
    }

    return periodIndices.reduce((prev, curr) => {
      return Math.abs(curr - 850) < Math.abs(prev - 850) ? curr : prev;
    });
  };

  return (
    <>
      <Box m={3}>
        <Grid container spacing={3}>
          <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3">Project Objectives</Typography>
            </Grid>
            <Grid item>
              <IconButton title="Edit Objectives Information" aria-label="Edit Objectives Information">
                <Typography variant="caption">
                  <Edit fontSize="inherit" /> EDIT
                </Typography>
              </IconButton>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={12}>
            {isTruncatedObjectives && (
              <>
                <Grid item xs={12}>
                  {objectives.objectives
                    .slice(0, determineTruncatingLength())
                    .split('\n')
                    .map((paragraph: string) => {
                      if (paragraph) {
                        return (
                          <Typography style={{ wordBreak: 'break-all' }} key={uuidv4()}>
                            {paragraph}
                          </Typography>
                        );
                      }
                      return <p key={uuidv4()}></p>;
                    })}
                </Grid>
                <Button color="primary" onClick={() => setIsTruncatedObjectives(false)}>
                  Read More
                </Button>
              </>
            )}
            {!isTruncatedObjectives && (
              <>
                <Grid item xs={12}>
                  {objectives.objectives.split('\n').map((paragraph: string) => {
                    if (paragraph) {
                      return (
                        <Typography style={{ wordBreak: 'break-all' }} key={uuidv4()}>
                          {paragraph}
                        </Typography>
                      );
                    }
                    return <p key={uuidv4()}></p>;
                  })}
                </Grid>
                {objectives.objectives.length > 850 && (
                  <Button color="primary" onClick={() => setIsTruncatedObjectives(true)}>
                    Read Less
                  </Button>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProjectObjectives;
