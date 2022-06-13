import { format } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

import timezoneRawData from "./data/timezones.json";

export function getTimezoneSelectOptions() {
  return Object.entries(timezoneRawData).map(([key, value]) => ({
    value: key,
    label: value,
  }));
}
