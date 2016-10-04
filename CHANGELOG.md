
### V4.0.0

- Converted to Node.js 6.0 supported ES6 (obviously requires Node 6).
- Replaced `confit` with `confidence`.
- API changes: `options` are `config`, `protocol`, and `environment`.

### V3.2.0

- Expose `compose` in exports.

### V3.1.0

- Bind a context to the route factory so that `server` and `target` can be read.

### V3.0.0

- Added `routes` to configuration support.
- Added CLI.

### V2.0.0

- Configuration format changed: `plugins` and `connections` are now objects to support merging. See README.
