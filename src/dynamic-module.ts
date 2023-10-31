"use client";
import { PluginUIContext } from "proceed-plugin-core-library";
import React, { ComponentType } from "react";
import useDynamicScript from "./useDynamicScript";
import {
  WebpackRemoteContainer,
  getContainer,
} from "@module-federation/utilities";

function loadComponent(remoteUrl: string, scope: string, module: string) {
  return async () => {
    // eslint-disable-next-line no-undef
    await __webpack_init_sharing__("default");
    await __webpack_init_sharing__(scope);

    const container = await getContainer(scope);

    if (container) {
      // eslint-disable-next-line no-undef
      await container.init(__webpack_share_scopes__);

      const factory = await container.get(module);
      const Module = factory();
      return Module;
    } else {
      console.log("Plugin " + scope + " not found");
      return null;
    }
  };
}

const componentCache = new Map();
export const useFederatedComponent = (
  remoteUrl: string,
  scope: any,
  module: string
) => {
  const key = `${remoteUrl}-${scope}-${module}`;
  const [Component, setComponent] = React.useState<ComponentType<{
    context: PluginUIContext;
  }> | null>(null);

  const { ready, errorLoading } = useDynamicScript(remoteUrl);

  React.useEffect(() => {
    if (Component) setComponent(null);
    // Only recalculate when key changes
  }, [key]);

  React.useEffect(() => {
    if (ready && !Component) {
      const Comp = React.lazy(loadComponent(remoteUrl, scope, module));
      componentCache.set(key, Comp);
      setComponent(Comp);
    }
    // key includes all dependencies (scope/module)
  }, [Component, ready, key]);

  return { errorLoading, Component };
};
