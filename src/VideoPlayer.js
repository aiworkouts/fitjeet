import React, { Component } from 'react';

import { Player, ControlBar } from 'video-react';
import "video-react/dist/video-react.css";

import PubSub from 'pubsub-js'


const sources = {
  localMovie: 'assets/LowImpactCardio.mp4',
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  test: 'http://media.w3.org/2010/05/video/movie_300.webm'
};

export default class VideoPlayer extends Component {
  constructor(props, context) {
    super(props, context);
    console.log(`dataTrack`, props.dataTrack)
    this.state = {
      source: sources.localMovie,
      dataTrack: props.dataTrack
    };

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.load = this.load.bind(this);
    this.changeCurrentTime = this.changeCurrentTime.bind(this);
    this.seek = this.seek.bind(this);
    this.changePlaybackRateRate = this.changePlaybackRateRate.bind(this);
    this.changeVolume = this.changeVolume.bind(this);
    this.setMuted = this.setMuted.bind(this);
  }

  componentDidMount() {
    // subscribe state change
    this.player.subscribeToStateChange(this.handleStateChange.bind(this));
    if(!this.state.dataTrack) {
      var localThis = this;
      var mySubscriber = function (msg, data) {
        console.log( `video-subscriber`, msg, data );
        const remotePlayer = data.player;
        const localPlayer = localThis.player.getState().player;
        console.log(`remoteState: `, remotePlayer.paused, remotePlayer.currentTime)
        console.log(`localState: `, localPlayer.paused, localPlayer.currentTime)
        if(Math.abs(remotePlayer.currentTime - localPlayer.currentTime) > 4) {
          console.log(`SEEKING to catchup with the remote player`)
          localThis.player.seek(remotePlayer.currentTime);
        }
        if(remotePlayer.paused && !localPlayer.paused) {
          console.log(`PAUSING because remote player is paused`)
          localThis.pause()
        }
        if(!remotePlayer.paused && localPlayer.paused) {
          console.log(`PLAYING because remote player is playing`)
          localThis.play()
        }
      };
      var token = PubSub.subscribe('video-updates', mySubscriber);
      this.setState({token})
    }
  }
  componentWillUnmount() {
    if(this.state.token)
      PubSub.unsubscribe(this.state.token);
  }


  setMuted(muted) {
    return () => {
      this.player.muted = muted;
    };
  }

  handleStateChange(state) {
    // copy player state to this component's state
    const playerState = {
      player: state
    };
    this.setState(playerState);
    if(this.state.dataTrack) {
      this.state.dataTrack.send(JSON.stringify(playerState));
    }

  }

  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  load() {
    this.player.load();
  }

  changeCurrentTime(seconds) {
    return () => {
      const { player } = this.player.getState();
      this.player.seek(player.currentTime + seconds);
    };
  }

  seek(seconds) {
    return () => {
      this.player.seek(seconds);
    };
  }

  changePlaybackRateRate(steps) {
    return () => {
      const { player } = this.player.getState();
      this.player.playbackRate = player.playbackRate + steps;
    };
  }

  changeVolume(steps) {
    return () => {
      const { player } = this.player.getState();
      this.player.volume = player.volume + steps;
    };
  }

  changeSource(name) {
    return () => {
      this.setState({
        source: sources[name]
      });
      this.player.load();
    };
  }

  render() {
    return (
      <div>
        <Player
          playsInline
          muted
          fluid={false}
          height={520}
          poster="/assets/poster.png"
          ref={player => {
            this.player = player;
          }}
        >
          <source src={this.state.source} />
          <ControlBar autoHide={false} />
        </Player>
      </div>
    );
  }
}
