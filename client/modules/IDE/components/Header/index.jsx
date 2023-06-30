import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import MediaQuery from 'react-responsive';
import Toolbar from './Toolbar';
import MobileNav from './MobileNav';
import NavV2 from './NavV2';

const Header = (props) => {
  const project = useSelector((state) => state.project);

  return (
    <MediaQuery minWidth={770}>
      {(matches) =>
        matches ? (
          <>
            <NavV2 />
            <Toolbar syncFileContent={props.syncFileContent} key={project.id} />
          </>
        ) : (
          <MobileNav />
        )
      }
    </MediaQuery>
  );
};

Header.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default Header;
