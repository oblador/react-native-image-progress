import type React from 'react';
import type { ImageProps, StyleProp } from 'react-native';

declare module 'react-native-image-progress' {
  type ImageProgressComponent<P = {}> = React.ComponentType<
    P & {
      errorContainerStyle?: StyleProp<any>;
      indicator?: React.ComponentType;
      indicatorContainerStyle?: StyleProp<any>;
      indicatorProps?: any;
      renderIndicator?: (
        progress: number,
        indeterminate: boolean,
      ) => React.ReactElement;
      renderError?: (error: Error) => React.ReactElement;
      style?: StyleProp<any>;
      imageStyle?: StyleProp<any>;
      threshold?: number;
    }
  >;

  export function createImageProgress<P = {}>(
    ImageComponent: React.ComponentType<P>,
  ): ImageProgressComponent<P>;

  const ImageProgress: ImageProgressComponent<ImageProps>;

  export default ImageProgress;
}
