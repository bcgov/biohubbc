import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification = () => {
  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  // Codes data must be loaded by a parent before this component is rendered
  assert(codesContext.codesDataLoader.data);
  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
  const projectData = projectContext.projectDataLoader.data.projectData;

  const hasIucnClassifications =
    projectData.iucn.classificationDetails && projectData.iucn.classificationDetails.length > 0;

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
