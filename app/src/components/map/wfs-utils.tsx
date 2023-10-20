import { Feature } from 'geojson';

export const layerContentHandlers: Record<string, any> = {
  'pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW': {
    featureKeyHandler: (feature: Feature) => feature?.properties?.OBJECTID,
    popupContentHandler: (feature: Feature) => {
      if (!feature || !feature.properties) {
        return { tooltip: 'Unparsable Feature', content: [] };
      }

      const tooltip = `${feature.properties.WILDLIFE_MGMT_UNIT_ID} - ${feature.properties.GAME_MANAGEMENT_ZONE_ID} - ${feature.properties.GAME_MANAGEMENT_ZONE_NAME}`;

      const content = (
        <>
          <div
            key={`${feature.id}-management-unit-id`}>{`Wildlife Management Unit: ${feature.properties.WILDLIFE_MGMT_UNIT_ID}`}</div>
          <div
            key={`${feature.id}-game-management-zone-id`}>{`Game Management Zone: ${feature.properties.GAME_MANAGEMENT_ZONE_ID}`}</div>
          <div
            key={`${feature.id}-game-management-zone-name`}>{`Game Management Zone Name: ${feature.properties.GAME_MANAGEMENT_ZONE_NAME}`}</div>
          <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
            0
          )} ha`}</div>
        </>
      );

      return { tooltip, content };
    }
  },
  'pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW': {
    featureKeyHandler: (feature: Feature) => feature?.properties?.OBJECTID,
    popupContentHandler: (feature: Feature) => {
      if (!feature || !feature.properties) {
        return { tooltip: 'Unparsable Feature', content: [] };
      }

      const tooltip = `${feature.properties.PROTECTED_LANDS_NAME} - ${feature.properties.PROTECTED_LANDS_DESIGNATION}`;

      const content = (
        <>
          <div key={`${feature.id}-lands-name`}>{`Lands Name: ${feature.properties.PROTECTED_LANDS_NAME}`}</div>
          <div
            key={`${feature.id}-lands-designation`}>{`Lands Designation: ${feature.properties.PROTECTED_LANDS_DESIGNATION}`}</div>
          <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
            0
          )} ha`}</div>
        </>
      );

      return { tooltip, content };
    }
  },
  'pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG': {
    featureKeyHandler: (feature: Feature) => feature?.properties?.OBJECTID,
    popupContentHandler: (feature: Feature) => {
      if (!feature || !feature.properties) {
        return { tooltip: 'Unparsable Feature', content: [] };
      }

      const tooltip = feature.properties.REGION_NAME;

      const content = (
        <>
          <div key={`${feature.id}-region`}>{`Region Name: ${feature.properties.REGION_NAME}`}</div>
          <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
            0
          )} ha`}</div>
        </>
      );

      return { tooltip, content };
    }
  }
};
