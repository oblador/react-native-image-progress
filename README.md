# react-native-image-progress
*Progress indicator for networked images in React Native*

**NOTE: This module requires React Native 0.8+**

## Installation

```
npm install --save react-native-image-progress
```

## Usage

```js
var Image = require('react-native-image-progress');
<Image 
  source={{ uri: 'http://loremflickr.com/640/480/dog' }} 
  indicator='bar' 
  style={{
    width: 320, 
    height: 240, 
  }}/>
```

## Properties

Any [`Image` property](http://facebook.github.io/react-native/docs/image.html) and the following:

| Prop | Description | Default |
|---|---|---|
|**`indicator`**|Style of the indicator, can be `bar` or `spinner`|`bar`|

## Demo

![demo](https://cloud.githubusercontent.com/assets/378279/8722568/309cf2ee-2bc6-11e5-8613-f365e21eddda.gif)

## Example 

Check full example in the `Example` folder. 

## Todo

- [x] Progress bar indicator
- [ ] Circular loading indicator
- [ ] Animate progress

## License

[MIT License](http://opensource.org/licenses/mit-license.html).

