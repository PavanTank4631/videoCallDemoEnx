import React, { Component } from "react";
import {
	Platform,
	StyleSheet,
	Text,
	Alert,
	TouchableHighlight,
	TextInput,
	Button,
	View,
	PermissionsAndroid,
	Keyboard,
	ScrollView
} from "react-native";
import PropTypes from "prop-types";
import axios from "axios";
import Logo from "./Logo";
import { each } from "underscore";

export default class App extends Component {
	static options(passProps) {
		return {
			topBar: {
				visible: true,
				animate: true,
				title: {
					text: "Enablex",
					fontSize: 20,
					color: "white"
				},
				background: {
					color: "#6f5989"
				}
			},
			statusBar: {
				backgroundColor: "#534367",
				visible: true,
				style: "light"
			}
		};
	}
	constructor(props) {
		super(props);
		this.state = {
			user_name: "React Native",
			room_id: "",
			permissionsError: false
		};

		this.infos = ''
		this.res_token = ''
		this.componentId = ''
	}
	render() {
		return (
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.container}>
					<Logo />
					<View style={{ marginTop: 10, marginBottom: 20 }}>
						<TextInput
							style={{
								height: 40,
								width: 300,
								borderColor: "#eae7e7",
								backgroundColor: "#eae7e7",
								borderWidth: 2,
								borderRadius: 10,
								marginBottom: 20,
								alignSelf: "center"
							}}
							placeholder="Enter name"
							ref={"textInput1"}
							keyboardType={"default"}
							autoCapitalize={"none"}
							editable={true}
							onChangeText={user_name => this.setState({ user_name })}
							value={this.state.user_name}
							returnKeyType={"next"}
							onSubmitEditing={event => {
								this.refs.textInput2.focus();
							}}
							autoCorrect={false}
							placeholderTextColor="#757575"
							underlineColorAndroid="transparent"
						/>

						<TextInput
							style={{
								height: 40,
								width: 300,
								borderColor: "#eae7e7",
								backgroundColor: "#eae7e7",
								borderWidth: 2,
								borderRadius: 10,
								marginBottom: 20,
								alignSelf: "center"
							}}
							placeholder="Enter roomId"
							autoCapitalize={"none"}
							ref={"textInput2"}
							editable={true}
							onChangeText={room_id => this.setState({ room_id })}
							value={this.state.room_id}
							keyboardType={"default"}
							returnKeyType={"next"}
							autoCorrect={false}
							placeholderTextColor="#757575"
							underlineColorAndroid="transparent"
						/>
					</View>
					<View
						style={{
							flex: 2,
							flexDirection: "row",
							width: 250,
							bottom: 0,
							alignSelf: "center",
							alignItems: "center",
							justifyContent: "space-between",
							borderRadius: 25,
						}}
					>
						<TouchableHighlight
							style={{
								height: 40,
								width: 120,
								borderColor: "#534367",
								backgroundColor: "#534367",
								borderRadius: 20,
								alignItems: "center"
							}}
							underlayColor="transparent"
							onPress={this._onCreate_Room}
						>
							<Text style={styles.continue_button}>Create Room</Text>
						</TouchableHighlight>

						<TouchableHighlight
							style={{
								height: 40,
								width: 120,
								borderColor: "#534367",
								backgroundColor: "#534367",
								borderWidth: 2,
								borderRadius: 20,
								alignItems: "center"
							}}
							underlayColor="transparent"
							onPress={this._onJoin_Room}
						>
							<Text style={styles.continue_button}>Join</Text>
						</TouchableHighlight>
					</View>
				</View>
			</ScrollView>
		);
	}

	_onCreate_Room = async () => {
		if (Platform.OS === "android") {
			checkAndroidPermissions()
				.then(() => {
					this.setState({ permissionsError: false });
				})
				.catch(error => {
					this.setState({ permissionsError: true });
					console.log("checkAndroidPermissions", error);
					return;
				});
		}
		await this.getRoomIDWebCall();
	};

	_onJoin_Room = () => {
		if (this.state.user_name == "" && this.state.room_id == "") {
			alert("Please enter your details");
		} else if (this.state.user_name == "") {
			alert("Please enter your name");
		} else if (this.state.room_id == "") {
			alert("Please enter roomId");
		} else {
			this.navigateToVideo();
		}
	};

	async getRoomIDWebCall() {
		var header = (kTry) ? { "x-app-id": kAppId, "x-app-key": kAppkey } : {};
		const options = {
			headers: header
		};

		await axios
			.post(kBaseURL + "createRoom/", {}, options)
			.then((response) => {
				console.log('!!!!!!!!!!!!!!!!!!!',response)
				this.infos = response.data;
				console.log("axiosResponseinfo", this.infos);
			})
			.catch(function (error) {
				console.log("axiosRoomIdCatchError", error);
			});
		this.setState({ room_id: this.infos.room.room_id })
	}

	async getRoomTokenWebCall() {
		var header = (kTry) ? { "x-app-id": kAppId, "x-app-key": kAppkey } : {};
		const options = {
			headers: header
		};
		await axios
			.post(kBaseURL + "createToken/", {
				name: this.state.user_name,
				role: "participant",
				user_ref: "2236",
				roomId: this.infos.room.room_id
			}, options)
			.then((response) => {
				console.log('@@@@@@@@@@@@@@@@@@@', response)
				this.res_token = response.data;
				console.log("axiosResponsetoken", this.res_token);
			})
			.catch((error) => {
				console.log("axiosCreateTokenCatch", error);
			});
	}

	async navigateToVideo() {
		await this.getRoomTokenWebCall();
		try {
			if (this.res_token.result == 0) {
				this.props.navigation.navigate('EnxConferenceScreen', {
					token: this.res_token.token,
					username: this.state.user_name,
					permissionsError: this.state.permissionsError,
					componentId: this.props.componentId
				});
			} else {
				console.log(this.res_token.error);
			}
		} catch (error) {
			console.log("navigationError", error);
		}
	}
}

const checkAndroidPermissions = () =>
	new Promise((resolve, reject) => {
		PermissionsAndroid.requestMultiple([
			PermissionsAndroid.PERMISSIONS.CAMERA,
			PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
		])
			.then(result => {
				const permissionsError = {};
				permissionsError.permissionsDenied = [];
				each(result, (permissionValue, permissionType) => {
					if (permissionValue === "denied") {
						console.log("denied Permission");
						permissionsError.permissionsDenied.push(permissionType);
						permissionsError.type = "Permissions error";
					}
				});
				if (permissionsError.permissionsDenied.length > 0) {
					console.log("denied Permission");
					reject(permissionsError);
				} else {
					console.log("granted Permission");
					resolve();
				}
			})
			.catch(error => {
				reject(error);
			});
	});

const styles = StyleSheet.create({
	container: {
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 10
	},
	continue_button: {
		color: "white",
		marginTop: 5,
		fontSize: 16,
		alignSelf: "center",
		justifyContent: "center"
	}
});
/*Your webservice host URL, Keet the defined host when kTry = true */
const kBaseURL = "https://demo.enablex.io/";
/* To try the app with Enablex hosted service you need to set the kTry = true */
const kTry = true;
/*Use enablec portal to create your app and get these following credentials*/
const kAppId = "5f9a4ddc0d7cbc66f7347222";
const kAppkey = "anuAuRyjuneRuhe3aXuMeYu2u4y3yQyXynes";
