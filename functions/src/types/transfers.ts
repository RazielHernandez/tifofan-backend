import {TeamCore} from "./team";

export interface Transfer {
  date?: string;
  type?: string;
  teams?: {
    in?: TeamCore;
    out?: TeamCore;
  };
}

export interface PlayerBlock {
  player?: {
    id?: number;
    name?: string;
    photo?: string;
  };
  transfers?: Transfer[];
}

export interface NormalizedTransfer {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  date: string;
  type: string;
  teams: {
    from: {
      id: number;
      name: string;
      logo: string;
    };
    to: {
      id: number;
      name: string;
      logo: string;
    };
  };
}
