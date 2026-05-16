# Epic 02 – Browse and Start a Lesson

**Title:** Browse and Start a Lesson

**User Story:** As a returning learner, I want to browse recommended lessons and start one quickly so that I can begin practice without friction.

**Priority:** High

**Related Functional Requirement(s):** FR‑2, FR‑7

**Assumptions / Constraints**

- Lesson discovery is limited to the MVP lesson catalog.
- Free lessons only are shown in the MVP.
- Downloaded lessons must remain available offline if they were previously saved successfully.

---

## Decomposed User Stories

### Group 1 — Home Screen & Lesson Discovery

---

#### US-2.1: Home Screen Recommended Lesson

**User Story:** As a signed-in learner, I want to see a recommended lesson on the home screen so that I can start practicing immediately without browsing.

**Acceptance Criteria:**

- Given I am signed in, when I open the home screen, then I see a recommended lesson card with title, level, and estimated duration.
- Given I have completed previous sessions, when I open the home screen, then the recommended lesson is based on my practice level or last incomplete lesson.
- Given I have no prior session history, when I open the home screen, then the recommended lesson is the first lesson in the MVP catalog matching my profile level.

**Priority:** High

**Dependencies:** US-3.3 (Returning User Sign-In)

---

#### US-2.2: Lesson Library with Filters

**User Story:** As a returning learner, I want to browse the full lesson library and filter by level or topic so that I can find lessons that match my interests.

**Acceptance Criteria:**

- Given I am on the lesson library screen, when the page loads, then I see a list of all available MVP lessons.
- Given I am on the lesson library screen, when I apply a level filter (Beginner / Intermediate / Advanced), then the list is filtered to show only matching lessons.
- Given I am on the lesson library screen, when I apply a topic filter, then the list is filtered to show only lessons under that topic.
- Given I select a filter that yields no results, when the list updates, then I see an empty state message suggesting I try different filters.

**Priority:** High

**Dependencies:** US-3.3

---

### Group 2 — Lesson Details

---

#### US-2.3: Lesson Detail Screen

**User Story:** As a learner, I want to view a lesson's detail screen before starting so that I can confirm it matches my level, topic, and available time.

**Acceptance Criteria:**

- Given I tap a lesson from the home screen or library, when the lesson detail screen opens, then it displays the lesson title, level, topic, duration, and a brief description.
- Given the lesson detail screen is displayed, when I tap "Start Practice," then the shadowing session begins.
- Given a lesson has been fully completed, when I view its detail screen, then I see a "Completed" badge and the option to replay the session.

**Priority:** High

**Dependencies:** US-2.1 or US-2.2

---

### Group 3 — Offline Access

---

#### US-2.4: Offline Lesson Access from Downloads

**User Story:** As a learner without network connectivity, I want to browse and open downloaded lessons so that I can practice even when offline.

**Acceptance Criteria:**

- Given I have no network connection, when I open the lesson library, then the app displays a banner indicating offline mode.
- Given I have previously downloaded lessons, when I am offline, then the app shows only the downloaded lessons in the library.
- Given I have no downloaded lessons and no network, when I open the lesson library, then I see an empty state with a message to go online and download lessons.
- Given I open a downloaded lesson, when I tap "Start Practice," then the session begins using locally cached audio.

**Priority:** Medium

**Dependencies:** US-2.2

---

### Group 4 — Edge Cases & Errors

---

#### US-2.5: Stale or Removed Lesson Handling

**User Story:** As a learner, I want to be notified when a lesson I tapped is no longer available so that I can choose an alternative lesson instead.

**Acceptance Criteria:**

- Given a lesson has been removed or is unavailable, when I tap it from a stale view (e.g., cached list), then the app displays a message that the lesson is no longer available.
- Given the tapped lesson is unavailable, when the error message is shown, then the app suggests an alternative valid lesson from the same level or topic.
- Given the alternative suggestion is shown, when I accept it, then I am taken to that lesson's detail screen.

**Priority:** Medium

**Dependencies:** US-2.3

---

#### US-2.6: Lesson Content Loading Failure

**User Story:** As a learner, I want to be informed if lesson content fails to load so that I can retry or choose another lesson.

**Acceptance Criteria:**

- Given a lesson's audio or metadata fails to load, when I tap "Start Practice," then the app shows a retryable error message.
- Given the error message is shown, when I tap "Retry," then the app attempts to load the lesson again.
- Given the retry also fails, when the error persists, then the app offers a fallback option to return to the library.

**Priority:** Medium

**Dependencies:** US-2.3
