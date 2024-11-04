import styled from 'styled-components';

export const DetailsContainer = styled.div`
  background: ${props => props.theme.secondaryBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  margin: 1rem 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
  max-height: ${props => props.isExpanded ? '2000px' : '60px'};
`;

export const Header = styled.div`
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.theme.background};
`;

export const Content = styled.div`
  padding: 1rem;
  display: ${props => props.isExpanded ? 'block' : 'none'};
`;

export const Section = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

export const ReportedContent = styled.div`
  background: ${props => props.theme.background};
  padding: 1rem;
  border-radius: 4px;
  margin: 0.5rem 0;
`;

export const PostImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5rem 0;
`;

export const Button = styled.button`
  background: ${props => props.variant === 'danger' ? '#EF4444' : props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 100%;

  &:hover {
    opacity: 0.9;
  }
`;

export const DeleteButton = styled(Button)`
  margin-top: 1rem;
  background: #EF4444;
`;

export const BanOptions = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
`;

export const ResolveInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

export const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  background: ${props => 
    props.status === 'resolved' ? '#10B981' :
    props.status === 'pending' ? '#F59E0B' :
    '#EF4444'};
  color: white;
`; 