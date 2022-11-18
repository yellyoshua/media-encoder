package cmd

import (
	"os"

	"github.com/yellyoshua/media-encoder/media"
)

func main() {
	// get args from command line
	// Use: ./process filepath resolution bitrate crf preset
	// Example: ./process movie.mk 1080 5000 22 ultrafast

	args := os.Args[1:]

	if len(args) == 0 || len(args) < 4 {
		panic("No arguments provided")
	}

	filepath := get_arg(args, "filepath", "")
	resolution := get_arg(args, "resolution", "1080")
	bitrate := get_arg(args, "bitrate", "5000")
	crf := get_arg(args, "crf", "22")
	preset := get_arg(args, "preset", "ultrafast")

	movie := media.MovieFile{
		Filename: filepath,
	}

	media.ProcessMovieStruct(movie, "")

	// ffmpeg -i ./onedrive/movies/fantasia-2000-1080p-latino-ingles.mkv -preset ultrafast -crf 22 -movflags +faststart -vf scale=-2:1080 ./onedrive/movies/fantasia-2000/fantasia-2000.1080.mkv

}

func get_arg(args []string, option string, defaultValue string) string {
	switch option {
	case "filepath":
		if len(args[0]) > 0 {
			return args[0]
		}
		return defaultValue
	case "resolution":
		if len(args[1]) > 0 {
			return args[1]
		}
		return defaultValue
	case "bitrate":
		if len(args[2]) > 0 {
			return args[2]
		}
		return defaultValue
	case "crf":
		if len(args[3]) > 0 {
			return args[3]
		}
		return defaultValue
	case "preset":
		if len(args[4]) > 0 {
			return args[4]
		}
		return defaultValue
	default:
		return defaultValue
	}
}
