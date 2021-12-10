import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  let navigate = useNavigate();

  return (
    <FontAwesomeIcon
      onClick={() => navigate('/')}
      icon={faHome}
      size="2x"
      color="white"
    />
  );
};

export default Header;
