import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart2, TrendingUp, Users, BookOpen } from 'lucide-react';

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AdminAnalytics = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <PageWrapper>
      <h2>Analytics Dashboard</h2>
      <AnalyticsGrid>
        {/* Add analytics cards here */}
      </AnalyticsGrid>
    </PageWrapper>
  );
};

export default AdminAnalytics;
