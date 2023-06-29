import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import MediaQuery from 'react-responsive';
import Nav from './Nav';
import Toolbar from './Toolbar';
import MobileNav from './MobileNav';

const Header = (props) => {
  const project = useSelector((state) => state.project);

  return (
    <MediaQuery minWidth={770}>
      {(matches) =>
        matches ? (
          <>
            <Nav cmController={props.cmController} />
            <Toolbar syncFileContent={props.syncFileContent} key={project.id} />
          </>
        ) : (
          <MobileNav cmController={props.cmController} />
        )
      }
    </MediaQuery>
  );
};

Header.propTypes = {
  cmController: PropTypes.shape({
    tidyCode: PropTypes.func,
    showFind: PropTypes.func,
    showReplace: PropTypes.func,
    getContent: PropTypes.func
  }),
  syncFileContent: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string
    }),
    updatedAt: PropTypes.string
  }).isRequired
};

Header.defaultProps = {
  cmController: {}
};

export default Header;
