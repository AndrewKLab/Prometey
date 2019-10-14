import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    TouchableHighlight,
    Linking,
    TextInput,
    ScrollView,
    StyleSheet,
    Image,
    Dimensions,
    Alert,
    FlatList,
    ActivityIndicator,

} from 'react-native';
import { Appbar, Provider as PaperProvider, DefaultTheme, Avatar, Card, Title, Paragraph, IconButton, Button} from 'react-native-paper';
import NfcManager, {Ndef} from 'react-native-nfc-manager';
import axios from 'axios';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, HeaderBackButton } from 'react-navigation';
import Moment from 'moment';
import {Overlay} from 'react-native-elements';
import RBSheet from "react-native-raw-bottom-sheet";
import { openDatabase } from 'react-native-sqlite-storage';

const db = openDatabase({ name: 'db.db' });

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const nfcImage = require('./assets/shild.png');
const nfcButt = require('./assets/ic_launcher.png');

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#e90052',
    accent: '#f1c40f',
  }
};

class Loading extends Component {

  static navigationOptions = ({navigation}) => {
    return{
      header: null,
   }
  }

  constructor(props) {
      super(props);

      this.state = {
        user_data: [],
      }
  }

componentWillMount() {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists user (id integer primary key not null, access_token text)'
      );
      tx.executeSql(
        'select access_token from user',
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }

          this.setState({
            user_data: temp,
          });
          console.log((this.state.user_data.map((item, key) => (item.access_token))).toString());
          if((this.state.user_data.map((item, key) => (item.access_token))).toString() == "sucess"){
            console.log("1");
            this.props.navigation.navigate('Home')
          } else {
            console.log("2");
          this.props.navigation.navigate('Login')
          }
        },
      );
  },
  error => console.log('something went wrong:' + error),
  () => console.log('table user create')
);


}



    render() {


        return (
            <View></View>
            )
    }
}

class Login extends Component {

  static navigationOptions = ({navigation}) => {
    return{
      header: null,
   }
  }

  constructor(props) {
      super(props);

      this.state = {
        username: '',
        password: '',
        err: '',
        user_data: [],
      }
  }

componentDidMount() {

}

  _Login = () => {

    if (this.state.username == 'alxystv@yandex.ru' && this.state.password == 'password' ){
      db.transaction(tx => {
        tx.executeSql(
  'insert or IGNORE into user (id, access_token) values (?, ?)', [1, 'sucess']
);
      tx.executeSql(
        'select * from user',
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }

          this.setState({
            user_data: temp,
          });
          console.log(JSON.stringify(this.state.user_data));

        },
      );
    })
        this.props.navigation.navigate('Home')
      } else {
        this.setState({ err: 'Неверно введен логин или пароль.' })
      }

    axios.post('http://api.прометей24.рф/api/login/', {
      username: this.state.username,
      password: this.state.password,

    })

    .then(function (response) {
      const token = response.data.access_token;


        })
    .catch(function (error) {
      //console.log(error);
    })

  }

    render() {


        return (
            <View style={{padding: 20, backgroundColor: '#fff', flex: 1, justifyContent: 'center'}}>
                <Image
                source={require('./assets/logo_login.png')}
                style={{
                    width: windowWidth * 1,
                    height: windowHeight * 0.125,
                    marginBottom: 20,
                    alignSelf: 'center'
                      }}
                />

                <TextInput style={{
                color: '#212529',
                marginBottom: 10,
                height: 40,
                borderBottomColor: '#212529',
                borderBottomWidth: 0.5}}
                placeholder='   Логин'
                placeholderTextColor = "#212529"
                value={this.state.username}
                onChangeText={username => this.setState({ username })}  />
                <TextInput style={{
                height: 40,
                color: '#212529',
                borderBottomColor: '#212529',
                borderBottomWidth: 0.5}}
                placeholder='   Пароль'
                placeholderTextColor = "#212529"
                value={this.state.password}
                onChangeText={password => this.setState({ password })}
                secureTextEntry = {true}  />
                <View style={{margin:5}} />
                <Text style={{color: '#212529'}}>{this.state.err}</Text>
                <View style={{margin:5}} />
                      <Button
                       theme={theme}
                       mode="contained"
                       onPress={this._Login.bind()}
                       color='#e90052'>
                          <Text>Войти</Text>
                      </Button>
                  </View>
            )
    }
}


class HomeScreen extends React.Component {


  static navigationOptions = ({navigation}) => {
    return{
      header: null,
   }
  }

  constructor(props) {
      super(props);
      this.state = {
          supported: true,
          enabled: false,
          id: null,
          tag: {},
          dataDevice: [],
          isVisible: false,
          user_data:[]

      }
  }

  componentDidMount() {
      NfcManager.isSupported()
          .then(supported => {
              this.setState({ supported });
              if (supported) {
                  this._startNfc();
              }
          })
  }

  componentWillUnmount() {
      if (this._stateChangedSubscription) {
          this._stateChangedSubscription.remove();
      }
  }

  render() {
      let { supported, enabled, tag, id, rtdType,} = this.state;
      const isNFCsup = `${
          supported === true ? 'ДА' : 'НЕТ'
      }`;
      const isNFC = `${
          enabled === true ? 'ВКЛЮЧЕН' : 'ОТКЛЮЧЕН'
      }`;

      const NFCcolor = `${
          enabled === true ? 'red' : 'green'
      }`;


      return (

                    <ScrollView style={{backgroundColor: '#f7f7f7'}}>
                    <View style={{ flexDirection: 'row'}}>
                    <Button
                     theme={theme}
                     mode="text"
                     onPress={() => this.goToLogin()}
                     color='#e90052'>
                        <Text>Выйти</Text>
                    </Button>
                    </View>
                    <View style={{justifyContent: 'center', }}>
                    <Card style={{marginBottom: -4}}>
                    <View style={{justifyContent: 'center', alignItems: 'center',}}>
                    <View style={{ height: 50, width: '90%',  borderBottomWidth: 0.5, borderBottomColor: 'lightgray', alignContent: 'center', justifyContent: 'center',}}>
                    <View style={{flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', }}>
                    <Text style={{fontSize: 14, color: '#000',}}>Поддерживает ли устройство NFC: </Text>
                    <Text style={ supported ? styles.isEn : styles.isntEn  }>{isNFCsup}</Text>
                    </View>
                    </View>
                    <View style={{ height: 50, width: '90%', alignContent: 'center', justifyContent: 'center',}}>
                    <View style={{flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', }}>
                    <Text style={{fontSize: 14, color: '#000',}}>NFC: </Text>
                    <Text style={ enabled ? styles.isEn : styles.isntEn  }>{isNFC}</Text>
                    </View>
                    </View>
                    </View>
                    </Card>
                    <View style={{ flexDirection: 'row-reverse'}}>
                    <Card style={{
                      height: 50,
                       width: 50,
                      justifyContent: 'center',
                        alignContent: 'center',}}>
                    <IconButton
                            icon="settings"
                            color='#e90052'
                            size={22}
                            onPress={() => this._goToNfcSetting()}
                          />
                    </Card>
                    </View>
                    <View style={{justifyContent: 'center', alignItems: 'center', marginTop: -20}}>
                    <TouchableOpacity style={{height: 400, width: 400, borderRadius: 150, backgroundColor: '#f7f7f7', alignContent: 'center', justifyContent: 'center', }}
                    onPress={()=>{
                      this._startDetection();
                      this.RBSheet.open();
                    }}>
                      <View style={{alignContent: 'center', justifyContent: 'center', alignItems: 'center', marginTop: 10, }}>
                      <Image
                              source={nfcButt}
                              style={{
                                  width: windowWidth * 0.9,
                                  height: windowHeight * 0.5,

                                    }}
                            />
                        </View>
                    </TouchableOpacity>
                    </View>

                    <RBSheet
                      ref={ref => {
                        this.RBSheet = ref;
                      }}
                      height={300}
                      duration={250}
                      customStyles={{
                        container: {
                          justifyContent: "center",
                          alignItems: "center"
                        }
                      }}
                    >
                    <View  style={{alignContent: 'center', justifyContent: 'center', alignItems: 'center',}}>
                      <Text style={{fontSize: 18, color: '#8d8d8d', textAlign: 'center', fontWeight: 'bold',}}>Готово к сканированию</Text>
                      <Image
                              source={nfcImage}
                              style={{
                                  width: windowWidth * 0.4,
                                  height: windowHeight * 0.2,

                                    }}
                            />
                      <Text style={{fontSize: 16, color: '#010103', textAlign: 'center', marginTop: 10,}}>Поднесите устройство{"\n"}
                       к NFC метке</Text>
                       </View>
                       <View style={{width: '90%'}}>
                       <Button style={{marginTop: 10, fontSize: 16,}} theme={theme} mode="contained" onPress={() => {this.RBSheet.close(); this._stopDetection();} }>
                           <Text>Отменить</Text>
                       </Button>
                    </View>
                    </RBSheet>

                  </View>
                </ScrollView>

      )
  }

  goToLogin(){
    db.transaction(tx => {
      tx.executeSql(
'UPDATE user SET access_token = "null" WHERE access_token = "sucess"'
);
tx.executeSql(
  'select access_token from user',
  [],
  (tx, results) => {
    var temp = [];
    for (let i = 0; i < results.rows.length; ++i) {
      temp.push(results.rows.item(i));
    }

    this.setState({
      user_data: temp,
    });
    console.log((this.state.user_data.map((item, key) => (item.access_token))).toString());
    if((this.state.user_data.map((item, key) => (item.access_token))).toString() == "null"){
      console.log("1");
      this.props.navigation.navigate('Login')
    } else {
      console.log("2");
    this.props.navigation.navigate('Home')
    }
  },
);
  })
  }

  _startNfc() {
      NfcManager.start({
          onSessionClosedIOS: () => {
              console.log('ios session closed');
          }
      })
          .then(result => {
              console.log('start OK', result);
          })
          .catch(error => {
              console.warn('start fail', error);
              this.setState({supported: false});
          })

      if (Platform.OS === 'android') {
          NfcManager.getLaunchTagEvent()
              .then(tag => {
                  console.log('launch tag', tag);
                  if (tag) {
                      this.setState({ tag });
                  }
              })
              .catch(err => {
                  console.log(err);
              })
          NfcManager.isEnabled()
              .then(enabled => {
                  this.setState({ enabled });
              })
              .catch(err => {
                  console.log(err);
              })
          NfcManager.onStateChanged(
              event => {
                  if (event.state === 'on') {
                      this.setState({enabled: true});
                  } else if (event.state === 'off') {
                      this.setState({enabled: false});
                  } else if (event.state === 'turning_on') {
                      // do whatever you want
                  } else if (event.state === 'turning_off') {
                      // do whatever you want
                  }
              }
          )
              .then(sub => {
                  this._stateChangedSubscription = sub;
                  // remember to call this._stateChangedSubscription.remove()
                  // when you don't want to listen to this anymore
              })
              .catch(err => {
                  console.warn(err);
              })
      }
  }

  _gotoDetails=() => {this.props.navigation.navigate('Details', {id: this.state.id})}

  _onTagDiscovered = tag => {
      console.log('Tag Discovered', tag);
      this.setState({ tag });

      let url = this._parseUri(tag);
      if (url) {
          Linking.openURL(url)
              .catch(err => {
                  console.warn(err);
              })
      }

      let text = this._parseText(tag);
      this.setState({id: text,});
      this.RBSheet.close();
      this._gotoDetails();
  }

  _startDetection = () => {
      NfcManager.registerTagEvent(this._onTagDiscovered)
          .then(result => {
              console.log('registerTagEvent OK', result)
          })
          .catch(error => {
              console.warn('registerTagEvent fail', error)
          })
  }

  _stopDetection = () => {
      NfcManager.unregisterTagEvent()
          .then(result => {
              console.log('unregisterTagEvent OK', result)
          })
          .catch(error => {
              console.warn('unregisterTagEvent fail', error)
          })
  }


  _clearMessages = () => {
      this.setState({id: null});

  }

  _goToNfcSetting = () => {
      if (Platform.OS === 'android') {
          NfcManager.goToNfcSetting()
              .then(result => {
                  console.log('goToNfcSetting OK', result)
              })
              .catch(error => {
                  console.warn('goToNfcSetting fail', error)
              })
      }
  }

  _parseUri = (tag) => {
      try {
          if (Ndef.isType(tag.ndefMessage[0], Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
              return Ndef.uri.decodePayload(tag.ndefMessage[0].payload);
          }
      } catch (e) {
          console.log(e);
      }
      return null;
  }

  _parseText = (tag) => {
      try {
          if (Ndef.isType(tag.ndefMessage[0], Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
              return Ndef.text.decodePayload(tag.ndefMessage[0].payload);
          }
      } catch (e) {
          console.log(e);
      }
      return null;
  }

}

class DetailsScreen extends React.Component {

  constructor(props) {
      super(props);

      this.state = {
          dataDevice: [],
          loading: false,
          updatedDate: '',


          loadButt: false,
          buttType: false,
          buttTitle: false,
          buttDis: false,

          dateVal: false,
      }
  }

  componentDidMount() {
      this._stopDetection();
      this._GetData();
  }

  _GetData(){ this.setState({loading: true});
    axios.get('http://api.прометей24.рф/api/getItem/' + this.props.navigation.state.params.id)

      .then(function (response) {
       //console.log(response.data)
       this.setState({ dataDevice: [response.data], loading: false});
       console.log([this.state.dataDevice]);
      }.bind(this))
      .catch(function (error) {
        console.log(error);
      })

  }

  _RefData(){
    axios.get('http://api.прометей24.рф/api/getItem/' + this.props.navigation.state.params.id)

      .then(function (response) {
       //console.log(response.data)
       this.setState({ dataDevice: [response.data],});
       console.log([this.state.dataDevice]);
      }.bind(this))
      .catch(function (error) {
        console.log(error);
      })

  }

  _SendData(){

    axios.post('http://api.прометей24.рф/api/serviceItem/' + this.props.navigation.state.params.id)
    .then(function (response) {

      this.setState({ dataDevice: [response.data]});
      console.log([this.state.dataDevice]);
    })
    .catch(function (error) {
      console.log(error);
    })
      this._RefData();
  }

  _stopDetection = () => {
      NfcManager.unregisterTagEvent()
          .then(result => {
              console.log('unregisterTagEvent OK', result)
          })
          .catch(error => {
              console.warn('unregisterTagEvent fail', error)
          })
  }


  static navigationOptions = ({navigation}) => {
    return{
      headerLeft:(<HeaderBackButton tintColor={'white'} onPress={()=>{navigation.navigate('Home')}}/>),
   }
  }
  render() {

    const buttType = `${
        this.state.buttType === true ? 'contained' : 'outlined'
    }`;

    const buttTitle = `${
        this.state.buttTitle === true ? 'Обслуженно' : 'Обслужить'
    }`;



    if (this.state.loading) {return (
    <View style={styles.loader}>
     <ActivityIndicator size="large" color="purple" />
    </View>
    );
  }
    return (
      <ScrollView >
      <View style={{flex: 1, justifyContent: 'center', margin: 10, }}>
      <Card>
        <Card.Content>
        <View>
        {
          this.state.dataDevice.map((item, key) => (


        <View>
              <Title>{item.title} </Title>
              <Text style={styles.listItem} >UUID: {item.uuid} </Text>
              <Text  style={styles.listItem} >Местоположение: {item.city.city}, {item.building.title}</Text>
        </View>
          ))
        }
        </View>
        </Card.Content>
        <Card.Actions style={{justifyContent: 'center', marginVertical: 10 }}>
          <Button loading={this.state.loadButt} mode={buttType} disabled={this.state.buttDis} color='green' style={{width: '100%'}}
          onPress={()=>{this.setState({
             buttDis: true,
             buttTitle: true,
             buttType: true,
            });
             this._SendData();}}>{buttTitle}</Button>
        </Card.Actions>
      </Card>
      </View>
      <View style={{marginVertical: 10,}}>
      {
        this.state.dataDevice.map((item, key) => (


      <View>
            {
                item.service.map((item, key) => (
  <View>
  <View style={{backgroundColor: 'lightgreen', width: 10, height: 10, borderRadius: 5,  marginLeft: 16, marginBottom: -2}}></View>
  <View style={{flexDirection: 'row', marginLeft: 20, marginBottom: -1}}>
  <View style={{backgroundColor: 'lightgreen', width: 2, height: 100,}}>
  </View>
  <View>
            <Text style={styles.itemServ} >{item.status_name} </Text>
            <Text style={styles.itemServtime}>{Moment.unix(item.created_at).format('DD.MM.YYYY, HH:mm:ss')}</Text>

  </View>
  </View>
  </View>

        ))
      }
      </View>
        ))
      }
      </View>
  </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    color: '#000',
    fontSize: 14,
    marginVertical: 5
  },

loader: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff"
},

itemServtime:{
  fontSize: 14,
  color: '#969696',
  width: 80,
  marginLeft: 16,
},

itemServ:{
  fontSize: 16,
  color: '#1c1c1e',
  marginLeft: 16,
  fontWeight: 'bold',
},

isEn: {
  fontSize: 14,
  color: 'green',
  fontWeight: 'bold',
  marginRight: 18,
},

isntEn: {
  fontSize: 14,
  color: 'red',
  fontWeight: 'bold',
  marginRight: 18,
},

});


const AppNavigator = createStackNavigator({
  Loading:{
    screen: Loading,
  },
  Login:{
    screen: Login,
  },
  Home: {
    screen: HomeScreen,
  },
  Details: {
    screen: DetailsScreen,
  },
}, {
    initialRouteName: 'Loading',

    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#38013c',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },

    },
    transitionConfig: () => ({
    transitionSpec: {
      duration: 0,  // Set the animation duration time as 0 !!
    },
  }),
});


export default createAppContainer(AppNavigator);
