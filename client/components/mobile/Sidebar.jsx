import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize, prop } from '../../theme';
import MobileHeader from './MobileHeader';
import IconButton from './IconButton';
import { ExitIcon } from '../../common/icons';

const SidebarWrapper = styled.div`
  height: 100%;
  width: ${remSize(180)};

  position: fixed;
  z-index: 2;
  left: 0;

  background: ${prop('backgroundColor')};
  box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.1);
`;

const Sidebar = ({ title, onPressClose, children }) => (
  <SidebarWrapper>
    {title && (
      <MobileHeader slim title={title} fixed={false}>
        <IconButton
          onClick={onPressClose}
          icon={ExitIcon}
          aria-label="Return to ide view"
        />
      </MobileHeader>
    )}
    {children}
  </SidebarWrapper>
);

Sidebar.propTypes = {
  title: PropTypes.string,
  onPressClose: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ])
};

Sidebar.defaultProps = {
  title: null,
  children: [],
  onPressClose: () => {}
};

export default Sidebar;
