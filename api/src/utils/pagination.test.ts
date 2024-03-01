import { expect } from 'chai';
import { Request } from 'express';
import { describe } from 'mocha';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { ensureCompletePaginationOptions, makePaginationOptionsFromRequest, makePaginationResponse } from './pagination';

describe('pagination', () => {
  describe('makePaginationOptionsFromRequest', () => {
    it('should return undefined options if the corresponding request params are undefined', () => {
      const mockRequst = {
        query: {}
      } as Request;

      const result = makePaginationOptionsFromRequest(mockRequst);
      expect(result).to.eql({
        limit: undefined,
        page: undefined,
        sort: undefined,
        order: undefined
      });
    });

    it('should cast request params to number successfully', () => {
      const mockRequst = ({
        query: {
          limit: '100',
          page: '2',
          sort: 'name',
          order: 'desc'
        }
      } as unknown) as Request;

      const result = makePaginationOptionsFromRequest(mockRequst);
      expect(result).to.eql({
        limit: 100,
        page: 2,
        sort: 'name',
        order: 'desc'
      });
    });
  });

  describe('makePaginationResponse', () => {
    it('should successfully coerce undefined params', () => {
      const mockPagination: Partial<ApiPaginationOptions> = {
        limit: undefined,
        page: undefined,
        sort: undefined,
        order: undefined
      };

      const result = makePaginationResponse(101, mockPagination);
      expect(result).to.eql({
        total: 101,
        per_page: 101,
        current_page: 1,
        last_page: 1,
        sort: undefined,
        order: undefined
      });
    });

    it('should successfully calculate last page given all defined params', () => {
      const mockPagination: Partial<ApiPaginationOptions> = {
        limit: 15,
        page: 3,
        sort: 'name',
        order: 'asc'
      };

      const result = makePaginationResponse(99, mockPagination);
      expect(result).to.eql({
        total: 99,
        per_page: 15,
        current_page: 3,
        last_page: 7,
        sort: 'name',
        order: 'asc'
      });
    });

    it('should successfully calculate last page given a total of zero records', () => {
      const mockPagination: Partial<ApiPaginationOptions> = {
        limit: 20,
        page: 1,
        sort: 'name',
        order: 'desc'
      };

      const result = makePaginationResponse(0, mockPagination);
      expect(result).to.eql({
        total: 0,
        per_page: 20,
        current_page: 1,
        last_page: 1,
        sort: 'name',
        order: 'desc'
      });
    });
  });

  describe('ensureCompletePaginationOptions', () => {
    it('should return undefined if limit is undefined', () => {
      const mockPagination: Partial<ApiPaginationOptions> = {
        limit: undefined,
        page: 1,
        sort: 'name',
        order: 'desc'
      };

      const result = ensureCompletePaginationOptions(mockPagination);
      expect(result).to.equal(undefined);
    });

    it('should return undefined if page is undefined', () => {
      const mockPagination: Partial<ApiPaginationOptions> = {
        limit: 15,
        page: undefined,
        sort: 'name',
        order: 'desc'
      };

      const result = ensureCompletePaginationOptions(mockPagination);
      expect(result).to.equal(undefined);
    });

    it('should return pagination if page and limit are defined', () => {
      it('should return undefined if limit is undefined', () => {
        const mockPagination: Partial<ApiPaginationOptions> = {
          limit: 15,
          page: 1,
          sort: 'name',
          order: 'desc'
        };

        const result = ensureCompletePaginationOptions(mockPagination);
        expect(result).to.eql({
          limit: 15,
          page: 1,
          sort: 'name',
          order: 'desc'
        });
      });
    });
  });
});
