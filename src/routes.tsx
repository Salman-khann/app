import type { ReactNode } from 'react';
import { lazy } from 'react';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const SignInPage = lazy(() => import('./pages/SignInPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AIAnalysisPage = lazy(() => import('./pages/AIAnalysisPage'));
const AnalysisResultPage = lazy(() => import('./pages/AnalysisResultPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ConsultationRoomPage = lazy(() => import('./pages/ConsultationRoomPage'));

const DermatologistPortal = lazy(() => import('./pages/DermatologistPortal'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const NotFound = lazy(() => import('./pages/NotFound'));

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <LandingPage />,
    visible: true,
  },
  {
    name: 'Sign In',
    path: '/login',
    element: <SignInPage />,
    visible: false,
  },
  {
    name: 'Sign Up',
    path: '/signup',
    element: <SignUpPage />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <UserDashboard />,
    visible: false,
  },
  {
    name: 'AI Analysis',
    path: '/analysis',
    element: <AIAnalysisPage />,
    visible: true,
  },
  {
    name: 'Analysis Result',
    path: '/analysis/:id',
    element: <AnalysisResultPage />,
    visible: false,
  },
  {
    name: 'Recommendations',
    path: '/recommendations',
    element: <RecommendationsPage />,
    visible: false,
  },
  {
    name: 'Doctors',
    path: '/doctors',
    element: <DoctorsPage />,
    visible: true,
  },
  {
    name: 'Book Consultation',
    path: '/doctors/:id/book',
    element: <BookingPage />,
    visible: false,
  },
  {
    name: 'Consultation Room',
    path: '/consultation/:id',
    element: <ConsultationRoomPage />,
    visible: false,
  },

  {
    name: 'Dermatologist Portal',
    path: '/dermatologist',
    element: <DermatologistPortal />,
    visible: false,
  },
  {
    name: 'Admin Panel',
    path: '/admin',
    element: <AdminPanel />,
    visible: false,
  },
  {
    name: 'Not Found',
    path: '/404',
    element: <NotFound />,
    visible: false,
  },
];

export default routes;
