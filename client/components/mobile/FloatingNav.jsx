import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { remSize, prop, colors } from '../../theme';
import IconButton from './IconButton';

const FloatingContainer = styled.div`
  position: fixed;
  right: ${remSize(16)};
  bottom: ${remSize(60)};

  text-align: right;
  z-index: 3;

  svg {
    width: ${remSize(32)};
  }
  svg > path {
    fill: ${prop('Button.primary.default.background')} !important;
  }
`;

const IconContainer = styled.div`
  padding: 1.4rem;
  background: ${prop('MobilePanel.default.background')};
  aspect-ratio: 1/1;
  border-radius: 99999px;
  display: flex;
  justify-content: center;
  align-items: center;
  scale: 0.75;
  padding-left: 1.8rem;
`;

const FloatingNav = ({ items }) => (
  <FloatingContainer>
    {items.map(({ icon, onPress, to }) => (
      <IconContainer>
        <IconButton onClick={onPress} icon={icon} to={to} />
      </IconContainer>
    ))}
  </FloatingContainer>
);

FloatingNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.element,
      onPress: PropTypes.func,
      to: PropTypes.string
    })
  )
};

FloatingNav.defaultProps = {
  items: []
};

export default FloatingNav;
