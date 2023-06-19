import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { prop, remSize } from '../../../../theme';
import AstriskIcon from '../../../../images/p5-asterisk.svg';
import IconButton from '../../../../components/mobile/IconButton';
import { AccountIcon, MoreIcon } from '../../../../common/icons';

const background = ({ transparent, inverted }) =>
  prop(
    transparent
      ? 'backgroundColor'
      : `MobilePanel.default.${inverted ? 'foreground' : 'background'}`
  );

const textColor = ({ transparent, inverted }) =>
  prop(
    !transparent && inverted
      ? 'MobilePanel.default.background'
      : 'primaryTextColor'
  );

const Nav = styled.div`
  background: ${(props) => background(props)};
  color: ${textColor};
  padding-top: ${remSize(12)};
  padding-bottom: ${remSize(12)};
  padding-left: ${remSize(16)};
  padding-right: ${remSize(16)};
  gap: ${remSize(14)};
  display: flex;
  align-items: center;
  font-size: ${remSize(10)};
`;

const IconContainer = styled.div`
  width: ${remSize(28)};
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  > svg {
    width: 100%;
    height: 100%;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${remSize(2)};

  > * {
    padding: 0;
    margin: 0;
  }

  > h5 {
    font-size: ${remSize(13)};
    font-weight: normal;
  }
`;

const Options = styled.div`
  margin-left: auto;
  display: flex;
  transform: translateX(${remSize(12)});
  svg {
    fill: ${(props) => props.color};
  }
`;

const MobileNav = () => {
  const project = useSelector((state) => state.project);
  console.log(project);

  const Logo = AstriskIcon;
  return (
    <Nav>
      <IconContainer>
        <Logo />
      </IconContainer>
      <Info>
        <h1>{project.name}</h1>
        <h5>by {project?.owner?.username}</h5>
      </Info>
      <Options>
        <IconButton icon={AccountIcon} />
        <IconButton icon={MoreIcon} />
      </Options>
    </Nav>
  );
};

export default MobileNav;
