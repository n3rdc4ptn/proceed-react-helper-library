/// This file is responsible for the connection to the pluginServer

import { Manifest } from "proceed-plugin-core-library";

export const pluginServer =
  process.env.PLUGIN_SERVER || "http://localhost:3333";

/// Returns a list of all plugins by fetching the plugin server
export async function getPlugins() {
  const plugins: Manifest[] = await fetch(`${pluginServer}/plugins`).then(
    (response) => response.json()
  );

  return plugins;
}

export async function getPluginsForExtensionPoint(
  extensionpoint: string
): Promise<Manifest[]> {
  const plugins = (await getPlugins())
    .map((plugin) => ({
      ...plugin,
      modules: plugin.modules?.filter(
        (module) =>
          module.type == "ui" && module.extensionpoint == extensionpoint
      ),
    }))
    .filter((plugin) => (plugin.modules?.length ?? 0) > 0);

  return plugins;
}
