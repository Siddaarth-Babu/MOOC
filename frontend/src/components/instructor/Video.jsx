import React from 'react'
import YouTube from 'react-youtube'

const Video = ({ videoId, title, description }) => {
  const opts = {
    height: '390',
    width: '100%',
    playerVars: { autoplay: 0 },
  }

  return (
    <div className="content-video-wrapper">
      <div className="content-video-container">
        {videoId && <YouTube videoId={videoId} opts={opts} />}
      </div>
      {title && <h3 className="content-item-title">{title}</h3>}
      {description && <p className="content-item-desc">{description}</p>}
    </div>
  )
}

export default Video
