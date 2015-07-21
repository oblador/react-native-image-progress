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

  getDefaultProps: function() {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      color: '#333',
      indicator: 'bar',
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
    var props = _.omit(this.props, 'children', 'indicator', 'backgroundColor', 'color', 'onLoadStart', 'onLoadProgress', 'onLoaded', 'onLoadAbort', 'onLoadError', 'handleLayoutChange');
    var style = flattenStyle(this.state.loading ? [styles.container, props.style] : props.style);
    var color = style.color || this.props.color;
    props.style = _.omit(style, 'color');

    if(this.state.loading) {

      switch(this.props.indicator) {
        case 'circle': throw new Error('Not yet implemented'); break;

        case 'spinner': {
          indicator = (<ActivityIndicatorIOS />);
          break;
        }

        case 'bar': {
          var barWidth = BAR_WIDTH;
          if(this.state.layout) {
            barWidth = Math.min(BAR_WIDTH, this.state.layout.width - MIN_PADDING * 2);
          }

          var barBackgroundStyle = {
            width: barWidth,
            backgroundColor: this.props.backgroundColor,
          };
          var barProgressStyle = {
            width: (barWidth - BAR_CONTAINER_PADDING * 2) * this.state.progress,
            backgroundColor: color,
          };

          indicator = (
            <View style={[styles.barContainer, barBackgroundStyle]}>
              <View style={[styles.bar, barProgressStyle]}></View>
            </View>)
          break;
        }
        default: {
          throw new Error('Invalid indicator type: ' + this.props.indicator);
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
    padding: BAR_CONTAINER_PADDING,
  },
  bar: {
    borderRadius: BAR_HEIGHT/2,
    padding: BAR_HEIGHT/2,
    height: BAR_HEIGHT,
  }
});

module.exports = ImageProgress;
