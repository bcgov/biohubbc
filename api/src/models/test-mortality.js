import { PostSurveyMortalityToBiohubObject } from './biohub-create';

const mortalityWithFeatures = {
  mortality_id: 'test-mortality-1',
  mortality_timestamp: '2025-01-01T10:00:00.000Z',
  mortality_comment: 'Test mortality with features',
  markings: [
    {
      marking_id: 'test-marking-1',
      identifier: 'TEST-001',
      marking_type: 'Ear Tag',
      primary_colour: 'Red'
    }
  ],
  quantitative_measurements: [
    {
      measurement_quantitative_id: 'test-measurement-1',
      measurement_name: 'Weight',
      value: 75.0
    }
  ]
};

const mortalityObj = new PostSurveyMortalityToBiohubObject(mortalityWithFeatures);
console.log('Mortality ID:', mortalityObj.id);
console.log('Child features count:', mortalityObj.child_features.length);
console.log('Child feature types:', mortalityObj.child_features.map(f => f.type));

