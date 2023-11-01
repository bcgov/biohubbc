import L from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
/*
  Set react leaflet icon to leaflet images
  React leaflet does not have these images in their package https://stackoverflow.com/questions/49441600/react-leaflet-marker-files-not-found
*/
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow
});

/**
 * This component exists to keep the leaflet map container css/ changes required for each map container to render properly.
 * This component can be added to each map container as a child to bring along these imports to allow:
 *  icons to render properly
 *  the full screen button to render when the `fullscreenControl` is true
 */
export const MapBaseCss = () => <></>;
