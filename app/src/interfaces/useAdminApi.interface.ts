export interface IGetAccessRequestsListResponse {
  id: number;
  status: number;
  status_name: string;
  description: string;
  notes: string;
  data: string;
  create_date: string;
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
  data: string;
  create_date: string;

  // Fields parsed from `data`
  name: string;
  username: string;
  company: string;
  regional_offices: string[];

  constructor(obj?: any) {
    this.id = obj?.id || null;
    this.status = obj?.status || null;
    this.status_name = obj?.status_name || null;
    this.description = obj?.description || null;
    this.notes = obj?.notes || null;
    this.data = obj?.data || null;
    this.create_date = obj?.create_date || null;

    const dataObject = (this.data && JSON.parse(this.data)) || null;

    this.name = dataObject?.name || null;
    this.username = dataObject?.username || null;
    this.company = dataObject?.company || null;
    this.regional_offices = (dataObject?.regional_offices?.length && dataObject.regional_offices) || [];
  }
}
