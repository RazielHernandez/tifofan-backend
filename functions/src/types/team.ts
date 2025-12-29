/**
 * Normalized Team model.
 */
export interface Team {
  id: number;
  name: string;
  country: string | null;
  founded: number | null;
  logo: string | null;
  national: boolean;
  venue: Venue | null;
}

/**
 * Team venue.
 */
export interface Venue {
  id: number | null;
  name: string | null;
  city: string | null;
  capacity: number | null;
  image: string | null;
}
