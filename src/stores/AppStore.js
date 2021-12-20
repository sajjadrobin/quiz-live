import {
  action,
  computed,
  makeObservable,
  observable,
} from "mobx";

class AppStore {
  audiences = [];
  host = {
    video: null,
    audio: null,
    tag: null,
    ref: null,
    videomute: false,
    audiomute: false
  };
  ver = 0;
  localUid = "";
  currentSpeaker = "";

  constructor() {
    makeObservable(this, {
      audiences: observable,
      host: observable,
      ver: observable,
      localUid: observable,
      currentSpeaker: observable,
      addHostInfo: action,
      addAudience: action,
      removeAudience: action,
      addTrack: action,
      handleMediaMute: action,
      setCurrentSpeaker: action,
      sortSpeakers: action,
      allAudiences: computed,
      hostInfo: computed
    });
  }

  addAudience(uid) {
    const index = this.audiences.findIndex((a) => a.uid === uid);
    if(uid && index === -1) {
      this.audiences.push({
        uid: uid, audio: null, video: null, audiomute: null, videomute: null
      });
    }
  }

  removeAudience(uid) {
    if(uid === "host") {
      this.host =  {
        video: null,
        audio: null,
        tag: null
      };
    } else {
      const index = this.audiences.findIndex((a) => a.uid === uid);
      if (index !== -1) {
        const oldAudiences = this.audiences;
        oldAudiences.splice(index, 1);
        this.audiences = oldAudiences;
      }
    }
  }

  addTrack(uid, type, track) {
    const oldAudiences = this.audiences;
    const index = oldAudiences.findIndex((a) => a.uid === uid);
    if(index !== -1) {
      const audience = oldAudiences[index];
      audience[type] = track;
      oldAudiences.splice(index, 1, audience);
      this.audiences = oldAudiences;
    }
  }

  handleMediaMute(uid, type, muted) {
    console.log("UID : " + uid + ", TYPE: " + type);
    if(uid === "host") {
      this.host[type] = muted;
    } else {
      const oldAudiences = this.audiences;
      const index = oldAudiences.findIndex((a) => a.uid === uid);
      if (index > -1) {
        const audience = oldAudiences[index];
        //const muteType = type + "mute";
        audience[type] = muted;
        oldAudiences.splice(index, 1, audience);
        this.audiences = oldAudiences;
      }
    }
  }

  addHostInfo(key, value) {
    this.host[key] = value;
  }

  setCurrentSpeaker(uid) {
    this.currentSpeaker = uid;
    if(uid.length) this.sortSpeakers();
  }

  sortSpeakers() {
    const index = this.audiences.findIndex((a) => a.uid === this.currentSpeaker);
    (index > -1) && this.audiences.splice(0, 0, this.audiences.splice(index, 1)[0]);
  }

  get allAudiences() {
    return this.audiences;
  }

  get hostInfo() {
    return this.host;
  }
}

export default new AppStore();
