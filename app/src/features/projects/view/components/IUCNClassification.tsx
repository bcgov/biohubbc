import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import assert from 'assert';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import React, { useContext } from 'react';

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification = () => {
  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  assert(codesContext.codesDataLoader.data);
  assert(projectContext.projectDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const projectData = projectContext.projectDataLoader.data.projectData;

  const hasIucnClassifications =
    projectData.iucn.classificationDetails && projectData.iucn.classificationDetails.length;

  return (
    <>
      {hasIucnClassifications && (
        <List disablePadding>
          {projectData.iucn.classificationDetails.map((classificationDetail: any, index: number) => {
            return (
              <ListItem key={index} divider disableGutters>
                <Typography>
                  {`${
                    codes.iucn_conservation_action_level_1_classification.find(
                      (item: any) => item.id === classificationDetail.classification
                    )?.name
                  } `}
                  <span>{'>'}</span>
                  {` ${
                    codes.iucn_conservation_action_level_2_subclassification.find(
                      (item: any) => item.id === classificationDetail.subClassification1
                    )?.name
                  } `}
                  <span>{'>'}</span>
                  {` ${
                    codes.iucn_conservation_action_level_3_subclassification.find(
                      (item: any) => item.id === classificationDetail.subClassification2
                    )?.name
                  }`}
                </Typography>
              </ListItem>
            );
          })}
        </List>
      )}

      {!hasIucnClassifications && (
        <Box component="ul" className="listNoBullets">
          <Box component="li">
            <Typography component="dd" variant="body1">
              No IUCN Classifications
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default IUCNClassification;
