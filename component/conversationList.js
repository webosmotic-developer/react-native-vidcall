import React, { Component } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Platform ,FlatList } from 'react-native';
import requestCameraAndAudioPermission from './permission';

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

 handleSubmit = (ChannelName) => {
    let AppID = this.state.AppID;
    if (AppID !== '' && ChannelName !== '') {
      this.props.navigation.navigate('VideoScreen',{ AppID, ChannelName });
    }
  }



async renderChannel(item){
    return (<View>
    {/* <Item title={item.name} /> */}
    <Text> {item.name}</Text>
    </View>)
}

  render() {
    return (
      <View style={styles.container}>
        {this.state.channelList && this.state.channelList.length &&
            this.state.channelList.map((item)=> {
                return(
                    <TouchableOpacity style={styles.chennelContainer} onPress={()=> this.handleSubmit(item.chennelId)}>
                    <Text>{item.name}</Text>
                    </TouchableOpacity>
                )
            })
        }
        {/* <Text style={styles.formLabel}>Channel Name</Text>
        <TextInput
          style={styles.formInput}
          onChangeText={(ChannelName) => this.setState({ ChannelName })}
          value={this.state.ChannelName}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            title="Start Call!"
            onPress={this.handleSubmit}
            style={styles.submitButton}
          >
            <Text style={{ color: '#ffffff' }}> Start Call </Text>
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // alignItems: 'center',
    marginTop: 0,
    padding: 20,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chennelContainer:{
    borderWidth:0.5,
    borderRadius:10,
    flexDirection:'row',
    marginVertical:5,
    paddingVertical:10,
    paddingLeft:10
  }


});

export default ConversationList;