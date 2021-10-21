package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
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
