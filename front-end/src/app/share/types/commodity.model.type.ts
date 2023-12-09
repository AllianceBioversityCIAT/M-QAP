export type Commodity = {
  id: number;

  creation_date: string;

  update_date: string;

  name: string;

  source: string;

  parent_id?: number;

  parent: Commodity;
};
