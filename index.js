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
} = React
var flattenStyle = require('react-native/Libraries/StyleSheet/flattenStyle');

var BAR_WIDTH = 150;
var BAR_HEIGHT = 6;
var MIN_PADDING = 10;

var ImageProgress = React.createClass({
  getInitialState: function() {
    return {
      loading: false,
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

  handleLoadStart: function() {
    this.setState({
      error: false,
      loading: true,
      progress: 0,
    });
  },

  handleLoadProgress: function(event) {
    this.setState({
      progress: event.nativeEvent.written / event.nativeEvent.total,
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

        default: {
          var barWidth = BAR_WIDTH;
          if(this.state.layout) {
            barWidth = Math.min(BAR_WIDTH, this.state.layout.width - MIN_PADDING * 2);
          }

          var barWidthStyle = { width: barWidth };
          var barProgressStyle = { width: (barWidth - 2) * this.state.progress };

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
        onLoadStart={this.handleLoadStart}
        onLoadProgress={this.handleLoadProgress}
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
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT/2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bar: {
    margin: 1,
    backgroundColor: 'black',
    borderRadius: BAR_HEIGHT/2 - 1,
    height: BAR_HEIGHT - 2,
  }
});

module.exports = ImageProgress;
