# Task Manager

A premium, **offline-first** mobile task manager for iOS and Android. Built with Expo (React Native), it features an OLED-optimized pitch-black interface, customizable accent colors, sub-tasks, recurring tasks, drag-and-drop reordering, smart local notifications, and per-task GitHub-style activity heatmaps.

---

## Features

- **Offline-first** — no account or internet connection required; all data stored locally on device.
- **OLED pitch-black UI** — true `#000000` background to save battery on OLED screens.
- **Accent color theming** — choose from 8 vibrant accent colors (Cyan, Rose, Lime, Violet, Amber, Coral, Mint, Peach).
- **Categories & Tags** — organize tasks into color-coded categories and apply free-form tags for cross-category filtering.
- **Sub-tasks** — break any task into smaller steps with drag-and-drop reordering and swipe-to-delete.
- **Recurring tasks** — daily, weekly, monthly, or custom cadence; each completion auto-generates the next instance.
- **Drag-and-drop reordering** — long-press to reorder tasks and sub-tasks with smooth haptic feedback animations.
- **Smart local notifications** — set reminders with customizable offsets; snooze and catch-up toasts on app launch.
- **Activity heatmap** — GitHub-style grid showing daily task activity, streaks, and subtask completion counts per task.
- **Multiple calendar views** — Today, Weekly, Monthly, and All Tasks screens with search, filter, and sort options.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Expo (React Native) |
| Navigation | React Navigation |
| Notifications | `expo-notifications` |
| Storage | `@react-native-async-storage/async-storage` |
| Date / Time | `date-fns` |
| Styling | React Native `StyleSheet` |
| Animations | `react-native-reanimated` |
| Drag & Drop | `react-native-draggable-flatlist` |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator **or** the [Expo Go](https://expo.dev/client) app on a physical device

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to open the app on your device.

---

## Screens

| Screen | Description |
|---|---|
| **Today** | Greeting, category filter pills, stats bar, priority-grouped task list |
| **Weekly** | Horizontal week strip with task dots; drag-and-drop list for the selected day |
| **Monthly** | Calendar grid with dot indicators; tap a day to see a half-sheet of tasks |
| **All Tasks** | Searchable, filterable, sortable master list with full drag-and-drop support |
| **Add / Edit Task** | Full-screen modal — title, description, category, tags, priority, due date/time, recurrence, reminder, sub-tasks |
| **Task Detail** | Large checkbox, metadata badges, reorderable sub-task list, link to Activity Heatmap |
| **Activity Heatmap** | GitHub-style grid per task; shows active days, best streak, current streak, total sub-tasks done |
| **Category Manager** | Create, rename, recolor, and delete categories; accessed via the Settings gear |

---

## Onboarding

The first launch walks through 4 swipable slides:

1. **Welcome** — minimalist checkmark animation.
2. **Organization** — tasks dropping into color-coded folders with expanding sub-tasks.
3. **Routines & Reminders** — recurring icon and a notification card sliding in.
4. **Personalization** *(required)* — pick your accent color to unlock the app and generate four default categories: **Personal**, **Work**, **Errands**, **Ideas**.

---

## Data Storage

All data is persisted locally via `AsyncStorage` using three keys:

| Key | Contents |
|---|---|
| `@tasks` | JSON array of Task objects |
| `@categories` | JSON array of Category objects |
| `@app_settings` | JSON object (accent color, notification permissions, onboarding flag) |

---

## Out of Scope (V1)

The following are intentionally excluded from the first release:

- Cloud sync / user accounts / backend
- File or image attachments
- Natural language task parsing
- Collaborative / shared lists
- iPad landscape-specific layouts

---

## License

MIT
