import React, {Component} from "react";
import {observer} from "mobx-react";
import AppStore from "stores/AppStore";
import MicMuted from "assets/controls/mic/MicOff.svg";
import {AgoraVideoPlayer} from "agora-rtc-react";

class Host extends Component {
  render() {
    const hostInfo = AppStore.hostInfo;
    const badgeMuteClass = hostInfo.audiomute ? "badge-mute-show" : "badge-mute-hide";

    AppStore.localUid !== "host" && hostInfo["audio"] && hostInfo["audio"].play();
    return (
      (hostInfo.video && !hostInfo.videomute) ?
        <AgoraVideoPlayer videoTrack={hostInfo.video}  >
          <div className="name-tag">{hostInfo.tag}</div>
          <div className={"badge-mute " + badgeMuteClass}>
            <img src={MicMuted} alt="Mic" />
          </div>
        </AgoraVideoPlayer> : <div className="empty-video-container">
          {hostInfo.tag && <div className="name-tag">{hostInfo.tag}</div>}
          <div className={"badge-mute " + badgeMuteClass}>
            <img src={MicMuted} alt="Mic" />
          </div>
        </div>
    );
  }
}

export default observer(Host);
