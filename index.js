/**
 * @providesModule ImageProgress
 */
'use strict';

var isEqual = require('lodash/lang/isEqual');
var omit = require('lodash/object/omit');
var pick = require('lodash/object/pick');

var React = require('react-native');
var {
  Image,
  View,
  StyleSheet,
  ActivityIndicatorIOS,
} = React

var ProgressBar = require('./ProgressBar');

var ImageProgress = React.createClass({
  propTypes: {
    indicator:        React.PropTypes.oneOf(['bar', 'spinner']),
    renderIndicator:  React.PropTypes.func,
    color:            React.PropTypes.string,
    backgroundColor:  React.PropTypes.string,
    threshold:        React.PropTypes.number,
  },

  getDefaultProps: function() {
    return {
      indicator: 'bar',
      threshold: 50,
    };
  },

  getInitialState: function() {
    return {
      loading: false,
      progress: 0,
      thresholdReached: !this.props.threshold,
    };
  },

  setNativeProps: function(nativeProps) {
    this._root.setNativeProps(nativeProps);
  },

  componentDidMount: function() {
    if(this.props.threshold) {
      this._thresholdTimer = setTimeout(() => {
        this.setState({ thresholdReached: true });
        this._thresholdTimer = null;
      }, this.props.threshold);
    }
  },

  componentWillUnmount: function() {
    if(this._thresholdTimer) {
      clearTimeout(this._thresholdTimer);
    }
  },

  bubbleEvent: function(propertyName, event) {
    if(typeof this.props[propertyName] === 'function') {
      this.props[propertyName](event);
    }
  },

  handleLoadStart: function() {
    if (!this.state.loading && this.state.progress !== 1) {
      this.setState({
        loading: true,
        progress: 0,
      });
    }
    this.bubbleEvent('onLoadStart');
  },

  handleProgress: function(event) {
    var progress = event.nativeEvent.loaded / event.nativeEvent.total;
    // RN is very buggy with these events, sometimes a loaded event and then a few
    // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
    // actually means the image is no longer loading
    if (progress !== this.state.progress && this.state.progress !== 1) {
      this.setState({
        loading: progress < 1,
        progress: progress,
      });
    }
    this.bubbleEvent('onProgress', event);
  },

  handleError: function(event) {
    this.setState({
      loading: false,
    });
    this.bubbleEvent('onError', event);
  },

  handleLoad: function(event) {
    if (this.state.progress !== 1) {
      this.setState({
        loading: false,
        progress: 1,
      });
    }
    this.bubbleEvent('onLoad', event);
  },

  componentWillReceiveProps: function(props) {
    if(!isEqual(this.props.source, props.source)) {
      this.setState(this.getInitialState());
    }
  },

  _renderIndicator: function(progress, color) {
    switch(this.props.indicator) {
      case 'circle': throw new Error('Not yet implemented');

      case 'spinner': {
        var props = pick(this.props, 'color');
        return (<ActivityIndicatorIOS {...props} />);
      }

      case 'bar': {
        var props = pick(this.props, 'color', 'backgroundColor');
        return (<ProgressBar progress={progress} {...props} />);
      }

      default: {
        throw new Error('Invalid indicator type: ' + this.props.indicator);
      }
    }
  },

  render: function() {
    var { style, children, renderIndicator, ...props } = this.props;

    // Don't pass on props that are used for the indicator.
    var props = omit(props, 'indicator', 'color', 'backgroundColor');

    if(loading && thresholdReached) {
      style = style ? [styles.container, style] : styles.container;
      renderIndicator = renderIndicator || this._renderIndicator;
      children = renderIndicator(this.state.progress)
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
