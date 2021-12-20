import {Component} from "react";
import {observer} from "mobx-react";
import {toJS} from "mobx";
import AppStore from "stores/AppStore";
import EventApi from "stores/api/EventApi";

import { AgoraVideoPlayer} from "agora-rtc-react";
import MicMuted from "assets/controls/mic/MicOff.svg";

class Audiences extends Component {
  render() {
    const audiences = AppStore.audiences;
    const currentSpeaker = AppStore.currentSpeaker;
    const participants = EventApi.eventDetails.participants;
    console.log("Participants ---->", toJS(participants));
    console.log("Audience Participants --->", toJS(audiences));
    return (
      // !!participants.length &&
      audiences.map((audience, index) => {
        //No more self echo, no need to play your own audio track
        audience.uid !== AppStore.localUid && audience.audio && audience.audio.play();
        const badgeMuteClass = audience.audiomute ? "badge-mute-show" : "badge-mute-hide";
        const currentSpeakerClass = (currentSpeaker === audience.uid) ? 'current-speaker' : '';
        const participant = participants.find(
          (participant) => participant.id.toString() === audience.uid
        );

        //for video mute showing a placeholder with empty-video-container class with black bg
        //Can be refactored to make it better
        return (audience.video && !audience.videomute) ?
          <div className={"player-container-aspect-ratio " + currentSpeakerClass} key={audience.uid}>
            <AgoraVideoPlayer className="video-container this-agora" videoTrack={audience.video}  >
              <div className="name-tag">{`test`}</div>
              <div className={"badge-mute " + badgeMuteClass}>
                <img src={MicMuted} alt="Mic" />
              </div>
            </AgoraVideoPlayer>
          </div> : <div className={"player-container-aspect-ratio " + currentSpeakerClass} key={audience.uid}>
            <div className="video-container empty-video-container">
              <div className="name-tag">{`test`}</div>
              <div className={"badge-mute " + badgeMuteClass}>
                <img src={MicMuted} alt="Mic" />
              </div>
            </div>
          </div>
      })
    );
  }
}

export default observer(Audiences);
