import { AxiosError } from 'axios';
import { APIError } from './useAxios';

describe('useAxios', () => {
  it('assigns all values correctly', () => {
    const error = {
      name: 'error name',
      message: 'error message',
      response: { status: 500, data: { errors: ['some errors'] } },
      config: {
        baseURL: 'localhost',
        url: '/test'
      },
      request: {
        responseURL: 'localhost/test-error'
      }
    } as Partial<AxiosError>;

    const apiError = new APIError((error as unknown) as AxiosError);

    expect(apiError).not.toBe(null);

    expect(apiError.name).toEqual('error name');
    expect(apiError.message).toEqual('error message');
    expect(apiError.status).toEqual(500);
    expect(apiError.errors).toEqual(['some errors']);
    expect(apiError.requestURL).toEqual('localhost/test');
    expect(apiError.responseURL).toEqual('localhost/test-error');
  });
});
