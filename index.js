import React, { Component, PropTypes } from 'react'

import {
  ActivityIndicator,
  View,
  Image,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native'

const styles = StyleSheet.create({
  progressContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
})

const DefaultIndicator = ActivityIndicator

class ImageProgress extends Component {
  static propTypes = {
    indicator: PropTypes.func,
    indicatorProps: PropTypes.object,
    renderIndicator: PropTypes.func,
    threshold: PropTypes.number,
    animation: PropTypes.object,
    animationDuration: PropTypes.number,
    animationEasing: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  }

  static defaultProps = {
    threshold: 50,
    animationDuration: 300,
    animationEasing: Easing.out(Easing.ease),
  }

  animationValue = new Animated.Value(0)

  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      progress: 0,
      thresholdReached: !props.threshold,
    }
  }

  componentDidMount() {
    if (this.props.threshold) {
      this._thresholdTimer = setTimeout(() => {
        this.setState({ thresholdReached: true })
        this._thresholdTimer = null
      }, this.props.threshold)
    }
  }

  componentWillUnmount() {
    if (this._thresholdTimer) {
      clearTimeout(this._thresholdTimer)
    }
  }

  componentWillReceiveProps(props) {
    if (
      !this.props.source ||
      !props.source ||
      this.props.source.uri !== props.source.uri
    ) {
      this.setState({
        loading: false,
        progress: 0,
      })
    }
  }

  ref = null
  handleRef = ref => {
    this.ref = ref
  }

  setNativeProps(nativeProps) {
    if (this.ref) {
      this.ref.setNativeProps(nativeProps)
    }
  }

  bubbleEvent(propertyName, event) {
    if (typeof this.props[propertyName] === 'function') {
      this.props[propertyName](event)
    }
  }

  interpolateStyle(animationStyle) {
    if (
      Object.prototype.toString.call(animationStyle) === '[object Object]' &&
      'from' in animationStyle &&
      'to' in animationStyle
    ) {
      return this.animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [animationStyle.from, animationStyle.to],
      })
    }
    return undefined
  }

  animateIn() {
    return Animated.timing(this.animationValue, {
      toValue: 1,
      duration: this.props.animationDuration,
      easing: this.props.animationEasing,
    }).start()
  }

  handleLoadStart = () => {
    if (!this.state.loading && this.state.progress !== 1) {
      this.setState({
        loading: true,
        progress: 0,
      })
      if (this.props.animation) {
        this.animationValue.setValue(0)
      }
    }
    this.bubbleEvent('onLoadStart')
  }

  handleProgress = event => {
    const progress = event.nativeEvent.loaded / event.nativeEvent.total
    // RN is a bit buggy with these events, sometimes a loaded event and then a few
    // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
    // actually means the image is no longer loading
    if (progress !== this.state.progress && this.state.progress !== 1) {
      this.setState({
        loading: progress < 1,
        progress: progress,
      })
    }
    this.bubbleEvent('onProgress', event)
  }

  handleError = event => {
    this.setState({
      loading: false,
    })
    this.bubbleEvent('onError', event)
  }

  handleLoad = event => {
    if (this.state.progress !== 1) {
      this.setState({
        loading: false,
        progress: 1,
      })
    }
    if (this.props.animation) {
      this.animateIn()
    }
    this.bubbleEvent('onLoad', event)
  }

  render() {
    const {
      indicator,
      indicatorProps,
      renderIndicator,
      source,
      threshold,
      animation,
      children,
      ...props
    } = this.props
    const { progress, thresholdReached, loading } = this.state

    let progressIndicator = null

    const passedStyle = StyleSheet.flatten(this.props.style)
    let imageStyle = null
    let containerStyle = null
    if (passedStyle) {
      ;(({
        resizeMode,
        tintColor,
        overlayColor,
        borderRadius,
        ...otherStyles
      }) => {
        imageStyle = {
          resizeMode,
          tintColor,
          overlayColor,
          borderRadius,
        }
        containerStyle = { borderRadius, ...otherStyles }
      })(passedStyle)
    }

    if ((loading || progress < 1) && thresholdReached) {
      if (renderIndicator) {
        progressIndicator = renderIndicator(progress, !loading || !progress)
      } else {
        const IndicatorComponent =
          typeof indicator === 'function' ? indicator : DefaultIndicator
        progressIndicator = (
          <IndicatorComponent
            progress={progress}
            indeterminate={!loading || !progress}
            {...indicatorProps}
          />
        )
      }
    }

    let animationStyle = null
    if (animation && typeof animation === 'object') {
      animationStyle = {}
      for (key in animation) {
        if (
          Object.prototype.toString.call(animation[key]) === '[object Array]'
        ) {
          let arrayStyle = []
          for (let i = 0; i < animation[key].length; i++) {
            for (nestedKey in animation[key][i]) {
              let interpolatedStyle = this.interpolateStyle(
                animation[key][i][nestedKey]
              )
              if (interpolatedStyle)
                arrayStyle.push({ [nestedKey]: interpolatedStyle })
            }
          }
          animationStyle[key] = arrayStyle
        } else {
          animationStyle[key] = this.interpolateStyle(animation[key])
        }
      }
    }

    return (
      <View style={containerStyle}>
        <Animated.Image
          {...props}
          key={source ? source.uri || source : undefined}
          onLoadStart={this.handleLoadStart}
          onProgress={this.handleProgress}
          onError={this.handleError}
          onLoad={this.handleLoad}
          ref={this.handleRef}
          source={source}
          style={[styles.image, imageStyle, animationStyle]}
        />
        {children}
        <View style={styles.progressContainer} pointerEvents="none">
          {progressIndicator}
        </View>
      </View>
    )
  }
}

module.exports = ImageProgress
