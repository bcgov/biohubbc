import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * IUCN Classification content for a project.
 *
 * @return {*}
 */
const IUCNClassification: React.FC<IIUCNClassificationProps> = (props) => {
  const {
    projectForViewData: { iucn },
    codes
  } = props;

  const hasIucnClassifications = iucn.classificationDetails && iucn.classificationDetails.length > 0;

  return (
    <>
      {hasIucnClassifications && (
        <List disablePadding>
          {iucn.classificationDetails.map((classificationDetail: any, index: number) => {
            return (
              <ListItem key={index} divider disableGutters>
                <Typography>
                  {`${
                    codes?.iucn_conservation_action_level_1_classification?.find(
                      (item: any) => item.id === classificationDetail.classification
                    )?.name
                  } `}
                  <span>{'>'}</span>
                  {` ${
                    codes?.iucn_conservation_action_level_2_subclassification?.find(
                      (item: any) => item.id === classificationDetail.subClassification1
                    )?.name
                  } `}
                  <span>{'>'}</span>
                  {` ${
                    codes?.iucn_conservation_action_level_3_subclassification?.find(
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
