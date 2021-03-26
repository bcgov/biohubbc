import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-view-update');

/**
 * Processes GET /project/{projectId} species data
 *
 * @export
 * @class GetSpeciesData
 */
export class GetSpeciesData {
  focal_species: string[];
  ancillary_species: string[];

  constructor(focal_species?: any[], ancillary_species?: any[]) {
    defaultLog.debug({ label: 'GetSpeciesData', message: 'params', focal_species, ancillary_species });

    this.focal_species = (focal_species?.length && focal_species.map((item: any) => item.name)) || [];
    this.ancillary_species = (ancillary_species?.length && ancillary_species.map((item: any) => item.name)) || [];
  }
}
