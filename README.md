# collada-utils

[![Build Status](https://travis-ci.org/fl4re/collada-nodejs-utils.svg?branch=master)](https://travis-ci.org/fl4re/collada-nodejs-utils)
[![Build status](https://ci.appveyor.com/api/projects/status/8t9c4krsjok7p9om?svg=true)](https://ci.appveyor.com/project/maxime-helen-sb/collada-nodejs-utils)

Nodejs utilities dealing with Collada documents. This project is under development.

### Release

- Valid collada documents
- List collada external resource dependencies from file

### To do

- Build gltf document from Collada conversion

### Requirements

We are compiling [OpenCOLLADA](https://github.com/KhronosGroup/OpenCOLLADA) project in order to handle the validation service. 
There for you must have [CMake](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=0ahUKEwik4ffjmoHRAhVBymMKHRnEBRgQFggcMAA&url=https%3A%2F%2Fcmake.org%2F&usg=AFQjCNHmSotyp0t2nhlfuGhrackSiKIPjw) installed on your machine for installing collada-utils.

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
