"use client";
import { PluginUIContext } from "proceed-plugin-core-library";
import React, { ComponentType } from "react";
import useDynamicScript from "./useDynamicScript";
import { getContainer } from "@module-federation/utilities";

function loadComponent(pluginBundle: string, module: string) {
  return async () => {
    // eslint-disable-next-line no-undef
    await __webpack_init_sharing__("default");
    await __webpack_init_sharing__(pluginBundle);

    const container = await getContainer(pluginBundle);

    if (container) {
      // eslint-disable-next-line no-undef
      await container.init(__webpack_share_scopes__);

      const factory = await container.get(module);
      const Module = factory();
      return Module;
    } else {
      console.log("Plugin " + pluginBundle + " not found");
      return null;
    }
  };
}

const componentCache = new Map();
export const useFederatedComponent = (
  remoteUrl: string,
  pluginBundle: any,
  module: string
) => {
  const key = `${remoteUrl}-${pluginBundle}-${module}`;
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
      const Comp = React.lazy(loadComponent(pluginBundle, module));
      componentCache.set(key, Comp);
      setComponent(Comp);
    }
    // key includes all dependencies (scope/module)
  }, [Component, ready, key]);

  return { errorLoading, Component };
};
