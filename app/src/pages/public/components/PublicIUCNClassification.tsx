import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPublicIUCNClassificationProps {
  projectForViewData: IGetProjectForViewResponse;
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
            return (
              <Box component="li" key={index} className={classes.iucnListItem}>
                <Divider />
                <Box>
                  <Typography component="span" variant="body1">
                    {classificationDetail.classification} <span>{'>'}</span> {classificationDetail.subClassification1}{' '}
                    <span>{'>'}</span> {classificationDetail.subClassification2}
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
