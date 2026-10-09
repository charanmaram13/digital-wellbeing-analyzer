# Digital Wellbeing Analyzer — REST API Specification (`/api/v1`)

All endpoints are prefixed with `/api/v1`. All JSON responses follow a uniform envelope structure:

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... } // optional pagination or timestamps
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable explanation",
    "details": [ ... ]
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new user account and sets an HTTP-only authentication cookie.
- **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "67a1b...",
        "name": "Alex Mercer",
        "email": "alex@example.com",
        "createdAt": "2026-10-10T00:00:00.000Z"
      }
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticates credentials and sets the HTTP-only cookie.
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "67a1b...",
        "name": "Alex Mercer",
        "email": "alex@example.com"
      }
    }
  }
  ```

### `POST /api/v1/auth/logout`
Clears the authentication cookie.
- **Response**: `200 OK`

### `GET /api/v1/auth/me`
Retrieves current authenticated user profile and settings.
- **Response**: `200 OK`

---

## 2. Screen-Time Records

### `GET /api/v1/screen-time`
List screen-time records for the authenticated user with optional filtering and pagination.
- **Query Params**:
  - `startDate`: `YYYY-MM-DD`
  - `endDate`: `YYYY-MM-DD`
  - `category`: `Social | Entertainment | Productivity | Gaming | Communication | Utilities | Other`
  - `source`: `manual | CSV | demo`
  - `page`: integer (default 1)
  - `limit`: integer (default 50)
- **Response**: `200 OK` with `{ records, pagination }`

### `POST /api/v1/screen-time`
Create a manual or recorded screen-time entry.
- **Request Body**:
  ```json
  {
    "applicationName": "YouTube",
    "category": "Entertainment",
    "date": "2026-10-09",
    "startTime": "22:30",
    "endTime": "23:45",
    "durationMinutes": 75,
    "sessionCount": 1,
    "source": "manual",
    "deviceIdentifier": "MacBook Pro"
  }
  ```
- **Response**: `201 Created`

### `GET /api/v1/screen-time/:id`
Fetch a specific record by ID (scoped to authenticated user).

### `PATCH /api/v1/screen-time/:id`
Update an existing record (duration, category, notes).

### `DELETE /api/v1/screen-time/:id`
Remove a record.

### `POST /api/v1/screen-time/import`
Import screen-time records via CSV multipart upload or JSON array payload.
- **Request**: Multipart file or JSON body with parsed rows.
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "totalRows": 25,
      "importedCount": 23,
      "duplicateCount": 2,
      "errorCount": 0,
      "errors": []
    }
  }
  ```

### `GET /api/v1/screen-time/export`
Export all user screen-time records as downloadable CSV.

---

## 3. Analytics Endpoints

### `GET /api/v1/analytics/overview`
Retrieves complete high-level dashboard metrics:
- Today's screen time & comparison with goal
- 7-day and 14-day daily averages
- Week-over-week % delta
- Top 3 apps by duration
- Overall Wellbeing Score & breakdown
- Top active pattern alerts

### `GET /api/v1/analytics/daily`
Returns daily aggregates for a designated range (default: last 14 days) including category splits and goal lines.

### `GET /api/v1/analytics/weekly`
Returns week-by-week aggregated totals, daily averages, and baseline shifts.

### `GET /api/v1/analytics/categories`
Returns total duration and percentage distribution by category.

### `GET /api/v1/analytics/patterns`
Runs the pattern detection engine and returns active detected patterns:
- High Goal Overrun
- Late-Night Binge
- Category Over-Concentration
- Extended Unbroken Sessions
- Upward Usage Velocity

### `GET /api/v1/analytics/wellbeing-score`
Returns the transparent breakdown of the 0–100 Digital Wellbeing Score:
- Goal Adherence (0–35 pts)
- Late-Night Minimization (0–25 pts)
- Session Fragmentation / Long Sessions (0–20 pts)
- Focus Session Consistency (0–20 pts)
- Total Score & Classification (`Balanced`, `Needs Attention`, `High-Risk Pattern`)

---

## 4. AI Insights & Recommendations

### `POST /api/v1/insights/generate`
Generates actionable, personalized insights based on current 14-day analytics. Uses Google Gemini with structured output, or immediate deterministic rule fallback if offline.
- **Response**: `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "source": "gemini",
      "summary": "Your screen time increased by 18% this week, mainly driven by late-night streaming.",
      "keyFindings": ["3 late-night sessions detected after 11 PM", "YouTube accounted for 42% of total screen time"],
      "recommendations": [
        {
          "title": "Establish an 11 PM Bedtime Wind-Down",
          "description": "Set a screen boundary 30 minutes before bedtime.",
          "type": "bedtime_habit",
          "triggeringPattern": "Late-Night Binge"
        }
      ]
    }
  }
  ```

### `GET /api/v1/recommendations`
List user recommendations with status filter (`active`, `completed`, `snoozed`, `dismissed`).

### `PATCH /api/v1/recommendations/:id`
Update recommendation status (e.g. mark completed or dismissed).

---

## 5. Goals & Focus Sessions

### `GET /api/v1/goals` & `POST /api/v1/goals`
Manage daily screen time goals, category-specific caps, and focus targets.

### `PATCH /api/v1/goals/:id`
Update target value or active status.

### `GET /api/v1/focus-sessions` & `POST /api/v1/focus-sessions`
Log or start Pomodoro/focus blocks with planned duration, actual duration, and completion status.

### `PATCH /api/v1/focus-sessions/:id`
Complete or cancel a focus session.

---

## 6. Settings & Operations

### `GET /api/v1/settings` & `PATCH /api/v1/settings`
View or update user thresholds (daily goal, bedtime, wake time, long session threshold, theme).

### `GET /api/v1/health`
System liveness and readiness probe reporting database status, uptime, and version without exposing secrets.
