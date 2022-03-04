import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

export interface IPublicIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  iucnListItem: {
    '& hr': {
      marginBottom: theme.spacing(2)
    },

    '& + li': {
      paddingTop: theme.spacing(2)
    }
  }
}));

/**
 * IUCN Classification content for a public (published) project.
 *
 * @return {*}
 */
const PublicIUCNClassification: React.FC<IPublicIUCNClassificationProps> = (props) => {
  const {
    projectForViewData: { iucn }
  } = props;

  const classes = useStyles();

  const hasIucnClassifications = iucn.classificationDetails && iucn.classificationDetails.length > 0;

  return (
    <>
      <Box mb={2} height="2rem">
        <Typography variant="h3">IUCN Conservation Actions Classification</Typography>
      </Box>

      {hasIucnClassifications && (
        <Box component="ul" className="listNoBullets">
          {iucn.classificationDetails.map((classificationDetail: any, index: number) => {
            const iucn1_name =
              props.codes.iucn_conservation_action_level_1_classification[classificationDetail.classification - 1].name;

            const iucn2_name =
              props.codes.iucn_conservation_action_level_2_subclassification[classificationDetail.subClassification1 - 1]
                .name;

            const iucn3_name =
              props.codes.iucn_conservation_action_level_3_subclassification[classificationDetail.subClassification2 - 1]
                .name;
            return (
              <Box component="li" key={index} className={classes.iucnListItem}>
                <Divider />
                <Box>
                  <Typography component="span" variant="body1">
                    {iucn1_name} 
                    <span>{' > '}</span> 
                    {iucn2_name}
                    <span>{' > '}</span> 
                    {iucn3_name}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {!hasIucnClassifications && (
        <Box component="ul" className="listNoBullets">
          <Box component="li" className={classes.iucnListItem}>
            <Typography component="dd" variant="body1">
              No IUCN Classifications
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default PublicIUCNClassification;
