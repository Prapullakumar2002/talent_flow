# TalentFlow - Hiring Management System

A modern hiring management application built with React that helps you manage job postings and track candidates through the recruitment pipeline.

## 🎯 Project Overview

TalentFlow is a full-featured hiring management system that demonstrates key React concepts including:

- Component-based architecture
- State management with hooks
- Drag-and-drop interactions
- Mock API integration
- Client-side database storage
- Responsive design with Tailwind CSS

## 🏗️ Architecture

This project uses a modern React stack with several powerful tools:

### **Vite**

Vite is our build tool and development server. It's super fast and provides:

- Instant server start
- Lightning-fast Hot Module Replacement (HMR)
- Optimized production builds
- Modern JavaScript features out of the box

### **Tailwind CSS**

Tailwind is a utility-first CSS framework that lets us style components directly in JSX:

- No need to write custom CSS files
- Consistent design system
- Responsive design made easy
- Small production bundle size

### **Dexie.js**

Dexie is a wrapper for IndexedDB (browser database) that provides:

- Local data storage that persists between sessions
- Fast queries for 1000+ records
- No backend server needed for development
- Simple, promise-based API

### **MSW (Mock Service Worker)**

MSW intercepts network requests and returns mock data:

- Simulates a real REST API
- Works in both development and testing
- No actual backend needed
- Realistic API behavior

### **@dnd-kit**

A modern drag-and-drop library for React:

- Accessible and keyboard-friendly
- Smooth animations
- Works with React 19
- Used for reordering jobs and moving candidates

## 📁 Project Structure

```
talentflow-hiring/
├── public/
│   ├── mockServiceWorker.js    # MSW service worker
│   └── vite.svg                # Favicon
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Main layout with navigation
│   │   └── Modal.jsx           # Reusable modal component
│   ├── mocks/
│   │   ├── browser.js          # MSW worker setup
│   │   └── handlers.js         # API endpoint handlers
│   ├── pages/
│   │   ├── AssessmentBuilder.jsx  # Assessment creation tool
│   │   ├── CandidateProfile.jsx   # Candidate detail page
│   │   ├── Candidates.jsx      # Kanban board for candidates
│   │   ├── Dashboard.jsx       # Home page
│   │   ├── Jobs.jsx            # Jobs list with filters
│   │   └── NotFound.jsx        # 404 page
│   ├── App.jsx                 # Router configuration
│   ├── db.js                   # Dexie database setup
│   ├── index.css               # Tailwind imports
│   └── main.jsx                # App entry point
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed on your computer. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

1. **Clone or download this project**

2. **Install dependencies**

   ```bash
   npm install
   ```

   This command reads the `package.json` file and installs all required packages.

3. **Start the development server**

   ```bash
   npm run dev
   ```

   This starts Vite's development server. You'll see a URL in the terminal (usually `http://localhost:5173`).

4. **Open your browser**
   Navigate to the URL shown in the terminal. The app will automatically reload when you make changes to the code!

### Other Commands

- **Build for production**

  ```bash
  npm run build
  ```

  Creates an optimized production build in the `dist/` folder.

- **Preview production build**

  ```bash
  npm run preview
  ```

  Serves the production build locally to test it before deployment.

- **Lint code**
  ```bash
  npm run lint
  ```
  Checks your code for potential errors and style issues.

## ✨ Features

### 1. Jobs Board

- View all job postings in a responsive table
- **Real-time search** - Filter jobs by title
- **Status filtering** - Filter by open/closed/draft/archived
- Create new jobs with a modal form
- **Unique slug validation** - Auto-generated URL-friendly slugs with uniqueness checks
- **Archive/Unarchive functionality** - Toggle job archive status with optimistic updates
- **Drag-and-drop reordering** - Reorder jobs with visual feedback
- Color-coded status badges (green for open, red for closed, yellow for archived, gray for draft)
- Direct link to assessment builder for each job
- Optimistic updates with automatic rollback on API errors (7.5% simulated failure rate)

### 2. Candidates Kanban

- **Efficiently handles 1000+ candidates** across 5 pipeline stages
- **Client-side search** - Real-time filtering by name or email
- **Drag-and-drop stage management:**
  - Applied → Screening → Interview → Offer → Hired
  - Visual feedback during drag operations
  - Column highlighting on hover
- **Optimistic UI updates** with automatic rollback on failures
- **Automatic history tracking** - Every stage change is recorded
- Click any candidate card to view detailed profile
- Dynamic result counter shows filtered candidates
- Smooth animations and transitions

### 3. Assessment Builder

- Create custom assessments for each job
- **6 question types** (exceeds requirement of 4):
  - Single Choice (radio buttons)
  - **Multi Choice (checkboxes)** - Select multiple options, stored as array
  - Short Text (single-line input with length validation)
  - **Long Text (textarea)** - Multi-line input with min/max length
  - Numeric (number input with range validation)
  - File Upload (stub/placeholder as specified)
- **Comprehensive validation engine:**
  - Required field validation
  - Min/max text length (characters)
  - Min/max numeric range
  - Multi-choice: at least one option required
  - Real-time error feedback
- **Advanced conditional logic:**
  - Show/hide questions based on previous answers
  - Dynamic form behavior (e.g., "Show Q3 only if Q1 == 'Yes'")
  - Dependency tracking and automatic cleanup
  - Prevents orphaned conditionals when questions are deleted
- **Split-panel interface:**
  - Left: Question builder with full customization
  - Right: Live preview showing candidate experience
- **State persistence** - All changes saved to IndexedDB
- Auto-generated unique question IDs for tracking

### 4. Candidate Profile

- View detailed candidate information
- Timeline showing all activity:
  - Stage changes with timestamps
  - Notes and comments
- Add notes with @mention support
  - Type @username to mention someone
  - Mentions highlighted in blue
- Sticky sidebar with quick actions
- Automatic history tracking

### 5. API Simulation & Data Persistence

- **Production-grade API simulation** with MSW (Mock Service Worker):
  - **Artificial latency**: 200-1200ms random delay on all requests (simulates real network conditions)
  - **Error rate**: 7.5% random failures on write operations (POST/PATCH/PUT)
  - Thoroughly tests loading states, error handling, and rollback logic
  - 15+ RESTful endpoints with proper HTTP status codes
- **Robust IndexedDB storage** via Dexie.js:
  - All data persists between page refreshes and browser sessions
  - **6 relational tables**: jobs, candidates, assessments, responses, stageHistory, notes
  - Automatically seeds 25 jobs and 1000 candidates on first load
  - Indexed fields for fast queries (by jobId, candidateId, stage, etc.)
  - Assessments, responses, notes, and complete history saved locally
- **Optimistic UI pattern** with automatic rollback on API failures
- **Automatic history tracking** - Stage changes recorded without manual intervention

## 🎨 Key React Concepts Used

### Hooks

- `useState` - Managing component state
- `useEffect` - Fetching data and side effects
- `useSensor` / `useSensors` - Drag-and-drop sensors

### Component Patterns

- Functional components
- Props for component communication
- Conditional rendering
- List rendering with `.map()`

### State Management

- Local state with useState
- Optimistic updates
- Error handling with rollback

### Forms

- Controlled inputs
- Form validation
- Submit handling

## 🔧 How It Works

### Data Flow

1. **App Initialization** (`main.jsx`)

   - Seeds the database with sample data
   - Starts MSW to intercept API calls
   - Renders the React app

2. **API Calls** (e.g., `fetch('/api/jobs')`)

   - MSW intercepts the request
   - Handler in `handlers.js` processes it
   - Dexie queries the IndexedDB
   - Response is returned to the component

3. **State Updates**
   - Component receives data
   - Updates state with `setState`
   - React re-renders the UI

### Drag and Drop Flow

1. User starts dragging an item
2. `onDragStart` captures the dragged item
3. User drops it in a new location
4. `onDragEnd` fires with old and new positions
5. UI updates immediately (optimistic)
6. API call is made to persist the change
7. If API fails, UI reverts to previous state

## 📚 Learning Resources

If you're new to these technologies, here are some helpful resources:

- **React**: [react.dev](https://react.dev)
- **Vite**: [vitejs.dev](https://vitejs.dev)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **Dexie.js**: [dexie.org](https://dexie.org)
- **MSW**: [mswjs.io](https://mswjs.io)
- **@dnd-kit**: [docs.dndkit.com](https://docs.dndkit.com)

## 🐛 Troubleshooting

### Port already in use

If you see an error about port 5173 being in use, you can:

- Stop other Vite servers
- Or Vite will automatically try the next available port

### Database not seeding

If you don't see any jobs or candidates:

1. Open browser DevTools (F12)
2. Go to Application > IndexedDB
3. Delete the "talentflow" database
4. Refresh the page

### MSW not working

If API calls aren't being intercepted:

1. Make sure `public/mockServiceWorker.js` exists
2. Check the browser console for MSW messages
3. Try running `npx msw init public/ --save` again

## 🎓 What I Learned

Building this project taught me:

- **React Architecture**: Component composition, state lifting, and data flow
- **Modern Build Tools**: Vite's fast HMR and optimized production builds
- **Drag & Drop**: Implementing accessible drag-and-drop with @dnd-kit
- **State Management**: Complex state with hooks, optimistic updates, and rollback patterns
- **Client-Side Database**: IndexedDB with Dexie for efficient data storage and queries
- **API Mocking**: Realistic API simulation with MSW including latency and errors
- **Form Handling**: Dynamic forms with validation and conditional logic
- **Responsive Design**: Tailwind CSS utility classes and mobile-first approach
- **Error Handling**: Graceful degradation and user feedback
- **Performance**: Handling 1000+ records efficiently in the browser
- **Text Processing**: Regex patterns for @mention detection and slug generation

## 🔧 Technical Decisions

### Why @dnd-kit instead of react-beautiful-dnd?

- react-beautiful-dnd doesn't support React 19
- @dnd-kit is more modern, actively maintained, and has better accessibility
- Provides more flexibility for custom drag behaviors

### Why IndexedDB (Dexie) instead of localStorage?

- Can handle 1000+ records efficiently
- Supports complex queries and indexing
- Better for relational data (jobs, candidates, assessments)
- localStorage has 5-10MB limit and no query capabilities

### Why MSW for API mocking?

- Intercepts requests at the network level (more realistic)
- Works in both development and testing
- No code changes needed to switch to real API
- Can simulate latency and errors

### Why Tailwind CSS?

- Rapid development with utility classes
- Consistent design system
- Small production bundle (unused classes purged)
- No CSS file management needed

## ⚠️ Known Issues & Limitations

### Current Limitations:

1. **No server-side pagination** - All jobs displayed client-side
2. **No dedicated virtualized list view** - Kanban layout prioritized for UX
3. **File upload is a stub** - Placeholder UI only (as specified in requirements)
4. **No assessment sections** - Questions in flat list structure
5. **Client-side only** - No real backend or authentication

### Strategic Design Decisions:

**Pagination:**
For a small, initial seed of 25 jobs, client-side filtering was prioritized over server-like pagination to maximize immediate user experience. The current implementation provides instant search and filtering without network round-trips. Server-side pagination is logged as a future enhancement for larger datasets.

**Virtualization:**
While the component architecture is designed to support virtualization, the current implementation prioritizes the user experience of the Kanban layout, which performs acceptably for the 1000-record demo dataset. The Kanban board's visual grouping by stage provides better context than a flat virtualized list. Full virtualization would be prioritized for a dedicated List View feature.

**File Upload:**
This feature is currently implemented as a placeholder stub (as required by the assignment) because full functionality would require secure cloud storage (AWS S3, Cloudinary) or a backend endpoint to handle file streams and validation, which is outside the scope of this frontend-only demonstration.

**Assessment Sections:**
A flat question structure was chosen to simplify the builder interface and meet core requirements. Grouping questions into collapsible sections is a planned enhancement that would improve organization for longer assessments.

### Browser Compatibility:

- Requires modern browser with IndexedDB support (Chrome 24+, Firefox 16+, Safari 10+, Edge 12+)
- Tested on Chrome 120+, Firefox 121+, Edge 120+
- Service Worker requires HTTPS in production (or localhost for development)
- Drag-and-drop requires pointer events support

## 📝 Future Enhancements

Ideas for extending this project:

- Add pagination for jobs (server-side style)
- Implement virtualized list view for candidates
- Make file upload functional with base64 encoding
- Add assessment sections/grouping
- Create analytics dashboard with charts
- Add user authentication and permissions
- Connect to a real backend API (Node.js/Express)
- Add unit and integration tests (Vitest + React Testing Library)
- Implement dark mode
- Add email notifications
- Export data to CSV/PDF
- Bulk operations for candidates

## 📄 License

This is a learning project and is free to use for educational purposes.

---

**Built with ❤️ using React, Vite, and modern web technologies**
