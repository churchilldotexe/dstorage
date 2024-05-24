import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function formattedDate(date: string | number | Date) {
   const newDate = new Date(date);

   const formattedDay = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
   }).format(newDate);

   const formattedDayToday = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
   }).format(new Date());

   const formattedTime = new Intl.DateTimeFormat("en-GB", {
      hour12: true,
      hour: "numeric",
      minute: "numeric",
   }).format(newDate);

   if (formattedDay === formattedDayToday) {
      return `today at ${formattedTime}`;
   } else {
      return `${formattedDay} at ${formattedTime}`;
   }
}
