export interface IItisSearchResponse {
  commonNames: string[];
  kingdom: string;
  name: string;
  parentTSN: string;
  scientificName: string;
  tsn: string;
  updateDate: string;
  usage: string;
}

export interface ITaxonomy {
  tsn: number;
  commonNames: string[];
  scientificName: string;
  rank: string;
  kingdom: string;
}
