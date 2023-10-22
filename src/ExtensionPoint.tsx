"use client";

import * as React from "react";
import { useFederatedComponent } from "./dynamic-module";
import { getPluginsForExtensionPoint, pluginServer } from "./pluginserver";
import { Manifest, Module } from "proceed-plugin-core-library";

export const ExtensionPoint = ({
  extensionPoint,
}: {
  extensionPoint: string;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [plugins, setPlugins] = React.useState<Manifest[]>([]);

  React.useEffect(() => {
    getPluginsForExtensionPoint(extensionPoint).then((plugins) => {
      setIsLoading(false);
      setPlugins(plugins);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (plugins.length == 0) {
    // TODO: Must be replaced, not found should not be displayed.
    return <div>No Plugin found.</div>;
  }

  let modules: {
    module: Module;
    plugin: Manifest;
  }[] = [];
  for (let plugin of plugins) {
    modules = [
      ...modules,
      ...(plugin.modules?.map((module) => ({
        module,
        plugin,
      })) ?? []),
    ];
  }

  return (
    <>
      {modules.map(({ module, plugin }) => (
        <DynamicComponent plugin={plugin} module={module}></DynamicComponent>
      ))}
    </>
  );
};

interface DynamicComponentProps {
  plugin: Manifest;
  module: Module;
}

const DynamicComponent: React.FC<DynamicComponentProps> = ({
  plugin,
  module,
}) => {
  const url = `${pluginServer}/plugins/${plugin.bundle}/remoteEntry.js`;
  const scope = plugin.name;
  const moduleName = module.module ?? "";

  const { Component: DynComponent } = useFederatedComponent(
    url,
    scope,
    moduleName
  );

  if (!DynComponent) {
    return <div>Loading...</div>;
  }

  return <DynComponent hallo="Plugin Demo" />;
};
