import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet/dist/leaflet.css';

/**
 * This component exists to keep the leaflet map container css/ changes required for each map container to render properly.
 * This component can be added to each map container as a child to bring along these imports to allow:
 *  icons to render properly
 *  the full screen button to render when the `fullscreenControl` is true
 */
export const MapBaseCss = () => <></>;
