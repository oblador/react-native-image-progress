import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Image from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

const INDICATORS = [undefined, Progress.Bar, Progress.Circle, Progress.Pie];

const IMAGES = [
  'https://www.savethecat.com/wp-content/uploads/2015/06/cats.jpg',
  'https://media4.popsugar-assets.com/files/2014/08/08/878/n/1922507/caef16ec354ca23b_thumb_temp_cover_file32304521407524949.xxxlarge/i/Funny-Cat-GIFs.jpg',
  'https://i.pinimg.com/originals/37/80/b2/3780b2af22c86e0b93a6c7cc6b74b191.gif',
  'https://c.tenor.com/RH9jOdC3R80AAAAd/cat-bop.gif',
  'https://c.tenor.com/TMFZeFRR-eQAAAAd/vibing-cat.gif',
  'https://i.imgur.com/zKBzrDn.gif',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  image: {
    width: 300,
    height: 200,
  },
});

const pseudoRandom = () => 0.5 - Math.random();

const getRandomIndicator = () => INDICATORS.slice(0).sort(pseudoRandom)[0];

const getRandomImage = (excludeUri?: string) => {
  const imageUrl = IMAGES.filter(
    (uri) => !excludeUri || excludeUri.indexOf(uri) !== 0,
  ).sort(pseudoRandom)[0];
  return `${imageUrl}?rand=${Date.now()}`;
};

const getRandomState = (excludeUri?: string) => ({
  imageUri: getRandomImage(excludeUri),
  indicator: getRandomIndicator(),
});

const App = () => {
  const [state, setState] = React.useState(getRandomState());
  const randomize = React.useCallback(
    () => setState(getRandomState(state.imageUri)),
    [state],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={randomize}>
        <Image
          key={state.imageUri}
          source={{ uri: state.imageUri }}
          indicator={state.indicator}
          style={styles.image}
          onLoadEnd={() => console.log('Image was loaded!')}
        />
      </TouchableOpacity>
    </View>
  );
};

export default App;
