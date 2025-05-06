# Admin Guide: Performance Reports Management

## Overview

This document outlines how to implement the administrative interface for managing performance reports submitted by clients. Administrators need to have a comprehensive view of all performance feedback for staff members, with the ability to view, filter, and manage reports.

## Database Structure

The system uses two main tables for performance tracking:

```
staff_report
- id (uuid)
- client_id (uuid) - References the client table
- staff_id (uuid) - References the staff table
- report_type (enum) - 'performance', 'incident', 'feedback', etc.
- title (string)
- description (string)
- report_date (date)
- severity (string) - 'low', 'medium', 'high'
- status (string) - 'pending', 'reviewed', 'resolved'
- action_taken (string)
- action_date (date)
- reviewed_by (uuid)
- report_file_url (string)
- created_at (timestamp)
- updated_at (timestamp)
```

```
staff_feedback
- id (uuid)
- client_id (uuid) - References the users_profile table
- staff_id (uuid) - References the staff table
- rating (number) - 1-5 stars
- comment (string)
- decision (string) - Additional context for the feedback
- created_at (timestamp)
- updated_at (timestamp)
```

## Required Admin Functionality

### 1. Performance Reports Dashboard

Create an admin dashboard with the following features:

- List of all performance reports with filtering capabilities:
  - By staff member
  - By client
  - By status (pending, reviewed, resolved)
  - By date range
  - By severity
  - By staff status (active, suspended, dismissed)
- Summary statistics:
  - Total reports
  - Reports by severity
  - Average rating by staff member
  - Reports requiring attention (pending)

### 2. Staff Performance Detail View

When viewing a staff profile in the admin panel, include a Performance tab that shows:

- List of all performance reports for this staff member
- Average rating over time (chart)
- Feedback trends and common themes
- Reports for different statuses (active, dismissed, suspended)
- Ability to add administrative notes/reports

### 3. Report Management Interface

For each report, provide admin functionality to:

- View complete report details
- Update report status
- Add admin comments and response
- Mark actions taken
- Log communications with clients about the report
- Link related documents or evidence

### 4. Report Submission for Admins

Allow administrators to:

- Submit performance reports on behalf of clients
- Record feedback provided during calls or support interactions
- Create internal-only performance assessments
- Document coaching or training recommendations

### 5. Staff Status Tracking with Performance Context

Show the relationship between performance reports and staff status changes:

- Display reports that led to suspension or dismissal
- Track performance improvement for reinstated staff
- Show historical performance trends across status changes

## Implementation Steps

1. Create admin controller and routes for performance report management
2. Implement dashboard view with filters and statistics
3. Add staff detail view with performance tab
4. Create report management forms and action handlers
5. Build admin report submission interface
6. Implement status tracking with performance context
7. Add audit logging for all admin actions on reports

## API Endpoints

Create the following API endpoints:

- `GET /api/admin/performance/reports` - List all performance reports with filtering
- `GET /api/admin/performance/reports/:id` - Get details for a specific report
- `PUT /api/admin/performance/reports/:id` - Update report status, add comments, etc.
- `POST /api/admin/performance/reports` - Create a new report as admin
- `GET /api/admin/performance/staff/:id` - Get all performance data for a specific staff
- `GET /api/admin/performance/stats` - Get performance statistics dashboard data

## UI Components

### Dashboard View
- Filterable data table with reports
- Summary cards with key metrics
- Status distribution charts
- Recent reports timeline

### Staff Performance Tab
- Performance timeline
- Rating trends chart
- Report list with expandable details
- Admin action buttons for each report
- Report submission form

### Report Management View
- Report details section
- Status update controls
- Admin notes and resolution tracking
- Client communication log
- Related reports linkage

## Permissions

Create granular permissions for report management:

- `view_performance_reports` - View reports but cannot modify
- `manage_performance_reports` - Update status, add notes
- `create_admin_reports` - Submit reports on behalf of clients
- `delete_performance_reports` - Remove inappropriate reports

## Security Considerations

- Implement proper authentication and authorization checks
- Record all changes to reports in audit logs
- Ensure client confidentiality in report data
- Validate all input parameters
- Implement rate limiting on API endpoints

## Testing Requirements

- Test filtering functionality with various combinations
- Verify proper permission controls
- Ensure reports link correctly to staff profiles
- Verify status updates are properly tracked
- Test the administrative report submission flow 