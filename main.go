package main

import "github.com/yellyoshua/media-encoder/cmd"

// func processVideoFile(m Movie, q string, wg *sync.WaitGroup) {
// 	defer wg.Done()

// 	if err := executeCommand(m, q); err != nil {
// 		fmt.Printf("SKIPED!! File (%s) - in quality (%s)\n", m.NewFileName, q)
// 	}

// }

// func productionProcess(withPanic bool) {
// 	pwd := getWD()
// 	jsonFileEntryData := "movies-list.json"

// 	moviesList := make([]Movie, 0)

// 	jsonBytesOfData := getJSONData(path.Join(pwd, jsonFileEntryData))

// 	if err := json.Unmarshal(jsonBytesOfData, &moviesList); err != nil {
// 		panic(err)
// 	}

// 	fmt.Printf("Creating folders\n")
// 	for _, m := range moviesList {
// 		createFolder(m)
// 	}
// 	fmt.Printf("Done folders\n")

// 	fmt.Printf("Converting files\n")
// 	for _, m := range moviesList {
// 		for _, q := range m.Quality {
// 			if err := executeCommand(m, q); err != nil {
// 				message := fmt.Sprintf("SKIPED!!\nFile (%s) - in quality (%s)\n\n\n%s", m.NewFileName, q, err.Error())
// 				if withPanic {
// 					panic(message)
// 				} else {
// 					fmt.Println(message)
// 				}
// 			}
// 		}

// 		fmt.Printf("Done file (%s) - in quality\n", m.NewFileName)
// 	}

// 	fmt.Printf("Done files\n")
// }

func main() {
	if err := cmd.Init(); err != nil {
		panic(err)
	}
	// var isLocal bool = false

	// if isLocal {
	// 	if err := executeCommand(Movie{
	// 		Filename:       "video-720-2.mp4",
	// 		NewPath:        "out",
	// 		NewFileName:    "video-720-2",
	// 		MovieExtension: "mp4",
	// 		CurrentQuality: []string{},
	// 		Quality:        []string{"720", "480"},
	// 	}, "724"); err != nil {
	// 		panic(err.Error())
	// 	}
	// } else {
	// 	productionProcess(false)
	// }
}

// ffmpeg -i ./onedrive/movies/fantasia-2000-1080p-latino-ingles.mkv -preset ultrafast -crf 22 -movflags +faststart -vf scale=-2:1080 ./onedrive/movies/fantasia-2000/fantasia-2000.1080.mkv
// export PATH=$PATH:/usr/local/go/bin

// go build -o videncode main.go
// screen -L ./videncode

// ls -l --block-size=M "onedrive/movies/100% Wolf 2020 lati"
