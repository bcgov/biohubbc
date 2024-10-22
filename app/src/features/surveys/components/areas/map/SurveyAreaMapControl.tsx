import { mdiShapePolygonPlus, mdiTrashCanOutline, mdiTrayArrowUp, mdiViewGridPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
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
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { DrawEvents, LatLngBoundsExpression, PathOptions } from 'leaflet';
import { useEffect, useState } from 'react';
import { FeatureGroup, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { shapeFileFeatureDesc, shapeFileFeatureName } from 'utils/Utils';
import { v4 } from 'uuid';
import { ISurveyLocationForm } from '../SurveyAreaFormContainer';

export interface ISurveyAreMapControlProps {
  map_id: string;
  formik_props: FormikContextType<ISurveyLocationForm>;
  draw_controls_bounds_ref: React.RefObject<IDrawControlsRef>;
  draw_controls_blocks_ref: React.RefObject<IDrawControlsRef>;
  toggle_delete_dialog: (isOpen: boolean) => void;
  onLayerAdd: (event: DrawEvents.Created, id: number) => void;
  onLayerEdit: (event: DrawEvents.Edited) => void;
  onLayerDelete: (event: DrawEvents.Deleted) => void;
  onSelectGeometry: (geo: Feature, layerName: string) => void;
  // Style for the draw controls
  drawStyle?: { blocks: PathOptions; bounds: PathOptions };
}

export const SurveyAreaMapControl = (props: ISurveyAreMapControlProps) => {
  const {
    map_id,
    formik_props,
    draw_controls_bounds_ref,
    draw_controls_blocks_ref,
    toggle_delete_dialog,
    onLayerAdd,
    onLayerEdit,
    onLayerDelete,
    onSelectGeometry,
    drawStyle
  } = props;
  const { setFieldValue, setFieldError, values } = formik_props;
  const [updatedBounds, setUpdatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  // BOUNDS
  const [isBoundsOpen, setIsBoundsOpen] = useState(false);
  // BLOCKS
  const [isBlocksOpen, setIsBlocksOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<IRegionOption | null>(null);
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [isDrawingBoundsEnabled, setIsDrawingBoundsEnabled] = useState(false);
  const [isDrawingBlocksEnabled, setIsDrawingBlocksEnabled] = useState(false);

  useEffect(() => {
    if (formik_props.values.locations.length) {
      setUpdatedBounds(calculateUpdatedMapBounds(formik_props.values.locations.map((item) => item.geojson[0])));
    }
    if (formik_props.values.blocks.length) {
      setUpdatedBounds(calculateUpdatedMapBounds(formik_props.values.blocks.map((item) => item.geojson[0])));
    }
  }, [formik_props.values.locations, formik_props.values.blocks]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStartDrawingBounds = () => {
    setIsDrawingBoundsEnabled(true);
    const drawControl = draw_controls_bounds_ref.current;
    if (drawControl && drawControl.enablePolygonDrawing) {
      drawControl.enablePolygonDrawing();
    }
  };

  const handleStartDrawingBlocks = () => {
    setIsDrawingBlocksEnabled(true);
    const drawControl = draw_controls_blocks_ref.current;
    if (drawControl && drawControl.enablePolygonDrawing) {
      drawControl.enablePolygonDrawing();
    }
  };

  const handleFinishDrawingBounds = () => {
    setIsDrawingBoundsEnabled(false);
    const drawControl = draw_controls_bounds_ref.current;
    if (drawControl && drawControl.disablePolygonDrawing) {
      drawControl.disablePolygonDrawing();
    }
  };

  const handleFinishDrawingBlocks = () => {
    setIsDrawingBlocksEnabled(false);
    const drawControl = draw_controls_blocks_ref.current;
    if (drawControl && drawControl.disablePolygonDrawing) {
      drawControl.disablePolygonDrawing();
    }
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
          setFieldValue('locations', [...values.locations, ...formData]);
        }}
        onFailure={(message) => {
          setFieldError('locations', message);
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
          setFieldValue('blocks', [...values.blocks, ...formData]);
        }}
        onFailure={(message) => {
          setFieldError('blocks', message);
        }}
      />

      <Toolbar
        disableGutters
        sx={{
          px: 2,
          justifyContent: 'space-between'
        }}>
        <Stack direction="row" gap={1}>
          {isDrawingBoundsEnabled ? (
            <Button
              color="primary"
              variant="outlined"
              data-testid="boundary_file-upload"
              startIcon={<Icon path={mdiShapePolygonPlus} size={1} />}
              onClick={handleFinishDrawingBounds}>
              Finish Drawing
            </Button>
          ) : (
            <Button
              color="primary"
              variant="outlined"
              disabled={isDrawingBlocksEnabled}
              data-testid="boundary_file-upload"
              startIcon={<Icon path={mdiShapePolygonPlus} size={1} />}
              onClick={handleStartDrawingBounds}>
              Draw Bound
            </Button>
          )}
          {isDrawingBlocksEnabled ? (
            <Button
              color="primary"
              variant="outlined"
              data-testid="boundary_file-upload"
              startIcon={<Icon path={mdiViewGridPlus} size={1} />}
              onClick={handleFinishDrawingBlocks}>
              Finish Drawing
            </Button>
          ) : (
            <Button
              color="primary"
              variant="outlined"
              disabled={isDrawingBoundsEnabled}
              data-testid="boundary_file-upload"
              startIcon={<Icon path={mdiViewGridPlus} size={1} />}
              onClick={handleStartDrawingBlocks}>
              Draw Block
            </Button>
          )}
        </Stack>
        <Box display="flex">
          <Button
            color="primary"
            variant="contained"
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
              disabled={values.locations.length <= 0}
              startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
              onClick={() => toggle_delete_dialog(true)}
              aria-label="Remove all survey areas">
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
        drawControl={false}
        maxZoom={17}
        fullscreenControl={true}
        scrollWheelZoom={false}>
        <MapBaseCss />

        {/* Allow scroll wheel zoom when in full screen mode */}
        <FullScreenScrollingEventHandler bounds={updatedBounds} scrollWheelZoom={false} />

        {/* Programmatically set map bounds */}
        <SetMapBounds bounds={updatedBounds} />

        {/* Bounds feature group for drawing */}
        <FeatureGroup data-id="draw-control-bounds-feature-group" key="draw-control-bounds-feature-group">
          <DrawControls
            ref={draw_controls_bounds_ref}
            options={{
              // Always disable circle, circlemarker and line
              draw: { circle: false, circlemarker: false, polyline: false },
              style: drawStyle?.bounds,
              toolbar: false
            }}
            onLayerAdd={onLayerAdd}
            onLayerEdit={onLayerEdit}
            onLayerDelete={onLayerDelete}
          />
        </FeatureGroup>

        {/* Blocks feature group for drawing */}
        <FeatureGroup data-id="draw-control-blocks-feature-group" key="draw-control-blocks-feature-group">
          <DrawControls
            ref={draw_controls_blocks_ref}
            options={{
              draw: { circle: false, circlemarker: false, polyline: false },
              style: drawStyle?.blocks,
              toolbar: false
            }}
            onLayerAdd={onLayerAdd}
            onLayerEdit={onLayerEdit}
            onLayerDelete={onLayerDelete}
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
            layers={[
              ...values.locations
                .filter((bound) => !bound?.leaflet_id) // filter out user drawn bounds
                .map((bound) => {
                  // Map geojson features into layer objects for leaflet
                  return {
                    layerName: bound.name,
                    features: bound.geojson.map((geo) => ({
                      id: bound.uuid ?? v4(),
                      key: `study-location-${bound.uuid ?? v4()}`,
                      geoJSON: geo
                    })),
                    layerOptions: {
                      color: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR,
                      fillColor: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR,
                      weight: 2,
                      opacity: 0.8
                    }
                  };
                }),
              ...values.blocks
                .filter((block) => !block?.leaflet_id) // filter out user drawn blocks
                .map((block) => {
                  // Map geojson features into layer objects for leaflet
                  return {
                    layerName: block.name,
                    features: block.geojson.map((geo) => ({
                      id: block.uuid ?? v4(),
                      key: `block-${block.uuid ?? v4()}`,
                      geoJSON: geo
                    })),
                    layerOptions: {
                      color: SURVEY_MAP_LAYER_COLOURS.BLOCKS_COLOUR,
                      fillColor: SURVEY_MAP_LAYER_COLOURS.BLOCKS_COLOUR,
                      weight: 2,
                      opacity: 0.75
                    }
                  };
                })
            ]}
          />
          <BaseLayerControls />
        </LayersControl>
      </LeafletMapContainer>
    </>
  );
};
