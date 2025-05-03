/*
  # Add rejected status to interview_status enum

  1. Changes
    - Add 'rejected' as a valid value for the interview_status enum type
*/

ALTER TYPE interview_status ADD VALUE IF NOT EXISTS 'rejected';