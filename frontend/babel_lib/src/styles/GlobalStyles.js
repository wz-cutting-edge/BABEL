import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }

  a {
    color: ${props => props.theme.accent};
    text-decoration: none;
  }

  button {
    background-color: ${props => props.theme.accent};
    color: ${props => props.theme.background};
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
  }
`;

export default GlobalStyle;