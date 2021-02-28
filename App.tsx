import React from 'react';
import { StyleSheet, View, Platform, Dimensions, SafeAreaView } from 'react-native';
import MapView, { Marker, AnimatedRegion, MarkerAnimated, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class Trackee extends React.Component {

  watchID: any = null;
  marker: any = null;
  pubnub:any=null;
  
  state = {
    latitude: LATITUDE,
    longitude: LONGITUDE,
    coordinate: new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
  };
  
  
  constructor(props: any) {
    super(props);
    // Replace "X" with your PubNub Keys
    // this.pubnub = new PubNubReact({
    //   publishKey: 'pub-c-7a90c8b2-b39b-451a-85af-6252d39cd5e1',
    //   subscribeKey: 'sub-c-85525d0e-7974-11eb-b338-de22a5d8105b',
    // });
    // this.pubnub.init(this);
  }

  componentDidMount() {
    this.watchLocation();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.state.latitude !== prevState.latitude) {
      // this.pubnub.publish({
      //   message: {
      //     latitude: this.state.latitude,
      //     longitude: this.state.longitude,
      //   },
      //   channel: 'location',
      //});
    }
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watchID);
  }

  watchLocation = () => {
    const { coordinate } = this.state;

    this.watchID = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;

        const newCoordinate = {
          latitude,
          longitude,
        };

        if (Platform.OS === 'android') {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(newCoordinate, 500); // 500 is the duration to animate the marker
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude,
          longitude,
        });
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 30,
      }
    );
  };

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <MapView style={styles.map} showsUserLocation followsUserLocation loadingEnabled region={this.getMapRegion()} provider={PROVIDER_GOOGLE}>
            <MarkerAnimated
              ref={(marker: any) => {
                this.marker = marker;
              }}
              coordinate={this.state.coordinate}
            />
          </MapView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
