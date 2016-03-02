# hapi-configure

Environment-aware server configuration for Hapi using [Confit](https://github.com/krakenjs/confit).

### API

- `configure(options, /* optional */ callback)` - configures a Hapi server.
    - `options` - `confit` configuration options.
        - `basedir` - directory to look for configuration files.
        - `protocols` - custom protocols for `confit`.
    - `callback(error, server)` - an optional callback - omitting returns a promise.

See also: [confit](https://github.com/krakenjs/confit).

### Manifest

The resulting configuration (please see [Confit](https://github.com/krakenjs/confit)) should contain the following:

- `server` - optional [server options](http://hapijs.com/api#new-serveroptions).
- `connections` - array of [server connections](http://hapijs.com/api#serverconnectionoptions).
- `plugins` - an array of [plugins](http://hapijs.com/api#plugins), with an optional `select` property.

Example:

```json
{
    "server": {

    },
    "connections": [
        {
            "labels": ["api"],
            "port": 9000
        },
        {
            "labels": ["web"],
            "port": 8000
        }
    ],
    "plugins": [
        {
            "register": "require:good",
            "options": {

            },
            "select": ["api", "web"]
        }
    ]
}
```

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
});
```
