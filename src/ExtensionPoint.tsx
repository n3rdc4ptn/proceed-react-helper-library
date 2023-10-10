"use client";

import * as React from "react";
import { useFederatedComponent } from "./dynamic-module";
import { getPluginsForExtensionPoint, pluginServer } from "./pluginserver";
import { Manifest, Module } from "./manifest";

export const ExtensionPoint = ({
  extensionPoint,
}: {
  extensionPoint: string;
}) => {
  const [plugins, setPlugins] = React.useState<Manifest[]>([]);

  React.useEffect(() => {
    getPluginsForExtensionPoint(extensionPoint).then((plugins) => {
      setPlugins(plugins);
    });
  }, []);

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
    <div>
      {modules.map(({ module, plugin }) => (
        <DynamicComponent
          key={`${plugin.bundle}-${module.module}`}
          plugin={plugin}
          module={module}
        ></DynamicComponent>
      ))}
    </div>
  );
};

const DynamicComponent = ({
  plugin,
  module,
}: {
  plugin: Manifest;
  module: Module;
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