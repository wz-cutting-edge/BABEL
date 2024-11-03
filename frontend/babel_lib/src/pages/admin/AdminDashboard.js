import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Users, Flag, MessageSquare, Upload } from 'lucide-react';

const DashboardWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
`;

const Sidebar = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
`;

const NavButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: ${props => props.active ? props.theme.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.text};
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? props.theme.primary : props.theme.background};
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DashboardCard = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
`;

const AdminDashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  const navItems = [
    { label: 'Dashboard', icon: <BarChart size={20} />, path: '/admin' },
    { label: 'Customer Support', icon: <MessageSquare size={20} />, path: '/admin/support' },
    { label: 'User Reports', icon: <Flag size={20} />, path: '/admin/reports' },
    { label: 'Media Uploader', icon: <Upload size={20} />, path: '/admin/upload' }
  ];

  return (
    <DashboardWrapper>
      <Sidebar>
        {navItems.map(item => (
          <NavButton
            key={item.path}
            onClick={() => navigate(item.path)}
            active={window.location.pathname === item.path}
          >
            {item.icon}
            {item.label}
          </NavButton>
        ))}
      </Sidebar>

      <MainContent>
        <h2>Admin Dashboard</h2>
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
      </MainContent>
    </DashboardWrapper>
  );
};

export default AdminDashboard;
