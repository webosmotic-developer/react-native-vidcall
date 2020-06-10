import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Actions } from 'react-native-router-flux';
import requestCameraAndAudioPermission from './permission';
import firestore from '@react-native-firebase/firestore';
import {Picker} from '@react-native-community/picker';
import AsyncStorage from '@react-native-community/async-storage';


let userSubRef='';
export default function Home(props) {
  const [selectedUser, setSelectedUser] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [userId, setUserId]= useState('');

  useEffect(() => {
    if (Platform.OS === 'android') {                    //Request required permissions from Android
      requestCameraAndAudioPermission().then(_ => {
        console.log('requested!');
      });
    }
    getUsers();
    return () => {
      if(userSubRef){
        userSubRef();
      }
    };
  }, []);


  function handleSubmit(){
    console.log('selectedUser :')
    if (selectedUser !== '') {
      AsyncStorage.setItem('userId',selectedUser)
      AsyncStorage.setItem('userName',usersList[usersList.findIndex((obj)=> {return obj.key ==selectedUser})].name);
      props.navigation.navigate('ConversationListScreen');
    }
  }

  // Get List Of users
  async function getUsers(){
    let userRef = firestore().collection('users');
    console.log('data : ', userRef);
    userSubRef = await userRef.onSnapshot(async (querySnapshot) => {
      console.log('querySnapshot -> ', querySnapshot);
     let data = await querySnapshot.docs.map((documentSnapshot, i) => {
         return {
             ...documentSnapshot.data(),
             key: documentSnapshot.id,
         };
     });
  
     setUsersList(data);
    //  this.setState({
    //    usersList : data
    //  });
   });
 }

    return (
      <View style={styles.container}>
         <Text style={styles.formLabel}>Login as</Text>
            <Picker style={styles.pickerStyle}  
                        selectedValue={selectedUser}  
                        onValueChange={(itemValue) =>  {
                                  setSelectedUser(itemValue)
                        }}>  
              {usersList && usersList.length ? 
                (
                 usersList.map((obj,index) => {
                    return (<Picker.Item  key={index}  label={obj.name} value={obj.key} />)
                  }) )
                : 
                  <Picker.Item label='no user available' value='' />}
          </Picker> 
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              title="Login!"
              onPress={()=>{handleSubmit()}}
              style={styles.submitButton}>
              <Text style={{ color: '#ffffff' }}> Login </Text>
            </TouchableOpacity>
          </View>
      </View>
    );
};

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

// export default Home;