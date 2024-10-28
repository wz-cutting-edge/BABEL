import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    line-height: 1.5;
    transition: background-color 0.2s ease;
  }

  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    color: inherit;
    
    &::placeholder {
      color: ${props => props.theme.textSecondary};
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.secondary};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.theme.secondaryHover};
    }
  }
`;

export default GlobalStyle;
