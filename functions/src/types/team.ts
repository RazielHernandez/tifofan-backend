export interface TeamCore {
  id: number;
  name: string;
  logo?: string | null;
  country?: string | null;
}

export interface Team extends TeamCore {
  founded: number | null;
  national: boolean;
  venue: Venue | null;
}

export interface Venue {
  id: number | null;
  name: string | null;
  city: string | null;
  capacity: number | null;
  image: string | null;
}
