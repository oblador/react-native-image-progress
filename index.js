import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const DefaultIndicator = ActivityIndicator;

const getSourceKey = source => (source && source.uri) || String(source);

export const createImageProgress = ImageComponent =>
  class ImageProgress extends Component {
    static propTypes = {
      children: PropTypes.node,
      errorContainerStyle: PropTypes.any,
      indicator: PropTypes.func,
      indicatorContainerStyle: PropTypes.any,
      indicatorProps: PropTypes.object,
      renderIndicator: PropTypes.func,
      renderError: PropTypes.func,
      source: PropTypes.any,
      style: PropTypes.any,
      imageStyle: PropTypes.object,
      threshold: PropTypes.number,
    };

    static defaultProps = {
      indicatorContainerStyle: styles.centered,
      errorContainerStyle: styles.centered,
      threshold: 50,
    };

    static prefetch = Image.prefetch;
    static getSize = Image.getSize;

    static getDerivedStateFromProps(props, state) {
      const sourceKey = getSourceKey(props.source);
      if (sourceKey !== state.sourceKey) {
        return {
          sourceKey,
          error: null,
          loading: false,
          progress: 0,
        };
      }
      return null;
    }

    constructor(props) {
      super(props);

      this.state = {
        sourceKey: getSourceKey(props.source),
        error: null,
        loading: false,
        progress: 0,
        thresholdReached: !props.threshold,
      };
    }

    componentDidMount() {
      if (this.props.threshold) {
        this.thresholdTimer = setTimeout(() => {
          this.setState({ thresholdReached: true });
          this.thresholdTimer = null;
        }, this.props.threshold);
      }
    }

    componentWillUnmount() {
      if (this.thresholdTimer) {
        clearTimeout(this.thresholdTimer);
      }
    }

    setNativeProps(nativeProps) {
      if (this.ref) {
        this.ref.setNativeProps(nativeProps);
      }
    }

    measure(cb) {
      if (this.ref) {
        this.ref.measure(cb);
      }
    }

    ref = null;
    handleRef = ref => {
      this.ref = ref;
    };

    bubbleEvent(propertyName, event) {
      if (typeof this.props[propertyName] === 'function') {
        this.props[propertyName](event);
      }
    }

    handleLoadStart = () => {
      if (!this.state.loading && this.state.progress !== 1) {
        this.setState({
          error: null,
          loading: true,
          progress: 0,
        });
      }
      this.bubbleEvent('onLoadStart');
    };

    handleProgress = event => {
      const progress = event.nativeEvent.loaded / event.nativeEvent.total;
      // RN is a bit buggy with these events, sometimes a loaded event and then a few
      // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
      // actually means the image is no longer loading
      if (progress !== this.state.progress && this.state.progress !== 1) {
        this.setState({
          loading: progress < 1,
          progress,
        });
      }
      this.bubbleEvent('onProgress', event);
    };

    handleError = event => {
      this.setState({
        loading: false,
        error: event.nativeEvent,
      });
      this.bubbleEvent('onError', event);
    };

    handleLoad = event => {
      if (this.state.progress !== 1) {
        this.setState({
          error: null,
          loading: false,
          progress: 1,
        });
      }
      this.bubbleEvent('onLoad', event);
    };

    handleLoadEnd = event => {
      this.setState({
        loading: false,
        progress: 1,
      });
      this.bubbleEvent('onLoadEnd', event);
    };

    render() {
      const {
        children,
        errorContainerStyle,
        indicator,
        indicatorContainerStyle,
        indicatorProps,
        renderError,
        renderIndicator,
        source,
        style,
        threshold,
        imageStyle,
        ...props
      } = this.props;

      if (!source || !source.uri) {
        // This is not a networked asset so fallback to regular image
        return (
          <View style={style} ref={this.handleRef}>
            <ImageComponent
              {...props}
              source={source}
              style={[StyleSheet.absoluteFill, imageStyle]}
            />
            {children}
          </View>
        );
      }
      const {
        progress,
        sourceKey,
        thresholdReached,
        loading,
        error,
      } = this.state;

      let indicatorElement;

      if (error) {
        if (renderError) {
          indicatorElement = (
            <View style={errorContainerStyle}>{renderError(error)}</View>
          );
        }
      } else if ((loading || progress < 1) && thresholdReached) {
        if (renderIndicator) {
          indicatorElement = renderIndicator(progress, !loading || !progress);
        } else {
          const IndicatorComponent =
            typeof indicator === 'function' ? indicator : DefaultIndicator;
          indicatorElement = (
            <IndicatorComponent
              progress={progress}
              indeterminate={!loading || !progress}
              {...indicatorProps}
            />
          );
        }
        indicatorElement = (
          <View style={indicatorContainerStyle}>{indicatorElement}</View>
        );
      }

      return (
        <View style={style} ref={this.handleRef}>
          <ImageComponent
            {...props}
            key={sourceKey}
            onLoadStart={this.handleLoadStart}
            onProgress={this.handleProgress}
            onError={this.handleError}
            onLoad={this.handleLoad}
            onLoadEnd={this.handleLoadEnd}
            source={source}
            style={[StyleSheet.absoluteFill, imageStyle]}
          />
          {indicatorElement}
          {children}
        </View>
      );
    }
  };

export default createImageProgress(Image);
