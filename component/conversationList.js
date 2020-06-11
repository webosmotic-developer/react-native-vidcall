import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, AsyncStorage, TouchableOpacity, Platform ,FlatList ,Image } from 'react-native';
import requestCameraAndAudioPermission from './permission';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

const conversationListArr= [
    { name : 'Dhruv bhagat' , chennelId: 'db123'},
    { name : 'Devang Mistry' , chennelId: 'dm123'},
    { name : 'WO mobile group' , chennelId: 'wom123'},
    { name : 'Mehul Mali' , chennelId: 'mm123'},
    { name : 'Vipul jain' , chennelId: 'vj123'},
    ]

  const AppID= 'c8dce22b6277415da8f7a9c1727efc70';
  let conversationsSubRef='';
  
  export default function ConversationList(props) {
  const [channelList, setChennelList]= useState(conversationListArr);
  // const [conversationsSubRef, setConversationsSubRef] = useState('');

  const [userId, setUserId]= useState('');
  // const [channelList, setChennelList]= useState(conversationListArr);

  useEffect(()=>{
    getConversations();
    return()=>{
      if(conversationsSubRef){
       conversationsSubRef();
      }
    }
  },[]);

//  Get List of Conversation in database
async function getConversations(){
   let convDB = firestore().collection('conversations');
   const currentUserId = await AsyncStorage.getItem('userId')
   const currentUserName = await AsyncStorage.getItem('userName')
   let convRef = convDB.where( "users","array-contains", { userId: currentUserId , name:currentUserName });
   conversationsSubRef = await convRef.onSnapshot(async (querySnapshot) => {
    let data = await querySnapshot.docs.map((documentSnapshot, i) => {
        return {
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
        };
    });
    setChennelList(data);
    setUserId(currentUserId);
  });
}

// Open Video call 
 async function handleSubmit (selectedUserID){
  const chennelId = await createChannelId(selectedUserID);
    if (AppID !== '' && chennelId !== '') {
      props.navigation.navigate('VideoScreen',{ AppID, chennelId });
    }
  }

//  Create cgennel ID by aflgabatical wise string of both users id
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

    return (
      <View style={styles.container}>
        {channelList && channelList.length ?
           channelList.map((item,i)=> {
                return(
                    <TouchableOpacity key={i} style={styles.chennelContainer} onPress={()=> handleSubmit(item.key)}>
                    <View style={styles.userDetailsContainer}>
                    <Image
                    style={styles.userImage}
                      backgroundColor="grey"
                      source={{uri : 'https://i.picsum.photos/id/19'+i+'/300/300.jpg'}}>
                    </Image> 
                    {/* {item.users &&item.users && item.users.length && console.log('--> ',item.users[1])} */}
                    {item.isGroup ? <Text style={styles.userNameText}>{item.groupName}</Text> : item.users && item.users.length && <Text style={styles.userNameText}>{ (item.users[0].userId !== userId)  ? item.users[0].name: item.users[1].name}</Text>}
                    </View>
                    {/* <Text>{item.datetime}</Text> */}
                    </TouchableOpacity>
                )
            })
            :
            <View style={styles.emptyList}><Text> You dont have any conversations</Text></View>
        }
        <TouchableOpacity style={styles.addButton} onPress={()=>props.navigation.navigate('UsersListScreen')} >

   <Text style={styles.addSymbol}>+</Text>
  </TouchableOpacity>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    paddingVertical: 20,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chennelContainer:{
    alignItems:'center',
    justifyContent:'space-between',
    borderWidth:0.4,
    borderRadius:5,
    flexDirection:'row',
    marginVertical:5,
    marginHorizontal:10,
    padding:10,
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
addButton :{
  borderWidth:1,
  borderColor:'rgba(0,0,0,0.2)',
  alignItems:'center',
  justifyContent:'center',
  width:70,
  position: 'absolute',                                          
  bottom: 15,                                                    
  right: 15,
  height:70,
  backgroundColor:'#fff',
  borderRadius:100,
},
addSymbol:{
  fontSize: 40,
  textAlign:'center',
},
emptyList : {
  alignItems:'center',
  justifyContent:'center'
},
userDetailsContainer:{
  flexDirection:'row',
    alignItems:'center',
},
});
