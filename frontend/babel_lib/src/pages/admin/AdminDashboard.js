import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Flag, MessageSquare, Upload } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const DashboardCard = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;

  h3 {
    color: ${props => props.theme.text};
    margin-bottom: 1rem;
  }

  p {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.theme.primary};
  }
`;

const AdminDashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingReports: 0,
    totalContent: 0,
    openTickets: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get pending reports count
        const reportsQuery = query(
          collection(db, 'reports'),
          where('status', '==', 'pending')
        );
        const reportsSnapshot = await getDocs(reportsQuery);
        const pendingReports = reportsSnapshot.size;

        // Get total content count (posts + media)
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const mediaSnapshot = await getDocs(collection(db, 'media'));
        const totalContent = postsSnapshot.size + mediaSnapshot.size;

        // Get open support tickets count
        const ticketsQuery = query(
          collection(db, 'support_tickets'),
          where('status', '==', 'open')
        );
        const ticketsSnapshot = await getDocs(ticketsQuery);
        const openTickets = ticketsSnapshot.size;

        setStats({
          pendingReports,
          totalContent,
          openTickets
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  const navItems = [
    { label: 'Dashboard', icon: <BarChart size={20} />, path: '/admin' },
    { label: 'Forums', icon: <MessageSquare size={20} />, path: '/forums' },
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
            <p>{stats.pendingReports}</p>
          </DashboardCard>
          <DashboardCard>
            <h3>Total Content</h3>
            <p>{stats.totalContent}</p>
          </DashboardCard>
          <DashboardCard>
            <h3>Open Support Tickets</h3>
            <p>{stats.openTickets}</p>
          </DashboardCard>
        </DashboardGrid>
      </MainContent>
    </DashboardWrapper>
  );
};

export default AdminDashboard;
