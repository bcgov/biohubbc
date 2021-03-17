import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import React from 'react';
import { IProjectWithDetails } from 'interfaces/project-interfaces';

export interface IIUCNClassificationProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification: React.FC<IIUCNClassificationProps> = (props) => {
  const {
    projectWithDetailsData: { iucn }
  } = props;

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">IUCN Classification</Typography>
          </Grid>
          <Grid item>
            <IconButton title="Edit Project Coordinator" aria-label="Edit Project Coordinator">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        {iucn.classificationDetails.map((classificationDetail: any) => (
          <Grid key={classificationDetail.classification} container item spacing={3} xs={12}>
            <Grid item xs={12} sm={6} md={4}>
              <Box color="text.disabled">
                <Typography variant="caption">Classification</Typography>
              </Box>
              <Box>
                <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                  {classificationDetail.classification}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box color="text.disabled">
                <Typography variant="caption">Sub-classification</Typography>
              </Box>
              <Box>
                <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                  {classificationDetail.subClassification1}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box color="text.disabled">
                <Typography variant="caption">Sub-classification</Typography>
              </Box>
              <Box>
                <Typography style={{ wordBreak: 'break-all' }} variant="subtitle1">
                  {classificationDetail.subClassification2}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default IUCNClassification;
