import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, AsyncStorage, TouchableOpacity, Platform ,FlatList ,Image } from 'react-native';
import requestCameraAndAudioPermission from './permission';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import * as _  from 'lodash';

const AppID = 'c8dce22b6277415da8f7a9c1727efc70';
let userSubRef='';
let newGroupMembers=[];

export default function UsersList(props) {

  const [usersList, setUsersList]= useState([{}]);
  const [isCreateGroup, setIsCreateGroup]= useState(false);
  const [userId, setUserId]= useState('');
  const [userName, setUserName]= useState('');

  useEffect(()=> {
    // setUsersList([]);
    // this.state = {
    //     usersList : usersList,
    //   isCreateGroup: false,
    //   newGroupMembers:[]
    // };
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
  },[])

 
//  Get list of existing users
async function getUsers(){
   let userRef = firestore().collection('users');
   const currentUserId= await AsyncStorage.getItem('userId')
  return userRef.onSnapshot(async (querySnapshot) => {
    let data = await querySnapshot.docs.map((documentSnapshot, i) => {
        return {
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
            isSelected : false
        };
    });
    data.splice(data.findIndex((obj)=> {return obj.key == currentUserId}),1); // remove loggedIn user
    setUsersList(data);
    setUserId(currentUserId);
    setUserName(await AsyncStorage.getItem('userName'));

    // this.setState({
    //     usersList : data,
    //     userId : currentUserId,
    //     userName : await AsyncStorage.getItem('userName')
    // });
  });
}

async function onSelectUser(selectedUser){
  const chennelId = await createChannelId(selectedUser.key);
  let conversationDB = firestore().collection('conversations');
  const conversationRef = conversationDB.where('chennelId','==',chennelId);
  const availablConversations = await conversationRef.get();

    if(!availablConversations.docs.length){
        const newConversationObj = {
            chennelId,
            users : [{
                userId: selectedUser.key,
                name : selectedUser.name
            },{
                userId: userId,
                name : userName
            }
        ]
        }
        await conversationDB.add(newConversationObj)
    }
   props.navigation.navigate('VideoScreen',{ AppID, chennelId });
  }

//  Create cgennel ID by alfabate wise string of both users id
async function createChannelId(selectedUserID){
  const str = selectedUserID +''+userId
  var arr = str.split('');
  var tmp;
  for(var i = 0; i < arr.length; i++){
    for(var j = i + 1; j < arr.length; j++){
      /* if ASCII code greater then swap the elements position*/
      if(arr[i] > arr[j]){
        tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    }
  }
 return arr.join('');
}

// Manage user Selection for group
async function manageUserInGroup(selectedUserForGroup, index){
  let tempList =  _.cloneDeep(usersList);
  const existingIndex = newGroupMembers.findIndex((obj)=> {return obj.userId == selectedUserForGroup.key});
  if(existingIndex < 0){
    if(newGroupMembers.length < 3 ){
    newGroupMembers.push({userId: selectedUserForGroup.key , name : selectedUserForGroup.name})
    tempList[index].isSelected = true;
    }else{
      console.log('limit exceeded');
    }
  }else{
    newGroupMembers.splice(existingIndex,1);
    tempList[index].isSelected = false;
  }
  setUsersList(tempList)
}

// Create new group
async function createNewGroup(){
  let conversationRef = firestore().collection('conversations');
  const groupUsers = newGroupMembers.map((user)=>{
            return { userId : user.userId, name: user.name}
         })
  groupUsers.push({userId: userId, name : userName});
  const newConversationObj = {
          chennelId : Math.random().toString(36).substring(7),
          users : groupUsers,
          isGroup: true,
          groupName: Math.random().toString(36).substring(7)+' Group',
          createdBy: userId
        }
  await conversationRef.add(newConversationObj);
  props.navigation.navigate('ConversationListScreen')
 }

    return (
      <View style={styles.container}>
        <TouchableOpacity  
        style={styles.groupCreation}
        onPress={()=>{newGroupMembers.length ? createNewGroup() :setIsCreateGroup(!isCreateGroup)}}
        >
          <Text style={styles.groupCreationText}>{isCreateGroup ? newGroupMembers.length ? 'Create now' : 'Select up to 3 group members' :  'Create a group +'}</Text>
    {isCreateGroup && !newGroupMembers.length && <Text>Click here to cancel</Text> }
        </TouchableOpacity>
        {usersList && usersList.length &&
            usersList.map((item,i)=> {
                return(
                    <TouchableOpacity key={item.key} style={styles.chennelContainer} onPress={()=> isCreateGroup ? manageUserInGroup(item ,i) : onSelectUser(item)}>
                    <Image
                    style={styles.userImage}
                      backgroundColor="grey"
                      source={{uri : 'https://i.picsum.photos/id/19'+i+'/300/300.jpg'}}>
                    </Image> 
                   <Text style={styles.userNameText}>{item.name}</Text>
                   {isCreateGroup &&<Text>{item.isSelected ? 'Selected' : 'Select'}</Text>}
                    </TouchableOpacity>
                )
            })
        }
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    paddingVertical: 10,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chennelContainer:{
    alignItems:'center',
    borderWidth:0.4,
    borderRadius:5,
    flexDirection:'row',
    marginVertical:5,
    marginHorizontal:10,
    paddingVertical:10,
    paddingLeft:10
  },
userImage: {
  height :50,
  width : 50,
  borderRadius:25,
  marginHorizontal: 8,
}, 
userNameText :{
  fontSize:18,
  marginLeft:8,
  fontWeight:'600'
},
groupCreation:{
  justifyContent:'center',
  alignItems:'center',
  padding:15,
  margin:10,
  borderWidth: 1,
  borderRadius:15,
  borderStyle:'dashed'
},
groupCreationText:{
  fontSize:20
}
});