/**
 * @providesModule ImageProgress
 */
'use strict';

var React = require('react-native');
var {
  Image,
  View,
  StyleSheet,
  ActivityIndicatorIOS,
} = React

var ImageProgress = React.createClass({
  propTypes: {
    indicator:        React.PropTypes.func,
    indicatorProps:   React.PropTypes.object,
    renderIndicator:  React.PropTypes.func,
    threshold:        React.PropTypes.number,
  },

  getDefaultProps: function() {
    return {
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
    if(!this.props.source || !props.source || this.props.source.uri !== props.source.uri) {
      this.setState(this.getInitialState());
    }
  },

  render: function() {
    var { style, children, indicator, indicatorProps, renderIndicator, threshold, ...props } = this.props;
    var { progress, thresholdReached, loading } = this.state;

    if((loading || progress < 1) && thresholdReached) {
      style = style ? [styles.container, style] : styles.container;
      if(renderIndicator) {
        children = renderIndicator(progress, !loading || !progress);
      } else {
        var IndicatorComponent = (typeof indicator === 'function' ? indicator : ActivityIndicatorIOS);
        children = (<IndicatorComponent progress={progress} indeterminate={!loading || !progress} {...indicatorProps} />);
      }
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
