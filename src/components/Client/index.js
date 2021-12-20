import React, { Component, createRef } from "react";
import { withRouter } from 'react-router-dom';
import ScrollContainer from "react-indiana-drag-scroll";
import { Select, Row, Col } from 'antd';
import AgoraRTC from "agora-rtc-sdk-ng";
import { observer } from "mobx-react";
import EventApi from "stores/api/EventApi";

import { LocalPlayerAspectRatio, CarouselAspectRatio } from "./AspectRatio";
import AppStore from "stores/AppStore";
//import cookies from "utils/CookiesHelper";

import VideoOff from "assets/controls/camera/VideoOff.svg";
import VideoOn from "assets/controls/camera/VideoOnBlack.svg";
import MicOn from "assets/controls/mic/MicOnBlack.svg";
import MicOff from "assets/controls/mic/MicOff.svg";
import Hand from "assets/controls/raise_hand/Hand.svg";
import Chat from "assets/controls/raise_hand/Icon.svg";


import clientOptions from "AgoraSettings";
import "./Client.scss";
import Audiences from "./Audiences";
import Host from "./Host";
import HighlightedProducts from "components/Product/HighlightedProducts";
import ProductList from "components/Product/ProductList";

const AUDIO_MUTE = "audiomute";
const VIDEO_MUTE = "videomute";

//const cookies = new Cookies();

class Client extends Component {
  localTracks = {
    videoTrack: null,
    audioTrack: null
  };
  searchParams = new URL(window.location.href).searchParams;
  client;
  isHost = false;
  localPlayerContainerRef;
  resizeTimer;
  localUid = "";

  constructor(props) {
    super(props);

    this.client = AgoraRTC.createClient({
      mode: "live",
      codec: "vp8" // safari 12.1 or earlier -> h264
    });

    this.state = {
      isAudioActive: true,
      isVideoActive: true,
      localPlayerContainerWidth: 0,
      localPlayerContainerHeight: 0,
      speakerUid: ""
    }

    this.isHost = true;
    this.localPlayerContainerRef = createRef();
  }


  async subscribe(user, mediaType) {
    const uid = user.uid;

    //subscribe to a remote user
    await this.client.subscribe(user, mediaType);

    if (mediaType === "video") {
      if (uid === "host") {
        AppStore.addHostInfo("video", user.videoTrack);
        AppStore.addHostInfo("tag", "Host");
        AppStore.addHostInfo("ref", React.createRef());
      } else {
        AppStore.addTrack(uid, "video", user.videoTrack);
      }
    }

    // If the subscribed track is audio.
    if (mediaType === "audio") {
      if (uid === "host") {
        AppStore.addHostInfo("audio", user.audioTrack);
      } else {
        AppStore.addTrack(uid, "audio", user.audioTrack);
      }
    }
  }

  handleUserInfoUpdated(user, msg) {
    console.log("USER INFO UPDATED? -->", user);
    const id = user;
    if (msg === "mute-audio") {
      AppStore.handleMediaMute(id, AUDIO_MUTE, true);
    } else if (msg === "unmute-audio") {
      AppStore.handleMediaMute(id, AUDIO_MUTE, false);
    }
    if (msg === "mute-video") {
      AppStore.handleMediaMute(id, VIDEO_MUTE, true);
    } else if (msg === "unmute-video") {
      AppStore.handleMediaMute(id, VIDEO_MUTE, false);
    }
  }

  handleUserPublished(user, mediaType) {
    // TODO: remove console.log
    console.log("published User info: -->", user);
    this.subscribe(user, mediaType);
  }

  whoIsTheSpeaker(result) {
    let highestVolumeLevel = 0;
    let speakerId = "";

    if (result) {
      result.forEach((volume) => {

        if (volume.uid && volume.uid !== "host") {
          if (volume.level > highestVolumeLevel) {
            speakerId = volume.uid;
            highestVolumeLevel = volume.level;
          }
        }
      });

      if (speakerId && highestVolumeLevel > 0.05) { //Need some checking, just adding a level now
        AppStore.setCurrentSpeaker(speakerId);
        //AppStore.sortSpeakers();
      } else {
        AppStore.setCurrentSpeaker("");
      }
    }
  }

  handleAudioMute(uid, muted) {
    const userDiv = document.getElementById(uid);
    if (userDiv) {
      const badgeMute = userDiv.getElementsByClassName("badge-mute")[0];
      if (muted === true) {
        badgeMute.style.display = "block";
      } else {
        badgeMute.style.display = "none";
      }
    }
  }

  async getEventDetails(userId) {
    const {channel = ""} = EventApi.tokenDetails;

    if (channel.length) {
      console.log("USER JOINED -> Event Details");
      await EventApi.getEventDetailByID(channel);
      AppStore.addAudience(userId);
      EventApi.getProducts(channel);
    }
  }

  handleUserJoined(user) {
    console.log("USER JOINED --> ", user.uid);
    if (user.uid !== "host") {
      console.log("USER JOINED host --->", user.uid);
      this.getEventDetails(user.uid);
    }
  }

  handleUserLeft(user) {
    AppStore.removeAudience(user.uid);
  }

  async startBasicCall() {
    await this.client.setClientRole(clientOptions.role);

    this.client.on("user-joined", (user) => this.handleUserJoined(user));
    this.client.on("user-published", (user, mediaType) => this.handleUserPublished(user, mediaType));
    this.client.on("user-info-updated", (user, msg) => this.handleUserInfoUpdated(user, msg));
    this.client.on("user-left", (user) => this.handleUserLeft(user));

    // check audio level
    this.client.enableAudioVolumeIndicator();
    this.client.on("volume-indicator", (result) => this.whoIsTheSpeaker(result));


    //const channel = this.searchParams.get('id');
    // const hostDetails = await EventApi.hostJoinEvent(channel);
    const {appId, agoraToken = "", id: uidHost = "host", channel} = clientOptions;

    //const token = cookies.get("agoraToken");

    const uid = await this.client.join(appId, channel, agoraToken, uidHost.toString());

    this.localUid = uid.toString();
    AppStore.localUid = this.localUid;

    const VideoEncoderConfigurationPreset = this.isHost ? "480p_8" : "120p_3";

    this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: VideoEncoderConfigurationPreset
    });

    if (clientOptions.role === "host") {
      // publish local tracks to channel
      await this.client.publish(Object.values(this.localTracks));
    }

    await this.getEventDetails();

    AppStore.addHostInfo("audio", this.localTracks.audioTrack);
    AppStore.addHostInfo("video", this.localTracks.videoTrack);
    AppStore.addHostInfo("tag", "You");
    AppStore.addHostInfo("ref", React.createRef());
  }

  handleResize() {
    const localPlayerBoundary = document.getElementsByClassName("host-player")[0].getBoundingClientRect();
    this.setState({
      localPlayerContainerWidth: localPlayerBoundary.width,
      localPlayerContainerHeight: localPlayerBoundary.height,
    });
  }

  blockBackButton() {
    window.history.pushState(null, "", document.URL);
    window.addEventListener('popstate', function () {
      window.history.pushState(null, "", document.URL);
    });
  }

  componentDidMount() {
    this.blockBackButton();
    this.startBasicCall();
    EventApi.getProducts(this.searchParams.get('id'));

    const localPlayerBoundary = document.getElementsByClassName("host-player")[0].getBoundingClientRect();
    this.setState({
      localPlayerContainerHeight: localPlayerBoundary.height,
      localPlayerContainerWidth: localPlayerBoundary.width
    });

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() =>
        this.handleResize(), 500);
    });
  }

  handleAudio() {
    const isAudioActive = !this.state.isAudioActive;
    AppStore.handleMediaMute(this.localUid, AUDIO_MUTE, !isAudioActive);
    this.localTracks.audioTrack.setEnabled(isAudioActive);
    this.setState({isAudioActive});
    // this.localStream.getAudioTracks()[0].enabled = isAudioActive;
    // this.setState({isAudioActive});
  }

  handleVideo() {
    const isVideoActive = !this.state.isVideoActive;
    this.localTracks.videoTrack.setEnabled(isVideoActive);
    this.setState({isVideoActive});
    // this.localStream.getVideoTracks()[0].enabled = isVideoActive;
    // this.setState({isVideoActive});
  }

  setVideoEncoderConfigurationPreset(value) {
    this.localTracks.videoTrack.setEncoderConfiguration(value)
  }

  render() {
    //console.log("RENDER TOKEN ->", UserApi.agoraToken);
    const {isAudioActive, isVideoActive, localPlayerContainerWidth, localPlayerContainerHeight} = this.state;
    return (
      <div className="client-container">
        <div className="host-audience-container">
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <LocalPlayerAspectRatio
                height={localPlayerContainerHeight}
                width={localPlayerContainerWidth}
                idealHeight={window.innerHeight - 250}
                idealWidth={window.innerWidth * 0.75 - 48}
                className="player host-player"
                id="host">
                <Host/>
                <HighlightedProducts />
                <ProductList />
              </LocalPlayerAspectRatio>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <CarouselAspectRatio
                height={localPlayerContainerHeight}
                width={localPlayerContainerWidth}
                idealHeight={window.innerHeight - 250}
                idealWidth={window.innerWidth - 68}
                id="remote-users-wrapper"
              >
                <ScrollContainer className="remote-users-container">
                  <Audiences/>
                </ScrollContainer>
              </CarouselAspectRatio>
            </Col>
          </Row>
        </div>
        <div className="audio-video-controller">
          <div
            onClick={() => this.handleVideo()}
            className={`${isVideoActive ? "active-media" : "not-active-media"} camera-mic-buttons`}>
            {isVideoActive && (<img
              alt="Video Off"
              src={VideoOn}/>)}

            {!isVideoActive && (<img
              alt="Video On"
              src={VideoOff}/>)}
          </div>
          <div
            onClick={() => this.handleAudio()}
            className={`${isAudioActive ? "active-media" : "not-active-media"} camera-mic-buttons`}>
            {isAudioActive && (<img
              alt="Mic On"
              src={MicOn}/>)}
            {!isAudioActive && (<img
              alt="Mic Off"
              src={MicOff}/>)}
          </div>
          <div className="active-media camera-mic-buttons">
            <img
              alt="Hand Raise"
              src={Hand}/>
          </div>
          <div className="active-media camera-mic-buttons">
            <img
              alt="Chat"
              src={Chat}/>
          </div>
          {this.isHost && (
            <>
              <label>16:9</label>
              <Select
                defaultValue="480p_8"
                style={{width: 120}}
                onChange={(value) => this.setVideoEncoderConfigurationPreset(value)}>
                <Select.Option value="180p_1">180p_1</Select.Option>
                <Select.Option value="360p_1">360p_1</Select.Option>
                <Select.Option value="480p_8">480p_8</Select.Option>
                <Select.Option value="720p_1">720p_1</Select.Option>
                <Select.Option value="1080p_1">1080p_1</Select.Option>
                <Select.Option value="1440p_1">1440p_1</Select.Option>
              </Select>
              <label>Square</label>
              <Select
                defaultValue="480p_6"
                style={{width: 120}}
                onChange={(value) => this.setVideoEncoderConfigurationPreset(value)}>
                <Select.Option value="120p_3">120p_3</Select.Option>
                <Select.Option value="180p_3">180p_3</Select.Option>
                <Select.Option value="240p_3">240p_3</Select.Option>
                <Select.Option value="360p_3">360p_3</Select.Option>
                <Select.Option value="480p_6">480p_6</Select.Option>
                <Select.Option value="720p_5">720p_5</Select.Option>
              </Select>
            </>
          )}
        </div>
      </div>
    )

  }
}


export default withRouter(observer(Client));
