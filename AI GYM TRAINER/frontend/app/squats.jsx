import { StyleSheet, Text, View, Platform } from "react-native";
import { useState, useEffect } from "react";
import WebView from "react-native-webview";
import { Camera } from "expo-camera";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Our API request your token provided on our dashboard on posetracker.com (It's free <3)
const API_KEY = "34cf348c-fd4b-4245-8e9f-6cf2110cd32f";
const POSETRACKER_API = "https://posetracker.com/pose_tracker/tracking";

export default function squats() {
  const [poseTrackerInfos, setCurrentPoseTrackerInfos] = useState();
  const [repsCounter, setRepsCounter] = useState(0);
  const [falseRepsCounter, setFlaseRepsCounter] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  // Our API request the width and height wanted for display the webcam inside the webview
  const width = 360;
  const height = 350;

  // Our API request the exercise you want to track and count
  const exercise = "face_squat";
  // Our API request the difficulty of the exercise (by default it's set to normal)
  const difficulty = "normal";

  // You can request API to display user skeleton or not (by default it's set to true)
  const skeleton = true;

  const posetracker_url = `${POSETRACKER_API}?token=${API_KEY}&exercise=${exercise}&difficulty=${difficulty}&width=${width}&height=${height}`;

  // We need a bridge to transit data between the ReactNative app and our WebView
  // The WebView will use this function define here to send info that we will use later
  const jsBridge = `
  (function() {
    window.webViewCallback = function(info) {
      window.ReactNativeWebView.postMessage(JSON.stringify(info));
    }
  })();
`;

  const handleCounter = (count) => {
    setRepsCounter(count);
  };

  const handleInfos = (infos) => {
    setCurrentPoseTrackerInfos(infos);
  };

  //This is the function pass to the WebView to listen info from the WebView
  const webViewCallback = (info) => {
    switch (info.type) {
      case "counter":
        return handleCounter(info.current_count);
      default:
        return handleInfos(info);
    }
  };

  // For Android it's needed to request camera authorization
  useEffect(() => {
    if (Platform.OS === "android") {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      })();
    }
  }, []);

  if (Platform.OS === "android" && !hasPermission) {
    return (
      <View
        alignItems="center"
        justifyContent="center"
        style={{ height: "100%", width: "100vw", backgroundColor: "black" }}
      ></View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <WebView
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          style={{
            width: width,
            height: height,
            zIndex: 1,
          }}
          source={{ uri: posetracker_url }}
          originWhitelist={["*"]}
          injectedJavaScript={jsBridge}
          onMessage={(event) => {
            const info = JSON.parse(event.nativeEvent.data);
            webViewCallback(info);
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
          position: "absolute",
          top: "80%",
          width: "100%",
          alignItems: "center",
          margin: "auto",
          fontSize: hp(3),
        }}
      >
        <Text>
          Status : {!poseTrackerInfos ? "loading AI..." : "AI Running"}
        </Text>
        <Text>
          Info type :{" "}
          {!poseTrackerInfos ? "loading AI..." : poseTrackerInfos.type}
        </Text>
        {poseTrackerInfos?.ready === false ? (
          <>
            <Text style={{ fontSize: hp(2) }}>Placement ready: false</Text>
            <Text style={{ fontSize: hp(2) }}>
              Placement info : Move {poseTrackerInfos?.postureDirection}{" "}
            </Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: hp(2) }}>Placement ready: true</Text>
            <Text style={{ fontSize: hp(2) }}>
              Placement info : You can start doing squats 🏋️
            </Text>
          </>
        )}
        {repsCounter >= 0 && (
          <Text style={{ fontSize: hp(3.5), fontWeight: "bold" }}>
            Correct Counter: {repsCounter}
          </Text>
        )}
        {falseRepsCounter >= 0 && (
          <Text style={{ fontSize: hp(3.5), fontWeight: "bold" }}>
            Incorrect Counter: {falseRepsCounter}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    marginTop: 60,
  },
  text: {},
});
