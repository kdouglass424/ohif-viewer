import { id } from './id';
import {
  ohif,
  cornerstone,
  basicRoute,
  extensionDependencies as basicDependencies,
  mode as basicMode,
  modeInstance as basicModeInstance,
} from '@ohif/mode-basic';
import {
  tracked,
  extensionDependencies as longitudinalDeps,
  longitudinalInstance,
} from '@ohif/mode-longitudinal';

export const vetPacs = {
  patientPanel: '@vcr/extension-vet-pacs.panelModule.vetPatientInfo',
};

export const extensionDependencies = {
  ...longitudinalDeps,
  '@vcr/extension-vet-pacs': '^1.0.0',
};

export const vetReadingLayout = {
  ...longitudinalInstance,
  props: {
    ...longitudinalInstance.props,
    leftPanels: [tracked.thumbnailList, vetPacs.patientPanel],
  },
};

export const vetReadingRoute = {
  ...basicRoute,
  path: 'reading',
  layoutInstance: vetReadingLayout,
};

export const modeInstance = {
  ...basicModeInstance,
  id,
  routeName: 'reading',
  displayName: 'Vet Reading',
  routes: [vetReadingRoute],
  extensions: extensionDependencies,
};

const mode = {
  ...basicMode,
  id,
  modeInstance,
  extensionDependencies,
};

export default mode;
