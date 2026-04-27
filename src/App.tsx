import {
  Alignment,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Drawer,
  Menu,
  MenuDivider,
  MenuItem,
  Navbar,
  Popover,
  ProgressBar,
} from '@blueprintjs/core';
import { Project } from './ui/Project';
import { Project as ProjectObj } from './core/Project';
import { createProject, loadProject, saveAsProject, saveProject } from './controller/Projects';
import { copy, cut, doDelete, paste, redo, undo } from './controller/Edit';
import { useEffect, useRef, useState } from 'react';
import { Engine } from './core/Engine';
import { BUFFER_SIZE, SAMPLE_RATE } from './core/Config';

import styles from './App.module.css';
import { AudioFileManager } from './core/AudioFileManager';
import { AudioFileManagerContext, EngineContext } from './ui/Context';

const audioContext = new AudioContext();

function App() {
  const initialProject = new ProjectObj();
  const engine = useRef<Engine>(
    new Engine(audioContext, { bufferSize: BUFFER_SIZE, sampleRate: SAMPLE_RATE }, initialProject),
  );
  const audioFileManager = useRef<AudioFileManager>(new AudioFileManager());

  const [project, setProject] = useState(initialProject);
  const [tracks, setTracks] = useState(initialProject.tracks);

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [confirmStopAudio, setConfirmStopAudio] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [mixerVisible, setMixerVisible] = useState(false);
  const [browserVisible, setBrowserVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const continueChangeProject = useRef<() => void>();

  useEffect(() => {
    initializeEngine(engine.current);
  }, []);

  function initializeEngine(engine: Engine) {
    setLoading(true);
    engine.initialize(() => {
      setLoading(false);
    });
  }

  function loadFiles(project: ProjectObj) {
    setLoading(true);
    project.loadFiles(
      engine.current.context,
      (project) => {
        engine.current.project = project;
        setProject(project);
        setTracks(project.tracks);
        setLoading(false);
      },
      (_project, progress) => {
        setLoadingProgress(progress);
      },
    );
  }

  function changeProject(action: () => void) {
    continueChangeProject.current = action;
    if (engine.current.isPlaying) {
      setConfirmStopAudio(true);
    } else {
      action();
    }
  }

  return (
    <EngineContext.Provider value={engine.current}>
      <AudioFileManagerContext.Provider value={audioFileManager.current}>
        {/* About Dialog */}
        <Dialog title="About SLAM OG Studio" icon="info-sign" isOpen={showAbout} className="bp5-dark">
          <DialogBody>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <h1 style={{
                fontFamily: 'Cinzel, serif',
                color: 'hsl(42, 51%, 54%)',
                marginBottom: '0.5rem'
              }}>
                SLAM OG Studio
              </h1>
              <p style={{ color: 'hsl(0, 0%, 65%)', fontSize: '0.875rem' }}>
                Professional Web-Based DAW
              </p>
            </div>
            <p>
              SLAM OG Studio is a digital audio workstation that runs in the browser,
              built by <strong>SLAM OG LLC</strong>.
            </p>
            <p>
              Powered by the{' '}
              <a href="https://www.w3.org/TR/webaudio/" target="_blank" rel="noreferrer" style={{ color: 'hsl(183, 56%, 60%)' }}>
                Web Audio API
              </a>{' '}
              and{' '}
              <a href="https://www.w3.org/TR/webmidi/" target="_blank" rel="noreferrer" style={{ color: 'hsl(183, 56%, 60%)' }}>
                Web MIDI API
              </a>.
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: 'hsl(0, 0%, 65%)',
              borderTop: '1px solid hsl(0, 0%, 15%)',
              paddingTop: '1rem',
              marginTop: '1rem'
            }}>
              Based on WebDAW by Hans-Martin Will (MIT License)
            </p>
          </DialogBody>
          <DialogFooter
            actions={<Button intent="primary" text="Close" onClick={() => setShowAbout(false)} />}
          />
        </Dialog>

        {/* Loading Dialog */}
        <Dialog title="Loading" icon="cloud-download" isOpen={loading} className="bp5-dark">
          <DialogBody>
            <p>Please wait while the project is being loaded...</p>
            <ProgressBar value={loadingProgress} intent="primary" />
          </DialogBody>
        </Dialog>

        {/* Stop Audio Confirmation */}
        <Dialog title="Stop Audio" icon="warning-sign" isOpen={confirmStopAudio} className="bp5-dark">
          <DialogBody>
            <p>Proceeding with this action will stop all audio. Are you sure you want to continue?</p>
          </DialogBody>
          <DialogFooter
            actions={
              <>
                <Button
                  intent="danger"
                  text="Yes"
                  onClick={() => {
                    setConfirmStopAudio(false);
                    continueChangeProject.current?.();
                  }}
                />
                <Button intent="primary" text="No" onClick={() => setConfirmStopAudio(false)} />
              </>
            }
          />
        </Dialog>

        <div className={`${styles.app} bp5-dark`}>
          {/* Navigation Bar */}
          <Navbar style={{
            flex: 0,
            backgroundColor: 'hsl(0, 0%, 8%)',
            borderBottom: '1px solid hsl(0, 0%, 15%)'
          }}>
            <Navbar.Group align={Alignment.LEFT}>
              <Navbar.Heading style={{
                fontFamily: 'Cinzel, serif',
                fontWeight: 500,
                color: 'hsl(42, 51%, 54%)',
                letterSpacing: '0.05em'
              }}>
                SLAM OG Studio
              </Navbar.Heading>
              <Navbar.Divider />

              {/* Project Menu */}
              <Popover
                content={
                  <Menu className="bp5-dark">
                    <MenuItem
                      icon="new-object"
                      text="New Project"
                      onClick={() => {
                        changeProject(() => {
                          engine.current.stop();
                          project.audioFiles.forEach((audioFile) => {
                            audioFileManager.current.unregisterAudioFile(audioFile);
                          });
                          createProject(audioFileManager.current, loadFiles);
                        });
                      }}
                    />
                    <MenuItem
                      icon="cloud-download"
                      text="Load..."
                      onClick={() => {
                        changeProject(() => {
                          engine.current.stop();
                          loadProject(audioFileManager.current);
                        });
                      }}
                    />
                    <MenuItem icon="cloud-upload" text="Save" onClick={saveProject} />
                    <MenuItem icon="duplicate" text="Save As..." onClick={saveAsProject} />
                  </Menu>
                }
                placement="bottom"
              >
                <Button className="bp5-minimal" icon="projects" text="Project" />
              </Popover>

              {/* Edit Menu */}
              <Popover
                content={
                  <Menu className="bp5-dark">
                    <MenuItem icon="undo" text="Undo" onClick={undo} />
                    <MenuItem icon="redo" text="Redo" onClick={redo} />
                    <MenuDivider />
                    <MenuItem icon="cut" text="Cut" onClick={cut} />
                    <MenuItem icon="duplicate" text="Copy" onClick={copy} />
                    <MenuItem icon="insert" text="Paste" onClick={paste} />
                    <MenuItem icon="delete" text="Delete" onClick={doDelete} />
                  </Menu>
                }
                placement="bottom"
              >
                <Button className="bp5-minimal" icon="edit" text="Edit" />
              </Popover>

              {/* Tools Menu */}
              <Button className="bp5-minimal" icon="build" text="Tools" />

              {/* View Menu */}
              <Popover
                content={
                  <Menu className="bp5-dark">
                    <MenuItem
                      icon="cloud"
                      text={browserVisible ? 'Hide Library' : 'Show Library'}
                      onClick={() => setBrowserVisible(!browserVisible)}
                    />
                    <MenuItem
                      icon="settings"
                      text={mixerVisible ? 'Hide Mixer' : 'Show Mixer'}
                      onClick={() => setMixerVisible(!mixerVisible)}
                    />
                    <MenuItem
                      icon="cog"
                      text={showSettings ? 'Hide Settings' : 'Show Settings'}
                      onClick={() => setShowSettings(!showSettings)}
                    />
                  </Menu>
                }
                placement="bottom"
              >
                <Button className="bp5-minimal" icon="control" text="View" />
              </Popover>

              {/* Help Menu */}
              <Popover
                content={
                  <Menu className="bp5-dark">
                    <MenuItem
                      icon="git-repo"
                      text="GitHub"
                      href="https://github.com/yetog/slam-og-studio"
                      target="_blank"
                    />
                    <MenuItem
                      icon="issue"
                      text="Report an Issue"
                      href="https://github.com/yetog/slam-og-studio/issues"
                      target="_blank"
                    />
                    <MenuDivider />
                    <MenuItem icon="info-sign" text="About" onClick={() => setShowAbout(true)} />
                  </Menu>
                }
                placement="bottom"
              >
                <Button className="bp5-minimal" icon="help" text="Help" />
              </Popover>
            </Navbar.Group>
          </Navbar>

          {/* Main Project View */}
          <Project
            project={project}
            tracks={tracks}
            setTracks={setTracks}
            mixerVisible={mixerVisible}
            setMixerVisible={setMixerVisible}
            browserVisible={browserVisible}
            setBrowserVisible={setBrowserVisible}
          />
        </div>

        {/* Settings Drawer */}
        <Drawer
          isOpen={showSettings}
          position="right"
          icon="cog"
          title="Settings"
          onClose={() => setShowSettings(false)}
          className="bp5-dark"
        >
          <div style={{ padding: '1rem' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'hsl(42, 51%, 54%)' }}>
              Audio Settings
            </h3>
            <p style={{ color: 'hsl(0, 0%, 65%)', fontSize: '0.875rem' }}>
              Sample Rate: {SAMPLE_RATE} Hz<br />
              Buffer Size: {BUFFER_SIZE} samples
            </p>
          </div>
        </Drawer>
      </AudioFileManagerContext.Provider>
    </EngineContext.Provider>
  );
}

export default App;
