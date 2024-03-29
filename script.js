console.log("Lets write javascript");
let songs;
let currentSong = new Audio();
let bar;
let currFolder;
// let currFolder

// Function to convert the audio time in proper format
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
// Load the songs folder wise
async function fetchSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/songs/${folder}`);
  const response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  Array.from(as).forEach((a) => {
    if (a.href.endsWith(".mp3")) {
      songs.push(
        a.href
          .replace(`http://127.0.0.1:3000/songs/${folder}/`, "")
          .replace("%20", " ")
      );
    }
  });
  // Load the first song and update the duration
  if (songs.length > 0) {
    let firstSong = new Audio(`/songs/${folder}/` + songs[0]);
    firstSong.onloadedmetadata = () => {
      document.querySelector(
        ".songtime"
      ).innerHTML = `00:00/${secondsToMinutesSeconds(firstSong.duration)}`;
    };
    firstSong.onloadeddata = () => {
      firstSong.remove();
    };
  }
  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  songs.forEach((song) => {
    songUL.innerHTML += `<li> <img class="invert" src="img/song.svg" >
    <div class="info">
      <span>${song
        .replaceAll("%20", " ")
        .replaceAll("%28", " ")
        .replaceAll("%29", " ")
        .replaceAll(".mp3", "")}</span>
    </div>
    <div class="playnow">
      <span>Play Now</span>
      <img class="invert" src="img/playsong.svg" >
    </div></li>`;
  });

  //   Attach event listener to each song
  Array.from(songUL.getElementsByTagName("li")).forEach((li) => {
    li.addEventListener("click", (e) => {
      //   console.log(li.querySelector(".info").firstElementChild.innerHTML);
      playMusic(li.querySelector(".info").firstElementChild.innerHTML);
    });
  });
  // Load the first song of the playlist
  playMusic(songs[0], true);
}

// PlayMusic function
function playMusic(songName, pause = false) {
  currentSong.src = `http://127.0.0.1:3000/songs/${currFolder}/` + songName;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  //   play.src = "img/playsong.svg";
  document.querySelector(".songinfo").innerHTML = songName
    .replaceAll(".mp3", "")
    .replaceAll("%20", " ")
    .replaceAll("%28", " ")
    .replaceAll("%29", " ");

  // document.querySelector(".songtime").innerHTML = `00:00/00:00`;
}

// Display the album of all songs present at local device
async function displayAlbum() {
  let cardContainer = document.querySelector(".cardContainer");
  let a = await fetch("http://127.0.0.1:3000/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let folders = [];
  for (let index = 0; index < as.length - 1; index++) {
    const element = as[index];
    if (element.href.includes("/songs/")) {
      folders.push(element.href.split("/").slice(-2)[0]);
      //  console.log(element.href.split("/").slice(4)[0]);
    }
  }
  // console.log(folder);
  folders.forEach(async (folder) => {
    // Fetch the info.json and album image
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
    let res = await a.json();
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
  src="/songs/${folder}/cover.jpg"
  alt=""
/>
<h2>${res.title}</h2>
<p>${res.description}</p>
</div>
`;
    // Load the playlist whenever card is clicked
    Array.from(document.querySelectorAll(".cardContainer .card")).forEach(
      (card) => {
        card.addEventListener("click", async (e) => {
          // console.log(e.currentTarget.dataset.folder);
          await fetchSongs(e.currentTarget.dataset.folder);
          playMusic(songs[0]);
          // console.log(folder);
        });
      }
    );
  });
}
async function main() {
  await fetchSongs("Angry_(Mood)");

  displayAlbum();
  // Handline the play pause button
  document.querySelector("#play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/playsong.svg";
    }
  });

  // Update seekbar
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Controlling the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    console.log(e.offsetX, e.target.getBoundingClientRect().width);
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (percent * currentSong.duration) / 100;
    currentSong.play();
    play.src = "img/pause.svg";
  });

  // Controlling hamburger
  let bar = document.querySelector(".bars");
  let close = document.querySelector(".close");
  let leftCont = document.querySelector(".left");

  bar.addEventListener("click", (e) => {
    leftCont.style.left = "0";
  });
  close.addEventListener("click", () => {
    leftCont.style.left = "-120%";
  });
  // Adding event listener to previous and next
  let previous = document.querySelector("#previous");

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  let next = document.querySelector("#next");
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Controlling the volume
  document.querySelector(".range input").addEventListener("change", (e) => {
    //  console.log(e.target.value);
    currentSong.volume = e.target.value / 100;
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
