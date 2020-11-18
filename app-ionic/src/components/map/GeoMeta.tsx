import { Color } from '@material-ui/lab';
import { DocType } from 'constants/database';
import { Feature } from 'geojson';
import { FunctionComponent } from 'react';

export enum MapContext {
  MAIN_MAP = 'main_map'
}

// MW:
// try to keep this agnostic to map lib, I'd like to make a Cesiumjs version of the MapContainer.
export interface interactiveGeoInputData {
  //meta:
  //mapContext: MapContext;
  recordDocID: string;
  recordDocType: DocType;
  description: string;

  // basic display:
  geometry: Feature;
  colour: Color;
  zIndex: number;

  // interactive
  onClickCallback: Function; //try to get this one workign first
  //isSelected?: boolean;

  markerComponent?: FunctionComponent;
  //showMarkerAtZoom?: number;
  //showMarker: boolean;

  popUpComponent?: HTMLElement;
  //showPopUp: boolean;
}
