import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Platform ,AsyncStorage ,Picker} from 'react-native';
import { Actions } from 'react-native-router-flux';
import requestCameraAndAudioPermission from './permission';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      AppID: 'c8dce22b6277415da8f7a9c1727efc70',                    //Set your APPID here
      selectedUSer:''
    };
    if (Platform.OS === 'android') {                    //Request required permissions from Android
      requestCameraAndAudioPermission().then(_ => {
        console.log('requested!');
      });
    }
  }

  async componentDidMount(){
   const userSubRef =  await this.getUsers();
   this.setState({
    userSubRef
   })
  }

  async componentDidUnMount(){
    if(this.state.userSubRef){
      this.state.userSubRef();
    }
  }
 
  handleSubmit = () => {
    if (this.state.selectedUSer !== '') {
      AsyncStorage.setItem('userId',this.state.selectedUSer)
      AsyncStorage.setItem('userName',this.state.usersList[this.state.usersList.findIndex((obj)=> {return obj.key == this.state.selectedUSer})].name);
      this.props.navigation.navigate('ConversationListScreen');
    }
  }

  // Get List Of users
  async getUsers(){
    let userRef = firestore().collection('users');
    console.log('data : ', userRef);
    return userRef.onSnapshot(async (querySnapshot) => {
      console.log('querySnapshot -> ', querySnapshot);
     let data = await querySnapshot.docs.map((documentSnapshot, i) => {
         return {
             ...documentSnapshot.data(),
             key: documentSnapshot.id,
         };
     });
     this.setState({
       usersList : data
   });
   });
 }

  render() {
    return (
      <View style={styles.container}>
         <Text style={styles.formLabel}>Login as</Text>
            <Picker style={styles.pickerStyle}  
                        selectedValue={this.state.selectedUSer}  
                        onValueChange={(itemValue, itemPosition) =>  {
                                   this.setState({
                            selectedUSer: itemValue
                          })
                        }}
                    >  
              {this.state.usersList && this.state.usersList.length ? 
                (
                  this.state.usersList.map((obj) => {
                    return (<Picker.Item label={obj.name} value={obj.key} />)
                  }) )
                : 
                  <Picker.Item label='no user available' value='' />}
          </Picker> 
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              title="Start Call!"
              onPress={this.handleSubmit}
              style={styles.submitButton}>
              <Text style={{ color: '#ffffff' }}> Login </Text>
            </TouchableOpacity>
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems:'center',
    marginTop: 0,
    padding: 20,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  formLabel: {
    paddingBottom: 10,
    paddingTop: 10,
    color: '#0093E9',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  submitButton: {
    paddingHorizontal: 60,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  formInput: {
    height: 40,
    backgroundColor: '#f5f5f5',
    color: '#0093E9',
    borderRadius: 4,
    paddingLeft: 20,
  },
  textStyle:{  
    margin: 24,  
    fontSize: 25,  
    fontWeight: 'bold',  
    textAlign: 'center',  
},  
pickerStyle:{  
    height: 150,  
    width: "80%",  
    color: '#344953',  
    justifyContent: 'center',  
}  
});

export default Home;