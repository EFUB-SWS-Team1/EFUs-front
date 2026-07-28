import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import EventPage from './pages/event/EventPage';
import EventDetailPage from './pages/event/EventDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<EventPage />} />
          <Route path="events" element={<EventPage />} />
          <Route path="events/:eventId" element={<EventDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

