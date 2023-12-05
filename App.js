// import React, {useState, useEffect, useRef} from 'react';
// import { StyleSheet, Text, View, Image } from 'react-native';
// import { Camera, CameraType } from 'expo-camera';
// import * as MediaLibrary from 'expo-media-library';
// import Button from './src/components/Button';

// export default function App() {
//   const [hasCameraPermission, setHasCameraPermission] = useState(null);
//   const [image, setImage] = useState(null);
//   const [type, setType] = useState(Camera.Constants.Type.back);
//   const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
//   const cameraRef = useRef(null);
  

//   useEffect(() => {
//     (async () => {
//       MediaLibrary.requestPermissionsAsync();
//       const cameraStatus = await Camera.requestCameraPermissionsAsync();
//       setHasCameraPermission(cameraStatus.status === 'Granted');
//     })();

//   }, [])

//   const takePicture = async() => {
//     if(cameraRef){
//       try{
//         const data = await cameraRef.current.takePictureAsync();
//         console.log(data);
//         setImage(data.uri);
//       } catch(e){
//         console.log(e);
//         alert("Error in taking pictures!" + error.message)
//       }
//     }
//   }
//   const saveImage = async () => {
//     if(image){
//       try{
//         await MediaLibrary.createAssetAsync(image);
//         alert('Picture Saved!')
//         setImage(null);
//       } catch(e) {
//         console.log(e)
//       }
//     }
//   }

//   if(hasCameraPermission === true) {
//     return <Text>No access to Camera!</Text>
//   }

//   return (
//     <View style={styles.container}>
//     {!image ? 
//     <Camera
//       style={styles.camera}
//       type={type}
//       flashMode={flash}
//       ref={cameraRef}
//     >
//       <View style={{
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         padding: 30,
//       }}>
//         <Button icon={'retweet'} onPress={() => {
//           setType(type === CameraType.back ? CameraType.front : CameraType.back)
//         }} />
//         <Button icon={'flash'} 
//           color={flash === Camera.Constants.FlashMode.off ? 'gray': '#f1f1f1'}
//           onPress={() => {
//             setFlash(flash === Camera.Constants.FlashMode.off
//               ? Camera.Constants.FlashMode.on
//               : Camera.Constants.FlashMode.off)
//         }}/>
//       </View>
//       </Camera>
//     :
//     <Image source={{uri: image}} style={styles.camera}/>
//     }
//       <View>
//         {image ?
//         <View style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           paddingHorizontal: 50,
//         }}>
//           <Button title={"Retake Picture"} icon="retweet" onPress={() => setImage(null)} />
//           <Button title={"Save Picture"} icon="check" onPress={saveImage} />
//         </View>
//         :
//         <Button title={'Take a Shot'} icon="camera" onPress={takePicture} />
//       }
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     paddingBottom: 20
//   },
//   camera: {
//     flex: 1,
//     borderRadius: 20,
//   }
// });
import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Button from './src/components/Button';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);
  

  useEffect(() => {
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'Granted');
    })();

  }, [])

  const takePicture = async() => {
    if(cameraRef){
      try{
        const data = await cameraRef.current.takePictureAsync();
        console.log(data);
        setImage(data.uri);
      } catch(e){
        console.log(e);
        alert("Error in taking pictures!" + error.message)
      }
    }
  }

const saveImage = async () => {
 if(image){
    try{
      // Compress the image using expo-image-manipulator
      const manipulatorResult = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert the image URI to a base64 encoded string
      const base64Image = await FileSystem.readAsStringAsync(manipulatorResult.uri, { encoding: FileSystem.EncodingType.Base64 });
      
      // Send the image to the Roboflow API
      const response = await axios({
        method: "POST",
        url: "https://detect.roboflow.com/acnedet-v1/2",
        params: {
          api_key: "yKWykCRtEekBUMSGbd0W"
        },
        data: base64Image,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      console.log(response.data);
      alert('Picture Saved!');
      setImage(null);
      const classNames = response.data.predictions.map(prediction => prediction.class);
      console.log(classNames);
    } catch(e) {
      console.log(e);
      alert("Error in saving picture!" + e.message);
    }
 }
}

  if(hasCameraPermission === true) {
    return <Text>No access to Camera!</Text>
  }

  return (
    <View style={styles.container}>
    {!image ? 
    <Camera
      style={styles.camera}
      type={type}
      flashMode={flash}
      ref={cameraRef}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 30,
      }}>
        <Button icon={'retweet'} onPress={() => {
          setType(type === CameraType.back ? CameraType.front : CameraType.back)
        }} />
        <Button icon={'flash'} 
          color={flash === Camera.Constants.FlashMode.off ? 'gray': '#f1f1f1'}
          onPress={() => {
            setFlash(flash === Camera.Constants.FlashMode.off
              ? Camera.Constants.FlashMode.on
              : Camera.Constants.FlashMode.off)
        }}/>
      </View>
      </Camera>
    :
    <Image source={{uri: image}} style={styles.camera}/>
    }
      <View>
        {image ?
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 50,
        }}>
          <Button title={"Retake Picture"} icon="retweet" onPress={() => setImage(null)} />
          <Button title={"Save Picture"} icon="check" onPress={saveImage} />
        </View>
        :
        <Button title={'Take a Shot'} icon="camera" onPress={takePicture} />
      }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingBottom: 20
  },
  camera: {
    flex: 1,
    borderRadius: 20,
  }
});


