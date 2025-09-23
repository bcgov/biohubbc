import { mdiMapMarker, mdiVectorLine, mdiVectorSquare } from '@mdi/js';

export const getSamplingSiteIcon = (geometry: 'Point' | 'LineString' | 'Polygon') => {
  let icon;
  if (geometry === 'Point') {
    icon = { path: mdiMapMarker, title: 'Point sampling site' };
  } else if (geometry === 'LineString') {
    icon = { path: mdiVectorLine, title: 'Transect sampling site' };
  } else {
    icon = { path: mdiVectorSquare, title: 'Polygon sampling site' };
  }
  return icon;
};
