import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { BarChart2, TrendingUp, Users, BookOpen } from 'lucide-react';

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChartContainer = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
  height: 400px;
`;

const Analytics = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <PageWrapper>
      <h2>Analytics Dashboard</h2>
      
      <GridContainer>
        <Card>
          <h3>Total Users</h3>
          <div style={{ fontSize: '2rem', marginTop: '1rem' }}>10,234</div>
          <div style={{ color: 'green' }}>+15% this month</div>
        </Card>
        <Card>
          <h3>Active Content</h3>
          <div style={{ fontSize: '2rem', marginTop: '1rem' }}>45,678</div>
          <div style={{ color: 'green' }}>+8% this month</div>
        </Card>
        <Card>
          <h3>Daily Active Users</h3>
          <div style={{ fontSize: '2rem', marginTop: '1rem' }}>2,345</div>
          <div style={{ color: 'green' }}>+12% this week</div>
        </Card>
      </GridContainer>

      <ChartContainer>
        <h3>User Growth</h3>
        {/* Add chart component here */}
      </ChartContainer>

      <ChartContainer>
        <h3>Content Engagement</h3>
        {/* Add chart component here */}
      </ChartContainer>
    </PageWrapper>
  );
};

export default Analytics;
