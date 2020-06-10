import * as React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
// import MainTabNavigator from './MainNavigator';
// import AuthLoadingScreen from '../screens/AuthLoadingScreen';
// import LoginScreen from '../screens/LoginScreen';
// import { ProfileScreen } from '../screens/ProfileScreen';
// import { SelectChallengeScreen } from '../screens/SelectChallengeScreen';
// import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
// import { SideMenu } from '../components/SlideMenu';
// import { TouchableOpacity } from 'react-native';
import Home from '../component/Home';
import Video from '../component/Video';
import ConversationList from '../component/conversationList';
import UsersList from '../component/usersList';

const AuthStack = createStackNavigator({
    HomeScreen: {
        screen: Home,
        navigationOptions: {
            title: 'Login',
        },
    },
    ConversationListScreen: {
        screen: ConversationList,
        navigationOptions: {
            title: 'Conversations',
        },
    },
    UsersListScreen : {
        screen: UsersList,
        navigationOptions: {
            title: 'Select Users',
        },
    },
    VideoScreen: {
        screen: Video,
         navigationOptions: {
            headerShown: false,
        },
    },
   

});

const AppNavigator = createAppContainer(
    createSwitchNavigator(
        {
            // Auth: HomeStack,
            // Profile: ProfileScreen,
            App: AuthStack,
            // Auth: AuthStack,
        },
        // {
        //     initialRouteName: AuthStack,
        // },
    ),
);

export default AppNavigator;
