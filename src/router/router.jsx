import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import GroupManagePage from '../pages/groupManage/GroupManagePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/group-manage" replace />,
      },
      {
        path: 'group-manage',
        element: <GroupManagePage />,
      },
    ],
  },
]);