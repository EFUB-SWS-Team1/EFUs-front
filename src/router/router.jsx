import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import EventPage from "../pages/event/EventPage";
import EventDetailPage from "../pages/event/EventDetailPage";


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
