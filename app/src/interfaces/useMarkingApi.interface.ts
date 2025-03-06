export type IMarkingTypeResponse = {
  name: string;
  marking_type_id: string;
  description: string;
};

export type IMarkingBodyLocationResponse = {
  description: string;
  body_location: string;
  taxon_marking_body_location_id: string;
};

export type IMarkingColourOption = {
  colour_id: string;
  colour: string;
  description: string | null;
  hex_code: string | null;
};
