## Videncode - Media Encoder (with ffmpeg)

#### `Powered by yellyoshua `

<a href="https://www.buymeacoffee.com/yellyoshua" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174" ></a>

---

##### (With2 easy steps) - Build JSON with folder of videos > Process the videos to the new folder or the same

Read the folders with a lot of videos and export to .json file and process the .json for encode the videos

---

Build

  `go build -o videncode main.go`

Read the folder that contains .mp4 and .mkv video extension, and create a .json file with this data.

-  For create a JSON file with the movies, you should run command:

    `videncode build -o <output .json generated> -m <media folder with videos> -e <export path for fideo processed>`

- After that JSON file be created, you must run the following command:

    `videncode process -i <.json generated>`

- Requirements:

    - apt install mkvtoolnix
    - apt install ffmpeg
    - apt install ffprobe