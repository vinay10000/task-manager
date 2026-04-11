# PRD V2.1 — Implementation status

## Completed in this pass

- **Recurring skip anchor**: Deleting/skipping an instance advances the series from the **skipped task’s due date** (local start of that day), not “now” (`skipRecurrenceAnchorIso` + `deleteTask`).
- **Cold start + resume reminder reconcile**: `reconcilePersistedOnResume` runs after load and on `AppState` `active` (timezone realign + missed reminders, single functional `setData` — no stale `data.tasks` closure).
- **DST / ambiguous local wall clock**: `computeReminderTime` resolves via `resolveLocalWallClockInstant` (gap → next valid minute; ambiguous → first matching instant).
- **Custom sort reindex**: `reindexTasksAfterCustomReorder` assigns contiguous global `sortOrder` after drag (ordered block first, then remaining by prior order).
- **Notification reschedule**: Cancels only scheduled notifications tagged with `data.taskId` (not `cancelAllScheduledNotificationsAsync`), then reschedules — aligns with per-task reminder lifecycle / snooze.
- **Reminder chips when permission denied**: `ScopeButton` supports `disabled` with reduced opacity; offset chips disabled when `!notificationGranted` or no date/time.
- **Task detail overflow**: Header ⋮ opens a bottom sheet with PRD-style actions (edit this / edit future, activity, snooze, delete this / delete future).
- **Weekly / Monthly**: Category strip hides **Uncategorized** until at least one task uses it (same rule as Today).

## Previously complete (unchanged summary)

Data model, storage keys, Today/All/calendar rules, categories, onboarding, recurrence/completion, corrupt JSON recovery, serialized writes, heatmap aggregation by series, etc.

## Optional follow-ups (nice-to-have)

- Per-task `replaceReminder` without walking all tasks if notification volume grows very large.
- Unit tests for `resolveLocalWallClockInstant` on known DST transition dates in your target locales.

---

_Last updated after PRD gap implementation pass._
