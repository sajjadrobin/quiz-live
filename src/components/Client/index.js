import React, {Component, createRef} from "react";
import {v4 as uuidv4} from 'uuid';
import ScrollContainer from "react-indiana-drag-scroll";
import {Select} from "antd";
import AgoraRTC from "agora-rtc-sdk-ng";

import {LocalPlayerAspectRatio} from "./AspectRatio";

import VideoOff from "assets/controls/camera/VideoOff.png";
import VideoOn from "assets/controls/camera/VideoOn.png";
import MicOn from "assets/controls/mic/MicOn.png";
import MicOff from "assets/controls/mic/MicOff.png";

import clientOptions from "AgoraSettings";
import "./Client.scss";

class Client extends Component {
  localTracks = {
    videoTrack: null,
    audioTrack: null
  };

  client;
  urlParams = new URL(window.location.href).searchParams;

  remoteUsers = {};
  isHost = false;
  localPlayerContainerRef;

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
      localPlayerContainerHeight: 0

    };

    this.isHost = !!this.urlParams.get("host");
    this.localPlayerContainerRef = createRef();
  }

  buildAudienceContainer(uid) {
    const playerContainer = document.createElement("div");
    playerContainer.classList.add("video-container");
    playerContainer.style.transform = "rotateY(180deg)";

    const textContainer = document.createElement("div");
    textContainer.textContent = uid.toString().slice(0,5);
    textContainer.classList.add("name-tag");

    playerContainer.append(textContainer);

    return playerContainer;
  }

  async subscribe(user, mediaType) {
    const uid = user.uid;

    //subscribe to a remote user
    await this.client.subscribe(user, mediaType);
    console.log("subscribe success");

    if (mediaType === "video") {
      // Get `RemoteVideoTrack` in the `user` object.
      const remoteVideoTrack = user.videoTrack;
      if (uid === "host") {
        document.getElementById("local-player").classList.add("remote-host-view");
        remoteVideoTrack.play("local-player");

        const textContainer = document.createElement("div");
        textContainer.classList.add("name-tag-audience-view");
        textContainer.textContent = "Host";
        document.getElementById("local-player").append(textContainer);
      } else {
        const playerContainer = this.buildAudienceContainer(uid);

        const playerContainerAspectRatio = document.createElement("div");
        playerContainerAspectRatio.id = uid.toString();
        playerContainerAspectRatio.classList.add("player-container-aspect-ratio");
        playerContainerAspectRatio.append(playerContainer);

        document.getElementsByClassName("remote-users-container")[0].append(playerContainerAspectRatio);
        remoteVideoTrack.play(playerContainer);

      }
    }

    // If the subscribed track is audio.
    if (mediaType === "audio") {
      // Get `RemoteAudioTrack` in the `user` object.
      const remoteAudioTrack = user.audioTrack;
      // Play the audio track. No need to pass any DOM element.
      remoteAudioTrack.play();
    }
  }

  handleUserPublished(user, mediaType) {
    // TODO: remove console.log
    console.log("published User info: -->", user);

    const id = user.uid;
    this.remoteUsers[id] = user;
    this.subscribe(user, mediaType);
  }

  handleUserUnpublished(user) {
    const id = user.uid;
    delete this.remoteUsers[id];

    // Get the dynamically created DIV container.
    const playerContainer = document.getElementById(user.uid);
    // Destroy the container.
    if (playerContainer) {
      playerContainer.remove();
    }

    //this.leaveCall();
  }

  async startBasicCall() {
    await this.client.setClientRole(clientOptions.role);

    //if (this.clientOptions.role === "audience") {
    this.client.on("user-published", (user, mediaType) => this.handleUserPublished(user, mediaType));
    this.client.on("user-unpublished", (user, mediaType) => this.handleUserUnpublished(user));
    //}

    const {appId, channel, token} = clientOptions;
    const uidHost = this.urlParams.get("host") ? "host" : uuidv4();
    const uid = await this.client.join(appId, channel, token, uidHost);


    //TODO: remove log
    console.log("local userID -->", uid);

    const VideoEncoderConfigurationPreset = this.isHost? "480p_1" : "120p_1";

    //if (this.clientOptions.role === "host") {
    // create local audio and video tracks
    this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: VideoEncoderConfigurationPreset
    });

    if (this.isHost) {
      // play local video track
      this.localTracks.videoTrack.play("local-player");

      const textContainer = document.createElement("div");
      textContainer.classList.add("name-tag");
      textContainer.textContent = "You";
      document.getElementById("local-player").append(textContainer);
    } else {
      const playerContainer = this.buildAudienceContainer(uid.toString());

      const playerContainerAspectRatio = document.createElement("div");
      playerContainerAspectRatio.id = uid.toString();
      playerContainerAspectRatio.classList.add("player-container-aspect-ratio");
      playerContainerAspectRatio.append(playerContainer);

      document.getElementsByClassName("remote-users-container")[0].append(playerContainerAspectRatio);
      this.localTracks.videoTrack.play(playerContainer);
    }

    if (clientOptions.role === "host") {
      // publish local tracks to channel
      await this.client.publish(Object.values(this.localTracks));
      console.log("publish success");
    }

    this.localTracks.audioTrack.setVolume(100);
  }

  async leaveCall() {
    // Destroy the local audio and video tracks.
    this.localTracks.audioTrack.close();
    this.localTracks.videoTrack.close();

    // Traverse all remote users.
    this.remoteUsers.forEach((user) => {
      // Destroy the dynamically created DIV container.
      const playerContainer = document.getElementById(user.uid);
      playerContainer && playerContainer.remove();
    });

    // Leave the channel.
    await this.client.leave();
  }

  componentDidMount() {
    this.startBasicCall();

    // TODO: remove console.log
    console.log("local ref ---> ", this.localPlayerContainerRef);
    this.setState({
      localPlayerContainerHeight: window.innerHeight - 194,
      localPlayerContainerWidth: window.innerWidth * 0.75
    });

  }

  handleAudio(type) {
    switch (type) {
      case "mute":
        this.localTracks.audioTrack.setVolume(0);
        this.setState({isAudioActive: false});
        break;

      case "unmute":
        this.localTracks.audioTrack.setVolume(100);
        this.setState({isAudioActive: true});
        break;
    }
  }

  handleVideo(type) {
    switch (type) {
      case "off":
        this.localTracks.videoTrack.setEnabled(false);
        this.setState({isVideoActive: false});
        break;
      case "on":
        this.localTracks.videoTrack.setEnabled(true);
        this.setState({isVideoActive: true})
        break;
    }
  }

  setVideoEncoderConfigurationPreset(value) {
    this.localTracks.videoTrack.setEncoderConfiguration(value)
  }

  render() {
    const {isAudioActive, isVideoActive, localPlayerContainerHeight, localPlayerContainerWidth} = this.state;
    return (
      <div className="client-container">
        <LocalPlayerAspectRatio
          height={localPlayerContainerHeight}
          width={localPlayerContainerWidth}
          ref={this.localPlayerContainerRef}>
          <div id="local-player" className="player"/>
        </LocalPlayerAspectRatio>
        <ScrollContainer className="remote-users-container"/>
        <div className="audio-video-controller">
          {isVideoActive && (<img
            onClick={() => this.handleVideo("off")}
            alt="Video Off"
            src={VideoOn}/>)}

          {!isVideoActive && (<img
            onClick={() => this.handleVideo("on")}
            alt="Video On"
            src={VideoOff}/>)}

          {isAudioActive && (<img
            onClick={() => this.handleAudio("mute")}
            alt="Mic On"
            src={MicOn}/>)}
          {!isAudioActive && (<img
            onClick={() => this.handleAudio("unmute")}
            alt="Mic Off"
            src={MicOff}/>)}

          <Select
            defaultValue="480p_1"
            style={{ width: 120 }}
            onChange={(value)=>this.setVideoEncoderConfigurationPreset(value)}>
            <Select.Option value="120p_1">120p_1</Select.Option>
            <Select.Option value="180p_1">180p_1</Select.Option>
            <Select.Option value="240p_1">240p_1</Select.Option>
            <Select.Option value="480p_1">480p_1</Select.Option>
            <Select.Option value="720p_1">720p_1</Select.Option>
            <Select.Option value="1440p_1">1440p_1</Select.Option>
          </Select>
        </div>
      </div>
    )
  }
}


export default Client;
