type VantageCategory = {
  vantage_category_id: number;
  name: string;
  description: string | null;
};

export type Vantage = {
  vantage_method_id: number;
  vantage_category_id: number;
  name: string;
};

/**
 * Response for fetching vantage reference records for a method lookup id
 */
export type GetVantageReferenceRecord = Vantage & { vantages: Vantage[] };
