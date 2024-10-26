import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, database } from '../firebase';
import { ref, get } from 'firebase/database';

const DashboardWrapper = styled.div`
  padding: 2rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DashboardCard = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1rem;
  border-radius: 5px;
  text-align: center;
`;

const AdminDashboard = () => {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      setIsAdmin(snapshot.val()?.role === 'admin');
    };
    
    checkAdminRole();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <DashboardWrapper>
      <h2>Admin Dashboard</h2>
      <nav>
        <Link to="/customer-support">Customer Support</Link> |
        <Link to="/user-reports">User Reports</Link> |
        <Link to="/media-uploader">Media Uploader</Link> |
        <Link to="/analytics">Analytics</Link> |
        <Link to="/">Logout</Link>
      </nav>
      <DashboardGrid>
        <DashboardCard>
          <h3>Pending Reports</h3>
          <p>15</p>
        </DashboardCard>
        <DashboardCard>
          <h3>New Users (Today)</h3>
          <p>42</p>
        </DashboardCard>
        <DashboardCard>
          <h3>Total Content</h3>
          <p>10,567</p>
        </DashboardCard>
        <DashboardCard>
          <h3>Active Users</h3>
          <p>1,234</p>
        </DashboardCard>
      </DashboardGrid>
    </DashboardWrapper>
  );
};

export default AdminDashboard;
