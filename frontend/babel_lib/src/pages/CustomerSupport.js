import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Mail, Phone } from 'lucide-react';

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
  color: ${props => props.theme.text};
`;

const TicketsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const TicketCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.background};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid ${props => props.theme.border};
`;

const CustomerSupport = () => {
  const { user, loading, isAdmin } = useAuth();
  const [tickets] = useState([
    { id: 1, user: 'John Doe', issue: 'Login Issues', status: 'Open', priority: 'High' },
    { id: 2, user: 'Jane Smith', issue: 'Content Access', status: 'In Progress', priority: 'Medium' },
    // Add more mock tickets
  ]);

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <PageWrapper>
      <Title>Customer Support Dashboard</Title>
      
      <StatsContainer>
        <StatCard>
          <h3>Open Tickets</h3>
          <p>23</p>
        </StatCard>
        <StatCard>
          <h3>Average Response Time</h3>
          <p>2.5 hours</p>
        </StatCard>
        <StatCard>
          <h3>Resolved Today</h3>
          <p>15</p>
        </StatCard>
      </StatsContainer>

      <TicketsGrid>
        {tickets.map(ticket => (
          <TicketCard key={ticket.id}>
            <h4>{ticket.user}</h4>
            <p>{ticket.issue}</p>
            <div>Status: {ticket.status}</div>
            <div>Priority: {ticket.priority}</div>
          </TicketCard>
        ))}
      </TicketsGrid>
    </PageWrapper>
  );
};

export default CustomerSupport;
