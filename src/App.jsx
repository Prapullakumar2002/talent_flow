import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import CandidateProfile from "./pages/CandidateProfile";
import AssessmentBuilder from "./pages/AssessmentBuilder";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "jobs", element: <Jobs /> },
      { path: "jobs/:jobId/assessment", element: <AssessmentBuilder /> },
      { path: "candidates", element: <Candidates /> },
      { path: "candidates/:id", element: <CandidateProfile /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
