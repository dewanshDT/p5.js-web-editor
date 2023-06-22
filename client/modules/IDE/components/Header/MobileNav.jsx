import React from 'react';
import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { prop, remSize } from '../../../../theme';
import AstriskIcon from '../../../../images/p5-asterisk.svg';
import IconButton from '../../../../components/mobile/IconButton';
import { AccountIcon, MoreIcon } from '../../../../common/icons';
import { openPreferences } from '../../actions/ide';

const Nav = styled.div`
  background: ${prop('MobilePanel.default.background')};
  color: ${prop('primaryTextColor')};
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
    > path {
      fill: ${prop('accentColor')};
      stroke: ${prop('accentColor')};
    }
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

const DropDown = styled.ul`
  position: absolute;
  z-index: 2;
  top: ${remSize(60)};
  right: ${remSize(12)};

  > button[data-type='menu-backdrop'] {
    position: absolute;
    z-index: -10;
    background-color: #00000005;
    transform: translate(-550px, -100px);
    height: 9999px;
    width: 9999px;
    cursor: default;
  }

  > ul {
    ${prop('MobilePanel.default')}
    display: flex;
    flex-direction: column;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    min-width: ${remSize(120)};
    border-radius: ${remSize(2)};

    > b {
      margin: ${remSize(6)} ${remSize(12)};
      position: relative;
      width: min-content;
      &::after {
        content: '';
        position: absolute;
        opacity: calc(0.5);
        top: 50%;
        transform: translate(100%, -50%);
        right: ${remSize(-6)};
        width: ${remSize(55)};
        height: 1px;
        background-color: ${prop('Button.primary.default.foreground')};
      }
    }

    > li {
      display: flex;
      width: 100%;
      > button {
        width: 100%;
        padding: ${remSize(8)} ${remSize(15)} ${remSize(8)} ${remSize(10)};
        font-size: ${remSize(18)};
        text-align: left;
        &:hover {
          background-color: ${prop('Button.primary.hover.background')};
          color: ${prop('Button.primary.hover.foreground')};
        }
      }
    }
  }
`;

const MobileNav = () => {
  const project = useSelector((state) => state.project);
  const [currentMenu, setCurrentMenu] = useState(null);
  const { t } = useTranslation();

  const Logo = AstriskIcon;
  return (
    <div>
      <Nav>
        <IconContainer>
          <Logo />
        </IconContainer>
        <Info>
          <h1>{project.name}</h1>
          {project?.owner && <h5>by {project?.owner?.username}</h5>}
        </Info>
        <Options>
          <IconButton
            onClick={() => {
              if (currentMenu === 'account') setCurrentMenu(null);
              else setCurrentMenu('account');
            }}
            icon={AccountIcon}
          />
          <IconButton
            onClick={() => {
              if (currentMenu === 'more') setCurrentMenu(null);
              else setCurrentMenu('more');
            }}
            icon={MoreIcon}
          />
        </Options>
      </Nav>
      {currentMenu && (
        <Menu setCurrentMenu={setCurrentMenu} currentMenu={currentMenu} />
      )}
    </div>
  );
};

const Menu = ({ currentMenu, setCurrentMenu }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <DropDown>
      <button data-type="menu-backdrop" onClick={() => setCurrentMenu(null)}>
        {' '}
      </button>
      {currentMenu === 'more' && (
        <ul>
          <b>{t('Nav.File.Title')}</b>
          <li>
            <button
              onClick={() => {
                console.log('file clicked');
                setCurrentMenu(null);
              }}
            >
              {t('Nav.File.New')}
            </button>
          </li>
          <li>
            <button>{t('Common.Save')}</button>
          </li>
          <li>
            <button>{t('Nav.File.Examples')}</button>
          </li>
          <b>{t('Nav.Edit.Title')}</b>
          <li>
            <button>{t('Nav.Edit.TidyCode')}</button>
          </li>
          <li>
            <button>{t('Nav.Edit.Find')}</button>
          </li>
          <b>{t('Nav.Sketch.Title')}</b>
          <li>
            <button>{t('Nav.Sketch.AddFile')}</button>
          </li>
          <li>
            <button>{t('Nav.Sketch.AddFolder')}</button>
          </li>
          {/* TODO: Add Translations */}
          <b>Settings</b>
          <li>
            <button
              onClick={() => {
                dispatch(openPreferences());
                setCurrentMenu(null);
              }}
            >
              Preferences
            </button>
          </li>
          <li>
            <button>Language</button>
          </li>
          <b>{t('Nav.Help.Title')}</b>
          <li>
            <button>{t('Nav.Help.KeyboardShortcuts')}</button>
          </li>
          <li>
            <button>{t('Nav.Help.Reference')}</button>
          </li>
          <li>
            <button>{t('Nav.Help.About')}</button>
          </li>
        </ul>
      )}
      {currentMenu === 'account' && (
        <ul>
          <li>
            <button>{t('Nav.File.New')}</button>
          </li>
          <li>
            <button>{t('Nav.File.New')}</button>
          </li>
          <li>
            <button>{t('Nav.File.New')}</button>
          </li>
          <li>
            <button>{t('Nav.File.New')}</button>
          </li>
        </ul>
      )}
    </DropDown>
  );
};

Menu.propTypes = {
  currentMenu: PropTypes.string.isRequired,
  setCurrentMenu: PropTypes.func.isRequired
};

export default MobileNav;
