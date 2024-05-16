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
  colour: string;
  colour_id: string;
  create_timestamp: string;
  create_user: string;
  description: string | null;
  hex_code: string | null;
  update_timestamp: string | null;
  update_user: string | null
};
