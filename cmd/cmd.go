package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/spf13/cobra"
	"github.com/yellyoshua/media-encoder/encoder"
	"github.com/yellyoshua/media-encoder/media"
	"github.com/yellyoshua/media-encoder/utils"
)

var OutputMoviesJSONFile string
var FolderToScanMovies string
var OutFolderProcessedMedia string

var CMDBuild = &cobra.Command{
	Use:   "build [string to print]",
	Short: "List of movies in to .json file",
	Run:   buildJSONCMD,
}

var CMDProcess = &cobra.Command{
	Use:   "process [string to print]",
	Short: "Process media from .json file provided",
	Run:   processMediaFromJSON,
}

func Init() error {
	CMDBuild.PersistentFlags().StringVarP(
		&OutputMoviesJSONFile,
		"output",
		"o",
		"movies-list.json",
		fmt.Sprintf("Output path of JSON Movies file (default: %s)", "movies-list.json"),
	)

	CMDBuild.PersistentFlags().StringVarP(
		&FolderToScanMovies,
		"media",
		"m",
		"movies",
		fmt.Sprintf("Folder for scan movies (default: %s)", "movies"),
	)

	CMDBuild.PersistentFlags().StringVarP(
		&OutFolderProcessedMedia,
		"export",
		"e",
		"encoded",
		fmt.Sprintf("Folder for processed media (default: %s)", "encoded"),
	)

	CMDProcess.PersistentFlags().StringVarP(
		&OutputMoviesJSONFile,
		"input",
		"i",
		"movies-list.json",
		fmt.Sprintf("JSON file with movies list (default: %s)", "movies-list.json"),
	)

	var rootCmd = &cobra.Command{Use: "videncode", Short: "videncode is a very fast video encoder with ffmpeg"}
	rootCmd.AddCommand(CMDBuild, CMDProcess)
	return rootCmd.Execute()
}

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

func processMediaFromJSON(cmd *cobra.Command, args []string) {
	var moviesList []media.Movie = make([]media.Movie, 0)
	jsonFile := OutputMoviesJSONFile

	if err := json.Unmarshal(utils.ReadFile(jsonFile), &moviesList); err != nil {
		panic(err)
	}

	for _, movie := range moviesList {
		for _, resolution := range movie.Quality {
			exec := encoder.NewEncoder().Command(encoder.Coder{
				Quality:    "22",
				Resolution: resolution,
				Preset:     "slow",
			}, movie)

			exec.Run()

			fmt.Println("--processed-file--")
		}
	}

}
