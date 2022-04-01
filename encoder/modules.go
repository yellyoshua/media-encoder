package encoder

import (
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/yellyoshua/media-encoder/utils"
)

func filterVideos(files *[]string, allowedExtensions []string) {
	var videosFile = make([]string, 0)

	for _, f := range *files {
		for _, e := range allowedExtensions {
			if strings.Contains(f, e) {
				videosFile = append(videosFile, f)
			}
		}
	}

	*files = videosFile
}

func videoDetails(f string) (VideoFile, error) {
	var video VideoFile

	splitVideoPath := strings.Split(filepath.ToSlash(f), "/")
	videoName := splitVideoPath[len(splitVideoPath)-1]

	splitByDot := strings.Split(videoName, ".")

	videoExtension := strings.Join(splitByDot[len(splitByDot)-1:], " ")
	videoExtension = strings.TrimSpace(videoExtension)

	return video, nil
}

func recopileVideosDetails(files []string) []VideoFile {
	var videos []VideoFile = make([]VideoFile, 0)

	for _, f := range files {
		v, err := videoDetails(f)
		if err == nil {
			videos = append(videos, v)
		}
	}

	return videos
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
