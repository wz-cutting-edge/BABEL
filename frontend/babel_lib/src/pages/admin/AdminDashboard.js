import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Flag, MessageSquare, Upload } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DashboardWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin-bottom: 1rem;
  }
`;

const NavGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const NavCard = styled.button`
  background: ${props => props.active ? props.theme.primary : props.theme.surfaceColor};
  color: ${props => props.active ? 'white' : props.theme.text};
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid ${props => props.active ? 'transparent' : props.theme.borderLight};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.theme.shadowSm};
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowMd};
    background: ${props => props.active ? props.theme.primary : props.theme.backgroundAlt};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const DashboardCard = styled.div`
  background: ${props => props.theme.surfaceColor};
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.borderLight};
  box-shadow: ${props => props.theme.shadowSm};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadowMd};
  }

  h3 {
    color: ${props => props.theme.textSecondary};
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  p {
    font-size: 2.5rem;
    font-weight: 600;
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
      <Header>
        <h2>Admin Dashboard</h2>
        <NavGrid>
          {navItems.map(item => (
            <NavCard
              key={item.path}
              onClick={() => navigate(item.path)}
              active={window.location.pathname === item.path}
            >
              {item.icon}
              {item.label}
            </NavCard>
          ))}
        </NavGrid>
      </Header>

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
    </DashboardWrapper>
  );
};

export default AdminDashboard;
