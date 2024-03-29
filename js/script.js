// Fetching songs from http://127.0.0.1:3000/songs/
let songs;
let currentSong = new Audio();
let currFolder;
let bar;
// Song time converter
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function fetchSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  // console.log(as);'
  // using tradtional for loop
  // for (let index = 0; index < as.length; index++) {
  //   const element = as[index];
  //   if(element.href.endsWith(".mp3")){
  //     songs.push(element.href)
  //   }
  // }

  // using for each loop
  songs = [];
  Array.from(as).forEach((a) => {
    if (a.href.endsWith(".mp3")) {
      songs.push(a.href.replace(`http://127.0.0.1:3000/${currFolder}/`, ""));
      // songs.push(a.href.split(`/${currFolder}/`)[1]);
    }
  });
  // Load the first song and update the duration
  if (songs.length > 0) {
    let firstSong = new Audio(`/${currFolder}/` + songs[0]);
    firstSong.onloadedmetadata = () => {
      document.querySelector(
        ".songtime"
      ).innerHTML = `00:00/${secondsToMinutesSeconds(firstSong.duration)}`;
    };
    firstSong.onloadeddata = () => {
      firstSong.remove();
    };
  }
  // Appending the songs in SongList/Playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  songs.forEach((song) => {
    songUl.innerHTML += `<li>   <img class="invert" src="img/song.svg" >
    <div class="info">
      <span>${
        song
          .replaceAll("%20", " ")
          .replaceAll("%28", " ")
          .replaceAll("%29", " ")
        // .replace(".mp3","")
      }</span>
      <span>- Ayush</span>
    </div>
    <div class="playnow">
      <span>Play Now</span>
      <img class="invert" src="img/playsong.svg" >
    </div></li>`;
  });

  // Attaching event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((li) => {
    li.addEventListener("click", (element) => {
      playMusic(li.querySelector(".info").firstElementChild.innerHTML.trim());
      //  console.log(li.querySelector(".info").firstElementChild.innerHTML.trim())
    });
  });

  //Playing the first song
  playMusic(songs[0], true);
  return songs;
}
// PlayMusic function
function playMusic(song, pause = false) {
  currentSong.src = `/${currFolder}/` + song;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = song
    .replaceAll("%20", " ")
    .replaceAll("%28", " ")
    .replaceAll("%29", " ");
  // document.querySelector(".songtime").innerHTML = `00:00/00:00`;
}

async function displayAlbum() {
  let cardContainer = document.querySelector(".cardContainer");
  let a = await fetch("http://127.0.0.1:3000/songs");
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  for (let index = 0; index < as.length - 1; index++) {
    const element = as[index];
    if (element.href.includes("/songs/")) {
      // console.log(element.href.split("/").slice(-2)[0]);
      let folder = element.href.split("/").slice(-2)[0];
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
      <div class="play">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 20V4L19 12L5 20Z"
            stroke="#141B34"
            stroke-width="1.5"
            stroke-linejoin="round"
            fill="#000"
          />
        </svg>
      </div>
      <img
        src="songs/${folder}/cover.jpg"
        alt=""
      />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`;
    }
  }
  // Load the playlists when clicked on the card
  Array.from(document.querySelectorAll(".cardContainer .card")).forEach(
    (card) => {
      card.addEventListener("click", async (e) => {
        await fetchSongs(`songs/${e.currentTarget.dataset.folder}`);
        playMusic(songs[0]);
      });
    }
  );
}
function timeupdate() {
  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
}
async function main() {
  // Getting list of every song
  await fetchSongs("songs/ncs");

  // Display the albums dynamically
  displayAlbum();

  // Attach an event listener to play button
  let play = document.querySelector("#play");
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/playsong.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
    currentSong.play();
    play.src = "img/pause.svg";
  });

  // Add and event listener to previous and next
  let previous = document.querySelector("#previous");
  previous.addEventListener("click", (e) => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  let next = document.querySelector("#next");
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    // let index = songs.indexOf(currentSong.src.replace("http://127.0.0.1:3000/songs/",""))
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Adjusting the volume button
  let volume = document.querySelector("#volume");
  volume.addEventListener("change", (e) => {
    console.log("Settin volume to", e.target.value, "/100");
    currentSong.volume = parseInt(e.target.value) / 100;
    bar = document
      .querySelector(".range")
      .getElementsByTagName("input")[0].value;
  });

  // Muting the audio whenever the icon is clicked
  let volIc = document.querySelector(".volume img");
  let click = 0;
  let prevVol = currentSong.volume;

  volIc.addEventListener("click", () => {
    console.log(bar);
    if (click == 0) {
      volIc.src = "img/mute.svg";
      currentSong.volume = 0;
      click = 1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      volIc.src = "img/volume.svg";
      currentSong.volume = prevVol;
      click = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value =
        bar;
    }
  });
}
main();
