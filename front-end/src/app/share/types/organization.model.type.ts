export type Organization = {
  id: number;

  creation_date?: string;

  update_date?: string;

  name: string;

  acronym: string | null;

  code?: string;

  hq_location?: string | null;

  hq_location_iso_alpha2?: string | null;

  institution_type?: string | null;

  institution_type_id?: string | null;

  website_link?: string | null;
};
