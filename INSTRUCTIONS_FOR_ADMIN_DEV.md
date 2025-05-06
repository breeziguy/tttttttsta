# Instructions for Admin/Vetting Platform Developers

This document tracks changes made in the **User-Facing Application (crm2)** codebase that may require corresponding updates or considerations in the **Admin Platform** or **Vetting Platform**.

**System Architecture Overview:**

*   **User-Facing App (crm2):** Handles client interactions, staff discovery, profile management, vetting requests initiation, etc. (This codebase).
*   **Admin Platform:** Separate application for administrative tasks (user management, system configuration, potentially overview dashboards).
*   **Vetting Platform:** Separate application used by admins/vetting team to process and manage vetting requests submitted via the User-Facing App.
*   **Shared Database:** All three platforms connect to the same Supabase database (`xovojzpwkavzddlcbqex`). Changes to the database schema or RLS policies can impact all platforms.
*   **Separate Hosting:** Each application is deployed and hosted independently.

**How to Use This Document:**

When a feature is added or modified in the User-Facing App that involves:

1.  **Database Schema Changes:** New tables, columns, relationships, or significant data modifications.
2.  **New Data requiring Admin/Vetting Action:** Data submitted by users that needs review, approval, or processing in the admin/vetting platforms (e.g., new vetting requests, profile update flags).
3.  **Changes in Workflow:** Modifications to how data flows between the user app and the admin/vetting processes.

Please add an entry below detailing the change and its implications for the other platforms.

---

## Change Log:

*(Add new entries here)*

**Date:** YYYY-MM-DD
**Feature/Change:** [Brief description of the feature or change in the User-Facing App]
**Relevant Database Tables/Columns:** [List relevant tables/columns modified or added]
**Impact on Admin Platform:** [Describe necessary changes, e.g., "Display new field X in user details", "Add filter for status Y"]
**Impact on Vetting Platform:** [Describe necessary changes, e.g., "Process new request type Z", "Show additional data point W on vetting task"]
**Notes:** [Any other relevant context]

---

# Development Instructions

## Cross-Platform Changes

This document outlines changes that affect multiple platforms in the system.

### Recent Changes

#### Updating Accommodation Status Values for Staff (May 2025)

The `accommodation_status` field for staff has been updated from free text values (like "family", "Owned", "Rented") to an ENUM type with values "Required" and "Non Required".

**Changes implemented:**

1. Created and applied a migration that:
   - Modified the existing accommodation_status enum to use "Required" and "Non Required" values
   - Updated the calculate_staff_completion_percentage() trigger function to remove reference to house_photos
   - Converted existing text data in the staff table to use the new enum values

2. Regenerated TypeScript type definitions to include the updated enum values

3. The user-facing application has already been updated:
   - The accommodation filter in DiscoverStaff.tsx now shows "Required" and "Non Required" options
   - Staff filtering correctly uses these values for queries

**What needs to be done in Admin Platform:**

Ensure any admin forms that manage staff accommodation status use the new enum values:
- Update forms to use a dropdown with "Required" and "Non Required" options instead of free text input
- Update any staff listing or staff detail views to display the new values

#### Updating Staff Roles (May 2025)

The staff role options have been updated:

**Changes implemented:**

1. Removed roles:
   - "Elderly Care"
   - "Office Assistant"

2. Added roles:
   - "Chef"
   - "Cleaner"
   - "Ironing Man"

3. Updated the database:
   - Modified the staff_type enum to include the new roles
   - Existing "Elderly Care" and "Office Assistant" roles have been mapped to "Cleaner"

4. Updated the UI:
   - Role filter in DiscoverStaff now shows the new options
   - COMMON_SKILLS updated to replace "Elderly Care" with "Chef Services"

**What needs to be done in Admin Platform:**

Ensure any admin forms that manage staff roles use the updated enum values:
- Update dropdowns for role selection to include the new options
- Remove the deprecated role options from any staff creation or editing forms

#### Updating Staff Skills (May 2025)

The staff skills have been simplified and standardized:

**Changes implemented:**

1. Removed all previous skills and replaced with a focused set of four core skills:
   - Literacy
   - Cooking
   - Pet Care
   - First Aid

2. Updated the database:
   - Created a migration to update all existing staff records with random combinations of these skills
   - Each staff member now has between 1-4 of these skills assigned

3. Updated the UI:
   - Staff skill filter in DiscoverStaff now shows only these four options
   - Skills displayed in staff cards and details now reflect these standardized skills

**What needs to be done in Admin Platform:**

Ensure any admin forms that handle staff skills use the new standardized options:
- Update dropdowns for skill selection to show only the four approved skills
- Remove any skill entry fields that allow free text entry
- Update any reporting or analytics that categorize staff by skills

#### Updating Salary Range Options (May 2025)

The salary range filter options have been updated:

**Changes implemented:**

1. Previous salary ranges have been replaced with the following:
   - Up to 70k Naira
   - 70k - 150k Naira
   - 150k - 230k Naira
   - 230k - 300k Naira
   - 300k+ Naira

2. Updated the UI:
   - Salary range filter in DiscoverStaff now shows the new range options
   - The filter logic for searching by salary has been updated to use these new thresholds

**What needs to be done in Admin Platform:**

Ensure any admin forms that use salary ranges adopt the new standardized ranges:
- Update any dropdowns that allow filtering or sorting by salary to use the new ranges
- Update any reporting or analytics that categorize staff by salary

#### UI Updates for Staff Display (May 2025)

Several UI improvements have been made to the staff display components:

**Changes implemented:**

1. Email display changes:
   - Removed email display with icon from staff profile in StaffDetails component
   - Email is still accessible in the system and appears in the downloadable PDF profile

2. Staff action buttons:
   - Fixed an issue where dismiss/suspend buttons were incorrectly appearing in the DiscoverStaff view
   - These buttons are now correctly shown only in the MyHires view for hired staff
   - The isHired check in StaffDetails has been corrected to ensure action buttons only display for hired staff

**What needs to be done in Admin Platform:**

No specific changes are required for the Admin Platform, but for consistency:
- Consider reviewing any staff detail views to confirm whether email should be displayed
- Ensure that staff action buttons (like dismiss/suspend) only appear in appropriate contexts

#### Previous Changes

[List of previous cross-platform changes...] 