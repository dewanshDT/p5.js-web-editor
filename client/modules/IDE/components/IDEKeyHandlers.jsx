import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { updateFileContent } from '../actions/files';
import {
  showErrorModal,
  startSketch,
  stopSketch,
  toggleConsole,
  toggleSidebar
} from '../actions/ide';
import { setAllAccessibleOutput } from '../actions/preferences';
import { cloneProject, saveProject } from '../actions/project';
import useKeyDownHandlers from '../hooks/useKeyDownHandlers';
import { getAuthenticated, selectCanEditSketch } from '../selectors/users';

export const useIDEKeyHandlers = ({ getContent }) => {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(getAuthenticated);
  const canEdit = useSelector(selectCanEditSketch);

  const syncFileContent = () => {
    const file = getContent();
    dispatch(updateFileContent(file.id, file.content));
  };

  useKeyDownHandlers({
    'ctrl-s': (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        dispatch(showErrorModal('forceAuthentication'));
      } else if (canEdit) {
        dispatch(saveProject(getContent()));
      } else {
        dispatch(cloneProject());
      }
    },
    'ctrl-shift-enter': (e) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(stopSketch());
    },
    'ctrl-enter': (e) => {
      e.preventDefault();
      e.stopPropagation();
      syncFileContent();
      dispatch(startSketch());
    },
    'ctrl-shift-1': (e) => {
      e.preventDefault();
      dispatch(setAllAccessibleOutput(true));
    },
    'ctrl-shift-2': (e) => {
      e.preventDefault();
      dispatch(setAllAccessibleOutput(false));
    },
    'ctrl-b': (e) => {
      e.preventDefault();
      dispatch(toggleSidebar());
    },
    'ctrl-`': (e) => {
      e.preventDefault();
      dispatch(toggleConsole());
    }
  });
};

const IDEKeyHandlers = ({ getContent }) => {
  useIDEKeyHandlers({ getContent });
  return null;
};

// Most actions can be accessed via redux, but those involving the cmController
// must be provided via props.
IDEKeyHandlers.propTypes = {
  getContent: PropTypes.func.isRequired
};

export default IDEKeyHandlers;
