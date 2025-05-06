# HomeCare Staff Verification System

## Project Overview

This document outlines the development plan for the HomeCare Staff Verification System, consisting of three interconnected components:

1. **Field Agent Mobile App** - An Expo-based mobile application for field agents to conduct on-site verification
2. **Admin Backend** - A web-based dashboard for administrators to manage verification requests
3. **User Frontend** - A web interface for clients to track verification status

---

## 1. Field Agent Mobile App (Expo)

### Purpose
A simple mobile application for field agents to receive verification tasks, visit locations, verify staff information, and submit reports.

### Key Features
- Basic authentication (login/logout)
- View list of assigned verification tasks
- View staff details to verify (name, address, phone number)
- Take photos using Expo Camera
- Submit verification status and comments

### Screens

#### 1.1 Login Screen
- Email/username field
- Password field
- Login button
- App logo and branding

#### 1.2 Task List Screen
- List of verification tasks assigned to the agent
- Each task shows:
  - Staff name
  - Address (truncated)
  - Assignment date
  - Status (New, In Progress)
- Tap to view task details

#### 1.3 Task Detail Screen
- Staff full name
- Phone number
- Complete address
- Staff ID
- Staff photo (if available)
- Type of verification required
- "Start Verification" button

#### 1.4 Camera Screen
- Simple camera interface using Expo Camera
- Photo capture button
- Option to retake photo
- "Use Photo" button
- Labels for photo types (Front of house, Staff ID, etc.)

#### 1.5 Verification Form
- Form with verification checklist:
  - Verified identity (Yes/No)
  - Verified address (Yes/No)
  - Staff physically present (Yes/No)
- Text field for comments/notes
- Display captured photos
- "Submit Report" button

#### 1.6 Confirmation Screen
- Success message
- Return to task list button

### Technical Specifications
- Built with React Native and Expo
- Simple REST API integration
- Camera access required
- Internet connectivity required for all operations
- No offline capability in MVP

---

## 2. Admin Backend

### Purpose
Web-based dashboard for administrators to manage verification requests, assign tasks to field agents, and review verification reports.

### Key Features
- User authentication with role-based access
- Dashboard overview of verification activities
- Create and assign verification tasks
- Review and process field agent reports
- Track verification statuses
- Manage field agents

### Screens

#### 2.1 Login Screen
- Username/email and password
- Login button
- Forgot password link

#### 2.2 Dashboard
- Summary statistics:
  - Total verification requests
  - Pending assignments
  - In progress verifications
  - Completed verifications
- Recent activity feed
- Quick access buttons for common actions

#### 2.3 Verification Requests
- List of all verification requests
- Filterable by status
- Sortable by date, priority
- Each request shows:
  - Staff name
  - Request date
  - Current status
  - Assigned agent (if any)

#### 2.4 Request Details
- Complete staff information
- Request details
- Assignment status
- Verification history
- Buttons to:
  - Assign to field agent
  - Edit details
  - Cancel request

#### 2.5 Assign Task
- Field agent selection dropdown
- Priority setting
- Due date selection
- Assignment notes field
- Confirm assignment button

#### 2.6 Verification Reports
- List of all submitted verification reports
- Filterable by status, date, agent
- Each report shows:
  - Staff name
  - Verification date
  - Field agent name
  - Verification result

#### 2.7 Report Details
- Complete verification information
- Field agent's comments
- Photos submitted by agent
- Verification checklist results
- Options to:
  - Approve verification
  - Request additional information
  - Reject verification

#### 2.8 Field Agent Management
- List of all field agents
- Performance metrics
- Task assignment history
- Account status management

### Technical Specifications
- Web application (React.js frontend)
- RESTful API backend
- Role-based access control
- Integration with existing database
- Real-time notifications for new reports

---

## 3. User Frontend

### Purpose
Web interface for clients to track verification status of their requested staff members.

### Key Features
- Client authentication
- View verification requests and status
- Track verification progress
- View verification results
- Request new verifications

### Screens

#### 3.1 Login Screen
- Email/username and password
- Login button
- Forgot password link

#### 3.2 Dashboard
- Summary of verification statuses
- Recent verification activities
- Quick buttons for common actions

#### 3.3 Staff Verification List
- List of all staff verification requests
- Each entry shows:
  - Staff name
  - Request date
  - Current status
  - Expected completion (if available)
- Filter by status, date

#### 3.4 Verification Details
- Staff information
- Verification status and timeline
- If completed:
  - Verification result
  - Completion date
  - Basic verification information
- Action buttons based on status

#### 3.5 Request Verification
- Staff selection dropdown (for existing staff)
- Verification type selection
- Priority options
- Additional notes/requirements
- Submit button

#### 3.6 Account Settings
- Profile information
- Notification preferences
- Password change

### Technical Specifications
- Web application (matching main HomeCare CRM)
- Secure client portal
- Email notifications for status changes
- Integration with existing database

---

## Data Flow

### Verification Process Flow
1. **Client/Admin** creates verification request in the system
2. **Admin** reviews and assigns request to a field agent
3. **Field Agent** receives task on mobile app
4. **Field Agent** visits location and conducts verification
5. **Field Agent** submits verification report with photos
6. **Admin** reviews report and approves/rejects verification
7. **Client** can view verification status and results

### Data Relationships
- Verification Request (connects client, staff, admin)
- Verification Assignment (connects admin, field agent, request)
- Verification Report (connects field agent, verification details)
- Photos (connected to verification report)

## Implementation Plan

### Phase 1: MVP
- Basic Field Agent mobile app with core features
- Essential Admin Backend functionality
- Simple User Frontend tracking

### Phase 2: Enhancements
- Additional verification types
- Performance metrics
- Enhanced reporting

### Phase 3: Advanced Features
- Scheduling optimization
- Business intelligence
- Advanced analytics

## Technical Requirements

### Field Agent App
- Expo SDK
- React Native
- Camera access
- Internet connectivity

### Admin Backend
- React.js
- Node.js/Express backend
- RESTful API
- Role-based authentication

### User Frontend
- React.js (matching main application)
- Secure authentication
- Responsive design

### Infrastructure
- Shared database with existing HomeCare CRM
- Cloud storage for photos
- API gateway for service integration
