# Timetable API Documentation

## Overview

Complete CRUD API for managing student timetables with time conflict detection and validation.

---

## Subjects API

### Base URL: `/api/subjects`

#### 1. Create Subject

**POST** `/api/subjects`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "Cookie": "better-auth.session_token=..." // Admin authentication required
}
```

**Request Body:**

```json
{
  "name": "Mathematics",
  "description": "Advanced Mathematics Course" // optional
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Mathematics",
    "description": "Advanced Mathematics Course",
    "createdAt": "2025-11-07T10:00:00Z",
    "updatedAt": "2025-11-07T10:00:00Z"
  }
}
```

---

#### 2. Get All Subjects

**GET** `/api/subjects`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Mathematics",
      "description": "Advanced Mathematics Course",
      "createdAt": "2025-11-07T10:00:00Z",
      "updatedAt": "2025-11-07T10:00:00Z"
    }
  ]
}
```

---

#### 3. Get Subject by ID

**GET** `/api/subjects/:id`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Mathematics",
    "description": "Advanced Mathematics Course",
    "createdAt": "2025-11-07T10:00:00Z",
    "updatedAt": "2025-11-07T10:00:00Z"
  }
}
```

---

#### 4. Update Subject

**PUT** `/api/subjects/:id`

**Request Body:**

```json
{
  "name": "Advanced Mathematics", // optional
  "description": "Updated description" // optional
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Advanced Mathematics",
    "description": "Updated description",
    "createdAt": "2025-11-07T10:00:00Z",
    "updatedAt": "2025-11-07T11:00:00Z"
  },
  "message": "Subject updated successfully"
}
```

---

#### 5. Delete Subject

**DELETE** `/api/subjects/:id`

**Response (200):**

```json
{ "success": true, "message": "Subject deleted successfully" }
```

---

## Timetable API

### Base URL: `/api/timetable`

#### 1. Create Single Timetable Entry

**POST** `/api/timetable`

**Request Body:**

```json
{
  "studentId": "student-uuid",
  "teacherId": "teacher-uuid",
  "subjectId": "subject-uuid",
  "day": "Monday", // Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday
  "startTime": "09:00", // HH:MM format
  "endTime": "10:30", // HH:MM format
  "notes": "Chapter 1-3" // optional
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "studentId": "student-uuid",
    "teacherId": "teacher-uuid",
    "subjectId": "subject-uuid",
    "day": "Monday",
    "startTime": "09:00",
    "endTime": "10:30",
    "isActive": true,
    "notes": "Chapter 1-3",
    "createdAt": "2025-11-07T10:00:00Z",
    "updatedAt": "2025-11-07T10:00:00Z",
    "deletedAt": null
  }
}
```

**Error Response (409 - Conflict):**

```json
{ "error": "Timetable entry overlaps with an existing entry for this student on this day" }
```

---

#### 2. Bulk Create Timetable (Weekly Schedule)

**POST** `/api/timetable`

**Request Body:**

```json
{
  "studentId": "student-uuid",
  "entries": [
    {
      "teacherId": "teacher-uuid-1",
      "subjectId": "subject-uuid-1",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "notes": "Week 1" // optional
    },
    {
      "teacherId": "teacher-uuid-2",
      "subjectId": "subject-uuid-2",
      "day": "Monday",
      "startTime": "11:00",
      "endTime": "12:30"
    },
    {
      "teacherId": "teacher-uuid-1",
      "subjectId": "subject-uuid-1",
      "day": "Tuesday",
      "startTime": "09:00",
      "endTime": "10:30"
    }
  ]
}
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "studentId": "student-uuid",
      "teacherId": "teacher-uuid-1",
      "subjectId": "subject-uuid-1",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "isActive": true,
      "notes": "Week 1",
      "createdAt": "2025-11-07T10:00:00Z",
      "updatedAt": "2025-11-07T10:00:00Z",
      "deletedAt": null
    }
    // ... more entries
  ],
  "message": "Successfully created 3 timetable entries"
}
```

**Validation Errors:**

- Time conflicts within submitted entries
- Time conflicts with existing timetable
- Invalid time format
- End time before start time

---

#### 3. Get Student Timetable

**GET** `/api/timetable?studentId=student-uuid`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "studentId": "student-uuid",
      "teacherId": "teacher-uuid",
      "subjectId": "subject-uuid",
      "subjectName": "Mathematics", // joined from subject table
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "isActive": true,
      "notes": "Chapter 1-3",
      "createdAt": "2025-11-07T10:00:00Z"
    }
    // ... sorted by day and start time
  ]
}
```

---

#### 4. Get Timetable Entry by ID

**GET** `/api/timetable/:id`

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "studentId": "student-uuid",
    "teacherId": "teacher-uuid",
    "subjectId": "subject-uuid",
    "subjectName": "Mathematics",
    "day": "Monday",
    "startTime": "09:00",
    "endTime": "10:30",
    "isActive": true,
    "notes": "Chapter 1-3",
    "createdAt": "2025-11-07T10:00:00Z",
    "updatedAt": "2025-11-07T10:00:00Z"
  }
}
```

---

#### 5. Update Timetable Entry

**PUT** `/api/timetable/:id`

**Request Body:**

```json
{
  "teacherId": "new-teacher-uuid", // optional
  "subjectId": "new-subject-uuid", // optional
  "startTime": "10:00", // optional
  "endTime": "11:30", // optional
  "notes": "Updated notes", // optional
  "isActive": false // optional - to disable entry
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "studentId": "student-uuid",
    "teacherId": "new-teacher-uuid",
    "subjectId": "new-subject-uuid",
    "day": "Monday",
    "startTime": "10:00",
    "endTime": "11:30",
    "isActive": false,
    "notes": "Updated notes",
    "createdAt": "2025-11-07T10:00:00Z",
    "updatedAt": "2025-11-07T12:00:00Z",
    "deletedAt": null
  },
  "message": "Timetable entry updated successfully"
}
```

---

#### 6. Delete Timetable Entry (Soft Delete)

**DELETE** `/api/timetable/:id`

**Response (200):**

```json
{ "success": true, "message": "Timetable entry deleted successfully" }
```

---

## Time Conflict Detection

The API automatically detects time conflicts in the following scenarios:

### 1. Single Entry Creation

- Checks if new entry overlaps with existing entries for the same student on the same day

### 2. Bulk Creation

- Validates no conflicts within submitted entries
- Validates no conflicts with existing timetable entries
- Provides detailed error messages indicating which entries conflict

### Conflict Detection Logic

Two time slots conflict if:

- New start time is within an existing slot
- New end time is within an existing slot
- New slot completely encompasses an existing slot

**Example Conflict:**

```
Existing: Monday 09:00-10:30
New:      Monday 10:00-11:00  ❌ Conflict (overlaps)
New:      Monday 10:30-12:00  ✅ No conflict (starts when other ends)
```

---

## Authentication

All endpoints require admin authentication:

**Required Header:**

```
Cookie: better-auth.session_token=<token>
```

**Error Response (403):**

```json
{ "error": "Unauthorized: Admin access required" }
```

---

## Validation Rules

### Time Format

- Must be in HH:MM format (24-hour)
- Examples: `09:00`, `14:30`, `23:59`

### Days

Must be one of: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`

### Subject Name

- Minimum: 1 character
- Maximum: 100 characters

### Notes

- Optional field
- Maximum: unlimited

---

## Error Codes

| Code | Description                     |
| ---- | ------------------------------- |
| 400  | Validation error or bad request |
| 403  | Unauthorized (not admin)        |
| 404  | Resource not found              |
| 409  | Time conflict detected          |
| 500  | Internal server error           |

---

## Usage Examples

### Creating a Full Week Timetable

```javascript
const response = await fetch('/api/timetable', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'student-123',
    entries: [
      // Monday
      { teacherId: 't1', subjectId: 's1', day: 'Monday', startTime: '09:00', endTime: '10:30' },
      { teacherId: 't2', subjectId: 's2', day: 'Monday', startTime: '11:00', endTime: '12:30' },
      // Tuesday
      { teacherId: 't1', subjectId: 's1', day: 'Tuesday', startTime: '09:00', endTime: '10:30' },
      // ... rest of the week
    ],
  }),
});
```

### Fetching and Displaying Student Timetable

```javascript
const response = await fetch('/api/timetable?studentId=student-123');
const { data: timetable } = await response.json();

// Group by day
const weeklySchedule = timetable.reduce((acc, entry) => {
  if (!acc[entry.day]) acc[entry.day] = [];
  acc[entry.day].push(entry);
  return acc;
}, {});
```

---

## Database Schema

### Subject Table

```typescript
{
  id: string(PK);
  name: string;
  description: string | null;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Timetable Table

```typescript
{
  id: string (PK)
  studentId: string (FK → user.id)
  teacherId: string (FK → user.id)
  subjectId: string (FK → subject.id)
  day: enum('Monday' | 'Tuesday' | ... | 'Sunday')
  startTime: string (HH:MM)
  endTime: string (HH:MM)
  isActive: boolean
  notes: string | null
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp | null
}
```
