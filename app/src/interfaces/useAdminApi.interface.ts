export interface IAccessRequestDataObject {
  name: string;
  username: string;
  identitySource: string;
  company: string;
  regional_offices: string[];
}

export interface IGetAccessRequestsListResponse {
  id: number;
  status: number;
  status_name: string;
  description: string;
  notes: string;
  create_date: string;

  data: IAccessRequestDataObject;
}

/**
 * Parses the data from a IGetAccessRequestsListResponse item.
 *
 * @export
 * @class GetAccessRequestListItem
 * @implements {IGetAccessRequestsListResponse}
 */
export class GetAccessRequestListItem implements IGetAccessRequestsListResponse {
  id: number;
  status: number;
  status_name: string;
  description: string;
  notes: string;
  create_date: string;

  data: IAccessRequestDataObject;

  constructor(obj?: any) {
    this.id = obj?.id || null;
    this.status = obj?.status || null;
    this.status_name = obj?.status_name || null;
    this.description = obj?.description || null;
    this.notes = obj?.notes || null;
    this.create_date = obj?.create_date || null;

    this.data = obj?.data && {
      name: obj.data?.name || null,
      username: obj.data?.username || null,
      identitySource: obj.data?.identitySource || null,
      company: obj.data?.company || null,
      regional_offices: (obj.data?.regional_offices?.length && obj.data.regional_offices) || []
    };
  }
}
