import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import useDraftApi from './useDraftApi';

describe('useDraftApi', () => {
  let mock: any;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('createDraft works as expected', async () => {
    mock.onPost('/api/draft/create').reply(200, {
      webform_draft_id: 1,
      create_date: '2020/04/04'
    });

    const result = await useDraftApi(axios).createDraft('draftName', null);

    expect(result.webform_draft_id).toEqual(1);
    expect(result.create_date).toEqual('2020/04/04');
  });

  it('updateDraft works as expected', async () => {
    mock.onPut('/api/draft/1/update').reply(200, {
      webform_draft_id: 1,
      create_date: '2020/04/04',
      update_date: '2023/06/28'
    });

    const result = await useDraftApi(axios).updateDraft(1, 'draftName', null);

    expect(result.webform_draft_id).toEqual(1);
    expect(result.update_date).toEqual('2023/06/28');
  });

  it('getDraftsList works as expected', async () => {
    mock.onGet('/api/draft/list').reply(200, [
      {
        webform_draft_id: 1,
        name: 'draft 1'
      },
      {
        webform_draft_id: 2,
        name: 'draft 2'
      }
    ]);

    const result = await useDraftApi(axios).getDraftsList();

    expect(result[0].webform_draft_id).toEqual(1);
    expect(result[0].name).toEqual('draft 1');
    expect(result[1].webform_draft_id).toEqual(2);
    expect(result[1].name).toEqual('draft 2');
  });

  it('getDraft works as expected', async () => {
    const draftId = 1;

    mock.onGet(`/api/draft/${draftId}/get`).reply(200, {
      id: 1,
      name: 'draft 1',
      data: { key: 'value' }
    });

    const result = await useDraftApi(axios).getDraft(draftId);

    expect(result.id).toEqual(1);
    expect(result.name).toEqual('draft 1');
    expect(result.data).toEqual({ key: 'value' });
  });

  it('deleteDraft works as expected', async () => {
    const draftId = 1;

    mock.onDelete(`/api/draft/${draftId}/delete`).reply(200, 1);

    const result = await useDraftApi(axios).deleteDraft(draftId);

    expect(result).toEqual(1);
  });
});
