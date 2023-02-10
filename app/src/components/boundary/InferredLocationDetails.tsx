import Box from '@material-ui/core/Box';
import { grey } from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  boundaryGroup: {
    clear: 'both',
    overflow: 'hidden',
    '&:first-child': {
      marginTop: 0
    }
  },
  boundaryList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    '& li': {
      display: 'inline-block',
      float: 'left'
    },
    '& li + li': {
      marginLeft: theme.spacing(1)
    }
  },
  metaSectionHeader: {
    color: grey[600],
    fontWeight: 700,
    textTransform: 'uppercase',
    '& + hr': {
      marginTop: theme.spacing(0.75),
      marginBottom: theme.spacing(0.75)
    }
  }
}));

export interface IInferredLayers {
  parks: string[];
  nrm: string[];
  env: string[];
  wmu: string[];
}

export interface IInferredLocationDetailsProps {
  layers: IInferredLayers;
}

const InferredLocationDetails: React.FC<IInferredLocationDetailsProps> = (props) => {
  const classes = useStyles();
  const displayInferredLayersInfo = (data: any[], type: string) => {
    if (!data.length) {
      return;
    }

    return (
      <>
        <Box className={classes.boundaryGroup} mt={3}>
          <Typography variant="body2" component="h3" className={classes.metaSectionHeader}>
            {type} ({data.length})
          </Typography>
          <Divider></Divider>
          <Box component="ul" className={classes.boundaryList}>
            {data.map((item: string, index: number) => (
              <Typography key={index} variant="body1" component="li">
                {item}
                {index < data.length - 1 && ', '}
              </Typography>
            ))}
          </Box>
        </Box>
      </>
    );
  };

  return (
    <>
      {displayInferredLayersInfo(props.layers.nrm, 'Natural Resource Ministries Regions')}
      {displayInferredLayersInfo(props.layers.env, 'Ministry of Environment Regions')}
      {displayInferredLayersInfo(props.layers.parks, 'Parks and EcoReserves')}
    </>
  );
};

export default InferredLocationDetails;
