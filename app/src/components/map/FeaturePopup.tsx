import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SPATIAL_COMPONENT_TYPE } from 'constants/spatial';
import { Feature, GeoJsonProperties } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useState } from 'react';
import { getFormattedDate, makeCsvObjectUrl } from 'utils/Utils';

export type OccurrenceFeature = Feature & { properties: OccurrenceFeatureProperties };

export type OccurrenceFeatureProperties = {
  type: SPATIAL_COMPONENT_TYPE.OCCURRENCE;
};

export type BoundaryFeature = Feature & { properties: BoundaryFeatureProperties };

export type BoundaryFeatureProperties = {
  type: SPATIAL_COMPONENT_TYPE.BOUNDARY;
};

export type BoundaryCentroidFeature = Feature & { properties: BoundaryCentroidFeatureProperties };

export type BoundaryCentroidFeatureProperties = {
  type: SPATIAL_COMPONENT_TYPE.BOUNDARY_CENTROID;
};

export enum COMMON_METADATA_PROPERTIES {
  'vernacularName' = 'Species',
  'individualCount' = 'Count',
  'eventDate' = 'Date',
  'lifeStage' = 'Life Stage',
  'sex' = 'Sex'
}

export enum UNCOMMON_METADATA_PROPERTIES {
  'type' = 'Type',
  'datasetID' = 'Dataset ID',
  'verbatimSRS' = 'Verbatim SRS',
  'occurrenceID' = 'Occurrence ID',
  'basisOfRecord' = 'Basis of Record',
  'associatedTaxa' = 'Associated Taxa',
  'verbatimCoordinates' = 'Verbatim Coordinates'
}

export const ALL_METADATA_PROPERTIES = {
  ...COMMON_METADATA_PROPERTIES,
  ...UNCOMMON_METADATA_PROPERTIES
};

export const formatMetadataProperty: Partial<
  Record<keyof typeof COMMON_METADATA_PROPERTIES, (property: string) => string>
> = {
  eventDate: (dateString: string) => getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, dateString)
};

interface IMetadataHeaderProps {
  type?: string;
  date?: string;
  index?: number;
  length?: number;
}

type IDwCMetadata = ({ dwc: Record<string, any> } & GeoJsonProperties) | null;

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
  divider: {
    marginTop: 1
  },
  table: {
    '& td': {
      paddingTop: '8px',
      paddingBottom: '8px',
      paddingLeft: 0,
      paddingRight: 0,
      fontSize: '13px'
    }
  },
  box: { gap: 1 },
  nextPrevButton: {
    fontWeight: 700,
    '& .MuiButton-startIcon': {
      mr: 0.2
    }
  },
  downloadButton: {
    color: '#ffffff !important'
  }
}));

const FeaturePopup: React.FC<React.PropsWithChildren<{ submissionSpatialComponentIds: number[] }>> = (props) => {
  const { submissionSpatialComponentIds } = props;

  const classes = useStyles();
  const api = useBiohubApi();
  const [currentIndex, setCurrentIndex] = useState(0);

  const metadataLoader = useDataLoader(() => {
    return api.dwca.getSpatialMetadata<IDwCMetadata>(submissionSpatialComponentIds);
  });

  metadataLoader.load();

  const data = metadataLoader.data || [];
  const isEmpty = data.length === 0;
  const metadataObjectUrl = isEmpty ? undefined : makeCsvObjectUrl(data.map((row) => row?.dwc || {}));

  const handleNext = () => {
    if (isEmpty) {
      return;
    }

    setCurrentIndex((currentIndex + 1) % data.length);
  };

  const handlePrev = () => {
    if (isEmpty) {
      return;
    }
    if (currentIndex === 0) {
      setCurrentIndex(data.length - 1);
    } else {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const ModalContentWrapper: React.FC<any> = ({ children }) => <div className={classes.modalContent}>{children}</div>;

  const MetadataHeader: React.FC<React.PropsWithChildren<IMetadataHeaderProps>> = (headerProps) => {
    const { date, index, length } = headerProps;

    return (
      <Box pt={0.5} pb={0.75}>
        <Typography variant="h5" component="h3" className={classes.pointType}>
          {length && length > 1 ? `Records (${(index || 0) + 1} of ${length})` : 'Record'}
        </Typography>
        {date && (
          <Typography className={classes.date} variant="subtitle1">
            {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, date)}
          </Typography>
        )}
      </Box>
    );
  };

  const NoMetadataAvailable: React.FC = () => (
    <Typography className={classes.date} variant="body1">
      No metadata available.
    </Typography>
  );

  if (metadataLoader.isLoading) {
    return (
      <ModalContentWrapper>
        <div className={classes.loading}>
          <CircularProgress size={24} color="primary" />
        </div>
      </ModalContentWrapper>
    );
  }

  if (data.length === 0) {
    return (
      <ModalContentWrapper>
        <NoMetadataAvailable />
      </ModalContentWrapper>
    );
  }

  const metadata = data[currentIndex];
  const type = metadata?.type;
  const dwc: Record<string, any> = metadata?.dwc || {};
  const filteredMetadata = Object.entries(COMMON_METADATA_PROPERTIES).filter(([key]) => Boolean(dwc[key])) as [
    keyof typeof COMMON_METADATA_PROPERTIES,
    COMMON_METADATA_PROPERTIES
  ][];

  if (!dwc || !Object.keys(dwc).length) {
    return (
      <ModalContentWrapper>
        <MetadataHeader type={type} />
        <NoMetadataAvailable />
      </ModalContentWrapper>
    );
  }

  return (
    <ModalContentWrapper>
      <MetadataHeader type={type} index={currentIndex} length={data.length} />
      <Divider className={classes.divider}></Divider>
      <Collapse in={metadataLoader.isReady}>
        <Table className={classes.table}>
          <TableBody>
            {filteredMetadata.map(([key, propertyName]) => {
              return (
                <TableRow key={key}>
                  <TableCell>{propertyName}</TableCell>
                  <TableCell>{(formatMetadataProperty[key] ?? String)(dwc[key])}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Collapse>
      <Box display="flex" justifyContent="space-between" mt={1.5} className={classes.box}>
        {!isEmpty && data.length > 1 && (
          <Box display="flex" className={classes.box}>
            <Button
              size="small"
              variant="text"
              style={{ textTransform: 'uppercase' }}
              startIcon={<Icon path={mdiChevronLeft} size={1} />}
              onClick={(event) => {
                event.stopPropagation();
                handlePrev();
              }}
              className={classes.nextPrevButton}>
              Prev
            </Button>
            <Button
              size="small"
              variant="text"
              style={{ textTransform: 'uppercase' }}
              endIcon={<Icon path={mdiChevronRight} size={1} />}
              onClick={(event) => {
                event.stopPropagation();
                handleNext();
              }}
              className={classes.nextPrevButton}>
              Next
            </Button>
          </Box>
        )}
        {metadataObjectUrl && (
          <Box>
            <Button
              href={metadataObjectUrl}
              size="small"
              variant="contained"
              color="primary"
              className={classes.downloadButton}>
              Download Records
            </Button>
          </Box>
        )}
      </Box>
    </ModalContentWrapper>
  );
};

export default FeaturePopup;
