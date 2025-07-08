export interface ICollectionLink {
  id: number;
  name: string;
  description: string | null;
  url: string;
  collection_id: number;
  record_end_date: Date | null;
  create_date: Date;
  create_user: number;
}

export interface IPostCollectionLinkRequest {
  name: string;
  description?: string;
  url: string;
}

export interface IPutCollectionLinkRequest {
  name: string;
  description?: string;
  url: string;
}

export interface IGetCollectionLinksResponse {
  links: ICollectionLink[];
  pagination: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}
