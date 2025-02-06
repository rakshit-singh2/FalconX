import React from 'react'

const Video = ({link}) => {


    let embedUrl;

    if (!link) {
        return;
    } else if  (link.includes('embed')) {
        embedUrl = link;
    } else {
        let videoId;
        if (link.includes('v=')) {
            videoId = link.split('v=')[1]?.split('&')[0];
        } else if (link.includes('youtu.be/')) {
            videoId = link.split('youtu.be/')[1];
        }

        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else {
            console.error("Invalid YouTube URL");
            return null;
        }
    }
  return (
    <div className='boxc'>
        <iframe width="100%" height="400" src={embedUrl} title="🔸PipiLol - A Simple Dive into the Hidden Gem on #Core🔸" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>
  )
}

export default Video