# ⚠️ DEPRECATED - Old Events App

## This app has been replaced by the new modular structure

The `events` app has been **deprecated** and replaced by 5 focused Django apps:

### Migration Path

| Old (events) | New Apps |
|--------------|----------|
| UserProfile model | → **accounts** app |
| Event model | → **webinars** app |
| Registration model | → **registrations** app |
| Recording model | → **recordings** app |
| Announcement, UserNotification, WebinarChatMessage | → **communications** app |

### What to Do

1. **Do not use this app** - It's kept for reference only
2. **Use the new apps** - See project root documentation
3. **Update imports** - Change from `events.models` to `accounts.models`, `webinars.models`, etc.
4. **Follow migration guide** - See `REFACTORING_GUIDE.md` in project root

### New Structure

```
OLD:  events/ (everything mixed)
      ↓
NEW:  accounts/        (user management)
      webinars/        (event management)
      registrations/   (user registrations)
      recordings/      (video recordings)
      communications/  (announcements & chat)
```

### API Endpoints Changed

All API endpoints have moved from root (e.g., `/events/`) to `/api/` namespace:

- `/events/` → `/api/webinars/`
- `/register/` → `/api/accounts/auth/register/`
- `/recordings/` → `/api/recordings/`
- `/notifications/` → `/api/communications/notifications/`

### More Information

- **Migration Guide:** See `REFACTORING_GUIDE.md` in project root
- **Quick Start:** See `QUICKSTART_REFACTORED.md` in project root
- **Final Summary:** See `FINAL_SUMMARY.md` in project root

---

**This app will be removed in a future version.**  
**Please migrate to the new structure immediately.**
