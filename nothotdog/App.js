/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  TouchableOpacity,
  Image,
  AsyncStorage,
  Dimensions
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import LottieView from 'lottie-react-native';

const fetch = require("node-fetch");
const WIDTH = Dimensions.get('window').width;

// some hardcoded calorie values for sake of demo
let foodCals = { 'hotdog': 151, 'spaghetti': 221, 'vanilla ice cream': 146 }
let foodCarbs = { 'hotdog': 2.2, 'spaghetti': 43, 'vanilla ice cream': 24 }
const dailyCals = 2800;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: 'jesting',
      results: null,
      photo: null,
      loading: false,
      history: null
    }
    //AsyncStorage.clear();

    // render previous scans which are stored in device storage
    AsyncStorage.getItem('scannedItems', (err, result) => {
      this.setState({ history: result })
    })

  }

  componentDidMount() {
    fetch(`http://localhost:8080/api/test`)
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson.express);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  doImageRec = (url) => {
    // api to process image and return it's identifiers
    fetch(`http://localhost:8080/api/imageRec?url=${url}`)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({ results: responseJson.imageRec, loading: false })
      })
      .catch((error) => {
        console.log(error);
      });
  }

  pickImage = () => {
    // use react native image picker to allow the user to select the image

    const options = {};
    ImagePicker.showImagePicker(options, (response) => {

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.uri };

        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        var imgPath = ('file://' + response.path).toString();

        const image = {
          image: response.uri.toString(),
          path: imgPath
        }
        if (image) {
          this.uploadImage(image);
          this.setState({ photo: response });
        }
      }
    });
  }

  uploadImage = (image) => {

    // upload image to firebase storage so that we have a hosted url to pass to api

    this.setState({ loading: true });
    var date = new Date();
    var name = date + 'fup';
    var imgRef = firebase.storage().ref(name);

    try {
      console.log(image.path);
      imgRef.putFile(image.path).then((file) => {
        imgRef.getDownloadURL().then((downloadURL) => {
          this.doImageRec(downloadURL);
        })
      });
    } catch {
      // something going wrong here, error being thrown but upload works fine
      console.log('error in fb upload');
    }
  }


  getTotalCals = () => {
    var totalCals = 0;
    if (this.state.history) {
      JSON.parse(this.state.history).map((food) => {
        console.log(foodCals[food]);
        totalCals= totalCals + foodCals[food]
      });
      return (
        totalCals
      )
    } 
  }




  saveScan = () => {

    // save new scan to async storage in an array

    AsyncStorage.getItem('scannedItems', (err, result) => {
      if (result) {
        var updatedResults = JSON.stringify(JSON.parse(result).concat(this.state.results.images[0].classifiers[0].classes[0].class));
        AsyncStorage.setItem('scannedItems', updatedResults, () => {
          AsyncStorage.getItem('scannedItems', (err, result1) => {
            this.setState({ history: result1 })
          })
        })
      } else {
        console.log('no result');
        AsyncStorage.setItem('scannedItems', JSON.stringify([this.state.results.images[0].classifiers[0].classes[0].class]), () => {
          AsyncStorage.getItem('scannedItems', (err, result2) => {
            this.setState({ history: result2 })
          })
        })
      }
      this.setState({ results: null, photo: null });
    });
  }

  cancelScan = () => {
    this.setState({ results: null, photo: null });
    console.log('cancelled scan');
  }

  getScanHistory = () => {

    // render view for displaying previously scanned foods

    if (this.state.history) {
      console.log(JSON.parse(this.state.history));

      return JSON.parse(this.state.history).map((food) => {
        return (
          <View style={{ backgroundColor: '#ecf0f1', marginBottom: 20, paddingBottom:20, paddingHorizontal:20, paddingTop:10, borderRadius: 15 }}>
            <View style={{borderBottomWidth:2, padding:10}}>
              
              <Text style={{ fontSize: 25, textAlign:'left' }}>{food}</Text>
              <Text style={{ fontSize: 25, textAlign:'left' }}>{this.state.results.images[0].classifiers[0].classes[1].class}</Text>
              <Text style={{ fontSize: 25, textAlign:'left' }}>{this.state.results.images[0].classifiers[0].classes[2].class}</Text>
              <Text style={{ fontSize: 25, textAlign:'left' }}>{this.state.results.images[0].classifiers[0].classes[3].class}</Text>
              <Text style={{ fontSize: 25, textAlign:'left' }}>{this.state.results.images[0].classifiers[0].classes[4].class}</Text>
              <Text style={{ fontSize: 25, textAlign:'left' }}>{this.state.results.images[0].classifiers[0].classes[5].class}</Text>
              <Text style={{ fontSize: 25, textAlign:'left' }}>{this.state.results.images[0].classifiers[0].classes[6].class}</Text>


            
            </View>
                <View style={{flexDirection: 'column', paddingTop:10, paddingLeft:30}}>
                  <View style={{flexDirection:'row'}}>
                    <Text style={{marginRight:20, fontSize:20, fontWeight:'bold', textAlign:'left'}}>Calories:</Text>
                    <Text style={{ fontSize: 20, }}>{foodCals[food]}</Text>
                  </View>

                  <View style={{flexDirection:'row'}}>
                    <Text style={{marginRight:20, fontSize:20, fontWeight:'bold', textAlign:'left'}}>Carbohydrates:</Text>
                    <Text style={{ fontSize: 20, }}>{foodCarbs[food]}</Text>
                  </View>

                  <View style={{ paddingTop:10}}>
                    <Text style={{marginRight:20, fontSize:20, textAlign:'left'}}>{Math.round((foodCals[food]/dailyCals)*100)*100/100} % of daily calorie intake</Text>
                  </View>
                </View>
            </View>
      
        )
      })
    } else {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop:30 }}>
          <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center' }}>Upload or take an image of your plate!</Text>
        </View>
      )
    }

  }

  render() {
    const { photo } = this.state;
    var scanHistory = null;

    return (
      <View style={{ flex: 1 }}>
        <LinearGradient colors={['#1289A7', '#0652DD', '#1B1464']} style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 30 }}>
            <View style={{ borderBottomWidth: 2, borderBottomColor: '#ecf0f1', paddingBottom: 10, marginBottom: 20 }}><Text style={{ fontFamily: 'Roboto', color: '#ecf0f1', fontWeight: 'bold', fontSize: 40 }}>SnackSnap</Text></View>


            {this.state.results && (
              <View>

                <View style={{ alignItems: 'center' }}><Image source={{ uri: photo.uri }} style={{ height: 300, width: 300 }} /></View>

                <View style={{ textAlign: 'left', paddingLeft: 40, paddingTop: 20 }}>
                  <Text style={{ color: '#ecf0f1', fontSize: 20 }}>Looks like: {this.state.results.images[0].classifiers[0].classes[0].class}</Text>
                  <Text style={{ color: '#ecf0f1', fontSize: 20 }}>Calories: {foodCals[this.state.results.images[0].classifiers[0].classes[0].class]}</Text>
                  <Text style={{ color: '#ecf0f1', fontSize: 20 }}>Carbohydrates: {foodCarbs[this.state.results.images[0].classifiers[0].classes[0].class]}</Text>

                </View>

                <View style={{ flexDirection: 'row', margin: 20 }}>
                  <TouchableOpacity style={{ borderRadius: 10, alignItems: 'center', flex: 1, padding: 10, backgroundColor: "#ecf0f1", marginRight: 5 }} onPress={() => this.saveScan()}>
                    <Text>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{ borderRadius: 10, alignItems: 'center', flex: 1, padding: 10, backgroundColor: "#ecf0f1" }} onPress={() => this.cancelScan()}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                </View>

              </View>
            )}

            {!this.state.results && !this.state.loading && (

              <View>
                 {this.state.history && (
                    <View style={{width:WIDTH, backgroundColor:'#ecf0f1', padding:10, marginBottom:20}}>
                      <Text style={{fontSize:17}}>Total Calories: {this.getTotalCals()}</Text>
                      <Text style={{fontSize:17}}>Daily Calories: {Math.round((this.getTotalCals() / dailyCals)*100 )*100/100}%</Text>
                    </View>
                 )}

                <ScrollView>
                  {/* <Text style={{fontSize:20, fontWeight:'bold', padding:10}}>History</Text> */}
                  {this.getScanHistory()}
                </ScrollView>
              </View>
            )}

            {this.state.loading && (
              <View style={{ flex: 1 }}>
                <LottieView source={require('./resources/animation/loading.json')} autoPlay loop />
              </View>
            )}


          </View>

          <View style={{ backgroundColor: '#ecf0f1', alignItems: 'center', padding: 5 }}>
            <TouchableOpacity style={{ borderRadius: 50, padding: 10, borderWidth: 3, borderColor: "#000" }} onPress={() => this.pickImage()}>
              <Icon name="camera" size={30} color="#000" />
            </TouchableOpacity>
          </View>

        </LinearGradient>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

