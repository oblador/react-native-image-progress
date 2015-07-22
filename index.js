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

  handleLoadStart: function() {
    this.setState({
      loading: true,
      progress: 0,
    });
    this.bubbleEvent('onLoadStart');
  },

  handleLoadProgress: function(event) {
    // RN is very buggy with these events, sometimes a loaded event and then a few
    // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
    // actually means the image is no longer loading
    var progress = event.nativeEvent.written / event.nativeEvent.total;
    this.setState({
      loading: progress < 1,
      progress: progress,
    });
    this.bubbleEvent('onLoadProgress', event);
  },

  handleLoaded: function() {
    this.setState({
      loading: false,
      progress: 1,
    });
    this.bubbleEvent('onLoaded');
  },

  handleLoadAbort: function() {
    this.setState({
      loading: false,
    });
    this.bubbleEvent('onLoadAbort');
  },

  handleLoadError: function(event) {
    this.setState({
      error: true,
      loading: false,
    });
    this.bubbleEvent('onLoadError', event);
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
        onLoadProgress={this.handleLoadProgress}
        onLoadStart={this.handleLoadStart}
        onLoaded={this.handleLoaded}
        onLoadAbort={this.handleLoadAbort}
        onLoadError={this.handleLoadError}
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
