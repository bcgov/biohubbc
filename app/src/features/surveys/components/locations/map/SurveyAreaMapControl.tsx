import { mdiShapePolygonPlus, mdiTrashCanOutline, mdiTrayArrowUp, mdiViewGridPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import DrawControls, { IDrawControlsRef } from 'components/map/components/DrawControls';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import ImportSpatialDialog from 'components/map/components/ImportSpatialDialog';
import { IRegionOption, RegionSelector } from 'components/map/components/RegionSelector';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { layerContentHandlers, layerNameHandler } from 'components/map/wfs-utils';
import WFSFeatureGroup from 'components/map/WFSFeatureGroup';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { FormikContextType } from 'formik';
import { Feature, FeatureCollection } from 'geojson';
import L, { DrawEvents, LatLngBoundsExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import { ISurveyLocationForm } from '../SurveyAreaFormContainer';

export interface ISurveyAreMapControlProps {
  map_id: string;
  formik_props: FormikContextType<ISurveyLocationForm>;
  draw_controls_ref: React.RefObject<IDrawControlsRef>;
  toggle_delete_dialog: (isOpen: boolean) => void;
  label: string;
  onLayerAdd: (event: DrawEvents.Created, id: number) => void;
  onSelectGeometry: (geo: Feature, layerName: string) => void
}

export const SurveyAreaMapControl = (props: ISurveyAreMapControlProps) => {
  const { map_id, formik_props, draw_controls_ref, toggle_delete_dialog, label, onLayerAdd, onSelectGeometry } = props;
  const { setFieldValue, setFieldError, values } = formik_props;
  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  // BOUNDS
  const [isBoundsOpen, setIsBoundsOpen] = useState(false);
  // BLOCKS
  const [isBlocksOpen, setIsBlocksOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<IRegionOption | null>(null);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  useEffect(() => {
    if (formik_props.values.bounds.length) {
      setUpdatedBounds(calculateUpdatedMapBounds(formik_props.values.bounds.map((item) => item.geojson[0])));
    }
  }, [formik_props.values.bounds]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        disableAutoFocusItem
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{
          mt: 1,
          '& a': {
            display: 'flex',
            px: 2,
            py: '6px',
            textDecoration: 'none',
            color: 'text.primary',
            borderRadius: 0,
            '&:focus': {
              outline: 'none'
            }
          }
        }}>
        <MenuItem
          onClick={() => {
            setIsBoundsOpen(true);
            setAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiShapePolygonPlus} size={0.8} />
          </ListItemIcon>
          <ListItemText>Bounds</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsBlocksOpen(true);
            setAnchorEl(null);
          }}>
          <ListItemIcon>
            <Icon path={mdiViewGridPlus} size={0.8} />
          </ListItemIcon>
          <ListItemText>Blocks</ListItemText>
        </MenuItem>
      </Menu>

      {/* BOUNDS DIALOG */}
      <ImportSpatialDialog
        dialogTitle="Import Bounds"
        isOpen={isBoundsOpen}
        onClose={() => setIsBoundsOpen(false)}
        onSuccess={(features) => {
          // Map features into form data
          const formData = features.map((item: Feature, index) => {
            return {
              name: shapeFileFeatureName(item) ?? `Boundary ${index + 1}`,
              description: shapeFileFeatureDesc(item) ?? '',
              geojson: [item],
              revision_count: 0
            };
          });
          setUpdatedBounds(calculateUpdatedMapBounds(features));
          setFieldValue('bounds', [...values.bounds, ...formData]);
        }}
        onFailure={(message) => {
          setFieldError('bounds', message);
        }}
      />

      {/* BLOCKS DIALOG */}
      <ImportSpatialDialog
        dialogTitle="Import Blocks"
        isOpen={isBlocksOpen}
        onClose={() => setIsBlocksOpen(false)}
        onSuccess={(features) => {
          // Map features into form data
          const formData = features.map((item: Feature, index) => {
            return {
              name: shapeFileFeatureName(item) ?? `Block ${index + 1}`,
              description: shapeFileFeatureDesc(item) ?? '',
              geojson: [item],
              revision_count: 0
            };
          });
          setUpdatedBounds(calculateUpdatedMapBounds(features));
          setFieldValue('blocks', [...values.bounds, ...formData]);
        }}
        onFailure={(message) => {
          setFieldError('blocks', message);
        }}
      />

      <Toolbar
        disableGutters
        sx={{
          px: 2
        }}>
        <Typography
          data-testid="map-control-title"
          component="div"
          fontWeight="700"
          sx={{
            flex: '1 1 auto'
          }}>
          {label}
        </Typography>
        <Box display="flex">
          <Button
            color="primary"
            variant="outlined"
            data-testid="boundary_file-upload"
            startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
            onClick={handleMenuClick}>
            Import
          </Button>
          <Box ml={1}>
            <RegionSelector
              selectedRegion={selectedRegion}
              onRegionSelected={(data) => {
                setSelectedRegion(data);
              }}
            />
          </Box>
          <Box ml={1}>
            <Button
              color="primary"
              variant="outlined"
              data-testid="boundary_remove-all"
              disabled={values.bounds.length <= 0}
              startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
              onClick={() => toggle_delete_dialog(true)}
              aria-label="Remove all study areas">
              Remove All
            </Button>
          </Box>
        </Box>
      </Toolbar>

      <LeafletMapContainer
        id={map_id}
        data-testid={`leaflet-${map_id}`}
        center={MAP_DEFAULT_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        style={{ height: 500 }}
        maxZoom={17}
        fullscreenControl={true}
        scrollWheelZoom={false}>
        <MapBaseCss />

        {/* Allow scroll wheel zoom when in full screen mode */}
        <FullScreenScrollingEventHandler bounds={updatedBounds} scrollWheelZoom={false} />

        {/* Programmatically set map bounds */}
        <SetMapBounds bounds={updatedBounds} />

        <FeatureGroup data-id="draw-control-feature-group" key="draw-control-feature-group">
          <DrawControls
            ref={draw_controls_ref}
            options={{
              // Always disable circle, circlemarker and line
              draw: { circle: false, circlemarker: false, polyline: false }
            }}
            onLayerAdd={onLayerAdd}
            onLayerEdit={(event: DrawEvents.Edited) => {
              event.layers.getLayers().forEach((item) => {
                const layer_id = L.stamp(item);
                const featureCollection = L.layerGroup([item]).toGeoJSON() as FeatureCollection;
                const updatedBounds = values.bounds.map((bound) => {
                  if (bound.leaflet_id === layer_id) {
                    bound.geojson = [...featureCollection.features];
                  }
                  return bound;
                });
                setFieldValue('bounds', [...updatedBounds]);
              });
            }}
            onLayerDelete={(event: DrawEvents.Deleted) => {
              let boundsToFilter = values.bounds;
              event.layers.getLayers().forEach((item) => {
                const layer_id = L.stamp(item);
                boundsToFilter = boundsToFilter.filter((bound) => bound.leaflet_id !== layer_id);
              });
              setFieldValue('bounds', [...boundsToFilter]);
            }}
          />
        </FeatureGroup>

        {selectedRegion && (
          <WFSFeatureGroup
            typeName={selectedRegion.key}
            minZoom={7}
            featureKeyHandler={layerContentHandlers[selectedRegion.key].featureKeyHandler}
            popupContentHandler={layerContentHandlers[selectedRegion.key].popupContentHandler}
            existingGeometry={[]}
            onSelectGeometry={(geo: Feature) => {
              const layerName = layerNameHandler[selectedRegion.key](geo);
              onSelectGeometry(geo, layerName);
            }}
          />
        )}
        <LayersControl position="bottomright">
          <StaticLayers
            layers={values.bounds
              .filter((bound) => !bound?.leaflet_id) // filter out user drawn bounds
              .map((bound) => {
                // Map geojson features into layer objects for leaflet
                return {
                  layerName: bound.name,
                  features: bound.geojson.map((geo) => ({
                    id: bound.uuid ?? v4(),
                    key: `study-area-${bound.uuid ?? v4()}`,
                    geoJSON: geo
                  }))
                };
              })}
          />
          <BaseLayerControls />
        </LayersControl>
      </LeafletMapContainer>
    </>
  );
};
