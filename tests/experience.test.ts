import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { useExperience } from '../src/state/experience';
import { applications } from '../src/content/apps';
beforeEach(() =>
  useExperience.setState({
    mode: 'showroom',
    drivePaused: false,
    activeApp: 'work',
    maximized: false,
    displayFocused: false,
    entryProgress: 0,
    entryControl: 'auto',
    inputOwner: 'none',
  }),
);
test('desktop receives input only after cabin entry completes', () => {
  useExperience.getState().arrive();
  assert.equal(useExperience.getState().mode, 'showroom');
  useExperience.getState().enter();
  assert.equal(useExperience.getState().inputOwner, 'none');
  useExperience.getState().arrive();
  assert.equal(useExperience.getState().inputOwner, 'desktop');
});
test('app launch is ignored while the entry animation owns the experience', () => {
  useExperience.getState().enter();
  useExperience.getState().openApp('about');
  assert.equal(useExperience.getState().activeApp, 'work');
});
test('returning to the showroom releases input and preserves the selected project', () => {
  useExperience.getState().enter();
  useExperience.getState().arrive();
  useExperience.getState().openApp('fermeon');
  useExperience.getState().exit();
  assert.equal(useExperience.getState().inputOwner, 'none');
  useExperience.getState().enter();
  useExperience.getState().arrive();
  assert.equal(useExperience.getState().activeApp, 'fermeon');
});
test('Meetly remains disabled and preserves its agreed address', () => {
  const meetly = applications.find((app) => app.id === 'meetly');
  assert.equal(meetly?.launchUrl, 'https://mymeetly.xyz');
  useExperience.getState().enter();
  useExperience.getState().arrive();
  useExperience.getState().openApp('meetly');
  assert.equal(useExperience.getState().activeApp, 'work');
});
test('cancelled entry cannot later switch to desktop', () => {
  useExperience.getState().enter();
  useExperience.getState().exit();
  useExperience.getState().arrive();
  assert.equal(useExperience.getState().mode, 'showroom');
});

test('scroll entry can reverse without handing input to the dashboard', () => {
  const state = useExperience.getState();
  state.enter('scroll');
  state.seekEntry(0.7);
  state.seekEntry(0.25);
  assert.equal(useExperience.getState().entryProgress, 0.25);
  assert.equal(useExperience.getState().inputOwner, 'none');
  assert.equal(useExperience.getState().mode, 'entering');
  state.seekEntry(2);
  assert.equal(useExperience.getState().entryProgress, 1);
  assert.equal(
    useExperience.getState().mode,
    'entering',
    'the camera must finish before apps become interactive',
  );
});

test('invalid scroll values and gestures outside entry cannot corrupt camera state', () => {
  const state = useExperience.getState();
  state.seekEntry(0.5);
  assert.equal(useExperience.getState().entryProgress, 0);
  state.enter('scroll');
  state.seekEntry(0.4);
  state.seekEntry(NaN);
  state.seekEntry(Infinity);
  assert.equal(useExperience.getState().entryProgress, 0.4);
  state.seekEntry(-1);
  assert.equal(useExperience.getState().entryProgress, 0);
  state.arrive();
  state.seekEntry(0.2);
  assert.equal(useExperience.getState().entryProgress, 1);
});

test('an automatic entry can resume a partial scroll entry', () => {
  const state = useExperience.getState();
  state.enter('scroll');
  state.seekEntry(0.6);
  state.continueEntry();
  assert.equal(useExperience.getState().entryControl, 'auto');
  assert.equal(useExperience.getState().entryProgress, 0.6);
});

test('dashboard apps focus the physical screen without forcing an overlay', () => {
  const state = useExperience.getState();
  state.enter();
  state.arrive();
  state.openApp('fermeon');
  assert.equal(useExperience.getState().activeApp, 'fermeon');
  assert.equal(useExperience.getState().displayFocused, true);
  assert.equal(useExperience.getState().maximized, false);
  state.toggleMaximized();
  state.toggleMaximized();
  state.focusDisplay(false);
  assert.equal(useExperience.getState().activeApp, 'fermeon');
});

test('showroom cannot acquire dashboard controls; exiting clears camera state', () => {
  const state = useExperience.getState();
  state.focusDisplay(true);
  state.toggleMaximized();
  assert.equal(useExperience.getState().displayFocused, false);
  assert.equal(useExperience.getState().maximized, false);
  state.enter();
  state.arrive();
  state.openApp('about');
  state.exit();
  assert.equal(useExperience.getState().entryProgress, 0);
  assert.equal(useExperience.getState().displayFocused, false);
  state.continueEntry();
  assert.equal(useExperience.getState().mode, 'showroom');
});

test('driving owns input exclusively and returns to the selected portfolio app', () => {
  const state = useExperience.getState();
  state.enter();
  state.arrive();
  state.openApp('fermeon');
  state.startDrive();
  assert.equal(useExperience.getState().mode, 'driving');
  assert.equal(useExperience.getState().inputOwner, 'driving');
  state.openApp('about');
  state.closeApp();
  state.toggleMaximized();
  assert.equal(useExperience.getState().activeApp, 'fermeon');
  state.pauseDrive();
  assert.equal(useExperience.getState().inputOwner, 'none');
  assert.equal(useExperience.getState().drivePaused, true);
  state.resumeDrive();
  assert.equal(useExperience.getState().inputOwner, 'driving');
  state.returnToPortfolio();
  assert.equal(useExperience.getState().mode, 'desktop');
  assert.equal(useExperience.getState().activeApp, 'fermeon');
  assert.equal(useExperience.getState().inputOwner, 'desktop');
  assert.equal(useExperience.getState().drivePaused, false);
});

test('driving shortcuts respect transition guards and can start directly from the showroom', () => {
  const state = useExperience.getState();
  state.pauseDrive();
  state.resumeDrive();
  state.returnToPortfolio();
  assert.equal(useExperience.getState().mode, 'showroom');
  assert.equal(useExperience.getState().inputOwner, 'none');
  state.enter();
  state.startDrive();
  assert.equal(useExperience.getState().mode, 'entering');
  state.exit();
  state.startDrive();
  assert.equal(useExperience.getState().mode, 'driving');
  state.arrive();
  state.enter();
  assert.equal(useExperience.getState().mode, 'driving');
  state.pauseDrive();
  state.exit();
  state.resumeDrive();
  assert.equal(useExperience.getState().mode, 'showroom');
  assert.equal(useExperience.getState().drivePaused, false);
  assert.equal(useExperience.getState().inputOwner, 'none');
});
