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

var BAR_CONTAINER_PADDING = 1;
var BAR_WIDTH = 150;
var BAR_HEIGHT = 5;
var MIN_PADDING = 10;

var ImageProgress = React.createClass({
  getInitialState: function() {
    return {
      loading: true,
      error: false,
      progress: 0,
    };
  },

  setNativeProps: function(nativeProps) {
    this._root.setNativeProps(nativeProps);
  },

  handleLayoutChange: function(event) {
    this.setState({ layout: event.nativeEvent.layout });
  },

  handleLoadStart: function(event) {
    this.setState({
      loading: true,
      progress: 0,
    });
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
  },

  handleLoaded: function() {
    this.setState({
      loading: false,
      progress: 1,
    });
  },

  handleLoadAbort: function() {
    this.setState({
      loading: false,
    });
  },

  handleLoadError: function() {
    this.setState({
      error: true,
      loading: false,
    });
  },

  render: function() {
    var indicator = false;
    var props = _.omit(this.props, 'onLoadStart', 'onLoadProgress', 'onLoaded', 'onLoadAbort', 'onLoadError', 'handleLayoutChange');

    if(this.state.loading) {
      props.style = flattenStyle([styles.container, props.style]);
      switch(props.indicator) {
        case 'circle': throw new Error('Not yet implemented'); break;

        case 'spinner': {
          indicator = (<ActivityIndicatorIOS />);
          break;
        }

        default: {
          var barWidth = BAR_WIDTH;
          if(this.state.layout) {
            barWidth = Math.min(BAR_WIDTH, this.state.layout.width - MIN_PADDING * 2);
          }

          var barWidthStyle = { width: barWidth };
          var barProgressStyle = { width: (barWidth - BAR_CONTAINER_PADDING * 2) * this.state.progress };

          indicator = (
            <View style={[styles.barContainer, barWidthStyle]}>
              <View style={[styles.bar, barProgressStyle]}></View>
            </View>)
          break;
        }
      }
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
        onLayout={this.handleLayoutChange}
      >
        {indicator}
      </Image>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  barContainer: {
    borderRadius: (BAR_HEIGHT + BAR_CONTAINER_PADDING)/2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: BAR_CONTAINER_PADDING,
  },
  bar: {
    borderRadius: BAR_HEIGHT/2,
    padding: BAR_HEIGHT/2,
    backgroundColor: '#333',
    height: BAR_HEIGHT,
  }
});

module.exports = ImageProgress;
