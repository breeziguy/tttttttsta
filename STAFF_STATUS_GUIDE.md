# Staff Status Behavior Guide

## Overview of Staff Status Handling

This document explains how staff status is managed in the CRM system, particularly focusing on dismissed and suspended staff members.

## Status Logic

### Database Structure
- **staff_hiring_status table**: Contains records of staff hiring relationships
  - `status`: Can be "hired", "rejected", etc.
  - `action_status`: Additional field that can be "dismissed" or "suspended"
  - `end_date`: Date when employment ended (for dismissed/suspended staff)

### Types of Status

1. **Active Staff** (Normal Employees)
   - `status` = "hired"
   - `action_status` = null
   - `end_date` = null
   - UI shows Dismiss/Suspend buttons in MyHires view

2. **Dismissed Staff**
   - `status` = "hired" (remains as hired in database)
   - `action_status` = "dismissed" 
   - `end_date` = Date of dismissal
   - UI shows a "Dismissed" label in MyHires
   - No Schedule Interview button appears

3. **Suspended Staff**
   - `status` = "hired" (remains as hired in database)
   - `action_status` = "suspended"
   - `end_date` = Date of suspension
   - UI shows a "Suspended" label in MyHires
   - No Schedule Interview button appears

## Why Dismissed Users Don't Have a Schedule Button

1. When a staff member is dismissed, their record maintains the "hired" status
2. The system determines button display based on `isHired` value:
   - If `isHired` is true → Show dismiss/suspend buttons (only in MyHires view)
   - If `isHired` is false → Show Schedule Interview button
3. For dismissed staff, `isHired` remains true because their database status is still "hired"
4. Since the condition for showing the Schedule button is `!isHired`, it doesn't appear

This is intentional behavior - once you've dismissed an employee, you wouldn't want to schedule another interview with them. If you want to re-engage with a dismissed employee, you would need to reset their status through the administrative interface.

## Navigation Context

The system uses a navigation state parameter to determine which buttons to show:
- When viewing staff from MyHires: Shows action buttons for hired staff
- When viewing staff from DiscoverStaff: Hides action buttons even for hired staff

This ensures that action buttons only appear in the appropriate context (MyHires). 