// frontend/index.js
import { AppRegistry } from 'react-native';
import App from './TempProject/App';
import { name as appName } from './app.json';

// Register the app
AppRegistry.registerComponent(appName, () => App);