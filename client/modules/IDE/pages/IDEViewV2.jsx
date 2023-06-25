import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import {
  unstable_useBlocker as useBlocker,
  useLocation
} from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { useTranslation, withTranslation } from 'react-i18next';
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
import { setPreviousPath, stopSketch, collapseSidebar } from '../actions/ide';
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

function getTitle(props) {
  const { id } = props.project;
  return id ? `p5.js Web Editor | ${props.project.name}` : 'p5.js Web Editor';
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
  const [consoleSize, setConsoleSize] = useState(
    props.ide.consoleIsExpanded ? 150 : 29
  );
  const [sidebarSize, setSidebarSize] = useState(
    props.ide.sidebarIsExpanded ? 160 : 20
  );
  const rootFile = useSelector(selectRootFile);
  const canEditProject = useSelector(selectCanEditSketch);

  // const [cmController, setCmController] = useState(null);
  let cmController = null;
  let overlay = null;
  const autosaveIntervalRef = useRef(null);
  const prevPropsRef = useRef({
    selectedFileName: props.selectedFile.name,
    selectedFileContent: props.selectedFile.content,
    location: props.location,
    sidebarIsExpanded: props.ide.sidebarIsExpanded,
    project_id: props.params.project_id
  });

  const handleBeforeUnload = (e) => {
    const confirmationMessage = props.t('Nav.WarningUnsavedChanges');
    if (props.ide.unsavedChanges) {
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    }
    return null;
  };

  const syncFileContent = () => {
    const file = cmController.getContent();
    props.updateFileContent(file.id, file.content);
  };

  useEffect(() => {
    props.clearPersistedState();

    props.stopSketch();
    if (props.params.project_id) {
      const { project_id: id, username } = props.params;
      if (id !== props.project.id) {
        props.getProject(id, username);
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    let autosaveInterval = null;

    return () => {
      clearTimeout(autosaveInterval);
      autosaveInterval = null;
    };
  }, []);

  useEffect(() => {
    if (props.location !== prevPropsRef.current.location) {
      props.setPreviousPath(prevPropsRef.current.location.pathname);
    }
    if (
      props.ide.sidebarIsExpanded !== prevPropsRef.current.sidebarIsExpanded
    ) {
      setSidebarSize(props.ide.sidebarIsExpanded ? 160 : 20);
    }

    prevPropsRef.current.location = props.location;
    prevPropsRef.current.sidebarIsExpanded = props.ide.sidebarIsExpanded;
  }, [props.location, props.ide, props.setPreviousPath]);

  useEffect(() => {
    if (props.params.project_id && !prevPropsRef.current.project_id) {
      if (props.params.project_id !== props.project.id) {
        props.getProject(props.params.project_id);
      }
    }

    prevPropsRef.current.project_id = props.params.project_id;
  }, [props.params.project_id, props.project.id, props.getProject]);

  useEffect(() => {
    const { isUserOwner, project, preferences, ide, selectedFile } = props;
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
        autosaveIntervalRef.current = setTimeout(autosaveProject, 20000);
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
    props.isUserOwner,
    props.project.id,
    props.preferences.autosave,
    props.ide.unsavedChanges,
    props.ide.justOpenedProject,
    props.selectedFile.name,
    props.selectedFile.content,
    props.autosaveProject
  ]);

  return (
    <RootPage>
      <Helmet>
        <title>{getTitle(props)}</title>
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
                onChange={(size) => setSidebarSize(size)}
                //   onDragFinished={this._handleSidebarPaneOnDragFinished}
                allowResize={props.ide.sidebarIsExpanded}
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
                    size={props.ide.consoleIsExpanded ? consoleSize : 29}
                    minSize={29}
                    onChange={(size) => setConsoleSize(size)}
                    allowResize={props.ide.consoleIsExpanded}
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
                        {props.t('Toolbar.Preview')}
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
                        {((props.preferences.textOutput ||
                          props.preferences.gridOutput) &&
                          props.ide.isPlaying) ||
                          props.ide.isAccessibleOutputPlaying}
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
              <PreviewWrapper show={props.ide.isPlaying}>
                <SplitPane
                  style={{ position: 'static' }}
                  split="horizontal"
                  primary="second"
                  size={50}
                >
                  <PreviewFrame
                    fullView
                    hide={!props.ide.isPlaying}
                    cmController={cmController}
                  />
                  <Console />
                </SplitPane>
              </PreviewWrapper>
              <EditorSidebarWrapper show={!props.ide.isPlaying}>
                <FileDrawer show={props.ide.sidebarIsExpanded}>
                  <button
                    data-backdrop="filedrawer"
                    onClick={props.collapseSidebar}
                  >
                    {' '}
                  </button>
                  <nav>
                    <h4>Sketch Files</h4>
                    <IconButton icon={PlusIcon} />
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
  }).isRequired,
  getProject: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool.isRequired,
    id: PropTypes.string,
    username: PropTypes.string
  }).isRequired,
  ide: PropTypes.shape({
    isPlaying: PropTypes.bool.isRequired,
    isAccessibleOutputPlaying: PropTypes.bool.isRequired,
    projectOptionsVisible: PropTypes.bool.isRequired,
    justOpenedProject: PropTypes.bool.isRequired,
    sidebarIsExpanded: PropTypes.bool.isRequired,
    consoleIsExpanded: PropTypes.bool.isRequired,
    unsavedChanges: PropTypes.bool.isRequired
  }).isRequired,
  stopSketch: PropTypes.func.isRequired,
  collapseSidebar: PropTypes.func.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string
    }),
    updatedAt: PropTypes.string
  }).isRequired,
  preferences: PropTypes.shape({
    autosave: PropTypes.bool.isRequired,
    textOutput: PropTypes.bool.isRequired,
    gridOutput: PropTypes.bool.isRequired,
    theme: PropTypes.string.isRequired,
    autorefresh: PropTypes.bool.isRequired,
    language: PropTypes.string.isRequired,
    autocloseBracketsQuotes: PropTypes.bool.isRequired,
    autocompleteHinter: PropTypes.bool.isRequired
  }).isRequired,
  selectedFile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  updateFileContent: PropTypes.func.isRequired,
  autosaveProject: PropTypes.func.isRequired,
  setPreviousPath: PropTypes.func.isRequired,
  clearPersistedState: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isUserOwner: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    selectedFile: selectActiveFile(state),
    ide: state.ide,
    preferences: state.preferences,
    user: state.user,
    project: state.project,
    isUserOwner: getIsUserOwner(state)
  };
}

const mapDispatchToProps = {
  autosaveProject,
  clearPersistedState,
  getProject,
  setPreviousPath,
  stopSketch,
  updateFileContent,
  collapseSidebar
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(IDEViewV2)
);
