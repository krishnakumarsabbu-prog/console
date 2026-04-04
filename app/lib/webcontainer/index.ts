import { webcontainer as fallback } from '../../../src/platform/webcontainer';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<typeof fallback> = Promise.resolve(fallback);

if (import.meta.hot) {
  import.meta.hot.data.webcontainer = webcontainer;
}
