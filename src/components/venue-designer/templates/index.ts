import { VenueTemplate, TemplateId } from "../types";
import { basketballArena } from "./basketball-arena";
import { footballStadium } from "./football-stadium";
import { concertHall } from "./concert-hall";
import { conferenceRoom } from "./conference-room";
import { blankCanvas } from "./blank";

export const templates: VenueTemplate[] = [
  basketballArena,
  footballStadium,
  concertHall,
  conferenceRoom,
  blankCanvas,
];

export const getTemplate = (id: TemplateId): VenueTemplate => {
  return templates.find((t) => t.id === id) || basketballArena;
};
