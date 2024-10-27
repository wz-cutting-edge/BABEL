import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Moon, Sun, LogOut, HeadphonesIcon, Users, BarChart2, Upload } from 'lucide-react';
import { auth } from '../../firebase';
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

const AdminHeader = ({ toggleTheme, isDarkMode, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <HeaderWrapper isScrolled={isScrolled}>
      <Container>
        <NavGroup className="logo-group">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={24} color="#7289DA" />
            <span style={{ fontWeight: 'bold' }}>BABEL ADMIN</span>
          </Link>
        </NavGroup>
        
        <NavGroup className="nav-links">
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/customer-support">Customer Support</NavLink>
            <NavLink to="/user-reports">User Reports</NavLink>
            <NavLink to="/analytics">Analytics</NavLink>
            <NavLink to="/media-uploader">Media Uploader</NavLink>
          </nav>
        </NavGroup>
        
        <NavGroup className="actions-group">
          <IconButton onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
          <Dropdown>
            <IconButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img 
                src={user?.photoURL || '/default-avatar.png'} 
                alt="avatar" 
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            </IconButton>
            <DropdownContent isOpen={isDropdownOpen}>
              <div style={{ padding: '0.5rem 1rem', borderBottom: `1px solid ${props => props.theme.border}` }}>
                <div>Admin User</div>
                <div style={{ fontSize: '0.75rem', color: props => props.theme.secondary }}>{user?.email}</div>
              </div>
              <DropdownItem as={Link} to="/customer-support">
                <HeadphonesIcon size={16} /> Customer Support
              </DropdownItem>
              <DropdownItem as={Link} to="/user-reports">
                <Users size={16} /> User Reports
              </DropdownItem>
              <DropdownItem as={Link} to="/analytics">
                <BarChart2 size={16} /> Analytics
              </DropdownItem>
              <DropdownItem as={Link} to="/media-uploader">
                <Upload size={16} /> Media Uploader
              </DropdownItem>
              <DropdownItem onClick={() => auth.signOut()}>
                <LogOut size={16} /> Log out
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </NavGroup>
      </Container>
    </HeaderWrapper>
  );
};

export default AdminHeader;
