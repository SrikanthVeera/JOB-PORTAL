import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) {
    return <div style={{padding: 40, textAlign: 'center', color: 'red', fontWeight: 600}}>
      Unauthorized: Only {allowedRoles.join(', ')} can access this page.
    </div>;
  }
  return children;
} 