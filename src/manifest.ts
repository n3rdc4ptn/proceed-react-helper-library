export function readManifest(manifestRaw: string) {}

export type Manifest = {
  name: string;
  bundle: string;
  version: string;
  description: string;
  permissions?: {
    scopes: string[];
    external: string[];
    plugin: PluginPermission[];
  };
  modules?: Module[];
};

export type PluginPermission = {
  name: string;
  description: string;
};

export type Module = {
  type: string;

  // UI Module
  extensionpoint?: string;
  module?: string;
  file?: string;
};
