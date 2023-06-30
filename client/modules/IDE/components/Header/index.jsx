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
    <MediaQuery minWidth={770}>
      {(matches) =>
        matches ? (
          <>
            <NavV2 />
            <ToolbarV2
              syncFileContent={props.syncFileContent}
              key={project.id}
            />
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
