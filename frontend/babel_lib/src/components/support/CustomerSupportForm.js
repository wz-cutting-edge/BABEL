import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageCircle } from 'lucide-react';
import { db } from '../../services/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FormWrapper = styled.div`
  padding: 6rem 2rem 2rem;
  max-width: 600px;
  margin: 0 auto;
  height: 100%;
  min-height: 100vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 4rem 1rem 1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background: ${props => props.theme.surfaceColor};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.borderLight};
  margin-bottom: 2rem; // Add space at bottom for scrolling
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(100vh - 300px); // Adjust based on your header height
  overflow-y: auto;
  padding-right: 0.5rem; // Space for scrollbar
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.background};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    @media (max-width: 768px) {
      font-size: 0.875rem;
    }
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  min-height: 150px;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    font-size: 16px;
    min-height: 120px;
  }
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
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    opacity: 0.9;
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CustomerSupportForm = () => {
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const ticketData = {
        type: ticketType,
        status: 'open',
        createdAt: serverTimestamp(),
        lastUpdate: serverTimestamp(),
        messages: [{
          text: formData.description,
          isAdmin: false,
          timestamp: serverTimestamp()
        }]
      };

      // Add type-specific data
      if (ticketType === 'request_media') {
        ticketData.mediaRequest = {
          title: formData.title,
          resourceType: formData.resourceType,
          author: formData.author,
          year: formData.year,
          reason: formData.reason
        };
      } else if (ticketType === 'other') {
        ticketData.otherRequest = {
          issueType: formData.issueType,
          relatedContent: formData.relatedContent
        };
      }

      await addDoc(collection(db, 'support_tickets'), ticketData);
      // Reset form and show success message
    } catch (error) {
      console.error('Error submitting ticket:', error);
    }
  };

  const renderFormFields = () => {
    switch (ticketType) {
      case 'request_media':
        return (
          <FormContent>
            <FormGroup>
              <label>Title *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <label>Resource Type *</label>
              <Select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select type...</option>
                <option value="book">Book</option>
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </Select>
            </FormGroup>
            {/* Add other media request fields */}
          </FormContent>
        );
      case 'other':
        return (
          <FormContent>
            <FormGroup>
              <label>Issue Type *</label>
              <Input
                name="issueType"
                value={formData.issueType}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            {/* Add other issue fields */}
          </FormContent>
        );
      // Add cases for 'report_bug' and 'appeal_ban'
    }
  };

  return (
    <FormWrapper>
      <h2>Customer Support</h2>
      <Form onSubmit={handleSubmit}>
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
          {renderFormFields()}
          <FormGroup>
            <label>Description *</label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <Button type="submit">
            <MessageCircle size={20} />
            Submit Ticket
          </Button>
        </FormContent>
      </Form>
    </FormWrapper>
  );
};

export default CustomerSupportForm; 