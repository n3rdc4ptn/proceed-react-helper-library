"use client";

import * as React from "react";

import { Manifest, Module, PluginUIContext } from "proceed-plugin-core-library";
import { pluginServer } from "./pluginserver";
import { useFederatedComponent } from "./dynamic-module";

export interface DynamicComponentProps {
  plugin: Manifest;
  module: Module;
  context: PluginUIContext;
}

export const DynamicComponent: React.FC<DynamicComponentProps> = ({
  plugin,
  module,
  context,
}) => {
  const url = `${pluginServer}/plugins/${plugin.bundle}/remoteEntry.js`;
  const pluginBundle = plugin.bundle.replaceAll(".", "_");
  const moduleName = module.module ?? "";

  console.log(url);
  console.log(pluginBundle);

  const { Component: DynComponent } = useFederatedComponent(
    url,
    pluginBundle,
    moduleName
  );

  if (!DynComponent) {
    return <div>Loading...</div>;
  }

  return <DynComponent context={context} />;
};
