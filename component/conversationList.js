import React, { Component } from 'react';
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

class ConversationList extends Component {

  constructor(props) {
    super(props);
    this.state = {
        channelList : conversationListArr,
      AppID: 'c8dce22b6277415da8f7a9c1727efc70',                    //Set your APPID here
      ChannelName: '',                                  //Set a default channel or leave blank
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
 
async getUsers(){
   let convDB = firestore().collection('conversations');
   const currentUserId = await AsyncStorage.getItem('userId')
   const currentUserName = await AsyncStorage.getItem('userName')
   console.log('user ',currentUserId ,currentUserName);
   let convRef = convDB.where( "users","array-contains", { userId: currentUserId , name:currentUserName });
  //  let convRef = convDB.where( "users","array-contains", { userId: currentUserId});
  //  console.log('data : ', convRef);
  return convRef.onSnapshot(async (querySnapshot) => {
    let data = await querySnapshot.docs.map((documentSnapshot, i) => {
        return {
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
        };
    });
    console.log('data', data);
    // data.splice(data.findIndex((obj)=> {return obj.key == currentUserId}),1); // remove loggedIn user
    this.setState({
      channelList : data,
      userId : currentUserId
  });
  });
}


 handleSubmit = async (selectedUserID) => {
  const chennelId = await this.createChannelId(selectedUserID);
   console.log('chennelId',chennelId)
    let AppID = this.state.AppID;
    if (AppID !== '' && chennelId !== '') {
      this.props.navigation.navigate('VideoScreen',{ AppID, chennelId });
    }
  }

//  Create cgennel ID by aflgabatical wise string of both users id
async createChannelId(selectedUserID){
  const str = selectedUserID +''+this.state.userId
console.log('chennelId : ',str);
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

  render() {
    return (
      <View style={styles.container}>
        {this.state.channelList && this.state.channelList.length ?
            this.state.channelList.map((item,i)=> {
                return(
                    <TouchableOpacity key={item.key} style={styles.chennelContainer} onPress={()=> this.handleSubmit(item.key)}>
                    <Image
                    style={styles.userImage}
                      backgroundColor="grey"
                      source={{uri : 'https://i.picsum.photos/id/19'+i+'/300/300.jpg'}}>
                    </Image> 
                    {/* {item.users &&item.users && item.users.length && console.log('--> ',item.users[1])} */}
                    {item.isGroup ? <Text style={styles.userNameText}>{item.groupName}</Text> : item.users && item.users.length && <Text style={styles.userNameText}>{ (item.users[0].userId !== this.state.userId)  ? item.users[0].name: item.users[1].name}</Text>}
                    </TouchableOpacity>
                )
            })
            :
            <View style={styles.emptyList}><Text> You dont have any conversations</Text></View>
        }
        <TouchableOpacity style={styles.addButton} onPress={()=>this.props.navigation.navigate('UsersListScreen')} >
   {/* <Icon name="plus"  size={40} color="#01a699" /> */}
   <Text style={styles.addSymbol}>+</Text>
  </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    marginTop: 0,
    paddingVertical: 20,
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
}
});

export default ConversationList;