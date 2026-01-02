# Webinar and Online Workshop Management System

## Objective
A simple Django-based system to manage webinars/workshops where:
- Admin/organizer can create events and add recording links.
- Users can view events, register (once per event), and view recordings after login.

## Tech Stack
- Python 3
- Django (Django ORM + built-in authentication)
- SQLite (default Django database)

## Modules
- **events app**
  - Event listing page
  - Event registration (login required)
  - Session recordings page (login required)
- **admin module**
  - Manage Events, Registrations, and Recordings from Django Admin

## Database Tables (Models)
Created using Django ORM (SQLite database `db.sqlite3`):
- **Event**
  - `title`, `description`, `date`, `time`, `organizer` (FK to User)
- **Registration**
  - `user` (FK to User), `event` (FK to Event), `registered_on` (auto timestamp)
  - Unique registration per user/event (prevents duplicate registration)
- **Recording**
  - `event` (FK to Event), `recording_link` (URL)

## User Roles
- **Admin (Superuser)**
  - Logs in to `/admin/`
  - Can create/edit events and add recordings
- **User (Student/Participant)**
  - Can view event list without login
  - Must log in to register and to view recordings

## How to Run (Windows)
1. Open PowerShell in the project folder.
2. Activate venv (if needed):
   - `.venv\Scripts\Activate.ps1`
3. Run migrations (first time only):
   - `python manage.py migrate`
4. Create an admin user:
   - `python manage.py createsuperuser`
5. Start the server:
   - `python manage.py runserver`

### Useful URLs
- Admin login: `http://127.0.0.1:8000/admin/`
- Event list: `http://127.0.0.1:8000/events/`

## Testing
Automated tests are included in `events/tests.py` and were run successfully:
- `python manage.py test`

The tests verify:
- Admin can create Events and Recordings
- Event list loads
- Registration and recordings require login and redirect to admin login
- User can register only once per event
- Redirect works correctly after registration
