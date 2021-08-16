import { envToNrmRegionsMapping, INonEditableGeometries } from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { getKeyByValue } from './Utils';

/**
 * Function to return an array of Features that are on the map regardless
 * of if they're non editable or editable (drawn/uploaded)
 *
 * @param {Feature[] | undefined} geometry
 * @param {INonEditableGeometries[] | undefined} nonEditableGeometries
 * @returns Feature[]
 */
export function determineMapGeometries(
  geometry: Feature[] | undefined,
  nonEditableGeometries: INonEditableGeometries[] | undefined
): Feature[] {
  if (geometry && geometry.length) {
    return geometry;
  }

  if (nonEditableGeometries) {
    return nonEditableGeometries.map((geo: INonEditableGeometries) => geo.feature);
  }

  return [];
}

/**
 * Gets the ENV region name based on the WMU GMZ ID
 *
 * @param {string} gmzId
 * @returns {string} env region name
 */
const getENVRegionByGMZ = (gmzId: string): string => {
  let env: string = '';

  if (gmzId.includes('1')) {
    env = '1- Vancouver Island';
  } else if (gmzId.includes('2')) {
    env = '2- Lower Mainland';
  } else if (gmzId.includes('3')) {
    env = '3- Thompson';
  } else if (gmzId.includes('4')) {
    env = '4- Kootenay';
  } else if (gmzId.includes('5')) {
    env = '5- Cariboo';
  } else if (gmzId.includes('6')) {
    env = '6- Skeena';
  } else if (gmzId.includes('7P')) {
    env = '9- Peace';
  } else if (gmzId.includes('7O')) {
    env = '7- Omineca';
  } else if (gmzId.includes('8')) {
    env = '8- Okanagan';
  }

  return env;
};

/**
 * Looks at a given projected geometry and determines if it is a known park/nrm/env/wmu layer and if so
 * adds it to the list of inferred layers to display to the user. Also, creates a list of layer types to
 * skip searching for based on when the layer info can be determined directly based on the geometry itself
 * (Open Maps API call is not required in this case)
 *
 * @param {any} projectedGeo
 * @param {any} prevLayersConfig
 * @returns {any} inferredLayersConfig
 */
export function getInferredLayersConfigByProjectedGeometry(projectedGeo: any, prevLayersConfig: any) {
  const currentLayersConfig = { ...prevLayersConfig };
  const geoId = projectedGeo.id as string;
  let layerTypesToSkip: string[] = [];

  if (geoId && geoId.includes('TA_PARK_ECORES_PA_SVW')) {
    currentLayersConfig.parksInfo.add(projectedGeo.properties?.PROTECTED_LANDS_NAME);

    layerTypesToSkip.push('pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW');
  }

  if (geoId && geoId.includes('ADM_NR_REGIONS_SPG')) {
    const nrm = projectedGeo.properties?.REGION_NAME;
    const env =
      nrm !== 'Thompson-Okanagan Natural Resource Region'
        ? [getKeyByValue(envToNrmRegionsMapping, nrm)]
        : ['3- Thompson', '8- Okanagan'];

    env.forEach((envRegion) => {
      if (envRegion) {
        currentLayersConfig.envInfo.add(envRegion);
      }
    });
    currentLayersConfig.nrmInfo.add(nrm);

    layerTypesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG');
    layerTypesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW');
  }

  if (geoId && geoId.includes('EADM_WLAP_REGION_BND_AREA_SVW')) {
    currentLayersConfig.envInfo.add(projectedGeo.properties?.REGION_NUMBER_NAME);
    currentLayersConfig.nrmInfo.add(envToNrmRegionsMapping[projectedGeo.properties?.REGION_NUMBER_NAME]);

    layerTypesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG');
    layerTypesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW');
  }

  if (geoId && geoId.includes('WAA_WILDLIFE_MGMT_UNITS_SVW')) {
    const gmzId = projectedGeo.properties?.GAME_MANAGEMENT_ZONE_ID;
    const env: string = getENVRegionByGMZ(gmzId);
    const nrm = envToNrmRegionsMapping[env];

    currentLayersConfig.nrmInfo.add(nrm);
    currentLayersConfig.envInfo.add(env);
    currentLayersConfig.wmuInfo.add(
      `${projectedGeo.properties?.WILDLIFE_MGMT_UNIT_ID}, ${gmzId}, ${projectedGeo.properties?.GAME_MANAGEMENT_ZONE_NAME}`
    );

    layerTypesToSkip.push('pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW');
    layerTypesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG');
    layerTypesToSkip.push('pub:WHSE_ADMIN_BOUNDARIES.EADM_WLAP_REGION_BND_AREA_SVW');
  }

  return {
    ...currentLayersConfig,
    layerTypesToSkip
  };
}

/**
 * Looks at a given feature returned from the WFS service API call and determines if it is a known park/nrm/env/wmu layer and if so
 * adds it to the list of inferred layers to display to the user.
 *
 * Performs some business logic to filter the env region based on the nrm region (1:1 mapping).
 *
 * Also filters the wmu layers based on the env region. This is because the mapping of env to wmu layers is not direct 1:1
 * ie; Omineca is env region 7 but Peace was split out to be env region 9, although when it comes to wmu layers - they are both GMZ ID 7
 * so Omineca is 7O and Peace is 7P (for wmu layer)
 *
 * @param {Feature} feature
 * @param {any} prevLayersConfig
 * @returns {any} currentLayersConfig
 */
export function getInferredLayersConfigByWFSFeature(feature: Feature, prevLayersConfig: any) {
  const currentLayersConfig = { ...prevLayersConfig };
  const featureId = feature.id as string;

  if (featureId.includes('TA_PARK_ECORES_PA_SVW')) {
    currentLayersConfig.parksInfo.add(feature.properties?.PROTECTED_LANDS_NAME);
  }

  if (featureId.includes('ADM_NR_REGIONS_SPG')) {
    currentLayersConfig.nrmInfo.add(feature.properties?.REGION_NAME);
  }

  if (featureId.includes('EADM_WLAP_REGION_BND_AREA_SVW')) {
    const nrmRegions = currentLayersConfig.nrmInfo as any;
    for (let nrm of nrmRegions) {
      const env = getKeyByValue(envToNrmRegionsMapping, nrm);

      if (env) {
        currentLayersConfig.envInfo.add(env);
      }
    }
  }

  if (featureId.includes('WAA_WILDLIFE_MGMT_UNITS_SVW')) {
    const gmzId = feature.properties?.GAME_MANAGEMENT_ZONE_ID;
    const envRegions = currentLayersConfig.envInfo as any;

    for (let env of envRegions) {
      if (
        (env[0] === '7' && gmzId.includes('7O')) ||
        (env[0] === '9' && gmzId.includes('7P')) ||
        (env[0] !== '7' && env[0] !== '9' && gmzId.includes(env[0]))
      ) {
        currentLayersConfig.wmuInfo.add(
          `${feature.properties?.WILDLIFE_MGMT_UNIT_ID}, ${gmzId}, ${feature.properties?.GAME_MANAGEMENT_ZONE_NAME}`
        );
      }
    }
  }

  return currentLayersConfig;
}
