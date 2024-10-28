import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { Flag, AlertTriangle, CheckCircle } from 'lucide-react';

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ReportsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  background: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Td = styled.td`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.border};
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  background: ${props => 
    props.status === 'resolved' ? '#10B981' :
    props.status === 'pending' ? '#F59E0B' :
    '#EF4444'};
  color: white;
`;

const UserReports = () => {
  const { user, loading, isAdmin } = useAuth();
  const [reports] = useState([
    { 
      id: 1, 
      reportedUser: 'user123', 
      reason: 'Inappropriate content', 
      status: 'pending',
      date: '2024-03-10' 
    },
    // Add more mock reports
  ]);

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <PageWrapper>
      <h2>User Reports</h2>
      
      <ReportsTable>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Reported User</Th>
            <Th>Reason</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <Td>{report.date}</Td>
              <Td>{report.reportedUser}</Td>
              <Td>{report.reason}</Td>
              <Td>
                <StatusBadge status={report.status}>
                  {report.status}
                </StatusBadge>
              </Td>
              <Td>
                {/* Add action buttons */}
              </Td>
            </tr>
          ))}
        </tbody>
      </ReportsTable>
    </PageWrapper>
  );
};

export default UserReports;
