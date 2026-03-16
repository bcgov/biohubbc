import { expect } from 'chai';
import { describe } from 'mocha';
import { PostSampleTechniqueToBiohubObject } from '../models/biohub-create';

describe('PostSampleTechniqueToBiohubObject Unit Test', () => {
  it('should create sampling technique object with correct properties', () => {
    const samplingTechniqueRecord = {
      method_technique_id: 123,
      method_name: 'Camera Trapping',
      description: 'Wildlife camera deployed for monitoring',
      method_lookup_id: 5,
      method_lookup_name: 'Camera Survey',
      method_response_metric_id: 1,
      attractants: 'Scent lure;Bait station',
      attractant_ids: [{ attractant_lookup_id: 3 }, { attractant_lookup_id: 7 }],
      distance_threshold: 50.0,
      response_metric: 'Count',
      attribute_data: [
        {
          attribute_header: 'Duration',
          attribute_value: '30 days',
          technique_attribute_qualitative_id: 'e0479006-f5ee-40cf-a33b-c1ffce393bf4',
          technique_attribute_qualitative_option_id: 20,
          technique_attribute_quantitative_id: null
        },
        {
          attribute_header: 'Flash Type',
          attribute_value: 'Infrared',
          technique_attribute_qualitative_id: 'a1599008-f7ff-42ef-c55d-e3ffef5a5df6',
          technique_attribute_qualitative_option_id: 21,
          technique_attribute_quantitative_id: null
        }
      ],
      vantage_data: [
        { vantage_header: 'Ground', vantage_value: 'Stationary mount', vantage_category_id: 1, vantage_id: 5 }
      ]
    };

    const techniqueObj = new PostSampleTechniqueToBiohubObject(samplingTechniqueRecord);

    expect(techniqueObj.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(techniqueObj.type).to.equal('sample_technique');
    expect(techniqueObj.properties.name).to.equal('Camera Trapping');
    expect(techniqueObj.properties.description).to.equal('Wildlife camera deployed for monitoring');
    expect(techniqueObj.properties.method_name).to.equal('code::method_lookup::5');
    expect(techniqueObj.properties.response_metric).to.equal('code::method_response_metric::1');
    expect(techniqueObj.properties.attractant).to.deep.equal([
      { attractant_name: 'code::attractant_lookup::3' },
      { attractant_name: 'code::attractant_lookup::7' }
    ]);
    expect(techniqueObj.properties.method_attribute).to.equal(
      'code::technique_attribute_qualitative::e0479006-f5ee-40cf-a33b-c1ffce393bf4'
    );
    expect(techniqueObj.properties.method_value).to.equal('code::technique_attribute_qualitative_option::20');
    expect(techniqueObj.properties.vantage_method_attribute).to.equal('code::vantage_category::1');
    expect(techniqueObj.properties.vantage_method_value).to.equal('code::vantage::5');
    expect(techniqueObj.child_features).to.be.an('array').with.length(0);
  });
});
