import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase/config';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsWrapper = styled.div`
  padding: 2rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
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
  margin-bottom: 2rem;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.textSecondary};
  font-size: 0.875rem;
`;

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalContent: 0,
    engagementRate: 0
  });
  const [userGrowth, setUserGrowth] = useState([]);
  const [contentEngagement, setContentEngagement] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch basic stats
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const contentSnapshot = await getDocs(collection(db, 'media'));
        
        // Calculate engagement (example metric)
        const engagementSnapshot = await getDocs(collection(db, 'interactions'));
        
        setStats({
          totalUsers: usersSnapshot.size,
          activeUsers: usersSnapshot.docs.filter(doc => 
            doc.data().lastActive > Date.now() - 7 * 24 * 60 * 60 * 1000
          ).length,
          totalContent: contentSnapshot.size,
          engagementRate: (engagementSnapshot.size / usersSnapshot.size * 100).toFixed(1)
        });

        // Fetch time series data for charts
        // ... implementation for fetching chart data

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Platform Growth',
      },
    },
  };

  return (
    <AnalyticsWrapper>
      <h2>Analytics Dashboard</h2>

      <DashboardGrid>
        <Card>
          <StatNumber>{stats.totalUsers}</StatNumber>
          <StatLabel>Total Users</StatLabel>
        </Card>
        <Card>
          <StatNumber>{stats.activeUsers}</StatNumber>
          <StatLabel>Active Users (7d)</StatLabel>
        </Card>
        <Card>
          <StatNumber>{stats.totalContent}</StatNumber>
          <StatLabel>Total Content</StatLabel>
        </Card>
        <Card>
          <StatNumber>{stats.engagementRate}%</StatNumber>
          <StatLabel>Engagement Rate</StatLabel>
        </Card>
      </DashboardGrid>

      <ChartContainer>
        <Line 
          options={chartOptions}
          data={{
            labels: userGrowth.map(d => d.date),
            datasets: [{
              label: 'User Growth',
              data: userGrowth.map(d => d.count),
              borderColor: '#3b82f6',
              tension: 0.4
            }]
          }}
        />
      </ChartContainer>

      <ChartContainer>
        <Bar 
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: {
                ...chartOptions.plugins.title,
                text: 'Content Engagement'
              }
            }
          }}
          data={{
            labels: contentEngagement.map(d => d.type),
            datasets: [{
              label: 'Engagement by Content Type',
              data: contentEngagement.map(d => d.count),
              backgroundColor: '#8b5cf6'
            }]
          }}
        />
      </ChartContainer>
    </AnalyticsWrapper>
  );
};

export default Analytics;
