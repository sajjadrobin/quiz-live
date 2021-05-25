import {Component, createRef} from "react";
import MicMuted from "assets/controls/mic/MicMuted.png";
import {observer} from "mobx-react";

class Audience extends Component {
  videoRef;

  constructor(props) {
    super(props);
    this.videoRef = createRef()
  }

  playTracks() {
    const {tracks} = this.props;
    tracks.audio && tracks.audio.play();
    tracks.video && tracks.video.play(this.videoRef.current);
  }

  render() {
    const {uid} = this.props;
    this.playTracks();
    return (<div className="player-container-aspect-ratio" id={uid}>
      <div className="video-container" ref={this.videoRef}>
        <div className="name-tag">{uid}</div>
        <div className="badge-mute">
          <img src={MicMuted} alt="Mic" />
        </div>
      </div>
    </div>);
  }
}

export default observer(Audience);
