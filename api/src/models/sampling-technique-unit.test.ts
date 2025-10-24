import { expect } from 'chai';
import { describe } from 'mocha';
import { PostSampleTechniqueToBiohubObject } from '../models/biohub-create';

describe('PostSampleTechniqueToBiohubObject Unit Test', () => {
  it('should create sampling technique object with correct properties', () => {
    const samplingTechniqueRecord = {
      method_technique_id: 123,
      method_name: 'Camera Trapping',
      description: 'Wildlife camera deployed for monitoring',
      method_lookup_name: 'Camera Survey',
      attractants: 'Scent lure;Bait station',
      distance_threshold: 50.0,
      response_metric: 'Count',
      attrib_data: [
        { ah: 'Duration', av: '30 days' },
        { ah: 'Flash Type', av: 'Infrared' }
      ],
      vantage_data: [{ vh: 'Ground', vv: 'Stationary mount' }]
    };

    const techniqueObj = new PostSampleTechniqueToBiohubObject(samplingTechniqueRecord, 0);

    expect(techniqueObj.id).to.equal('sample-technique-123');
    expect(techniqueObj.type).to.equal('sample_technique');
    expect(techniqueObj.properties.name).to.equal('Camera Trapping');
    expect(techniqueObj.properties.description).to.equal('Wildlife camera deployed for monitoring');
    expect(techniqueObj.properties.method_name).to.equal('Camera Survey');
    expect(techniqueObj.properties.attractant).to.equal('Scent lure;Bait station');
    expect(techniqueObj.child_features).to.be.an('array').with.length(0);
  });
});
