"use client";

import * as React from "react";
import { getPluginsForExtensionPoint, pluginServer } from "./pluginserver";
import {
  Manifest,
  Module,
  PluginUIContext,
  PluginUIContextData,
} from "proceed-plugin-core-library";
import { DynamicComponent } from "./DynamicComponent";

type ModuleWithManifest = {
  module: Module;
  plugin: Manifest;
};

const ExtensionModuleContext = React.createContext<
  | ({
      context: PluginUIContext;
    } & ModuleWithManifest)
  | null
>(null);

const ExtensionPoint = ({
  extensionPoint,
  data,
  children,
  plugin,
}: {
  extensionPoint: string;
  plugin?: Manifest;
  data?: PluginUIContextData;
  children?: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = React.useState(plugin == null);
  const [plugins, setPlugins] = React.useState<Manifest[]>(
    plugin ? [plugin] : []
  );

  if (plugin == null) {
    React.useEffect(() => {
      getPluginsForExtensionPoint(extensionPoint).then((plugins) => {
        setIsLoading(false);
        setPlugins(plugins);
      });
    }, []);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (plugins.length == 0) {
    // TODO: Must be replaced, not found should not be displayed.
    return <div>No Plugin found.</div>;
  }

  let modules: ModuleWithManifest[] = [];
  for (let plugin of plugins) {
    modules = [
      ...modules,
      ...(plugin.modules?.map((module) => ({
        module,
        plugin,
      })) ?? []),
    ];
  }

  const context: PluginUIContext = {
    extensionpoint: extensionPoint,
    data,
  };

  if (children) {
    return (
      <>
        {modules.map((module, index) => (
          <ExtensionModuleContext.Provider
            key={index}
            value={{
              ...module,
              context,
            }}
          >
            {children}
          </ExtensionModuleContext.Provider>
        ))}
      </>
    );
  }

  return (
    <>
      {modules.map(({ module, plugin }) => (
        <DynamicComponent
          key={`${extensionPoint}-${plugin.name}-${module.module}`}
          context={context}
          plugin={plugin}
          module={module}
        ></DynamicComponent>
      ))}
    </>
  );
};

const ExtensionPointContent = ({}) => {
  const data = React.useContext(ExtensionModuleContext);

  if (data == null) {
    return undefined;
  }

  const { module, plugin, context } = data;

  return (
    <DynamicComponent
      context={context}
      plugin={plugin}
      module={module}
    ></DynamicComponent>
  );
};

ExtensionPoint.Content = ExtensionPointContent;

export { ExtensionPoint };
