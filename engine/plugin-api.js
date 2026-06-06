// ============================================================
//  C BUILDER — Plugin API
// ============================================================

var _plugins = {};

function registerLanguage(plugin) {
  if (!plugin.id) throw new Error('Plugin must have an id');
  _plugins[plugin.id] = plugin;
  Object.keys(plugin.fileTypes || {}).forEach(function(ext) {
    _plugins['__ext__' + ext] = plugin.id;
  });
  console.log('[PluginAPI] Registered: ' + plugin.name + ' (' + plugin.id + ')');
}

function getPlugin(extKey) {
  var pluginId = _plugins['__ext__' + extKey];
  if (pluginId && _plugins[pluginId]) return _plugins[pluginId];
  var keys = Object.keys(_plugins).filter(function(k) { return k.indexOf('__ext__') !== 0; });
  return keys.length ? _plugins[keys[0]] : null;
}

function getAllPlugins() {
  return Object.keys(_plugins)
    .filter(function(k) { return k.indexOf('__ext__') !== 0; })
    .map(function(k) { return _plugins[k]; });
}

function getFileType(name) {
  if (!name) return 'c';
  if (name === 'Makefile' || name.endsWith('.mk')) return 'mk';
  var m = name.match(/\.(\w+)$/);
  return m ? m[1] : 'c';
}

function getBlocksForFile(filename) {
  var ext = getFileType(filename);
  var plugin = getPlugin(ext);
  if (!plugin) return {};
  var ft = plugin.fileTypes[ext];
  return ft ? (ft.blocks || {}) : {};
}

function getHighlighter(filename) {
  var ext = getFileType(filename);
  var plugin = getPlugin(ext);
  return plugin ? plugin.highlight : function(code) { return escH(code); };
}

function getValidator(filename) {
  var ext = getFileType(filename);
  var plugin = getPlugin(ext);
  return (plugin && plugin.validate) ? plugin.validate : null;
}
