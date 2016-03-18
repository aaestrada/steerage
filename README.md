# hapi-configure

Environment-aware server configuration for [Hapi](http://hapijs.com) using [Confit](https://github.com/krakenjs/confit).

### API

- `configure(options, /* optional */ callback)` - configures a Hapi server.
    - `options` - `confit` configuration options.
        - `basedir` - directory to look for configuration files.
        - `protocols` - custom protocols for `confit`.
    - `callback(error, server)` - an optional callback - omitting returns a promise.

See also: [confit](https://github.com/krakenjs/confit).

### Manifest

The resulting configuration (please see [Confit](https://github.com/krakenjs/confit)) should contain the (minimum) following:

- `server` - optional [server options](http://hapijs.com/api#new-serveroptions).
- `connections` - object defining [server connections](http://hapijs.com/api#serverconnectionoptions), with key name being a default label.
- `plugins` - an object defining [plugins](http://hapijs.com/api#plugins), with an optional additional properties:
    - `select` - passed to `register`.
    - `before` - a string or array of strings of plugin names (keys in the `plugins` object) used to reorder.
    - `after` - a string or array of strings of plugin names used to reorder.
- `routes` - an object defining [routes](http://hapijs.com/tutorials/routing), with keys representing paths and in addition to standard `handler` property:
    - `handler` - can be an object describing how to load the handler.
        - `module` - the module, which in absence of a factory method is expected to be a factory.
        - `method` - the factory method, if anything other than the top level export.
        - `arguments` - an array of arguments to apply to the factory.

Example:


```json
{
    "server": {
        "load": {
            "sampleInterval": 500
        }
    },
    "connections": {
        "api": {
            "labels": ["api"],
            "port": 9000
        },
        "web": {
            "labels": ["web"],
            "port": 8000
        }
    },
    "plugins": {
        "good": {
            "register": "require:good",
            "options": {
                "reporters": [{
                    "reporter": "require:good-console",
                    "events": {
                        "log": ["error", "medium"]
                    }
                }]
            },
            "select": ["api", "web"]
        }
    },
    "routes": {
        "/test": {
            "method": "GET",
            "handler": {
                "module": "require:../handlers",
                "method": "createTestHandler",
                "arguments": [
                    "testArgument"
                ]
            },
            "select": ["web"]
        }
    }
}
```

In addition, the [confit](https://github.com/krakenjs/confit) configuration will be accessible on `server.app.config`.

### Usage

```javascript
import Path from 'path';
import HapiConfigure from 'hapi-configure';

//Note: will return a promise if no callback.
HapiConfigure({ basedir: Path.join(__dirname, 'config')}, (error, server) => {
    if (error) {
        console.log(error);
        return;
    }

    //Do something with server object.

    //Also, config values availble via
    server.app.config.get('key');
});
```
