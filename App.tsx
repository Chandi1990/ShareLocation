import React from 'react';
import { StyleSheet, View, Platform, Dimensions, SafeAreaView, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, AnimatedRegion, MarkerAnimated, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const firebaseConfig = {
  apiKey: "AIzaSyAQp40FcHWzUoojgd9ZPpkIjj5nMwSwjd8",
  authDomain: "livelocation-1a3b6.firebaseapp.com",
  databaseURL: "https://livelocation-1a3b6-default-rtdb.firebaseio.com",
  projectId: "livelocation-1a3b6",
  storageBucket: "livelocation-1a3b6.appspot.com",
  messagingSenderId: "430825290866",
  appId: "1:430825290866:web:5abb21d38d585a982016eb",
  measurementId: "G-GJN1X70ZF9"
};

if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

const driverCollection = firestore().collection('Driver');

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

  addDriver = (latitude:number,longitude:number) => {
    driverCollection.add({latlng:{latitude,longitude}});
    Alert.alert('--- Driver added ---');
  }

  setDriver = (driverid:string, latitude: number, longitude: number) => {
    driverCollection.doc(driverid).set({latnlg:{latitude,longitude}});
    Alert.alert('--- Driver set success ---');
  }

  updateDriver = (driverid:string, latitude: number, longitude: number) => {
    driverCollection.doc(driverid).update({latnlg:{latitude,longitude}});
    Alert.alert('--- Driver set success ---');
  }

  deleteDriver = (driverid:string) => {
    driverCollection.doc(driverid).delete().then(()=>{Alert.alert('--- Driver set success ---')}).catch((err)=>{Alert.alert(err)});
  }



  componentDidMount() {
    this.watchLocation();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.state.latitude !== prevState.latitude) {
      this.addDriver(this.state.latitude,this.state.longitude)
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
        distanceFilter: 2,
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
          {/* <TouchableOpacity style={{position:'absolute', top:height*7/10, backgroundColor:'#3e8f', height:height/15, width:width/2, marginBottom:20, padding:10}} onPress={()=>this.setDriver('pasindu1003',this.state.latitude,this.state.longitude)} ><Text>Set</Text></TouchableOpacity>
          <TouchableOpacity style={{position:'absolute', top:height*8/10, backgroundColor:'#3e8f', height:height/15, width:width/2, marginBottom:20, padding:10}} onPress={()=>this.updateDriver('pasindu1003',this.state.latitude,this.state.longitude)} ><Text>Update</Text></TouchableOpacity>
          <TouchableOpacity style={{position:'absolute', top:height*9/10, backgroundColor:'#3e8f', height:height/15, width:width/2, marginBottom:20, padding:10}} onPress={()=>this.deleteDriver('pasindu1003')} ><Text>Delete</Text></TouchableOpacity> */}
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
