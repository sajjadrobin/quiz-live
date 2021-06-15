import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBg7dwp5EXEdKnQ2wikojWmTqbRa8k3twg",
  authDomain: "bbu-rtc-poc.firebaseapp.com",
  projectId: "bbu-rtc-poc",
  storageBucket: "bbu-rtc-poc.appspot.com",
  messagingSenderId: "400647073357",
  appId: "1:400647073357:web:c8d85dc6d03da2d3077604",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
