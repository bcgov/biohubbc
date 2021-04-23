import { cleanup } from '@testing-library/react';
import { useBiohubApi } from 'hooks/useBioHubApi';

jest.mock('./useBioHubApi');
const mockUseBiohubApi = {
  user: {
    getUser: jest.fn()
  }
};

const mockBiohubApi = ((useBiohubApi as unknown) as jest.Mock<typeof mockUseBiohubApi>).mockReturnValue(
  mockUseBiohubApi
);

describe('AttachmentsList', () => {
  beforeEach(() => {
    // clear mocks before each test
    mockBiohubApi().user.getUser.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('', () => {});
});
