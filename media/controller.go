package media

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/spf13/cobra"
	"github.com/yellyoshua/media-encoder/utils"
)

func buildJSONCMD(cmd *cobra.Command, args []string) {
	out := OutputMoviesJSONFile
	existFolder := utils.ExistFolder(FolderToScanMovies)
	var jsonfiles []media.MovieFile = make([]media.MovieFile, 0)

	if !existFolder {
		panic(fmt.Sprintf("Folder provided not exist, %s", FolderToScanMovies))
	}

	files, err := utils.WalkFilesPath(FolderToScanMovies)
	if err != nil {
		panic(err)
	}

	var newMoviesList []media.Movie = make([]media.Movie, 0)

	for _, f := range files {
		jsonfiles = append(jsonfiles, media.MovieFile{Filename: f})
	}

	for _, f := range jsonfiles {
		movie, err := media.ProcessMovieStruct(f, OutFolderProcessedMedia)

		if err == nil {
			newMoviesList = append(newMoviesList, movie)
		}

	}

	file, _ := json.MarshalIndent(newMoviesList, "", " ")

	_ = ioutil.WriteFile(out, file, 0644)
}
