import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, LogOut, User, BookMarked, MessageSquare, Moon, Sun, Settings, HelpCircle, LogIn, UserPlus } from 'lucide-react';
import { auth, db } from '../../services/firebase/config';
import { doc, getDoc, onSnapshot, query, collection, where } from 'firebase/firestore';
import {
  HeaderWrapper,
  Container,
  NavGroup,
  NavLink,
  IconButton,
  Dropdown,
  DropdownContent,
  DropdownItem,
  NotificationDot,
  DropdownHeader,
  LogoLink,
  NavContainer,
  RegisterButton
} from './styles';
import useScrollDirection from '../../hooks/useScrollDirection';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggleButton } from './styles';

const SignedHeader = ({ toggleTheme, isDarkMode }) => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const scrollDirection = useScrollDirection();
  const navigate = useNavigate();
  const [supportTickets, setSupportTickets] = useState([]);
  const [hasUnreadTickets, setHasUnreadTickets] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfileData(doc.data());
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    // Subscribe to user's support tickets
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'support_tickets'),
        where('userId', '==', user.uid),
        where('status', 'in', ['open', 'in_progress'])
      ),
      (snapshot) => {
        const tickets = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSupportTickets(tickets);
        setHasUnreadTickets(tickets.some(ticket => !ticket.read));
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleProfileClick = () => {
    if (user?.uid) {
      navigate(`/profile/${user.uid}`);
      setIsDropdownOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderSupportDropdown = () => (
    <Dropdown>
      <IconButton onClick={() => navigate('/support')}>
        <HelpCircle size={20} />
        {hasUnreadTickets && (
          <NotificationDot />
        )}
      </IconButton>
      <DropdownContent>
        <div style={{ padding: '0.5rem 1rem', borderBottom: `1px solid ${props => props.theme.border}` }}>
          <div>Support</div>
        </div>
        {supportTickets.length > 0 ? (
          <>
            {supportTickets.map(ticket => (
              <DropdownItem 
                key={ticket.id} 
                as={Link} 
                to={`/support/ticket/${ticket.id}`}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div>{ticket.subject}</div>
                  <small style={{ opacity: 0.7 }}>
                    {ticket.status === 'open' ? 'Awaiting Response' : 'In Progress'}
                  </small>
                </div>
                {!ticket.read && (
                  <span style={{ 
                    background: '#EF4444', 
                    borderRadius: '50%', 
                    width: '8px', 
                    height: '8px' 
                  }} />
                )}
              </DropdownItem>
            ))}
          </>
        ) : (
          <DropdownItem as={Link} to="/support">
            No active tickets
          </DropdownItem>
        )}
        <DropdownItem as={Link} to="/support/new">
          <MessageSquare size={16} /> New Support Ticket
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );

  return (
    <HeaderWrapper isScrolled={isScrolled} hide={scrollDirection === 'down'}>
      <Container>
        <NavGroup className="logo-group">
          <LogoLink to="/">
            <BookOpen size={24} />
            <span>BABEL</span>
          </LogoLink>
        </NavGroup>
        
        <NavGroup className="nav-links">
          <NavContainer>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search">Search</NavLink>
            <NavLink to="/collections">Collections</NavLink>
            <NavLink to="/forums">Forums</NavLink>
          </NavContainer>
        </NavGroup>
        
        <NavGroup className="actions-group">
          <ThemeToggleButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </ThemeToggleButton>
          <IconButton>
            <Search size={20} />
          </IconButton>
          {renderSupportDropdown()}
          <Dropdown>
            <IconButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img 
                src={profileData?.photoURL || user?.photoURL || '/default-avatar.png'} 
                alt="avatar" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </IconButton>
            <DropdownContent isOpen={isDropdownOpen}>
              <DropdownHeader>
                <div>{profileData?.displayName || user?.displayName || 'User'}</div>
                <div>{user?.email}</div>
              </DropdownHeader>
              <DropdownItem onClick={handleProfileClick}>
                <User size={16} /> Profile
              </DropdownItem>
              <DropdownItem as={Link} to="/settings" style={{ textDecoration: 'none' }}>
                <Settings size={16} /> Settings
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                <LogOut size={16} /> Log out
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </NavGroup>
      </Container>
    </HeaderWrapper>
  );
};

export default SignedHeader;
