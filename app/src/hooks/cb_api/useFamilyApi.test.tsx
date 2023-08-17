import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { Critter } from 'features/surveys/view/survey-animals/animal';
import { v4 } from 'uuid';
import { useFamilyApi } from './useFamilyApi';

describe('useFamily', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  const family = {
    family_id: v4(),
    family_label: 'fam'
  }

  const immediateFamily = {
    parents: [],
    children: []
  }

  it('should return a list of families', async () => {
    mock.onGet('/api/family').reply(200, [family]);
    const result = await useFamilyApi(axios).getAllFamilies();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0].family_id).toBeDefined();
  });

  it('should return an immediate family by id', async () => {
    const familyId = v4();
    mock.onGet('/api/family/' + familyId).reply(200, immediateFamily);
    const result = await useFamilyApi(axios).getImmediateFamily(familyId);
    expect(Array.isArray(result.parents));
    expect(Array.isArray(result.children));
  });

});