import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { Flag, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import ReportDetails from '../../components/admin/ReportDetailsComponent';

const PageWrapper = styled.div`
  padding: 6rem 2rem 2rem;
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

const ActionGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const UserReports = () => {
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
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleString()
      }));

      // Fetch content and user details for each report
      const contentDetails = {};
      await Promise.all(reportsData.map(async (report) => {
        const contentRef = doc(db, report.contentType + 's', report.contentId);
        const contentSnap = await getDoc(contentRef);
        if (contentSnap.exists()) {
          contentDetails[report.contentId] = contentSnap.data();
        }

        // Get reporter username
        const userRef = doc(db, 'users', report.reportedUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          contentDetails[report.reportedUserId] = userSnap.data();
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
      <h2>User Reports</h2>
      {reports.map(report => (
        <ReportDetails
          key={report.id}
          report={report}
          reportedContent={reportedContent[report.contentId]}
          onResolve={handleResolve}
          onDelete={handleDelete}
        />
      ))}
    </PageWrapper>
  );
};

export default UserReports;
