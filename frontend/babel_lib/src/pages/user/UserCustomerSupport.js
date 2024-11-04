import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Clock, Send } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Reusing styled components from CustomerSupport.js
const PageWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const SupportGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  height: calc(100vh - 350px);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    height: calc(100vh - 400px);
  }
`;

const TicketList = styled.div`
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 450px);
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
  max-height: calc(100vh - 300px);
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.border};
    border-radius: 3px;
  }
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const CreateTicketButton = styled(Button)`
  margin-bottom: 1rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  min-height: 100px;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FormContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 350px);
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

const UserCustomerSupport = () => {
  const { user, loading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    resourceType: '',
    author: '',
    year: '',
    description: '',
    reason: '',
    issueType: '',
    relatedContent: ''
  });

  useEffect(() => {
    if (!user) return;

    const ticketsRef = collection(db, 'support_tickets');
    const q = query(
      ticketsRef,
      where('userId', '==', user.uid),
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
  }, [user]);

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
        isAdmin: false,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...selectedTicket.messages, message];
      
      await updateDoc(ticketRef, {
        messages: updatedMessages,
        lastUpdate: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketType || !formData.description) return;

    try {
      const ticketData = {
        userId: user.uid,
        type: ticketType,
        status: 'open',
        createdAt: serverTimestamp(),
        lastUpdate: serverTimestamp(),
        messages: [{
          text: formData.description,
          isAdmin: false,
          timestamp: new Date().toISOString()
        }]
      };

      // Add type-specific data
      if (ticketType === 'request_media') {
        ticketData.mediaRequest = {
          title: formData.title,
          resourceType: formData.resourceType,
          author: formData.author,
          year: formData.year,
          reason: formData.reason,
          description: formData.description
        };
      } else if (ticketType === 'other') {
        ticketData.otherRequest = {
          issueType: formData.issueType,
          description: formData.description,
          relatedContent: formData.relatedContent
        };
      }

      await addDoc(collection(db, 'support_tickets'), ticketData);
      setFormData({
        title: '',
        resourceType: '',
        author: '',
        year: '',
        description: '',
        reason: '',
        issueType: '',
        relatedContent: ''
      });
      setTicketType('');
      setShowNewTicketForm(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <PageWrapper>
      <h2>Customer Support</h2>
      <SupportGrid>
        <div>
          <CreateTicketButton onClick={() => setShowNewTicketForm(true)}>
            <MessageCircle size={20} />
            New Support Ticket
          </CreateTicketButton>
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
                  <Clock size={14} style={{ marginRight: '0.5rem' }} />
                  {formatTimestamp(ticket.lastUpdate)}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: ticket.status === 'resolved' ? '#10B981' : '#F59E0B'
                }}>
                  Status: {ticket.status}
                </div>
              </TicketItem>
            ))}
          </TicketList>
        </div>

        {showNewTicketForm ? (
          <ChatWindow>
            <ChatHeader>
              <h3>Create New Support Ticket</h3>
            </ChatHeader>
            <FormContent>
              <FormGroup>
                <label>Request Type *</label>
                <Select
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="request_media">Request Media</option>
                  <option value="report_bug">Report Bug</option>
                  <option value="appeal_ban">Appeal Ban</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>

              {ticketType === 'request_media' && (
                <>
                  <FormGroup>
                    <label>Title *</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Resource Type *</label>
                    <Select
                      name="resourceType"
                      value={formData.resourceType}
                      onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                      required
                    >
                      <option value="">Select type...</option>
                      <option value="book">Book</option>
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <label>Author/Creator</label>
                    <Input
                      name="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Year</label>
                    <Input
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Reason for Request *</label>
                    <TextArea
                      name="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </FormGroup>
                </>
              )}

              {ticketType === 'other' && (
                <FormGroup>
                  <label>Issue Type *</label>
                  <Input
                    name="issueType"
                    value={formData.issueType}
                    onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                    required
                  />
                </FormGroup>
              )}

              <FormGroup>
                <label>Description *</label>
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </FormGroup>

              <Button onClick={handleCreateTicket}>
                Create Ticket
              </Button>
            </FormContent>
          </ChatWindow>
        ) : selectedTicket ? (
          <ChatWindow>
            <ChatHeader>
              <h3>{selectedTicket.subject}</h3>
              <small>Ticket #{selectedTicket.id}</small>
            </ChatHeader>
            <ChatMessages>
              {selectedTicket?.messages?.map((message, index) => (
                <Message key={`${selectedTicket.id}-${index}`} isAdmin={message.isAdmin}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>{message.isAdmin ? 'Support Agent' : 'You'}</strong>
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
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send size={20} />
                Send
              </Button>
            </ReplyBox>
          </ChatWindow>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            Select a ticket or create a new one to start a conversation
          </div>
        )}
      </SupportGrid>
    </PageWrapper>
  );
};

export default UserCustomerSupport; 