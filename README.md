# steerage

Plugin for configuring and composing [Hapi](http://hapijs.com) (version `>= 15.0.0 < 17.0.0`) servers through configuration files.

Leverages [Confidence](https://github.com/hapijs/confidence) for environment-aware configuration, [Shortstop](https://github.com/krakenjs/shortstop) for protocol handlers, and [Topo](https://github.com/hapijs/topo) for ordering.

Includes hooks that enable boostrapping lifecycle events to be listened for.

### Usage

```javascript
const Path = require('path');
const Steerage = require('steerage');
const Hapi = require('hapi');

const steerage = await Steerage.init({ config: Path.join(__dirname, 'config', 'config.json') });

const server = new Hapi.Server(steerage.config.server);

await server.register(steerage);

server.start();
```

### API

- `init(options)` - a promise that returns a new Steerage plugin. In addition, this plugin will have the following properties:
    - `config` - contains the fully resolved configuration specified in `options`.


### Configuration options

- `config` - a fully resolved path to a configuration document (relative paths in this document are from the document's location).
- `basedir` - optional alternative location to base `shortstop` relative paths from.
- `hooks` - an optional object containing hook functions consisting of:
    - `config(store, callback)` - hook for modifying config prior to compose.
    - `register(name, config, callback)` - hook for modifying the plugin config before register.
- `protocols` - optional additional custom protocols for `shortstop`.
- `environment` - optional additional criteria for `confidence` property resolution and defaults to `{ env: process.env }`.

### Default protocols

- `file` - read a file.
- `path` - resolve a path.
- `base64` - resolve a base64 string.
- `env` - access an environment variable.
- `require` - require a javascript or json file.
- `exec` - execute a function.
- `glob` - match files using the patterns shell uses.
- `config` - access another property in the config.
- `import` - imports another JSON file, supports comments.

### Manifest

The resulting configuration (please see [Confidence](https://github.com/hapijs/confidence)) should contain the (minimum) following:

- `server` - optional [server settings](https://hapijs.com/api#serversettings) overrides.
- `register` - an object defining [plugins](http://hapijs.com/api#plugins), with optional additional properties:
    - `plugin` - Hapi 17 plugin object.
    - `enabled` - can be set to `false` to disable registering this plugin (defaults to `true`).
    - `before` - a string or array of strings of plugin names (keys in the `plugins` object) used to reorder.
    - `after` - a string or array of strings of plugin names used to reorder.

Example:

```json
{
    "server": {
        "app": {
            "name": "testApp"
        },
        "debug": {
            "log": {
                "$filter": "env.NODE_ENV",
                "$default": ["debug"],
                "production": ["warn"]
            }
        }
    },
    "register": {
        "good": {
            "plugin": "require:good",
            "options": {
                "reporters": {
                    "console": [{
                        "module": "good-console"
                    }, "stdout"]
                }
            }
        }
    }
}
```

In addition, the [Confidence](https://github.com/hapijs/confidence) configuration store will be accessible as `server.app.config`. This config object allows access to deep properties:

```
server.app.config.get('my.app.property');
server.app.config.set('my.app.property', true);
```

The resolved (for the `environment` at start time) JSON configuration can be viewed as `server.settings.app`.
