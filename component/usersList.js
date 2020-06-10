import React, { Component } from 'react';
import { View, StyleSheet, Text, AsyncStorage, TouchableOpacity, Platform ,FlatList ,Image } from 'react-native';
import requestCameraAndAudioPermission from './permission';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';

const usersList= [{}]

class UsersList extends Component {

  constructor(props) {
    super(props);
    this.state = {
        usersList : usersList,
      AppID: 'c8dce22b6277415da8f7a9c1727efc70',                    //Set your APPID here
      ChannelName: '',                                  //Set a default channel or leave blank
      isCreateGroup: false,
      newGroupMembers:[]
    };
    if (Platform.OS === 'android') {                    //Request required permissions from Android
      requestCameraAndAudioPermission().then(_ => {
        console.log('requested!');
      });
    }
  }

 async componentDidMount(){
   await this.getUsers();
  }

  async componentDidUnMount(){
    if(this.state.userSubRef){
      this.state.userSubRef();
    }
  }
 
//  Get list of existing users
async getUsers(){
   let userRef = firestore().collection('users');
   console.log('data : ', userRef);
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
    this.setState({
      usersList : data,
      userId : currentUserId,
      userName : await AsyncStorage.getItem('userName')
  });
  });
}

 onSelectUser = async (selectedUser) => {
  const chennelId = await this.createChannelId(selectedUser.key);
  let conversationDB = firestore().collection('conversations');
  const conversationRef = conversationDB.where('chennelId','==',chennelId);
 const availablConversations = await conversationRef.get();
 let AppID = this.state.AppID; 
 console.log('chennelId',chennelId)
 if(!availablConversations.docs.length){
     const newConversationObj = {
        chennelId,
        users : [{
            userId: selectedUser.key,
            name : selectedUser.name
        },{
            userId: this.state.userId,
            name :  this.state.userName
        }
    ]
     }
    await conversationDB.add(newConversationObj)
 }
this.props.navigation.navigate('VideoScreen',{ AppID, chennelId });


    // let AppID = this.state.AppID;
    // if (AppID !== '' && chennelId !== '') {
    // }
  }

//  Create cgennel ID by alfabate wise string of both users id
async createChannelId(selectedUserID){
  const str = selectedUserID +''+this.state.userId
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
manageUserInGroup(selectedUserForGroup, index){
  let tempList =  this.state.usersList;
  const existingIndex = this.state.newGroupMembers.findIndex((obj)=> {return obj.userId == selectedUserForGroup.key});
  if(existingIndex < 0){
    if(this.state.newGroupMembers.length < 3 ){
    this.state.newGroupMembers.push({userId: selectedUserForGroup.key , name : selectedUserForGroup.name})
    tempList[index].isSelected = true;
    }else{
      console.log('limit exceeded');
    }
  }else{
    this.state.newGroupMembers.splice(existingIndex,1);
    tempList[index].isSelected = false;
  }
  this.setState({
     usersList: tempList
  });
}

// Create new group
async createNewGroup(){
  let conversationRef = firestore().collection('conversations');
  const groupUsers = this.state.newGroupMembers.map((user)=>{
            return { userId : user.userId, name: user.name}
         })
  groupUsers.push({userId: this.state.userId, name : this.state.userName});
  const newConversationObj = {
          chennelId : Math.random().toString(36).substring(7),
          users : groupUsers,
          isGroup: true,
          groupName: Math.random().toString(36).substring(7)+' Group',
          createdBy: this.state.userId
        }
  await conversationRef.add(newConversationObj);
  this.props.navigation.navigate('ConversationListScreen')
 }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity  
        style={styles.groupCreation}
        onPress={()=>{this.state.newGroupMembers.length ? this.createNewGroup() :this.setState({isCreateGroup : !this.state.isCreateGroup})}}
        >
          <Text style={styles.groupCreationText}>{this.state.isCreateGroup ? this.state.newGroupMembers.length ? 'Create now' : 'Select up to 4 group members' :  'Create a group +'}</Text>
    {this.state.isCreateGroup && !this.state.newGroupMembers.length && <Text>Click here to cancel</Text> }
        </TouchableOpacity>
        {this.state.usersList && this.state.usersList.length &&
            this.state.usersList.map((item,i)=> {
                return(
                    <TouchableOpacity key={item.key} style={styles.chennelContainer} onPress={()=> this.state.isCreateGroup ? this.manageUserInGroup(item ,i) : this.onSelectUser(item)}>
                    <Image
                    style={styles.userImage}
                      backgroundColor="grey"
                      source={{uri : 'https://i.picsum.photos/id/19'+i+'/300/300.jpg'}}>
                    </Image> 
                   <Text style={styles.userNameText}>{item.name}</Text>
                   {this.state.isCreateGroup &&<Text>{item.isSelected ? 'Selected' : 'Select'}</Text>}
                    </TouchableOpacity>
                )
            })
        }
      </View>
    );
  }
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

export default UsersList;