import React, { useState, useEffect, useRef } from 'react';
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

export const createImageProgress = ImageComponent => {
  const ReactNativeImageProgress = props => {
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
      ...rest
    } = props;

    const [sourceKey, setSourceKey] = useState(getSourceKey(source));
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [thresholdReached, setThresholdReached] = useState(!threshold);
    const ref = useRef(null);

    useEffect(
      () => {
        setSourceKey(getSourceKey(source));
        setError(null);
        setLoading(false);
        setProgress(0);
      },
      [source],
    );

    useEffect(
      () => {
        let thresholdTimer;
        thresholdTimer = setTimeout(() => {
          setThresholdReached(true);
          thresholdTimer = null;
        }, threshold);

        return () => {
          if (thresholdTimer) {
            clearTimeout(thresholdTimer);
          }
        };
      },
      [threshold],
    );

    // eslint-disable-next-line no-unused-vars
    const setNativeProps = nativeProps => {
      if (ref && ref.current) {
        ref.current.setNativeProps(nativeProps);
      }
    };

    // eslint-disable-next-line no-unused-vars
    const measure = cb => {
      if (ref && ref.current) {
        ref.current.measure(cb);
      }
    };

    const bubbleEvent = (propertyName, event) => {
      if (typeof props[propertyName] === 'function') {
        props[propertyName](event);
      }
    };

    const handleLoadStart = () => {
      if (!loading && progress !== 1) {
        setError(null);
        setLoading(true);
        setProgress(0);
      }
      bubbleEvent('onLoadStart');
    };

    const handleProgress = event => {
      const progressProp = event.nativeEvent.loaded / event.nativeEvent.total;
      // RN is a bit buggy with these events, sometimes a loaded event and then a few
      // 100% progress – sometimes in an infinite loop. So we just assume 100% progress
      // actually means the image is no longer loading
      if (progressProp !== progress && progress !== 1) {
        setLoading(progressProp < 1);
        setProgress(progressProp);
      }
      bubbleEvent('onProgress', event);
    };

    const handleError = event => {
      setLoading(false);
      setError(event.nativeEvent);
      bubbleEvent('onError', event);
    };

    const handleLoad = event => {
      if (progress !== 1) {
        setError(null);
        setLoading(false);
        setProgress(1);
      }
      bubbleEvent('onLoad', event);
    };

    const handleLoadEnd = event => {
      setLoading(false);
      setProgress(1);
      bubbleEvent('onLoadEnd', event);
    };

    if (!source || !source.uri) {
      // This is not a networked asset so fallback to regular image
      return (
        <View style={style} ref={ref}>
          <ImageComponent
            {...rest}
            source={source}
            style={[StyleSheet.absoluteFill, imageStyle]}
          />
          {children}
        </View>
      );
    }

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
      <View style={style} ref={ref}>
        <ImageComponent
          {...rest}
          key={sourceKey}
          onLoadStart={handleLoadStart}
          onProgress={handleProgress}
          onError={handleError}
          onLoad={handleLoad}
          onLoadEnd={handleLoadEnd}
          source={source}
          style={[StyleSheet.absoluteFill, imageStyle]}
        />
        {indicatorElement}
        {children}
      </View>
    );
  };

  ReactNativeImageProgress.propTypes = {
    children: PropTypes.node,
    errorContainerStyle: PropTypes.any,
    indicator: PropTypes.func,
    indicatorContainerStyle: PropTypes.any,
    indicatorProps: PropTypes.object,
    renderIndicator: PropTypes.func,
    renderError: PropTypes.func,
    source: PropTypes.any,
    style: PropTypes.any,
    imageStyle: PropTypes.any,
    threshold: PropTypes.number,
  };

  ReactNativeImageProgress.defaultProps = {
    indicatorContainerStyle: styles.centered,
    errorContainerStyle: styles.centered,
    threshold: 50,
  };

  ReactNativeImageProgress.prefetch = Image.prefetch;
  ReactNativeImageProgress.getSize = Image.getSize;

  return ReactNativeImageProgress;
};

export default createImageProgress(Image);
