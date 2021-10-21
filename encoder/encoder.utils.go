package encoder

import (
	"fmt"
	"path"
	"strconv"

	"github.com/yellyoshua/media-encoder/media"
)

func loadEncoderPreset(coder Coder) string {
	switch coder.Preset {
	case "slow":
		return "slow"
	case "fast":
		return "fast"
	default:
		return "slow"
	}
}

func loadQuality(coder Coder) string {
	defaultQuality := "22"

	quality, err := strconv.ParseInt(coder.Quality, 10, 64)
	if err != nil {
		panic(err.Error())
	}

	if quality >= 50 {
		return defaultQuality
	}

	if quality <= 0 {
		return defaultQuality
	}

	return coder.Quality
}

func loadResolution(coder Coder) string {
	switch coder.Resolution {
	case "1080":
		return "1080"
	case "720":
		return "720"
	case "480":
		return "480"
	default:
		return "720"
	}
}

func parseResolutionFlag(resolution string) string {
	return fmt.Sprintf("scale=-2:%s", resolution)
}

func parseMovieFileName(movie media.Movie, resolution string) string {
	return fmt.Sprintf("%s - %sp.%s", movie.NewFileName, resolution, movie.MovieExtension)
}

func parseMovieFullPath(out string, movieName string) string {
	return path.Join(out, movieName)
}
