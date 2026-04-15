# PRD V2.1 — Implementation status

## Completed in this pass

- **Interactive Android reminder actions**: Task reminders now register notification actions for **Done** and **Snooze 10 min** via `expo-notifications` categories. The app listens for notification responses on live launch and cold start, then reuses the existing `completeTask` / `snoozeTask` flows so persistence and reminder rescheduling stay centralized.
- **Production Android release APK**: Release signing via `android/keystore.properties` + `android/task-manager-release.keystore` (local, gitignored). Build: `npm run build:android:release` (runs `scripts/Build-AndroidRelease.ps1`). Output: `dist/task-manager-release.apk` (copy of `android/app/build/outputs/apk/release/app-release.apk`). `versionCode` **2** in `app.json` / Gradle. `EX_DEV_CLIENT_NETWORK_INSPECTOR=false` in `android/gradle.properties`. **Back up** the keystore and passwords; Play Store updates require the same signing key.

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

- Background/headless handling if you want notification action presses to mutate task state without bringing the app to the foreground first.
- Per-task `replaceReminder` without walking all tasks if notification volume grows very large.
- Unit tests for `resolveLocalWallClockInstant` on known DST transition dates in your target locales.

---

_Last updated after Android notification actions pass._
