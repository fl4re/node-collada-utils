# collada-utils

[![Build Status](https://travis-ci.org/fl4re/node-collada-utils.svg?branch=master)](https://travis-ci.org/fl4re/collada-nodejs-utils)
[![Build status](https://ci.appveyor.com/api/projects/status/8t9c4krsjok7p9om?svg=true)](https://ci.appveyor.com/project/maxime-helen-sb/collada-nodejs-utils)

Nodejs utilities dealing with Collada documents. This project is under development.

### Release

- Valid collada documents
- List collada external resource dependencies from file

### To do

- Build gltf document from Collada conversion

### Requirements

You must have install DAEValidator application and its validation schemas from [OpenCOLLADA](https://github.com/KhronosGroup/OpenCOLLADA) project in order to deploy this validation service.

Your path environment variable must point to the installed DAEValidator binaries location.

Required files are:
- collada_schema_1_4_1
- collada_schema_1_5
- DAEValidator

### Install

```$ npm install collada-utils```

### Usage

```javascript
const collada_utils = require("collada-utils");
const deps = collada_utils.dependencies(model_path);
collada.validate(model_path)
  .then(() => console.log("success!"))
  .catch(err => console.error(err))
```
### Contact

Maxime Helen - maxime.helen@starbreeze.com

David Gaya - david.gaya@starbreeze.com

### Licence

MIT
