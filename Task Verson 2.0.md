# Task List - Version 2.0 Upgrade (Job-Hunt Mode Integration)

This task checklist tracks the implementation steps required to upgrade the application to Version 2.0, adding the autonomous Job-Hunt mode while preserving all existing capabilities.

---

## 1. Goal 1: Integrate "Job-Hunt Mode" Toggle & Switch UI
- `[x]` Define `jobHuntMode` state in `App.jsx` and persist it to `localStorage`.
- `[x]` Add a premium, glowing toggle switch in the navbar (`top-navbar`) with a briefcase icon (`Briefcase` or `GraduationCap` or custom) labeled "Job-Hunt Mode".
- `[x]` Create visual theme updates in `App.css` to notify the user when Job-Hunt mode is activated (e.g., subtle gold or orange glow effects, changing header branding).

---

## 2. Goal 2: Backend Architecture & Database Setup
- `[x]` Create `backend/models/Resume.js` schema for storing ATS scores, extracted skills, and suggestions.
- `[x]` Create `backend/models/JobApplication.js` schema for logging applied companies, jobs, cover letters, and statuses.
- `[x]` Configure Mongoose model registrations and relations inside `backend/server.js`.

---

## 3. Goal 3: Backend API Development
- `[ ]` Create resume parser endpoint `POST /api/resume/evaluate`:
  - Receives resume file buffers (PDF or Text).
  - Prompts Gemini 2.5 Flash to extract ATS score, keywords, missing items, and search queries in a clean JSON format.
  - Stores the analysis in the database.
- `[ ]` Create search & auto-apply endpoint `POST /api/resume/auto-apply`:
  - Simulates/calls job search portal listings based on the resume's target keywords.
  - Loops over results and generates bespoke cover letters for each position using Gemini.
  - Records application entries in the database.
- `[ ]` Create history fetch endpoint `GET /api/resume/history`:
  - Retrieves all historical resume analyses and job applications for the current session.

---

## 4. Goal 4: Frontend Agentic Dashboard & Visuals
- `[ ]` Add custom option `💼 ATS Auto-Apply` in the input attach menu, visible **only** when Job-Hunt mode is active.
- `[ ]` Build the overlay dashboard modal/panel (`.job-hunt-dashboard`):
  - Add drag-and-drop file upload target zone.
  - Implement dynamic circular ATS score gauge (color transitions: red < 50%, yellow 50-79%, green >= 80%).
  - Create scrollable pseudo-terminal container displaying real-time agent output lines.
  - Add jobs grid/table rendering applied positions and a click-to-open sub-modal showing generated cover letters.

---

## 5. Goal 5: Ensure Separation & Retention of Classic Features
- `[ ]` Verify that when Job-Hunt mode is **inactive**:
  - All standard messaging functions (text prompts, image prompts, PDF reading queries) work perfectly.
  - Normal files uploaded via attach menu are handled as general chat context by Gemini.
  - The job dashboard and logs are completely hidden, preserving the original ChatGPT interface.
- `[ ]` Verify that when Job-Hunt mode is **active**:
  - General chat operations still function.
  - File uploads specifically matching resume pathways trigger the ATS dashboard and auto-apply pipeline.

---

## 6. Goal 6: Verification & Validation
- `[ ]` Build production code (`npm run build`) in both backend and frontend to check compile-time health.
- `[ ]` Perform manual integration testing (mocking high/low ATS scenarios to check branching workflows).
