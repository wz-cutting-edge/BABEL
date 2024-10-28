import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, User, Clock, CheckCircle, XCircle } from 'lucide-react';

const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SupportGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  height: calc(100vh - 200px);
`;

const TicketList = styled.div`
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  overflow-y: auto;
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
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const Message = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  max-width: 70%;
  ${props => props.isAdmin ? `
    background-color: ${props.theme.primary}20;
    margin-left: auto;
  ` : `
    background-color: ${props.theme.secondaryBackground};
    margin-right: auto;
  `}
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

const CustomerSupport = () => {
  const { user, loading, isAdmin } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets] = useState([
    {
      id: 1,
      userId: 'user123',
      subject: 'Cannot access my account',
      status: 'open',
      lastUpdate: '2024-03-10',
      messages: [
        { id: 1, text: 'I cannot log in to my account', isAdmin: false, timestamp: '2024-03-10 10:00' },
        { id: 2, text: 'Have you tried resetting your password?', isAdmin: true, timestamp: '2024-03-10 10:05' }
      ]
    }
    // Add more mock tickets
  ]);

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
                <strong>{ticket.subject}</strong>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                <User size={14} style={{ marginRight: '0.5rem' }} />
                {ticket.userId}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                <Clock size={14} style={{ marginRight: '0.5rem' }} />
                {ticket.lastUpdate}
              </div>
            </TicketItem>
          ))}
        </TicketList>

        {selectedTicket ? (
          <ChatWindow>
            <ChatHeader>
              <div>
                <h3>{selectedTicket.subject}</h3>
                <small>Ticket #{selectedTicket.id}</small>
              </div>
              <div>
                <Button style={{ marginRight: '0.5rem' }}>
                  <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                  Resolve
                </Button>
                <Button style={{ background: '#DC2626' }}>
                  <XCircle size={16} style={{ marginRight: '0.5rem' }} />
                  Close
                </Button>
              </div>
            </ChatHeader>
            <ChatMessages>
              {selectedTicket.messages.map(message => (
                <Message key={message.id} isAdmin={message.isAdmin}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>{message.isAdmin ? 'Support Agent' : selectedTicket.userId}</strong>
                  </div>
                  {message.text}
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                    {message.timestamp}
                  </div>
                </Message>
              ))}
            </ChatMessages>
            <ReplyBox>
              <Input placeholder="Type your reply..." />
              <Button>Send</Button>
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
