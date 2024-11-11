import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const PageWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 4rem 1rem 1rem;
    height: auto;
  }
`;

const SupportGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  flex: 1;
  min-height: 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    height: auto;
    gap: 1rem;
  }
`;

const TicketList = styled.div`
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  overflow-y: auto;
  height: 100%;
  
  @media (max-width: 768px) {
    max-height: 300px;
  }
`;

const TicketItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
  cursor: pointer;
  background-color: ${props => 
    props.active ? props.theme.primary + '10' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.theme.secondaryBackground};
  }
`;

const ChatWindow = styled.div`
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    
    h3 {
      font-size: 1rem;
    }
    
    button {
      padding: 0.5rem;
      font-size: 0.875rem;
    }
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  min-height: 0;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    max-height: calc(100vh - 400px);
  }
`;

const Message = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 85%;
  word-break: break-word;
  
  @media (max-width: 768px) {
    max-width: 90%;
    padding: 0.5rem;
    font-size: 0.875rem;
  }
`;

const ReplyBox = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.border};
  display: flex;
  gap: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    if (typeof timestamp === 'object' && timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
};

const CustomerSupport = () => {
  const { user, loading, isAdmin } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user || !isAdmin) return;

    const ticketsRef = collection(db, 'support_tickets');
    const q = query(
      ticketsRef,
      orderBy('lastUpdate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketData);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    if (!selectedTicket) return;

    const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
    const unsubscribe = onSnapshot(ticketRef, (doc) => {
      if (doc.exists()) {
        setSelectedTicket({ id: doc.id, ...doc.data() });
      }
    });

    return () => unsubscribe();
  }, [selectedTicket?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      const message = {
        text: newMessage,
        isAdmin: true,
        timestamp: new Date().toISOString()
      };

      await updateDoc(ticketRef, {
        messages: [...selectedTicket.messages, message],
        lastUpdate: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;

    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      await updateDoc(ticketRef, {
        status: 'resolved',
        lastUpdate: serverTimestamp(),
        notificationSeen: false
      });
    } catch (error) {
      console.error('Error resolving ticket:', error);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    try {
      const ticketRef = doc(db, 'support_tickets', selectedTicket.id);
      await updateDoc(ticketRef, {
        status: 'closed',
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <PageWrapper>
      <h2>Customer Support Dashboard</h2>
      <SupportGrid>
        <TicketList>
          {tickets.map(ticket => (
            <TicketItem 
              key={ticket.id}
              active={selectedTicket?.id === ticket.id}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>{ticket.type}</strong>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                <User size={14} style={{ marginRight: '0.5rem' }} />
                {ticket.userId}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                <Clock size={14} style={{ marginRight: '0.5rem' }} />
                {formatTimestamp(ticket.lastUpdate)}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: ticket.status === 'resolved' ? '#10B981' : 
                       ticket.status === 'closed' ? '#DC2626' : '#F59E0B'
              }}>
                Status: {ticket.status}
              </div>
            </TicketItem>
          ))}
        </TicketList>

        {selectedTicket ? (
          <ChatWindow>
            <ChatHeader>
              <div>
                <h3>{selectedTicket.type}</h3>
                <small>Ticket #{selectedTicket.id}</small>
              </div>
              <div>
                <Button 
                  style={{ marginRight: '0.5rem' }}
                  onClick={handleResolveTicket}
                  disabled={selectedTicket.status === 'resolved'}
                >
                  <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                  Resolve
                </Button>
                <Button 
                  style={{ background: '#DC2626' }}
                  onClick={handleCloseTicket}
                  disabled={selectedTicket.status === 'closed'}
                >
                  <XCircle size={16} style={{ marginRight: '0.5rem' }} />
                  Close
                </Button>
              </div>
            </ChatHeader>
            <ChatMessages>
              {selectedTicket?.messages?.map((message, index) => (
                <Message key={`${selectedTicket.id}-${index}`} isAdmin={message.isAdmin}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>{message.isAdmin ? 'Support Agent' : 'User'}</strong>
                  </div>
                  {message.text}
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </Message>
              ))}
            </ChatMessages>
            <ReplyBox>
              <Input 
                placeholder="Type your reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </ReplyBox>
          </ChatWindow>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            Select a ticket to view the conversation
          </div>
        )}
      </SupportGrid>
    </PageWrapper>
  );
};

export default CustomerSupport;
