import { LatLngBoundsExpression } from 'leaflet';
import { useMap } from 'react-leaflet';

export interface IFullScreenScrollingEventHandlerProps {
  /**
   * Whether or not scroll wheel zooming is enabled.
   *
   * Usage:
   * - If `true`, scroll wheel zooming will always be enabled regardless of mode.
   * - If `false`, scroll wheel zooming will only be enabled in full screen mode.
   *
   * @type {boolean}
   * @memberof IFullScreenScrollingEventHandlerProps
   */
  scrollWheelZoom?: boolean;
  /**
   * Bounds to set when exiting full screen mode.
   *
   * @type {LatLngBoundsExpression}
   * @memberof IFullScreenScrollingEventHandlerProps
   */
  bounds?: LatLngBoundsExpression;
}

/**
 * Special event handler that triggers when the map enters and exists full screen mode.
 *
 * @param {*} props
 * @return {*}
 */
const FullScreenScrollingEventHandler: React.FC<React.PropsWithChildren<IFullScreenScrollingEventHandlerProps>> = (
  props
) => {
  const map = useMap();

  if (props.scrollWheelZoom) {
    map.scrollWheelZoom.enable();
  } else {
    map.scrollWheelZoom.disable();
  }

  map.on('fullscreenchange', function () {
    if (map.isFullscreen()) {
      if (!props.scrollWheelZoom) {
        // don't change scroll wheel zoom settings if it was enabled by default via props
        map.scrollWheelZoom.enable();
      }
    } else {
      if (!props.scrollWheelZoom) {
        // don't change scroll wheel zoom settings if it was enabled by default via props
        map.scrollWheelZoom.disable();
      }

      if (props.bounds) {
        // reset bounds, if provided, on exit fullscreen
        map.fitBounds(props.bounds);
      }
    }
  });

  return null;
};

export default FullScreenScrollingEventHandler;
