import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { SPATIAL_COMPONENT_TYPE } from 'constants/spatial';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export type BoundaryCentroidFeature = Feature & { properties: BoundaryCentroidFeatureProperties };

export type BoundaryCentroidFeatureProperties = {
  type: SPATIAL_COMPONENT_TYPE.BOUNDARY_CENTROID;
  datasetTitle: string;
  datasetID: string;
};

const useStyles = makeStyles(() => ({
  modalContent: {
    position: 'relative',
    width: 300,
    minHeight: 36
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  pointType: {
    lineHeight: 'unset'
  },
  date: {
    margin: 0,
    lineHeight: 'unset'
  },
  table: {
    marginTop: 16
  },
  tableCell: {
    padding: 8,
    fontSize: '0.625rem'
  }
}));

const DatasetPopup: React.FC<React.PropsWithChildren<{ submissionSpatialComponentIds: number[] }>> = ({
  submissionSpatialComponentIds
}) => {
  const classes = useStyles();
  const api = useBiohubApi();

  const dataLoader = useDataLoader(() => {
    return api.dwca.getSpatialMetadata(submissionSpatialComponentIds);
  });

  dataLoader.load();

  const { isLoading, isReady } = dataLoader;
  const data = (dataLoader.data || []) as BoundaryCentroidFeatureProperties[];

  const ModalContentWrapper: React.FC<React.PropsWithChildren<Record<never, any>>> = ({ children }) => (
    <div className={classes.modalContent}>{children}</div>
  );

  const MetadataHeader: React.FC<React.PropsWithChildren<{ title: string }>> = (props) => (
    <Box mb={1}>
      <Typography variant="overline" className={classes.pointType}>
        Dataset
      </Typography>
      {props.title && (
        <Typography className={classes.date} component="h6" variant="subtitle1">
          {props.title}
        </Typography>
      )}
    </Box>
  );

  const NoMetadataAvailable: React.FC = () => (
    <Typography className={classes.date} component="h6" variant="body1">
      No metadata available.
    </Typography>
  );

  if (isLoading) {
    return (
      <ModalContentWrapper>
        <div className={classes.loading}>
          <CircularProgress size={24} color="primary" />
        </div>
      </ModalContentWrapper>
    );
  }

  if (!data.length) {
    return (
      <ModalContentWrapper>
        <NoMetadataAvailable />
      </ModalContentWrapper>
    );
  }

  return (
    <>
      {data.map((metadata) => {
        const datasetTitle = metadata.datasetTitle;
        const datasetID = metadata.datasetID;

        return (
          <ModalContentWrapper>
            <Collapse in={isReady}>
              <MetadataHeader title={datasetTitle} />
              <Link color="primary" to={`/datasets/${datasetID}/details`} component={RouterLink}>
                Go to Dataset
              </Link>
            </Collapse>
          </ModalContentWrapper>
        );
      })}
    </>
  );
};

export default DatasetPopup;
