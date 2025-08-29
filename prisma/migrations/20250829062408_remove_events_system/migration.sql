/*
  Warnings:

  - You are about to drop the `event_attendees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event_attendees" DROP CONSTRAINT "event_attendees_attendee_id_fkey";

-- DropForeignKey
ALTER TABLE "event_attendees" DROP CONSTRAINT "event_attendees_event_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_created_by_fkey";

-- DropTable
DROP TABLE "event_attendees";

-- DropTable
DROP TABLE "events";

-- DropEnum
DROP TYPE "AttendeeStatus";

-- DropEnum
DROP TYPE "EventCategory";

-- DropEnum
DROP TYPE "EventStatus";

-- DropEnum
DROP TYPE "EventType";
