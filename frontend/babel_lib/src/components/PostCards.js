import React from 'react';
import styled from 'styled-components';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const Card = styled.div`
  background-color: ${props => props.theme.secondaryBackground};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.5rem;
`;

const Username = styled.span`
  font-weight: bold;
`;

const Content = styled.p`
  margin-bottom: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    color: ${props => props.theme.accent};
  }
`;

const PostCard = ({ user, content, likes, comments }) => {
  return (
    <Card>
      <UserInfo>
        <Avatar src="/placeholder.svg?height=40&width=40" alt={user} />
        <Username>{user}</Username>
      </UserInfo>
      <Content>{content}</Content>
      <Actions>
        <ActionButton>
          <Heart size={20} />
          <span>{likes}</span>
        </ActionButton>
        <ActionButton>
          <MessageCircle size={20} />
          <span>{comments}</span>
        </ActionButton>
        <ActionButton>
          <Share2 size={20} />
        </ActionButton>
      </Actions>
    </Card>
  );
};

export default PostCard;
