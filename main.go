package main

import "github.com/yellyoshua/media-encoder/cmd"

func main() {
	if err := cmd.Init(); err != nil {
		panic(err)
	}
}

// ffmpeg -i ./onedrive/movies/fantasia-2000-1080p-latino-ingles.mkv -preset ultrafast -crf 22 -movflags +faststart -vf scale=-2:1080 ./onedrive/movies/fantasia-2000/fantasia-2000.1080.mkv
// export PATH=$PATH:/usr/local/go/bin

// go build -o videncode main.go
// screen -L ./videncode

// ./videncode build -o ../movies-list.json -m ../onedrive/new-movies -e ../onedrive/new-movies
// screen -L ./videncode process -i ../movies-list.json

// screen -L ./videncode build -o ../movies-list.json -m ../onedrive/new-movies -e ../onedrive/new-movies
// Ctrl-a d -> "Detach screen"

// ls -l --block-size=M "onedrive/movies/100% Wolf 2020 lati"
