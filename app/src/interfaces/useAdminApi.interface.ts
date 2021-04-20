export interface IGetAccessRequestsListResponse {
  id: number;
  status: string;
  status_name: string;
  description: string;
  notes: string;
  data: object;
  create_date: string;
}

/**
 * Parses the data from a IGetAccessRequestsListResponse item.
 *
 * @export
 * @class GetAccessRequestListItem
 */
export class GetAccessRequestListItem {
  id: number;
  status: number;
  status_name: string;
  description: string;
  notes: string;
  create_date: string;

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
    this.create_date = obj?.create_date || null;

    this.name = obj?.data?.name || null;
    this.username = obj?.data?.username || null;
    this.company = obj?.data?.company || null;
    this.regional_offices = (obj?.data?.regional_offices?.length && obj.regional_offices) || [];
  }
}
