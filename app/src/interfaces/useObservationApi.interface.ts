export interface IGetSubmissionCSVForViewItem {
  name: string;
  headers: string[];
  rows: string[][];
}

export interface IGetSubmissionCSVForViewResponse {
  data: IGetSubmissionCSVForViewItem[];
}
