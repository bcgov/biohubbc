import { GetAccessRequestListItem } from './useAdminApi.interface';

describe('GetAccessRequestListItem', () => {
  describe('Null obj provided', () => {
    let data: GetAccessRequestListItem;

    beforeAll(() => {
      data = new GetAccessRequestListItem(null);
    });

    it('set id', () => {
      expect(data.id).toEqual(null);
    });

    it('set status', () => {
      expect(data.status).toEqual(null);
    });

    it('set status_name', () => {
      expect(data.status_name).toEqual(null);
    });

    it('set description', () => {
      expect(data.description).toEqual(null);
    });

    it('set notes', () => {
      expect(data.notes).toEqual(null);
    });

    it('set data', () => {
      expect(data.data).toEqual(null);
    });

    it('set create_date', () => {
      expect(data.create_date).toEqual(null);
    });

    it('set name', () => {
      expect(data.name).toEqual(null);
    });

    it('set username', () => {
      expect(data.username).toEqual(null);
    });

    it('set company', () => {
      expect(data.company).toEqual(null);
    });

    it('set regional_offices', () => {
      expect(data.regional_offices).toEqual([]);
    });
  });

  describe('Empty obj provided', () => {
    let data: GetAccessRequestListItem;

    beforeAll(() => {
      data = new GetAccessRequestListItem({});
    });

    it('set id', () => {
      expect(data.id).toEqual(null);
    });

    it('set status', () => {
      expect(data.status).toEqual(null);
    });

    it('set status_name', () => {
      expect(data.status_name).toEqual(null);
    });

    it('set description', () => {
      expect(data.description).toEqual(null);
    });

    it('set notes', () => {
      expect(data.notes).toEqual(null);
    });

    it('set data', () => {
      expect(data.data).toEqual(null);
    });

    it('set create_date', () => {
      expect(data.create_date).toEqual(null);
    });

    it('set name', () => {
      expect(data.name).toEqual(null);
    });

    it('set username', () => {
      expect(data.username).toEqual(null);
    });

    it('set company', () => {
      expect(data.company).toEqual(null);
    });

    it('set regional_offices', () => {
      expect(data.regional_offices).toEqual([]);
    });
  });

  describe('Valid obj provided with null data', () => {
    let data: GetAccessRequestListItem;

    beforeAll(() => {
      data = new GetAccessRequestListItem({
        id: 1,
        status: 2,
        status_name: 'Rejected',
        description: 'test description',
        notes: 'test notes',
        data: null,
        create_date: '2020-04-20'
      });
    });

    it('set id', () => {
      expect(data.id).toEqual(1);
    });

    it('set status', () => {
      expect(data.status).toEqual(2);
    });

    it('set status_name', () => {
      expect(data.status_name).toEqual('Rejected');
    });

    it('set description', () => {
      expect(data.description).toEqual('test description');
    });

    it('set notes', () => {
      expect(data.notes).toEqual('test notes');
    });

    it('set data', () => {
      expect(data.data).toEqual(null);
    });

    it('set create_date', () => {
      expect(data.create_date).toEqual('2020-04-20');
    });

    it('set name', () => {
      expect(data.name).toEqual(null);
    });

    it('set username', () => {
      expect(data.username).toEqual(null);
    });

    it('set company', () => {
      expect(data.company).toEqual(null);
    });

    it('set regional_offices', () => {
      expect(data.regional_offices).toEqual([]);
    });
  });

  describe('Valid obj provided with empty data', () => {
    let data: GetAccessRequestListItem;

    beforeAll(() => {
      data = new GetAccessRequestListItem({
        id: 1,
        status: 2,
        status_name: 'Rejected',
        description: 'test description',
        notes: 'test notes',
        data: '',
        create_date: '2020-04-20'
      });
    });

    it('set id', () => {
      expect(data.id).toEqual(1);
    });

    it('set status', () => {
      expect(data.status).toEqual(2);
    });

    it('set status_name', () => {
      expect(data.status_name).toEqual('Rejected');
    });

    it('set description', () => {
      expect(data.description).toEqual('test description');
    });

    it('set notes', () => {
      expect(data.notes).toEqual('test notes');
    });

    it('set data', () => {
      expect(data.data).toEqual(null);
    });

    it('set create_date', () => {
      expect(data.create_date).toEqual('2020-04-20');
    });

    it('set name', () => {
      expect(data.name).toEqual(null);
    });

    it('set username', () => {
      expect(data.username).toEqual(null);
    });

    it('set company', () => {
      expect(data.company).toEqual(null);
    });

    it('set regional_offices', () => {
      expect(data.regional_offices).toEqual([]);
    });
  });

  describe('Valid obj provided with valid data', () => {
    let data: GetAccessRequestListItem;

    let jsonDataString: string;

    beforeAll(() => {
      jsonDataString = JSON.stringify({
        name: 'test name',
        username: 'test username',
        company: 'test company',
        regional_offices: ['office 1', 'office 2']
      });

      data = new GetAccessRequestListItem({
        id: 1,
        status: 2,
        status_name: 'Rejected',
        description: 'test description',
        notes: 'test notes',
        data: jsonDataString,
        create_date: '2020-04-20'
      });
    });

    it('set id', () => {
      expect(data.id).toEqual(1);
    });

    it('set status', () => {
      expect(data.status).toEqual(2);
    });

    it('set status_name', () => {
      expect(data.status_name).toEqual('Rejected');
    });

    it('set description', () => {
      expect(data.description).toEqual('test description');
    });

    it('set notes', () => {
      expect(data.notes).toEqual('test notes');
    });

    it('set data', () => {
      expect(data.data).toEqual(jsonDataString);
    });

    it('set create_date', () => {
      expect(data.create_date).toEqual('2020-04-20');
    });

    it('set name', () => {
      expect(data.name).toEqual('test name');
    });

    it('set username', () => {
      expect(data.username).toEqual('test username');
    });

    it('set company', () => {
      expect(data.company).toEqual('test company');
    });

    it('set regional_offices', () => {
      expect(data.regional_offices).toEqual(['office 1', 'office 2']);
    });
  });
});
