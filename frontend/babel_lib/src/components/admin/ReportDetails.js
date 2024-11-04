import React, { useState, useEffect } from 'react';
import { User, Ban, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import {
  DetailsContainer,
  Header,
  Content,
  Section,
  ReportedContent,
  PostImage,
  Button,
  DeleteButton,
  BanOptions,
  ResolveInput,
  StatusBadge
} from './ReportDetails.styles';

const ReportDetails = ({ report, reportedContent, onResolve, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userOffenses, setUserOffenses] = useState([]);
  const [resolveMessage, setResolveMessage] = useState('');
  const [selectedBan, setSelectedBan] = useState('');

  useEffect(() => {
    const fetchUserOffenses = async () => {
      const offensesRef = collection(db, 'reports');
      const q = query(
        offensesRef, 
        where('reportedUserId', '==', report.reportedUserId),
        where('status', '==', 'resolved')
      );
      const querySnapshot = await getDocs(q);
      setUserOffenses(querySnapshot.docs.map(doc => doc.data()));
    };

    if (isExpanded) {
      fetchUserOffenses();
    }
  }, [isExpanded, report.reportedUserId]);

  const handleBanUser = async () => {
    if (!selectedBan) return;

    const banDurations = {
      '3': 3,
      '7': 7,
      '14': 14,
      '28': 28,
      'permanent': -1
    };

    const banEndDate = selectedBan === 'permanent' 
      ? null 
      : new Date(Date.now() + banDurations[selectedBan] * 24 * 60 * 60 * 1000);

    await updateDoc(doc(db, 'users', report.reportedUserId), {
      banned: true,
      banEndDate: banEndDate
    });

    await addDoc(collection(db, 'notifications'), {
      userId: report.reportedUserId,
      type: 'ban',
      message: `Your account has been banned for ${selectedBan === 'permanent' ? 'permanently' : selectedBan + ' days'}.`,
      createdAt: new Date()
    });
  };

  const handleResolve = () => {
    onResolve(report.id, resolveMessage);
    setIsExpanded(false);
  };

  return (
    <DetailsContainer isExpanded={isExpanded}>
      <Header onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <strong>{report.contentType}</strong> reported by {report.reporterId}
        </div>
        <StatusBadge status={report.status}>{report.status}</StatusBadge>
      </Header>

      <Content isExpanded={isExpanded}>
        <Section>
          <h4>Reported Content</h4>
          <ReportedContent>
            <p>{report.contentType === 'post' ? 'Post' : 'Comment'}: {reportedContent?.content}</p>
            {reportedContent?.imageUrl && (
              <PostImage src={reportedContent.imageUrl} alt="Reported content" />
            )}
            <p><strong>Created At:</strong> {new Date(reportedContent?.createdAt?.toDate()).toLocaleString()}</p>
            <p><strong>Reason:</strong> {report.reason}</p>
            <DeleteButton onClick={() => onDelete(report)} variant="danger">
              <Trash2 size={16} /> Delete Content
            </DeleteButton>
          </ReportedContent>
        </Section>

        <Section>
          <h4>User Information</h4>
          <Link to={`/profile/${report.reportedUserId}`}>
            <User size={16} /> View Profile
          </Link>
          <h5>Previous Offenses: {userOffenses.length}</h5>
          {userOffenses.map((offense, index) => (
            <div key={index}>
              <small>{new Date(offense.createdAt?.toDate()).toLocaleDateString()}: {offense.reason}</small>
            </div>
          ))}
        </Section>

        <Section>
          <h4>Take Action</h4>
          <BanOptions 
            value={selectedBan} 
            onChange={(e) => setSelectedBan(e.target.value)}
          >
            <option value="">Select ban duration...</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="28">28 days</option>
            <option value="permanent">Permanent</option>
          </BanOptions>
          {selectedBan && (
            <Button variant="danger" onClick={handleBanUser}>
              <Ban size={16} /> Apply Ban
            </Button>
          )}
        </Section>

        <Section>
          <h4>Resolve Report</h4>
          <ResolveInput
            value={resolveMessage}
            onChange={(e) => setResolveMessage(e.target.value)}
            placeholder="Message to user (optional)"
          />
          <Button onClick={handleResolve}>
            <CheckCircle size={16} /> Resolve Report
          </Button>
        </Section>
      </Content>
    </DetailsContainer>
  );
};

export default ReportDetails; 