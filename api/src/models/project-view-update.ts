import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-view-update');

interface IGetFundingSource {
  id: number;
  agency_id: number;
  investment_action_category: number;
  investment_action_category_name: string;
  agency_name: string;
  funding_amount: number;
  start_date: string;
  end_date: string;
  agency_project_id: string;
  revision_count: number;
}

export class GetFundingData {
  fundingSources: IGetFundingSource[];

  constructor(fundingData?: any[]) {
    defaultLog.debug({
      label: 'GetFundingData',
      message: 'params',
      fundingData: fundingData
    });

    this.fundingSources =
      (fundingData &&
        fundingData.map((item: any) => {
          return {
            id: item.id,
            agency_id: item.agency_id,
            investment_action_category: item.investment_action_category,
            investment_action_category_name: item.investment_action_category_name,
            agency_name: item.agency_name,
            funding_amount: item.funding_amount,
            start_date: item.start_date,
            end_date: item.end_date,
            agency_project_id: item.agency_project_id,
            revision_count: item.revision_count
          };
        })) ||
      [];
  }
}
