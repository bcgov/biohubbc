export type ITaxonomy = {
  tsn: number;
  commonNames: string[];
  scientificName: string;
  rank: string;
  kingdom: string;
};

// TODO: Remove and replace instances of `IPartialTaxonomy` with `ITaxonomy` once the BioHub API endpoint is updated
// to return the extra `rank` and `kingdom` fields, which are currently only available in some of the BioHub taxonomy
// endpoints.
export type IPartialTaxonomy = Partial<ITaxonomy> & Pick<ITaxonomy, 'tsn' | 'commonNames' | 'scientificName'>;

export type ITaxonomyHierarchy = Pick<ITaxonomy, 'tsn'> & { hierarchy: number[] };
