/**
 * @providesModule ProgressBar
 */
'use strict';

var React = require('react-native');
var {
  Animated,
  View,
  StyleSheet,
} = React

var BAR_CONTAINER_PADDING = 1;
var BAR_WIDTH = 150;
var BAR_HEIGHT = 5;
var MIN_PADDING = 10;
// For some reason 0 widths will equal 100% in RN 0.12+
var ALMOST_ZERO = 0.00000001;

var ProgressBar = React.createClass({
  propTypes: {
    progress:         React.PropTypes.number,
    color:            React.PropTypes.string,
    backgroundColor:  React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      progress: 0,
      color: '#333',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    };
  },

  getInitialState: function() {
    return {
      barWidth: BAR_WIDTH,
      progressWidth: new Animated.Value(this.props.progress || ALMOST_ZERO),
    };
  },

  handleLayoutChange: function(event) {
    var layout = event.nativeEvent.layout;
    var barWidth = BAR_WIDTH;
    if(this.state.layout) {
      barWidth = Math.min(BAR_WIDTH, this.state.layout.width - MIN_PADDING * 2);
    }
    this.setState({ layout, barWidth });
  },

  componentWillReceiveProps: function(props) {
    var progressWidth = (this.state.barWidth - BAR_CONTAINER_PADDING * 2) * props.progress;
    Animated.spring(this.state.progressWidth, {
      toValue: progressWidth || ALMOST_ZERO,
    }).start();
  },

  render: function() {
    var { color, backgroundColor } = this.props;
    var { barWidth, progressWidth } = this.state;

    return (
      <View onLayout={this.handleLayoutChange}>
        <View style={[styles.barContainer, { width: barWidth, backgroundColor }]}>
          <Animated.View style={[styles.bar, { width: progressWidth, backgroundColor: color }]} />
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
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

module.exports = ProgressBar;
