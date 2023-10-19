import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AnimalSex, Critter, IAnimal } from 'features/surveys/view/survey-animals/animal';
import { v4 } from 'uuid';
import { useCritterApi } from './useCritterApi';

describe('useCritterApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const mockId = v4();

  const mockCritter = {
    critter_id: mockId,
    wlh_id: '17-10748',
    animal_id: '6',
    sex: AnimalSex.FEMALE,
    taxon: 'Caribou',
    collection_units: [
      {
        category_name: 'Population Unit',
        unit_name: 'Itcha-Ilgachuz',
        collection_unit_id: '0284c4ca-a279-4135-b6ef-d8f4f8c3d1e6',
        collection_category_id: '9dcf05a8-9bfe-421b-b487-ce65299441ca'
      }
    ],
    mortality_timestamp: new Date()
  };

  /*it('should fetch an array of critter objects', async () => {
    mock.onGet('/api/critter-data/critters').reply(200, [mockCritter]);

    const result = await useCritterApi(axios).getAllCritters();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].critter_id).toBeDefined();
  });*/

  it('should fetch a single critter by id', async () => {
    mock.onGet('/api/critter-data/critters/' + mockId).reply(200, mockCritter);

    const result = await useCritterApi(axios).getCritterByID(mockId);
    expect(result.critter_id).toBe(mockId);
    expect(typeof result.wlh_id).toBe('string');
    expect(typeof result.sex).toBe('string');
    expect(typeof result.taxon).toBe('string');
    expect(Array.isArray(result.collection_units)).toBe(true);
    expect(typeof result.mortality_timestamp).toBe('string');
  });

  it('should create a critter in critterbase', async () => {
    const forCritter: IAnimal = {
      ...mockCritter,
      captures: [],
      markings: [],
      measurements: [],
      general: {
        taxon_id: mockCritter.taxon,
        animal_id: mockCritter.animal_id,
        taxon_name: 'Joe',
        wlh_id: 'a',
        sex: AnimalSex.MALE,
        critter_id: v4()
      },
      mortality: [],
      family: [],
      images: [],
      device: [],
      collectionUnits: []
    };
    const payload = new Critter(forCritter);

    mock.onPost('/api/critter-data/critters').reply(201, { count: 1 });

    const result = await useCritterApi(axios).createCritter(payload);
    expect(result.count).toBe(1);
  });
});
