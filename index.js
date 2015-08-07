/**
 * @providesModule ImageProgress
 */
'use strict';

var _ = require('lodash');
var React = require('react-native');
var {
  Image,
  View,
  StyleSheet,
  ActivityIndicatorIOS,
} = React
var flattenStyle = require('react-native/Libraries/StyleSheet/flattenStyle');

var ProgressBar = require('./ProgressBar');

var ImageProgress = React.createClass({
  getInitialState: function() {
    return {
      loading: true,
      error: false,
      progress: 0,
    };
  },

  getDefaultProps: function() {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      indicator: 'bar',
    };
  },

  setNativeProps: function(nativeProps) {
    this._root.setNativeProps(nativeProps);
  },

  bubbleEvent: function(propertyName, event) {
    if(typeof this.props[propertyName] === 'function') {
      this.props[propertyName](event);
    }
  },

  setStateStart: function() {
    if (!this.state.loading && this.state.progress !== 1) {
      this.setState({
        loading: true,
        progress: 0,
      });
    }
  },

  setStateLoaded: function() {
    if (this.state.progress !== 1) {
      this.setState({
        loading: false,
        progress: 1,
      });
    }
  },

  setStateError: function() {
    this.setState({
      error: true,
      loading: false,
    });
  },

  setStateProgress: function(progress) {
    // RN is very buggy with these events, sometimes a loaded event and then a few
    // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
    // actually means the image is no longer loading
    if (progress !== this.state.progress && this.state.progress !== 1) {
      this.setState({
        loading: progress < 1,
        progress: progress,
      });
    }
  },

  // React>=0.8.0
  handleLoadStart: function() {
    this.setStateStart();
    this.bubbleEvent('onLoadStart');
  },

  // React>=0.9.0
  handleProgress: function(event) {
    var progress = event.nativeEvent.loaded / event.nativeEvent.total;
    this.setStateProgress(progress);
    this.bubbleEvent('onProgress', event);
  },

  // React>=0.9.0
  handleError: function(event) {
    this.setStateError();
    this.bubbleEvent('onError', event);
  },

  // React>=0.9.0
  handleLoad: function(event) {
    this.setStateLoaded();
    this.bubbleEvent('onLoad', event);
  },

  // React>=0.9.0
  handleLoadEnd: function(event) {
    this.setStateLoaded();
    this.bubbleEvent('onLoadEnd', event);
  },

  // React<0.9.0
  handleLoadProgress: function(event) {
    var progress = event.nativeEvent.written / event.nativeEvent.total;
    this.setStateProgress(progress);
    this.bubbleEvent('onLoadProgress', event);
  },

  // React<0.9.0
  handleLoaded: function() {
    this.setStateLoaded();
    this.bubbleEvent('onLoaded');
  },

  // React<0.9.0
  handleLoadAbort: function() {
    this.setState({
      loading: false,
    });
    this.bubbleEvent('onLoadAbort');
  },

  // React<0.9.0
  handleLoadError: function(event) {
    this.setStateError();
    this.bubbleEvent('onLoadError', event);
  },

  componentWillReceiveProps: function(props) {
    if(!_.isEqual(this.props.source, props.source)) {
      this.setState(this.getInitialState());
    }
  },

  _renderIndicator: function(progress, color) {
    switch(this.props.indicator) {
      case 'circle': throw new Error('Not yet implemented');

      case 'spinner': {
        var props = {};
        if(color) {
          props.color = color;
        }
        return (<ActivityIndicatorIOS {...props} />);
      }

      case 'bar': {
        var props = { progress };
        if(color) {
          props.color = color;
        }
        if(this.props.backgroundColor) {
          props.backgroundColor = this.props.backgroundColor;
        }
        return (<ProgressBar {...props} />);
      }

      default: {
        throw new Error('Invalid indicator type: ' + this.props.indicator);
      }
    }
  },

  render: function() {
    var children = this.props.children;

    // Don't pass on props that are overridden or specific to this module.
    var props = _.omit(this.props, 'children', 'indicator', 'backgroundColor', 'color', 'onLoadStart', 'onLoadProgress', 'onLoaded', 'onLoadAbort', 'onLoadError');

    // Flatten style so we can read the color property, but remove it since it doen't apply to Image
    var style = flattenStyle(this.state.loading ? [styles.container, props.style] : props.style);
    var color = style.color || this.props.color;
    props.style = _.omit(style, 'color');

    if(this.state.loading) {
      var renderIndicator = this.props.renderIndicator || this._renderIndicator;
      children = renderIndicator(this.state.progress, color)
    }
    return (
      <Image
        {...props}
        ref={component => this._root = component}
        onLoadStart={this.handleLoadStart} // React>=0.8.0
        onProgress={this.handleProgress} // React>=0.9.0
        onError={this.handleError} // React>=0.9.0
        onLoad={this.handleLoad} // React>=0.9.0
        onLoadEnd={this.handleLoadEnd} // React>=0.9.0
        onLoadAbort={this.handleLoadAbort} // React<0.9.0
        onLoadError={this.handleLoadError} // React<0.9.0
        onLoadProgress={this.handleLoadProgress} // React<0.9.0
        onLoaded={this.handleLoaded} // React<0.9.0
      >
        {children}
      </Image>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

module.exports = ImageProgress;
