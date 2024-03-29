import React from 'react';
import { View, BackHandler } from 'react-native';
import { shotsToTakeDefault, UserSettings } from '../config';

import CameraScreen from './CameraScreen';
import CameraRollScreen from './CameraRollScreen';

import * as alerts from '../helpers/Alerts';
import { getItem, setItem } from '../helpers/Storage'

export default class CameraRoot extends React.Component {
    state = {
        shotsTaken: 0,
        shotsToTake: shotsToTakeDefault,
        showCamera: true,
        shotsUris: [],
        loading: false,
    };

    setShotsToTake = async (shotsToTake) => {
        setItem(UserSettings.shotsToTake, shotsToTake);
        this.setState({ shotsToTake: shotsToTake })
    }

    incShots = () => {
        this.setState({ shotsTaken: this.state.shotsTaken + 1 });
    }

    addShotUri = (shotUri) => {
        this.setState({
            shotsUris: [...this.state.shotsUris, { shotUri: shotUri, keep: false }]
        });
    }

    resetShots = () => {
        this.setState({ shotsTaken: 0, shotsUris: [] });
    }

    toggleCamera = () => {
        this.setState({ showCamera: !this.state.showCamera });
    }

    setLoading = (loading) => {
        this.setState({ loading })
    }

    keepShot = (id) => {
        let shotsUris = [...this.state.shotsUris];
        shotsUris[id].keep = !shotsUris[id].keep;
        this.setState({ shotsUris });
    }

    handleBackPress = () => {
        if (this.state.showCamera) {
            BackHandler.exitApp();
        }
        else {
            alerts.areYouSure(
                'If you continue the whole session will be lost.',
                () => {
                    this.resetShots();
                    this.toggleCamera();
                })

            return true;
        }
    }

    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        const shotsToTake = await getItem(UserSettings.shotsToTake);

        this.setState({
            ...(shotsToTake != null ? { shotsToTake } : {})
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
    }

    render() {
        // Do not unmount the Camera - 
        // takePictureAsync promise will not return anything 
        // (the promise will not be resolved/rejected) if there is no Camera
        return (
            <View style={{ flex: 1 }}>
                <View
                    // ~~ is used to convert true/false to 1/0
                    style={{
                        flex: ~~this.state.showCamera
                    }}>
                    <CameraScreen
                        shotsTaken={this.state.shotsTaken}
                        shotsToTake={this.state.shotsToTake}
                        loading={this.state.loading}
                        setShotsToTake={this.setShotsToTake}
                        incShots={this.incShots}
                        addShotUri={this.addShotUri}
                        toggleCamera={this.toggleCamera}
                        setLoading={this.setLoading}></CameraScreen>
                </View>
                {
                    this.state.showCamera ?
                        <View style={{ flex: 0 }}></View>
                        :
                        <View style={{ flex: 1 }}>
                            <CameraRollScreen
                                shotsUris={this.state.shotsUris}
                                resetShots={this.resetShots}
                                toggleCamera={this.toggleCamera}
                                keepShot={this.keepShot}>
                            </CameraRollScreen>
                        </View>
                }
            </View>
        );
    }
}
