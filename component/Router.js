import { Router, Scene, ActionConst } from 'react-native-router-flux';
import React from 'react';
import Video from './Video';
import Home from './Home';

const RouterComponent = () => (
	<Router>
    
	<Stack key="root">
			<Scene key="home" component={Home} title="Agora Video Call" initial type={ActionConst.RESET} />
			<Scene key="video" component={Video} title="Video Feed"  type={ActionConst.RESET} hideNavBar={true} />
		</Stack>
	</Router>
);

export default RouterComponent;