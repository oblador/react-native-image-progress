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

  handleLoadStart: function() {
    this.setStateStart();
    this.bubbleEvent('onLoadStart');
  },

  handleProgress: function(event) {
    var progress = event.nativeEvent.loaded / event.nativeEvent.total;
    this.setStateProgress(progress);
    this.bubbleEvent('onProgress', event);
  },

  handleError: function(event) {
    this.setStateError();
    this.bubbleEvent('onError', event);
  },

  handleLoad: function(event) {
    this.setStateLoaded();
    this.bubbleEvent('onLoad', event);
  },

  handleLoadEnd: function(event) {
    this.setStateLoaded();
    this.bubbleEvent('onLoadEnd', event);
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
    var { style, color, children, renderIndicator, ...props } = this.props;

    // Don't pass on props that are used for the indicator.
    var props = _.omit(props, 'indicator', 'backgroundColor');

    // Flatten style so we can read the color property, but remove it since it doen't apply to Image
    if(this.state.loading) {
      style = style ? [styles.container, style] : styles.container;
    }

    if(this.state.loading) {
      renderIndicator = renderIndicator || this._renderIndicator;
      children = renderIndicator(this.state.progress, color)
    }
    return (
      <Image
        {...props}
        ref={component => this._root = component}
        style={style}
        onLoadStart={this.handleLoadStart}
        onProgress={this.handleProgress}
        onError={this.handleError}
        onLoad={this.handleLoad}
        onLoadEnd={this.handleLoadEnd}
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
