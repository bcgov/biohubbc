import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';
// Custom CSS to fix a display issue in Chrome
// Chrome has a built in css rule for adding focus borders around items that have been clicked
// This was displaying a large black outline on map elements that had been clicked
// More details on the issue at this link: https://gis.stackexchange.com/questions/447502/prevent-leaflet-map-from-showing-rectangle-around-layer-on-click
import './MapBase.scss';

/**
 * This component exists to keep the leaflet map container css/ changes required for each map container to render properly.
 * This component can be added to each map container as a child to bring along these imports to allow:
 *  icons to render properly
 *  the full screen button to render when the `fullscreenControl` is true
 */
export const MapBaseCss = () => <></>;
