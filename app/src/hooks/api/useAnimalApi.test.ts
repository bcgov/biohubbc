import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useAnimalApi from 'hooks/api/useAnimalApi';
import { IFindAnimalsResponse } from 'interfaces/useAnimalApi.interface';

describe('useAnimalApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('findAnimal works as expected', async () => {
    const mockResponse: IFindAnimalsResponse = {
      animals: [
        {
          wlh_id: null,
          animal_id: '123456',
          sex: 'unknown',
          itis_tsn: 123321,
          itis_scientific_name: 'scientific name',
          critter_comment: 'comment',
          critter_id: 2,
          survey_id: 1,
          critterbase_critter_id: '345-345-345'
        }
      ],
      pagination: {
        total: 100,
        current_page: 2,
        last_page: 4,
        per_page: 25
      }
    };

    mock.onGet('/api/animal', { params: { limit: 25, page: 2, itis_tsn: 12345 } }).reply(200, mockResponse);

    const result = await useAnimalApi(axios).findAnimals({ limit: 25, page: 2 }, { itis_tsn: 12345 });

    expect(result).toEqual(mockResponse);
  });
});
