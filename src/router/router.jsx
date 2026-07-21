import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import EventPage from "../pages/event/EventPage";
import EventDetailPage from "../pages/event/EventDetailPage";

/**
 * router.jsx (event 브랜치)
 * develop 병합 시 dashboard, ledger 등 다른 기능 라우트가 추가됩니다.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <EventPage />,
      },
      {
        path: "events",
        element: <EventPage />,
      },
      {
        path: "events/:eventId",
        element: <EventDetailPage />,
      },
    ],
  },
]);
