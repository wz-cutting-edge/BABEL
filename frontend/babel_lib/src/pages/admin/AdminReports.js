import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { Flag, Trash2, CheckCircle } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ReportCard = styled.div`
  background: ${props => props.theme.secondaryBackground};
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#FFB100';
      case 'resolved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  }};
  color: white;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: ${props => props.color || props.theme.text};
  &:hover {
    opacity: 0.8;
  }
`;

const AdminReports = () => {
  const { user, loading, isAdmin } = useAuth();
  const [reports, setReports] = useState([]);
  const [reportedContent, setReportedContent] = useState({});

  useEffect(() => {
    if (!isAdmin) return;

    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch content details for each report
      const contentDetails = {};
      await Promise.all(reportsData.map(async (report) => {
        const contentRef = doc(db, report.contentType + 's', report.contentId);
        const contentSnap = await getDoc(contentRef);
        if (contentSnap.exists()) {
          contentDetails[report.contentId] = contentSnap.data();
        }
      }));

      setReportedContent(contentDetails);
      setReports(reportsData);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleResolve = async (reportId, message) => {
    try {
      // Get the report data first
      const reportRef = doc(db, 'reports', reportId);
      const reportSnap = await getDoc(reportRef);
      const reportData = reportSnap.data();

      // Update report status
      await updateDoc(reportRef, {
        status: 'resolved'
      });

      // If there's a message, create a notification
      if (message) {
        await addDoc(collection(db, 'notifications'), {
          userId: reportData.reportedUserId,
          type: 'report_resolved',
          message,
          createdAt: serverTimestamp(),
          read: false
        });
      }
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const handleDelete = async (report) => {
    try {
      // If it's a comment, get the postId and update the comment count
      if (report.contentType === 'comment') {
        const commentDoc = await getDoc(doc(db, 'comments', report.contentId));
        if (commentDoc.exists()) {
          const commentData = commentDoc.data();
          // Decrement the comment count on the parent post
          await updateDoc(doc(db, 'posts', commentData.postId), {
            commentCount: increment(-1)
          });
        }
      }

      // Delete the reported content
      await deleteDoc(doc(db, report.contentType + 's', report.contentId));
      
      // Update the report status to resolved
      await updateDoc(doc(db, 'reports', report.id), {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolution: 'content_removed'
      });

      // Create notification for the content owner
      await addDoc(collection(db, 'notifications'), {
        userId: report.reportedUserId,
        type: 'content_removed',
        contentType: report.contentType,
        message: `Your ${report.contentType} has been removed for violating community guidelines.`,
        createdAt: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error('Error handling report:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <PageWrapper>
      <h2>Reports Dashboard</h2>
      <ReportsGrid>
        {reports.map(report => (
          <ReportCard key={report.id}>
            <h3>Reported {report.contentType}</h3>
            <p><strong>Reason:</strong> {report.reason}</p>
            <p><strong>Content:</strong> {reportedContent[report.contentId]?.content}</p>
            <p><strong>Status:</strong> 
              <StatusBadge status={report.status}>
                {report.status}
              </StatusBadge>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <ActionButton 
                onClick={() => handleResolve(report.id)}
                color="#10B981"
              >
                <CheckCircle size={20} />
              </ActionButton>
              <ActionButton 
                onClick={() => handleDelete(report)}
                color="#EF4444"
              >
                <Trash2 size={20} />
              </ActionButton>
            </div>
          </ReportCard>
        ))}
      </ReportsGrid>
    </PageWrapper>
  );
};

export default AdminReports;
