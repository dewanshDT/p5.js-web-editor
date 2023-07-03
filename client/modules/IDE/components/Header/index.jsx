import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import MediaQuery from 'react-responsive';
import MobileNav from './MobileNav';
import NavV2 from './NavV2';
import ToolbarV2 from './ToolbarV2';

const Header = (props) => {
  const project = useSelector((state) => state.project);

  return (
    <header style={{ zIndex: 1 }}>
      <NavV2 />
      <MediaQuery minWidth={770}>
        {(matches) => {
          if (matches)
            return (
              <ToolbarV2
                syncFileContent={props.syncFileContent}
                key={project.id}
              />
            );
          return null;
        }}
      </MediaQuery>
    </header>
  );
};

Header.propTypes = {
  syncFileContent: PropTypes.func.isRequired
};

export default Header;
