import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
   "Delete old files marked for deletion",
   // TODO Change back to 1 day after
   { minutes: 1 }, //1 day
   // { minutes: 60 * 24 }, //1 day
   internal.files.deleteAllFiles
);

export default crons;
