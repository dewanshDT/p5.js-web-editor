import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import MediaQuery from 'react-responsive';
import styled from 'styled-components';
import Nav from './Nav';
import Toolbar from './Toolbar';
import MobileHeader from '../../../../components/mobile/MobileHeader';
import UnsavedChangesIndicator from '../UnsavedChangesIndicator';
import { selectActiveFile } from '../../selectors/files';
import { MoreIcon } from '../../../../common/icons';
import IconButton from '../../../../components/mobile/IconButton';
import MobileNav from './MobileNav';

const NavItem = styled.li`
  position: relative;
`;

const Header = (props) => {
  const project = useSelector((state) => state.project);

  return (
    <MediaQuery minWidth={770}>
      {(matches) =>
        matches ? (
          <>
            <Nav cmController={props.cmController} />
            <Toolbar
              syncFileContent={props.syncFileContent}
              key={props.project.id}
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
  }).isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired
};

Header.defaultProps = {
  cmController: {}
};

function mapStateToProps(state) {
  return {
    user: state.user,
    project: state.project,
    selectedFile: selectActiveFile(state)
  };
}

const mapDispatchToProps = {};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(Header)
);
