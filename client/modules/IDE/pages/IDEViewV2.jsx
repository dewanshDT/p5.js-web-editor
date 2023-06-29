import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import {
  unstable_useBlocker as useBlocker,
  useLocation
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import SplitPane from 'react-split-pane';
import MediaQuery from 'react-responsive';
import Editor from '../components/Editor';
import IDEKeyHandlers from '../components/IDEKeyHandlers';
import Sidebar from '../components/Sidebar';
import PreviewFrame from '../components/PreviewFrame';
import Console from '../components/Console';
import Toast from '../components/Toast';
import { updateFileContent } from '../actions/files';
import {
  setPreviousPath,
  stopSketch,
  collapseSidebar,
  newFile
} from '../actions/ide';
import {
  autosaveProject,
  clearPersistedState,
  getProject
} from '../actions/project';
import { selectActiveFile, selectRootFile } from '../selectors/files';
import { getIsUserOwner, selectCanEditSketch } from '../selectors/users';
import RootPage from '../../../components/RootPage';
import IDEOverlays from './IDEOverlays';
import Header from '../components/Header';
import FloatingActionButton from '../components/FloatingActionButton';
import EditorV2 from '../components/EditorV2';
import {
  EditorSidebarWrapper,
  FileDrawer,
  PreviewWrapper
} from '../components/EditorV2/MobileEditor';
import IconButton from '../../../components/mobile/IconButton';
import { PlusIcon } from '../../../common/icons';
import ConnectedFileNode from '../components/FileNode';

function getTitle(project) {
  const { id } = project;
  return id ? `p5.js Web Editor | ${project.name}` : 'p5.js Web Editor';
}

function isAuth(pathname) {
  return pathname === '/login' || pathname === '/signup';
}

function isOverlay(pathname) {
  return pathname === '/about' || pathname === '/feedback';
}

function WarnIfUnsavedChanges() {
  const hasUnsavedChanges = useSelector((state) => state.ide.unsavedChanges);
  const { t } = useTranslation();

  const currentLocation = useLocation();

  const blocker = useBlocker(hasUnsavedChanges);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const nextLocation = blocker.location;
      if (
        isAuth(nextLocation.pathname) ||
        isAuth(currentLocation.pathname) ||
        isOverlay(nextLocation.pathname) ||
        isOverlay(currentLocation.pathname)
      ) {
        blocker.proceed();
      } else {
        const didConfirm = window.confirm(t('Nav.WarningUnsavedChanges'));
        if (didConfirm) {
          blocker.proceed();
        } else {
          blocker.reset();
        }
      }
    }
  }, [blocker, currentLocation.pathname, t, hasUnsavedChanges]);

  return null;
}

const IDEViewV2 = (props) => {
  const ide = useSelector((state) => state.ide);
  const selectedFile = useSelector(selectActiveFile);
  const preferences = useSelector((state) => state.preferences);
  const project = useSelector((state) => state.project);
  const isUserOwner = useSelector(getIsUserOwner);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [consoleSize, setConsoleSize] = useState(
    ide.consoleIsExpanded ? 150 : 29
  );
  const [sidebarSize, setSidebarSize] = useState(
    ide.sidebarIsExpanded ? 160 : 20
  );
  const rootFile = useSelector(selectRootFile);
  const canEditProject = useSelector(selectCanEditSketch);

  let cmController = null;
  let overlay = null;

  const autosaveIntervalRef = useRef(null);
  const prevPropsRef = useRef({
    selectedFileName: selectedFile.name,
    selectedFileContent: selectedFile.content,
    location: props.location,
    sidebarIsExpanded: ide.sidebarSize,
    project_id: props.params.project_id
  });

  const handleBeforeUnload = (e) => {
    const confirmationMessage = t('Nav.WarningUnsavedChanges');
    if (ide.unsavedChanges) {
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
    return null;
  };

  const syncFileContent = () => {
    const file = cmController.getContent();
    dispatch(updateFileContent(file.id, file.content));
  };

  useEffect(() => {
    dispatch(clearPersistedState());

    dispatch(stopSketch());
    if (props.params.project_id) {
      const { project_id: id, username } = props.params;
      if (id !== project.id) {
        dispatch(getProject(id, username));
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    let autosaveInterval = null;

    return () => {
      clearTimeout(autosaveInterval);
      autosaveInterval = null;
    };
  }, []);

  // for setting previous location
  useEffect(() => {
    if (props.location !== prevPropsRef.current.location) {
      dispatch(setPreviousPath(prevPropsRef.current.location.pathname));
    }

    prevPropsRef.current.location = props.location;
  }, [props.location]);

  // for the sidebar size behaviour
  useEffect(() => {
    if (!ide.sidebarIsExpanded) {
      prevPropsRef.current.sidebarSize = sidebarSize;
      setSidebarSize(20);
    }
    if (ide.sidebarIsExpanded) {
      setSidebarSize(
        prevPropsRef.current.sidebarSize > 160
          ? prevPropsRef.current.sidebarSize
          : 160
      );
    }
  }, [ide.sidebarIsExpanded]);

  // For autosave
  useEffect(() => {
    if (
      isUserOwner &&
      project.id &&
      preferences.autosave &&
      ide.unsavedChanges &&
      !ide.justOpenedProject
    ) {
      if (
        selectedFile.name === prevPropsRef.current.selectedFileName &&
        selectedFile.content !== prevPropsRef.current.selectedFileContent
      ) {
        if (autosaveIntervalRef.current) {
          clearTimeout(autosaveIntervalRef.current);
        }
        autosaveIntervalRef.current = setTimeout(
          dispatch(autosaveProject()),
          20000
        );
      }
    } else if (autosaveIntervalRef.current && !preferences.autosave) {
      clearTimeout(autosaveIntervalRef.current);
      autosaveIntervalRef.current = null;
    }

    prevPropsRef.current.selectedFileName = selectedFile.name;
    prevPropsRef.current.selectedFileContent = selectedFile.content;

    return () => {
      if (autosaveIntervalRef.current) {
        clearTimeout(autosaveIntervalRef.current);
        autosaveIntervalRef.current = null;
      }
    };
  }, [
    isUserOwner,
    project.id,
    preferences.autosave,
    ide.unsavedChanges,
    ide.justOpenedProject,
    selectedFile.name,
    selectedFile.content
  ]);

  return (
    <RootPage>
      <Helmet>
        <title>{getTitle(project)}</title>
      </Helmet>
      <IDEKeyHandlers getContent={() => cmController.getContent()} />
      <WarnIfUnsavedChanges />
      <Toast />
      <Header cmController={cmController} syncFileContent={syncFileContent} />
      <MediaQuery minWidth={770}>
        {(matches) =>
          matches ? (
            <main className="editor-preview-container">
              <SplitPane
                split="vertical"
                size={sidebarSize}
                onChange={(size) => {
                  setSidebarSize(size);
                }}
                allowResize={ide.sidebarIsExpanded}
                minSize={125}
              >
                <Sidebar />
                <SplitPane
                  split="vertical"
                  defaultSize="50%"
                  onChange={() => {
                    overlay.style.display = 'block';
                  }}
                  onDragFinished={() => {
                    overlay.style.display = 'none';
                  }}
                  resizerStyle={{
                    borderLeftWidth: '2px',
                    borderRightWidth: '2px',
                    width: '2px',
                    margin: '0px 0px'
                  }}
                >
                  <SplitPane
                    split="horizontal"
                    primary="second"
                    size={ide.consoleIsExpanded ? consoleSize : 29}
                    minSize={29}
                    onChange={(size) => setConsoleSize(size)}
                    allowResize={ide.consoleIsExpanded}
                    className="editor-preview-subpanel"
                  >
                    <Editor
                      provideController={(ctl) => {
                        cmController = ctl;
                      }}
                    />
                    <Console />
                  </SplitPane>
                  <section className="preview-frame-holder">
                    <header className="preview-frame__header">
                      <h2 className="preview-frame__title">
                        {t('Toolbar.Preview')}
                      </h2>
                    </header>
                    <div className="preview-frame__content">
                      <div
                        className="preview-frame-overlay"
                        ref={(element) => {
                          overlay = element;
                        }}
                      />
                      <div>
                        {((preferences.textOutput || preferences.gridOutput) &&
                          ide.isPlaying) ||
                          ide.isAccessibleOutputPlaying}
                      </div>
                      <PreviewFrame cmController={cmController} />
                    </div>
                  </section>
                </SplitPane>
              </SplitPane>
            </main>
          ) : (
            <>
              <FloatingActionButton syncFileContent={syncFileContent} />
              <PreviewWrapper show={ide.isPlaying}>
                <SplitPane
                  style={{ position: 'static' }}
                  split="horizontal"
                  primary="second"
                  minSize={200}
                >
                  <PreviewFrame
                    fullView
                    hide={!ide.isPlaying}
                    cmController={cmController}
                  />
                  <Console />
                </SplitPane>
              </PreviewWrapper>
              <EditorSidebarWrapper show={!ide.isPlaying}>
                <FileDrawer show={ide.sidebarIsExpanded}>
                  <button
                    data-backdrop="filedrawer"
                    onClick={() => {
                      dispatch(collapseSidebar());
                    }}
                  >
                    {' '}
                  </button>
                  <nav>
                    <h4>Sketch Files</h4>
                    <IconButton
                      onClick={() => {
                        dispatch(newFile(rootFile.id));
                      }}
                      icon={PlusIcon}
                    />
                  </nav>
                  <ConnectedFileNode id={rootFile.id} canEit={canEditProject} />
                </FileDrawer>
                <EditorV2
                  provideController={(ctl) => {
                    cmController = ctl;
                  }}
                />
              </EditorSidebarWrapper>
            </>
          )
        }
      </MediaQuery>
      <IDEOverlays />
    </RootPage>
  );
};

IDEViewV2.propTypes = {
  params: PropTypes.shape({
    project_id: PropTypes.string,
    username: PropTypes.string,
    reset_password_token: PropTypes.string
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }).isRequired
};

export default IDEViewV2;