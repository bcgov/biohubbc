import { expect } from 'chai';
import { describe } from 'mocha';
import { PostSampleTechniqueToBiohubObject } from '../models/biohub-create';

describe('Sampling Technique Features BioHub Integration', () => {
  describe('PostSampleTechniqueToBiohubObject', () => {
    it('should create sampling technique object with all properties', () => {
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

    it('should handle sampling technique with null values', () => {
      const samplingTechniqueRecord = {
        method_technique_id: 456,
        method_name: 'Visual Survey',
        description: null,
        method_lookup_name: 'Direct Observation',
        attractants: null,
        distance_threshold: null,
        response_metric: 'Presence/Absence',
        attrib_data: [],
        vantage_data: []
      };

      const techniqueObj = new PostSampleTechniqueToBiohubObject(samplingTechniqueRecord, 1);

      expect(techniqueObj.id).to.equal('sample-technique-456');
      expect(techniqueObj.type).to.equal('sample_technique');
      expect(techniqueObj.properties.name).to.equal('Visual Survey');
      expect(techniqueObj.properties.description).to.be.null;
      expect(techniqueObj.properties.method_name).to.equal('Direct Observation');
      expect(techniqueObj.properties.attractant).to.equal('');
      expect(techniqueObj.child_features).to.be.an('array').with.length(0);
    });

    it('should handle sampling technique with empty attractants string', () => {
      const samplingTechniqueRecord = {
        method_technique_id: 789,
        method_name: 'Acoustic Monitoring',
        description: 'Passive acoustic monitoring for species identification',
        method_lookup_name: 'Acoustic Survey',
        attractants: '',
        distance_threshold: 100.0,
        response_metric: 'Detection Rate',
        attrib_data: [{ ah: 'Frequency Range', av: '20-20000 Hz' }],
        vantage_data: [{ vh: 'Arboreal', vv: 'Tree mount' }]
      };

      const techniqueObj = new PostSampleTechniqueToBiohubObject(samplingTechniqueRecord, 2);

      expect(techniqueObj.id).to.equal('sample-technique-789');
      expect(techniqueObj.type).to.equal('sample_technique');
      expect(techniqueObj.properties.name).to.equal('Acoustic Monitoring');
      expect(techniqueObj.properties.description).to.equal('Passive acoustic monitoring for species identification');
      expect(techniqueObj.properties.method_name).to.equal('Acoustic Survey');
      expect(techniqueObj.properties.attractant).to.equal('');
      expect(techniqueObj.child_features).to.be.an('array').with.length(0);
    });
  });
});
