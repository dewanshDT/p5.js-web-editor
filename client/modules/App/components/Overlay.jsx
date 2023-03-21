import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import ExitIcon from '../../../images/exit.svg';

const Overlay = ({
  closeOverlay,
  previousPath,
  ariaLabel,
  title,
  children,
  actions,
  isFixedHeight
}) => {
  const ref = useRef(null);
  const navigate = useNavigate();

  const close = () => {
    // Only close if it is the last (and therefore the topmost overlay)
    const overlays = document.getElementsByClassName('overlay');
    if (
      ref.current.parentElement.parentElement !== overlays[overlays.length - 1]
    )
      return;

    if (!closeOverlay) {
      navigate(previousPath);
    } else {
      closeOverlay();
    }
  };

  const handleClickOutside = () => {
    close();
  };

  const handleClick = (e) => {
    if (ref.current.contains(e.target)) {
      return;
    }

    handleClickOutside(e);
  };

  const keyPressHandle = (e) => {
    // escape key code = 27.
    // So here we are checking if the key pressed was Escape key.
    if (e.keyCode === 27) {
      close();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false);
    document.addEventListener('keydown', keyPressHandle);

    ref.current.focus();

    return () => {
      document.removeEventListener('mousedown', handleClick, false);
      document.removeEventListener('keydown', keyPressHandle);
    };
  });

  return (
    <div
      className={`overlay ${isFixedHeight ? 'overlay--is-fixed-height' : ''}`}
    >
      <div className="overlay__content">
        <section
          role="main"
          aria-label={ariaLabel}
          ref={(node) => {
            this.node = node;
          }}
          className="overlay__body"
        >
          <header className="overlay__header">
            <h2 className="overlay__title">{title}</h2>
            <div className="overlay__actions">
              {actions}
              <button
                className="overlay__close-button"
                onClick={close}
                aria-label={this.props.t('Overlay.AriaLabel', { title })}
              >
                <ExitIcon focusable="false" aria-hidden="true" />
              </button>
            </div>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
};

Overlay.propTypes = {
  children: PropTypes.element,
  actions: PropTypes.element,
  closeOverlay: PropTypes.func,
  title: PropTypes.string,
  ariaLabel: PropTypes.string,
  previousPath: PropTypes.string,
  isFixedHeight: PropTypes.bool
};

Overlay.defaultProps = {
  children: null,
  actions: null,
  title: 'Modal',
  closeOverlay: null,
  ariaLabel: 'modal',
  previousPath: '/',
  isFixedHeight: false
};

export default withTranslation()(Overlay);
