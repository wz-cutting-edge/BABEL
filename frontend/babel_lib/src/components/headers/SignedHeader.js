import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, LogOut, User, BookMarked, MessageSquare, Moon, Sun, Settings, HelpCircle } from 'lucide-react';
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
  DropdownItem
} from './styles';
import useScrollDirection from '../../hooks/useScrollDirection';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';

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
    const fetchProfileData = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
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
          <span style={{ 
            position: 'absolute', 
            top: '-5px', 
            right: '-5px', 
            background: '#EF4444', 
            borderRadius: '50%', 
            width: '10px', 
            height: '10px' 
          }} />
        )}
      </IconButton>
      <DropdownContent>
        <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
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
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} color="#7289DA" />
            <span style={{ fontWeight: 'bold' }}>BABEL</span>
          </Link>
        </NavGroup>
        
        <NavGroup className="nav-links">
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/search">Search</NavLink>
            <NavLink to="/collections">Collections</NavLink>
            <NavLink to="/forums">Forums</NavLink>
          </nav>
        </NavGroup>
        
        <NavGroup className="actions-group">
          <IconButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
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
              <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <div>{profileData?.displayName || user?.displayName || 'User'}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{user?.email}</div>
              </div>
              <DropdownItem onClick={handleProfileClick}>
                <User size={16} /> Profile
              </DropdownItem>
              <DropdownItem as={Link} to="/settings">
                <Settings size={16} /> Settings
              </DropdownItem>
              <DropdownItem as={Link} to="/collections">
                <BookMarked size={16} /> Collections
              </DropdownItem>
              <DropdownItem as={Link} to="/forums">
                <MessageSquare size={16} /> Forums
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
