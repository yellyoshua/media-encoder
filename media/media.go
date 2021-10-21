package media

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/yellyoshua/media-encoder/utils"
)

type MovieFile struct {
	Filename string
}

type Movie struct {
	Filename       string   `json:"filename"`
	NewPath        string   `json:"newPath"`
	NewFileName    string   `json:"newFileName"`
	MovieExtension string   `json:"movieExtension"`
	CurrentQuality []string `json:"currentQuality"`
	Quality        []string `json:"quality"`
}

func QualitiesFilter(q string) []string {
	switch q {
	case "1080":
		return []string{"1080", "720"}
	case "720":
		return []string{"720", "480"}
	case "480":
		return []string{"480"}
	default:
		return []string{"720", "480"}
	}
}

func ProcessMovieStruct(primitiveMovie MovieFile, out string) (Movie, error) {
	qualitiesAllowed := []string{"1080", "720", "480"}
	fileNamePaths := strings.Split(filepath.ToSlash(primitiveMovie.Filename), "/")
	fullMovieName := fileNamePaths[len(fileNamePaths)-1]

	movieNameDotSplit := strings.Split(fullMovieName, ".")

	movieExtension := strings.Join(movieNameDotSplit[len(movieNameDotSplit)-1:], " ")
	movieExtension = strings.TrimSpace(movieExtension)

	movieWithNoExtension := strings.Join(movieNameDotSplit[:len(movieNameDotSplit)-1], " ")
	movieWithNoExtension = strings.TrimSpace(movieWithNoExtension)

	currentQuality := make([]string, 0)
	quality := make([]string, 0)

	for _, q := range qualitiesAllowed {
		containQualityInFileName := strings.Contains(fullMovieName, q)

		movieWithNoExtension = strings.ReplaceAll(movieWithNoExtension, fmt.Sprintf(`%sp`, q), "")
		movieWithNoExtension = strings.TrimSpace(movieWithNoExtension)
		if containQualityInFileName {
			currentQuality = append(currentQuality, q)
		}
	}

	if len(currentQuality) != 0 {
		for _, cq := range currentQuality {
			qualities := QualitiesFilter(cq)
			tempQualityList := append(quality, qualities...)
			quality = utils.FilterString(tempQualityList, func(w string, index int, prevList []string) bool {
				return utils.IndexOf(w, prevList) == index
			})
		}
	} else {
		qualities := QualitiesFilter("")
		tempQualityList := append(quality, qualities...)
		quality = utils.FilterString(tempQualityList, func(w string, index int, prevList []string) bool {
			return utils.IndexOf(w, prevList) == index
		})
	}

	if isOKMovieExtension(movieExtension) {
		return Movie{
			Filename:       utils.ParsePathWithPWD(primitiveMovie.Filename),
			NewPath:        utils.ParsePathWithPWD(filepath.Join(out, movieWithNoExtension)),
			NewFileName:    movieWithNoExtension,
			MovieExtension: movieExtension,
			CurrentQuality: currentQuality,
			Quality:        quality,
		}, nil
	}

	return Movie{}, errors.New("extension not allowed (allowed: mp4 and mkv)")
}

func isOKMovieExtension(extension string) bool {
	switch extension {
	case "mkv":
		return true
	case ".mkv":
		return true
	case ".mp4":
		return true
	case "mp4":
		return true
	default:
		return false
	}
}
