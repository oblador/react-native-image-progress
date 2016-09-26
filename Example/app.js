import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Image from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

const INDICATORS = [null, Progress.Bar, Progress.Circle, Progress.Pie];

const IMAGES = [
  'http://www.savethecat.com/wp-content/uploads/2015/06/cats.jpg',
  'http://i.ytimg.com/vi/tntOCGkgt98/maxresdefault.jpg',
  'http://media4.popsugar-assets.com/files/2014/08/08/878/n/1922507/caef16ec354ca23b_thumb_temp_cover_file32304521407524949.xxxlarge/i/Funny-Cat-GIFs.jpg',
  'http://media1.santabanta.com/full1/Animals/Cats/cats-87a.jpg',
  'http://awesomegifs.com/wp-content/uploads/cat-smacks-at-hands.gif',
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

export default class Example extends Component {
  constructor(props) {
    super(props);
    this.state = this.getRandomState();
  }

  getRandomState() {
    return {
      imageUri: this.getRandomImage(),
      indicator: this.getRandomIndicator(),
    };
  }

  getRandomIndicator() {
    return INDICATORS.slice(0).sort( () => { return 0.5 - Math.random(); } )[0];
  }

  getRandomImage() {
    let images = IMAGES.slice(0);

    // Filter out the current one since we don't want to see that one again
    if (this.state && typeof this.state.image === 'object') {
      images = images.filter((uri) => this.state.imageUri.indexOf(uri) !== 0 );
    }
    return images.sort( () => { return 0.5 - Math.random(); } )[0] + '?rand=' + Date.now();
  }

  randomize = () => {
    this.setState(this.getRandomState());
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.randomize}>
          <Image
            key={this.state.imageUri}
            source={{ uri: this.state.imageUri }}
            indicator={this.state.indicator}
            style={styles.image}
            onLoaded={() => console.log('Image was loaded!')}
          />
        </TouchableOpacity>
      </View>
    );
  }
}
