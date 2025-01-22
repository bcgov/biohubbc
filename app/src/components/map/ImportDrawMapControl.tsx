import { mdiTrashCanOutline, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import DrawControls, { IDrawControlsRef } from 'components/map/components/DrawControls';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import ImportBoundaryDialog from 'components/map/components/ImportBoundaryDialog';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { ALL_OF_BC_BOUNDARY } from 'constants/spatial';
import { Feature, FeatureCollection } from 'geojson';
import { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import { ReactElement, useEffect, useState } from 'react';
import { FeatureGroup, GeoJSON, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { v4 } from 'uuid';

export interface IImportDrawMapControlProps {
  mapId: string;
  label: string;
  features: Feature[];
  handleImport: (features: Feature[]) => void;
  handleImportFailure: () => void;
  handleAdd: (feature: Feature, id: number) => void;
  handleEdit: (features: Feature[]) => void;
  handleDelete?: (features: Feature[]) => void;
  handleDeleteAll?: () => void;
  handleRegionSelect?: (feature: Feature) => void;
  handleFeatureSelect?: (feature: Feature) => void;
  tooltip?: (feature: Feature) => ReactElement;
  selectedFeatures?: Feature[];
  regions?: Feature[]; // Optional for selectable BCGW layers
  dialogTitle?: string;
  drawControlsRef?: React.MutableRefObject<IDrawControlsRef | null>;
}

/**
 * Returns a generic map control with the ability to draw or import features, used for adding spatial data as part of a form
 *
 * @param {IImportDrawMapControlProps} props
 * @returns {*}
 */
export const ImportDrawMapControl = (props: IImportDrawMapControlProps) => {
  const {
    mapId,
    label,
    features,
    handleImport,
    handleImportFailure,
    handleAdd,
    handleEdit,
    handleDelete,
    handleDeleteAll,
    handleRegionSelect,
    handleFeatureSelect,
    tooltip,
    selectedFeatures,
    regions = [],
    dialogTitle = 'Import Features',
    drawControlsRef
  } = props;
  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (features.length > 0) {
      setUpdatedBounds(calculateUpdatedMapBounds(features));
    } else {
      setUpdatedBounds(calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]));
    }
  }, [features]);

  return (
    <>
      <ImportBoundaryDialog
        dialogTitle={dialogTitle}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleImport}
        onFailure={handleImportFailure}
      />

      <Toolbar
        disableGutters
        sx={{
          px: 2
        }}>
        <Typography
          component="div"
          fontWeight="700"
          sx={{
            flex: '1 1 auto'
          }}>
          {label}
          <Typography component="span" color="textSecondary" sx={{ ml: 0.5 }}>
            ({features.length})
          </Typography>
        </Typography>
        <Stack gap={1} flexDirection="row">
          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
            onClick={() => setIsDialogOpen(true)}>
            Import
          </Button>
          {handleDeleteAll && (
            <Box>
              <Button
                color="primary"
                variant="outlined"
                disabled={features.length <= 0}
                startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                onClick={handleDeleteAll}>
                Remove All
              </Button>
            </Box>
          )}
          {handleDelete && (
            <Collapse in={selectedFeatures && selectedFeatures?.length > 0} orientation="horizontal">
              <Box whiteSpace="nowrap" display="flex" sx={{ gap: 1 }}>
                <Button
                  color="primary"
                  variant="outlined"
                  startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                  onClick={() => selectedFeatures && handleDelete(selectedFeatures)}>
                  Remove Selected
                </Button>
              </Box>
            </Collapse>
          )}
        </Stack>
      </Toolbar>

      <LeafletMapContainer
        id={mapId}
        center={[0, 0]}
        zoom={3}
        style={{ height: 500 }}
        maxZoom={17}
        scrollWheelZoom={false}>
        <MapBaseCss />

        <FullScreenScrollingEventHandler bounds={updatedBounds} scrollWheelZoom={false} />
        <SetMapBounds bounds={updatedBounds} />

        <FeatureGroup>
          <DrawControls
            ref={drawControlsRef}
            options={{
              draw: { circle: false, circlemarker: false }
            }}
            onLayerAdd={(event: DrawEvents.Created, id: number) => {
              const feature: Feature = event.layer.toGeoJSON();
              handleAdd(feature, id);
              // Remove the draw layer from the map since the feature will be displayed as a static layer instead
              event.layer.remove();
            }}
            onLayerEdit={(event: DrawEvents.Edited) => {
              const editedFeatures = event.layers.toGeoJSON() as FeatureCollection;
              handleEdit(editedFeatures.features);
            }}
            onLayerDelete={(event: DrawEvents.Deleted) => {
              const deletedFeatures = event.layers.toGeoJSON() as FeatureCollection;
              handleDelete && handleDelete(deletedFeatures.features);
            }}
          />
        </FeatureGroup>

        {regions.length > 0 && (
          <FeatureGroup>
            {regions.map((region, index) => (
              <GeoJSON
                key={region.id || index}
                data={region}
                eventHandlers={{
                  click: () => handleRegionSelect && handleRegionSelect(region)
                }}
              />
            ))}
          </FeatureGroup>
        )}

        <LayersControl position="bottomright">
          <StaticLayers
            layers={features.map((feature, index) => {
              const isSelected = selectedFeatures?.some((selectedFeature) => selectedFeature.id === feature.id);

              const color = isSelected
                ? SURVEY_MAP_LAYER_COLOURS.SELECTED_COLOUR
                : SURVEY_MAP_LAYER_COLOURS.NON_SELECTED_COLOUR;

              const id = String(feature.id) || v4();

              return {
                key: feature.id,
                layerName: `Feature ${index + 1}`,
                features: [
                  {
                    id: index,
                    key: id,
                    geoJSON: feature
                  }
                ],
                layerOptions: {
                  fillColor: color,
                  color: color
                },
                tooltip: tooltip ? () => tooltip(feature) : undefined,
                handleClick: (feature: Feature) => {
                  handleFeatureSelect && handleFeatureSelect(feature);
                }
              };
            })}
          />
          <BaseLayerControls />
        </LayersControl>
      </LeafletMapContainer>
    </>
  );
};
