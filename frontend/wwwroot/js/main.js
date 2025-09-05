// Replace with your YouTube channel ID and API key
const CHANNEL_ID = 'UC2ZsXdZgEeZs8N1ypgbVXzg';
const API_KEY = 'AIzaSyAfOQuKrYKNcqrd5cTqfjGXyoAuNNyAM9Q';
const MAX_RESULTS = 12;

async function fetchLatestVideos() {
  const feedContainer = document.getElementById('youtube-feed');
  try {
    const response = await fetch(
     "http://localhost:5000/youtubevideos"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const jsonObj = data;
    const ytVids = jsonObj.YouTubeVideos.items;
    const profilePic = jsonObj.YouTubeProfile.items[0].snippet.thumbnails.high.url;

    if (jsonObj.YouTubeVideos.items && jsonObj.YouTubeVideos.items.length > 0) {
      displayVideos(ytVids, profilePic);
    } else {
      feedContainer.innerHTML = '<div class="error">No videos found</div>';
    }
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    feedContainer.innerHTML = '<div class="error">Failed to load videos. Please try again later.</div>';
  }
}

function displayVideos(videos, profilePic) {
  const feedContainer = document.getElementById('youtube-feed');

  feedContainer.innerHTML = videos.map(video => `
      <div class="video-card" onclick="openVideo('${video.id.videoId}')">
        <img 
          src="${video.snippet.thumbnails.medium.url}" 
          alt="${video.snippet.title}"
          class="video-thumbnail"
        >
        <div class="video-info">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <img src=${profilePic} style="width: 36px; border-radius: 50%;" />
            <div>
              <h3 class="video-title">${video.snippet.title}</h3>
              <div class="video-channel">${video.snippet.channelTitle}</div>
              <div class="video-meta">
                <span>${formatViewCount(video.statistics?.viewCount)} views</span>
                <span>&nbsp • &nbsp </span>
                <span>${formatDate(video.snippet.publishedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  `).join('');
}

function formatViewCount(viewCount) {
  if (!viewCount) return '0';
  const num = parseInt(viewCount);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function openVideo(videoId) {
  window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
}

// Load videos when page loads
document.addEventListener('DOMContentLoaded', fetchLatestVideos);

const scrollers = document.querySelectorAll(".scroller");

// If a user hasn't opted in for recuded motion, then we add the animation
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation();
}

function addAnimation() {
  scrollers.forEach((scroller) => {
    // add data-animated="true" to every `.scroller` on the page
    scroller.setAttribute("data-animated", true);

    // Make an array from the elements within `.scroller-inner`
    const scrollerInner = scroller.querySelector(".scroller__inner");
    const scrollerContent = Array.from(scrollerInner.children);

    // For each item in the array, clone it
    // add aria-hidden to it
    // add it into the `.scroller-inner`
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    });
  });
}

