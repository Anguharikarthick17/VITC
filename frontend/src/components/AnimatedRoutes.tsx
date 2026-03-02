import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import HomePage from '../pages/HomePage';
import SuccessPage from '../pages/SuccessPage';
import TrackingPage from '../pages/TrackingPage';
import LoginPage from '../pages/admin/LoginPage';
import OAuthCallbackPage from '../pages/admin/OAuthCallbackPage';
import AdminLayout from './AdminLayout';
import DashboardPage from '../pages/admin/DashboardPage';
import ComplaintsPage from '../pages/admin/ComplaintsPage';
import HistoryPage from '../pages/admin/HistoryPage';
import ComplaintDetailPage from '../pages/admin/ComplaintDetailPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import UsersPage from '../pages/admin/UsersPage';
import MapPage from '../pages/admin/MapPage';

const AnimatedRoutes: React.FC = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/report" />} />
                <Route path="/report" element={<HomePage />} />
                <Route path="/success/:id" element={<SuccessPage />} />
                <Route path="/track" element={<TrackingPage />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin/oauth-callback" element={<OAuthCallbackPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="complaints" element={<ComplaintsPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="complaints/:id" element={<ComplaintDetailPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="map" element={<MapPage />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/report" />} />
            </Routes>
        </AnimatePresence>
    );
};

export default AnimatedRoutes;
