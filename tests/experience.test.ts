import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { useExperience } from '../src/state/experience';
import { applications } from '../src/content/apps';
beforeEach(() =>
  useExperience.setState({
    mode: 'showroom',
    activeApp: 'work',
    maximized: false,
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
