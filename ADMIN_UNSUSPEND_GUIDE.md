# Admin Guide: Employee Status Management CRM

## Overview

When clients suspend or dismiss employees in the HomeCare CRM, they are informed that they need to contact customer support to unsuspend/rehire the employee. This document outlines the implementation details for the admin backend system to handle these status change requests through a comprehensive CRM interface.

## Database Structure

The current database structure for user profiles:

```
user_profile
- id (uuid)
- client_id (uuid)
- staff_id (uuid)
- status (text) - 'hired', 'rejected', etc.
- action_status (text) - 'dismissed', 'suspended', or null
- start_date (date)
- end_date (date) - Set when suspended/dismissed
- created_at (timestamp)
- updated_at (timestamp)
```

## Required Admin CRM Functionality

### 1. Comprehensive Employee Management Dashboard

Create an admin CRM dashboard with the following features:

- Single comprehensive list view of all employees with their statuses (hired, suspended, dismissed)
- Advanced search/filter capabilities:
  - By client
  - By status (hired, suspended, dismissed)
  - By date range (hire date, suspension date, dismissal date)
  - By employee name/role
- Details view showing:
  - Employee details
  - Client details
  - Current status with reason and date
  - Status history
  - Contact information

### 2. Status Management Actions

Implement status action buttons that allow admins to:

- Unsuspend employees (change from suspended → hired)
- Rehire dismissed employees (change from dismissed → hired)
- Suspend active employees (change from hired → suspended)
- Dismiss employees (change from any status → dismissed)

Status change SQL example:
```sql
UPDATE user_profile
SET action_status = :new_action_status, 
    end_date = CASE WHEN :new_action_status IS NULL THEN NULL ELSE end_date END,
    updated_at = NOW()
WHERE client_id = :client_id AND staff_id = :staff_id
```

### 3. Permission Controls

- Create specific permissions for managing employee statuses: `can_manage_employee_status`
- Only users with admin or customer support roles and this permission should access this functionality
- Log all status change actions with the admin user who performed them

### 4. Notification System

- Implement email notifications to:
  - The client when an employee's status is changed
  - The employee when their status is changed (if employee emails are in the system)
- Add notification templates for each type of status change to the admin CMS

### 5. Audit Logs

- Record all status change actions in an audit log
- Include:
  - Timestamp
  - Admin user who performed the action
  - Client and employee IDs
  - Previous status and new status
  - Reason for change
  - Notes added by admin

## Implementation Steps

1. Create the new admin CRM interface for comprehensive employee management
2. Add the required database queries and updates for all status types
3. Implement the frontend components with unified status filters and actions
4. Add permission checks and validation
5. Create notification templates and triggers for all status types
6. Implement detailed audit logging
7. Test all status change flows

## API Endpoints

Create the following API endpoints:

- `GET /api/admin/employees` - List all employees with filter options for status
- `GET /api/admin/employees/:id` - Get details for a specific employee including status history
- `POST /api/admin/employees/:id/status` - Update an employee's status (unsuspend, rehire, suspend, dismiss)
- `GET /api/admin/status-change-logs` - View audit logs for all status change actions

## Security Considerations

- Ensure proper authentication and authorization
- Validate all input parameters
- Implement rate limiting on the API endpoints
- Record IP addresses for sensitive actions
- Ensure proper error handling without leaking sensitive information

## Testing Requirements

- Test all status change workflows with various employee/client scenarios
- Test permission controls for different admin roles
- Verify email notifications are sent correctly for each status change
- Verify audit logs are created properly with correct before/after states
- Test error handling for edge cases 