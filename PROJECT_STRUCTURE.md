# 🏛️ CampusFlow Architecture & Project Structure

Welcome to the **CampusFlow** codebase! This document outlines where every piece of code lives, how components are organized for maximum reusability, and where to find or add features.

---

## 📁 High-Level Folder Structure

```
campusflow/
├── public/                 # Static assets (favicons, manifest, sound effects)
├── src/
│   ├── assets/             # Brand logos and vector graphics
│   ├── components/         # Modular, reusable React components
│   │   ├── assignments/    # Experiment tracking & submission workflows
│   │   ├── auth/           # Google & student login modal
│   │   ├── dashboard/      # Bento grid widgets & statistics cards
│   │   ├── landing/        # Home landing page sections
│   │   ├── layout/         # App shell (Sidebar, Topbar, UserMenu, Shell)
│   │   ├── notifications/  # Notification dropdown & push settings
│   │   ├── subjects/       # Subject cards & curriculum creation
│   │   └── ui/             # Core atomic design & React Bits micro-interactions
│   ├── context/            # React Contexts (Supabase Auth & session)
│   ├── data/               # Default seeds & fallback datasets
│   ├── lib/                # Third-party SDK clients (Supabase)
│   ├── pages/              # High-level route views (lean, composable screens)
│   ├── store/              # Zustand global state (assignments, layout, toast)
│   ├── types/              # TypeScript interface & enum definitions
│   └── utils/              # Helper functions & browser notification engine
```

---

## 🧩 Components Guide ("Which Code is Where?")

### 1. `src/components/ui/` (Atomic UI & React Bits Micro-Interactions)
These are independent, reusable building blocks:
* **`TechText.tsx`** – Interactive SVG cursor-tracking text animation with coordinate crosshairs and hover glow (*React Bits*).
* **`CodeSlots.tsx`** – Mechanical slot-machine number reel animations for authorization passcodes (*React Bits*).
* **`MagicBento.tsx`** – Spotlight radial cursor tracking grid & cards (*React Bits*).
* **`Stepper.tsx`** – Horizontal and vertical step progress bar for submission cycles (*React Bits*).
* **`BranchedMenu.tsx`** – SVG tree branches connecting subjects to experiments with collapse/expand (*React Bits*).
* **`SpringCheck.tsx`** – Springy bounce checkbox with animated SVG checkmark stroke drawing (*React Bits*).
* **`Button.tsx`** – Standard button with variants (`primary`, `secondary`, `outline`, `danger`, `ghost`).
* **`Badge.tsx`** – Status & metadata pill badges.
* **`Card.tsx`** – Clean white card container primitives.
* **`ConfirmationDialog.tsx`** – Accessible modal confirmation for destructive actions.
* **`ErrorBoundary.tsx`** – React error boundary for crash protection.
* **`ToastContainer.tsx`** – Pop-up notification toasts.

### 2. `src/components/dashboard/` (Modular Dashboard Widgets)
* **`DashboardHeader.tsx`** – Greeting header, realtime sync status, and "Add Experiment" button.
* **`ActionRequiredCard.tsx`** – Bento widget displaying overdue or urgent experiments.
* **`AcademicProgressCard.tsx`** – Bento widget with overall completion bar, pending and overdue counts.
* **`WorkflowDistributionCard.tsx`** – Bento widget displaying live counts across the 6 workflow phases.
* **`UpcomingDeadlinesCard.tsx`** – Bento widget displaying experiments due in the next 7 days with calendar date badges.

### 3. `src/components/assignments/` (Experiment & Lab Details)
* **`AssignmentHeader.tsx`** – Back navigation, subject badge, experiment title, edit/delete buttons, and bulk complete action.
* **`AssignmentWorkflowStepper.tsx`** – Interactive 6-step progress stepper for lab submissions.
* **`AssignmentChecklist.tsx`** – 6 independent `SpringCheck` items, completion banner, and faculty feedback box.
* **`AssignmentSidebar.tsx`** – Metadata sidebar (due date, faculty, Moodle link, description, notes).
* **`ExperimentFormModal.tsx`** – Modal dialog to create or edit lab experiments.

### 4. `src/components/subjects/` (Curriculum & Course Cards)
* **`SubjectCard.tsx`** – Clean card for classic grid view displaying progress bar and total/pending/completed counters.
* **`SubjectFormModal.tsx`** – Modal dialog to add a new course/subject with color picking.

### 5. `src/components/notifications/` (Notifications & System Alerts)
* **`NotificationItem.tsx`** – Individual notification row with time-remaining pill, experiment title, and dismiss button.
* **`NotificationPushSettings.tsx`** – Tab for enabling browser/device push alerts, timing info, and test alert trigger.
* **`NotificationEmptyState.tsx`** – Clean empty state with "Restore cleared notifications" option.

### 6. `src/components/landing/` (Landing Page Sections)
* **`LandingNavbar.tsx`** – Sticky header with CampusFlow brand icon, sign-in button, and workspace CTA.
* **`LandingHero.tsx`** – Hero headline, TechText animated wordmark, and Google OAuth CTA.
* **`LandingFeatures.tsx`** – MagicBento feature grid previewing the Stepper, SpringCheck, and notifications.
* **`LandingFooter.tsx`** – Bottom action banner and copyright footer.

### 7. `src/components/layout/` (App Shell & Navigation)
* **`Layout.tsx`** – Outer layout frame connecting Sidebar, Topbar, and `<Outlet />`.
* **`Sidebar.tsx`** – Collapsible navigation drawer with course quick-links and student profile.
* **`Topbar.tsx`** – Top navigation with search bar, focus mode toggle, notifications dropdown, and user menu.
* **`UserMenu.tsx`** – Authenticated user profile avatar and dropdown (Google account / guest session / sign out).
* **`NotificationDropdown.tsx`** – Popover panel for deadlines and device push alerts.

### 8. `src/components/auth/` (Authentication)
* **`LoginModal.tsx`** – Modal featuring `CodeSlots` slot machine reel animation, Google OAuth, and 1-click student mode.

---

## 📄 Pages Directory (`src/pages/`)
Each page file is now lean (~50 to 150 lines), focusing solely on data fetching and assembling modular components:
* **`LandingPage.tsx`** (`/`) – Public home landing page.
* **`Dashboard.tsx`** (`/dashboard`) – Primary workspace bento dashboard.
* **`Assignments.tsx`** (`/assignments`) – Full list of all experiments across subjects.
* **`AssignmentDetail.tsx`** (`/assignments/:id`) – Detailed lab experiment workflow page.
* **`Subjects.tsx`** (`/subjects`) – Course curriculum view with Branched Tree and Grid Cards views.
* **`SubjectDetail.tsx`** (`/subjects/:id`) – Individual subject overview and experiment breakdown.
* **`Calendar.tsx`** (`/calendar`) – Month-by-month calendar view with experiment deadlines.
* **`Submissions.tsx`** (`/submissions`) – Summary of upload-ready and submitted lab work.
* **`Settings.tsx`** (`/settings`) – Student profile, notifications settings, and database sync options.

---

## 🗄️ State, Context & Utilities

* **`src/context/AuthContext.tsx`** – Manages Supabase Google OAuth state, user session, and student fallback session.
* **`src/store/useStore.ts`** – Zustand store managing subjects and assignments with Supabase database synchronization and localStorage fallback.
* **`src/store/useLayoutStore.ts`** – Zustand store for sidebar and topbar hide/focus mode toggles.
* **`src/store/useToast.ts`** – Zustand store for toast alerts.
* **`src/utils/notifications.ts`** – Browser push notifications, permission requests, sound effects, and deadline checks.
* **`src/utils/index.ts`** – Helper functions (`formatDate`, `getDaysRemaining`, `cn`).
* **`src/types/index.ts`** – Core data structures (`Assignment`, `Subject`, `Checklist`, `WorkflowStage`).
