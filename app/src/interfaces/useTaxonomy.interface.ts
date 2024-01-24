export interface ITaxonomySearchResult {
  searchResponse: ITaxonomy[];
}

export interface ITaxonomy {
  id: string;
  label: string;
  scientificName?: string;
}
