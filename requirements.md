# Requirements Document

## Introduction

To-Do List Life Dashboard adalah aplikasi web produktivitas all-in-one berbasis browser yang menyatukan empat fitur utama dalam satu halaman: Greeting & Clock (waktu dan sapaan dinamis), Focus Timer (Pomodoro 25 menit), To-Do List (manajemen tugas lengkap), dan Quick Links (bookmark link favorit). Aplikasi dibangun dengan HTML, CSS, dan Vanilla JavaScript tanpa framework eksternal. Semua data disimpan di browser menggunakan LocalStorage API sehingga tidak memerlukan server atau backend. Aplikasi harus berjalan di semua modern browser (Chrome 80+, Firefox 75+, Edge 80+, Safari 13.1+).

---

## Glossary

- **Dashboard**: Halaman tunggal (`index.html`) yang menampung semua fitur aplikasi.
- **Clock**: Komponen penampil waktu real-time (`HH:MM:SS`) di header.
- **Greeting**: Pesan sapaan dinamis yang berubah sesuai jam hari di header.
- **Timer**: Komponen Focus Timer (countdown 25 menit / Pomodoro).
- **Task**: Item pekerjaan yang tersimpan di LocalStorage dengan properti `id`, `text`, `done`, dan `createdAt`.
- **Link**: Item bookmark yang tersimpan di LocalStorage dengan properti `name` dan `url`.
- **LocalStorage**: Browser API yang menyimpan data sebagai string di sisi klien (key: `dashboard_todos` dan `dashboard_links`).
- **escHtml**: Fungsi utilitas yang meng-escape karakter HTML (`& < > " '`) untuk mencegah XSS.
- **activeFilter**: State yang menentukan tampilan task: `'all'`, `'pending'`, atau `'done'`.
- **UID**: ID unik yang dihasilkan dari kombinasi `Date.now().toString(36)` dan `Math.random().toString(36)`.
- **Favicon**: Ikon website kecil yang diambil via Google Favicon API (`https://www.google.com/s2/favicons`).
- **Modal**: Dialog overlay untuk mengedit teks task yang sudah ada.

---

## Requirements

### Requirement 1: Real-Time Clock dan Tanggal

**User Story:** As a user, I want to see the current time and date displayed at all times, so that I can stay aware of the time without leaving the page.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Clock SHALL display the current time in `HH:MM:SS` format and update every second.
2. WHEN the Dashboard loads, THE Dashboard SHALL display the current date in `Day, DD Month YYYY` format (e.g., "Thursday, 16 October 2026").
3. THE Clock SHALL use `setInterval` with a 1-second interval to update the time display.
4. THE Clock SHALL use zero-padding so that single-digit hours, minutes, and seconds are displayed with a leading zero (e.g., `09:05:03`).

---

### Requirement 2: Greeting Berdasarkan Waktu Hari

**User Story:** As a user, I want to see a personalized greeting based on the time of day, so that the dashboard feels welcoming and contextually relevant.

#### Acceptance Criteria

1. WHEN the current hour is in the range `[0, 5)`, THE Greeting SHALL display "🌙 Good night!".
2. WHEN the current hour is in the range `[5, 12)`, THE Greeting SHALL display "☀️ Good morning!".
3. WHEN the current hour is in the range `[12, 17)`, THE Greeting SHALL display "🌤 Good afternoon!".
4. WHEN the current hour is in the range `[17, 21)`, THE Greeting SHALL display "🌆 Good evening!".
5. WHEN the current hour is in the range `[21, 24)`, THE Greeting SHALL display "🌙 Good night!".
6. THE Greeting SHALL update in sync with the Clock's 1-second interval so the greeting changes immediately when the hour boundary is crossed.

---

### Requirement 3: Focus Timer (Countdown 25 Menit)

**User Story:** As a user, I want a 25-minute countdown timer with Start, Pause, and Reset controls, so that I can focus on work using the Pomodoro technique.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Timer SHALL display "25:00" as the initial state.
2. WHEN the user clicks the Start button, THE Timer SHALL begin counting down from the current remaining time at a rate of one second per tick.
3. WHEN the Start button is clicked while the Timer is already running, THE Timer SHALL ignore the click and SHALL NOT start a second concurrent interval.
4. WHEN the user clicks the Pause button, THE Timer SHALL stop the countdown and display "⏸ Paused" as the status label.
5. WHEN the user clicks the Reset button, THE Timer SHALL stop the countdown, reset remaining time to 1500 seconds (25:00), and display "Ready to focus 🎯" as the status label.
6. WHEN the countdown reaches zero, THE Timer SHALL stop automatically, display "00:00", set the progress bar width to 0%, and display "🎉 Session complete! Take a break." as the status label.
7. WHILE the Timer is running, THE Timer SHALL update the progress bar width every second using the formula `(TOTAL_SECONDS - remaining) / TOTAL_SECONDS × 100`, so that the bar shrinks from 100% to 0% as time elapses.
8. WHILE the Timer is running, THE Dashboard SHALL display "🔥 Focusing…" as the status label.

---

### Requirement 4: Tambah Task Baru

**User Story:** As a user, I want to add new tasks to my to-do list, so that I can capture and track things I need to accomplish.

#### Acceptance Criteria

1. WHEN the user submits the add-task form with a non-empty text, THE Dashboard SHALL create a new Task with a unique `id` (generated by the UID algorithm), `done: false`, and `createdAt: Date.now()`, and prepend it to the top of the task list.
2. WHEN the user submits the add-task form, THE Dashboard SHALL persist the updated task array to LocalStorage under key `dashboard_todos` immediately.
3. WHEN a new task is successfully added, THE Dashboard SHALL clear the task input field and return focus to it.
4. IF the user attempts to submit the add-task form with an empty or whitespace-only text, THEN THE Dashboard SHALL prevent the addition and leave the task list unchanged.
5. THE Dashboard SHALL limit task text to a maximum of 120 characters via the `maxlength` HTML attribute.

---

### Requirement 5: Toggle Status Task (Done / Pending)

**User Story:** As a user, I want to mark tasks as done or pending by clicking a checkbox, so that I can track my progress.

#### Acceptance Criteria

1. WHEN the user clicks a task's checkbox, THE Dashboard SHALL toggle the `done` property of that Task between `true` and `false`.
2. WHEN a Task's `done` property is `true`, THE Dashboard SHALL render the task item with a strikethrough style and reduced opacity.
3. WHEN a Task's `done` property is `false`, THE Dashboard SHALL render the task item without strikethrough.
4. WHEN a task's `done` status is toggled, THE Dashboard SHALL persist the updated task array to LocalStorage immediately and re-render the task list.

---

### Requirement 6: Edit Teks Task

**User Story:** As a user, I want to edit the text of an existing task, so that I can correct or update it without deleting and re-adding it.

#### Acceptance Criteria

1. WHEN the user clicks the edit button (✏️) on a task, THE Dashboard SHALL open the Modal dialog pre-filled with the current task text.
2. WHEN the Modal is open, THE Dashboard SHALL move keyboard focus to the modal input field within 50 milliseconds.
3. WHEN the user clicks the Save button in the Modal with a non-empty text, THE Dashboard SHALL update the Task's `text` property, persist the changes to LocalStorage, close the Modal, and re-render the task list.
4. IF the user clicks Save in the Modal with an empty or whitespace-only text, THEN THE Dashboard SHALL prevent the save and keep the Modal open.
5. WHEN the user clicks the Cancel button or presses the Escape key, THE Dashboard SHALL close the Modal without saving any changes.
6. WHEN the user clicks outside the Modal dialog (on the overlay backdrop), THE Dashboard SHALL close the Modal without saving any changes.
7. WHEN the user presses Enter while the modal input is focused, THE Dashboard SHALL trigger the save action.

---

### Requirement 7: Hapus Task

**User Story:** As a user, I want to delete individual tasks from my list, so that I can remove tasks I no longer need.

#### Acceptance Criteria

1. WHEN the user clicks the delete button (🗑️) on a task, THE Dashboard SHALL remove that Task from the task array by its `id`.
2. WHEN a task is deleted, THE Dashboard SHALL persist the updated task array to LocalStorage immediately and re-render the task list.

---

### Requirement 8: Filter Task (All / Pending / Done)

**User Story:** As a user, I want to filter my task list by status, so that I can focus on tasks that need attention or review what I've completed.

#### Acceptance Criteria

1. WHEN the user clicks the "All" filter button, THE Dashboard SHALL display all tasks regardless of their `done` status.
2. WHEN the user clicks the "Pending" filter button, THE Dashboard SHALL display only tasks where `done` is `false`.
3. WHEN the user clicks the "Done" filter button, THE Dashboard SHALL display only tasks where `done` is `true`.
4. WHEN a filter button is activated, THE Dashboard SHALL apply the "active" visual style to the selected button and remove it from the others.
5. WHILE the "Pending" filter is active and all tasks are complete, THE Dashboard SHALL display the empty state message "🎉 All tasks done!".
6. WHILE the "Done" filter is active and no tasks are complete, THE Dashboard SHALL display the empty state message "No completed tasks yet.".
7. WHILE the "All" filter is active and the task list is empty, THE Dashboard SHALL display the empty state message "✨ No tasks yet. Add one above!".

---

### Requirement 9: Statistik Task

**User Story:** As a user, I want to see a summary of my task counts, so that I can quickly understand my overall progress.

#### Acceptance Criteria

1. THE Dashboard SHALL display the total number of tasks as "`N` task" (singular) or "`N` tasks" (plural) in the stats bar.
2. THE Dashboard SHALL display the count of completed tasks as "`N` done" in the stats bar.
3. THE Dashboard SHALL display the count of pending tasks as "`N` pending" in the stats bar.
4. WHEN any task operation occurs (add, toggle, delete, edit, clear completed), THE Dashboard SHALL recalculate and update all three stat values immediately.
5. THE Dashboard SHALL maintain the invariant: `statTotal = statDone + statPending` at all times.

---

### Requirement 10: Hapus Semua Task Selesai

**User Story:** As a user, I want to clear all completed tasks at once, so that I can quickly clean up my list without deleting tasks one by one.

#### Acceptance Criteria

1. WHEN the user clicks the "Clear completed" button, THE Dashboard SHALL remove all Tasks where `done` is `true` from the task array.
2. WHEN "Clear completed" is clicked, THE Dashboard SHALL persist the filtered task array to LocalStorage immediately and re-render the task list.
3. WHEN "Clear completed" is clicked and no completed tasks exist, THE Dashboard SHALL leave the task list unchanged.

---

### Requirement 11: Persistensi Data Task ke LocalStorage

**User Story:** As a user, I want my tasks to be saved automatically, so that they persist across browser sessions and page refreshes.

#### Acceptance Criteria

1. THE Dashboard SHALL store the task array as a JSON string in LocalStorage under the key `dashboard_todos` after every write operation.
2. WHEN the Dashboard loads, THE Dashboard SHALL read and parse the task array from LocalStorage key `dashboard_todos`.
3. IF the LocalStorage value for `dashboard_todos` is `null` or contains invalid JSON, THEN THE Dashboard SHALL initialize the task array as an empty array `[]` without crashing.
4. THE Dashboard SHALL maintain the round-trip invariant: for any task array written with `save()`, calling `load()` immediately afterward SHALL return an equivalent array.

---

### Requirement 12: Tambah Quick Link

**User Story:** As a user, I want to add URLs as quick-access links, so that I can navigate to my favorite websites with a single click.

#### Acceptance Criteria

1. WHEN the user submits the add-link form with a non-empty name and URL, THE Dashboard SHALL create a new Link item and append it to the links array.
2. WHEN the user submits the add-link form, THE Dashboard SHALL persist the updated links array to LocalStorage under key `dashboard_links` immediately.
3. WHEN a new link is successfully added, THE Dashboard SHALL clear both name and URL input fields and return focus to the name input.
4. IF the submitted URL does not start with `http://` or `https://`, THEN THE Dashboard SHALL automatically prepend `https://` before saving.
5. IF the user attempts to submit the add-link form with an empty name or URL, THEN THE Dashboard SHALL prevent the addition.
6. THE Dashboard SHALL limit link name to a maximum of 30 characters via the `maxlength` HTML attribute.

---

### Requirement 13: Tampil dan Hapus Quick Link

**User Story:** As a user, I want to see my saved links and remove ones I no longer need, so that I can keep my quick links relevant.

#### Acceptance Criteria

1. WHEN the Dashboard renders the links list, THE Dashboard SHALL display each Link as a pill/chip element containing the link name and a delete button.
2. WHEN the Dashboard renders a link, THE Dashboard SHALL attempt to display the link's favicon using the Google Favicon API URL `https://www.google.com/s2/favicons?domain={hostname}&sz=16`.
3. IF the link's URL is invalid or the favicon cannot be resolved, THEN THE Dashboard SHALL render the link without an `<img>` tag, displaying text only.
4. WHEN the user clicks the delete button (✕) on a link, THE Dashboard SHALL remove that Link from the links array by its array index, persist the change to LocalStorage, and re-render the links list.
5. WHEN the Dashboard renders each link, THE Dashboard SHALL set `target="_blank"` and `rel="noopener noreferrer"` on the anchor element to prevent reverse tabnapping.
6. WHILE the links list is empty, THE Dashboard SHALL display the empty state message "No links yet. Add your favorites!".

---

### Requirement 14: Persistensi Data Link ke LocalStorage

**User Story:** As a user, I want my quick links to be saved automatically, so that they persist across browser sessions.

#### Acceptance Criteria

1. THE Dashboard SHALL store the links array as a JSON string in LocalStorage under the key `dashboard_links` after every write operation.
2. WHEN the Dashboard loads, THE Dashboard SHALL read and parse the links array from LocalStorage key `dashboard_links`.
3. IF the LocalStorage value for `dashboard_links` is `null` or contains invalid JSON, THEN THE Dashboard SHALL initialize the links array as an empty array `[]` without crashing.

---

### Requirement 15: Keamanan Input (XSS Prevention)

**User Story:** As a user, I want my data to be handled safely, so that malicious content in task text or link names cannot execute as code.

#### Acceptance Criteria

1. THE Dashboard SHALL escape all user-generated content (task text and link names) using `escHtml()` before inserting it into `innerHTML`.
2. THE `escHtml` function SHALL escape the characters `&`, `<`, `>`, `"`, and `'` into their respective HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`).
3. THE `escHtml` function SHALL be idempotent on its own output: calling `escHtml(escHtml(str))` SHALL return the same result as `escHtml(str)`.
4. THE Dashboard SHALL NOT send any user data to external servers; all processing SHALL remain client-side.

---

### Requirement 16: Responsif dan Struktur File

**User Story:** As a user, I want the dashboard to work well on different screen sizes, so that I can use it on both desktop and mobile devices.

#### Acceptance Criteria

1. THE Dashboard SHALL use a two-column layout for the top row (Focus Timer + Quick Links) on screens wider than 900px.
2. WHEN the viewport width is 900px or less, THE Dashboard SHALL switch to a single-column layout for all sections.
3. THE Dashboard SHALL be implemented in exactly three files: `index.html` at the project root, `css/style.css`, and `js/app.js`.
4. THE Dashboard SHALL NOT depend on any external JavaScript framework or library (no React, Vue, Angular, jQuery, etc.).
5. THE Dashboard SHALL function correctly in Chrome 80+, Firefox 75+, Edge 80+, and Safari 13.1+.
