package encoder

import (
	"bytes"
	"fmt"
	"os/exec"

	"github.com/yellyoshua/media-encoder/media"
	"github.com/yellyoshua/media-encoder/utils"
)

type Coder struct {
	Preset     string
	Quality    string
	Resolution string
}

type Encoder interface {
	Command(coder Coder, movie media.Movie) Process
}

type Process interface {
	Run()
}

type process struct {
	output     string
	filename   string
	coder      *Coder
	binaryExec string
	cmd        []string
}

type encoder struct {
	coder *Coder
}

func NewEncoder() Encoder {
	return &encoder{}
}

func (e *encoder) Command(coder Coder, movie media.Movie) Process {
	e.coder = &coder

	binaryExec := "ffmpeg"

	inputFile := movie.Filename

	encodingPreset := loadEncoderPreset(coder)
	videoQuality := loadQuality(coder)
	resolution := loadResolution(coder)

	flagForOptimizeInBrowser := "+faststart"

	scale := parseResolutionFlag(resolution)

	outputFileName := parseMovieFileName(movie, resolution)

	outputFile := parseMovieFullPath(movie.NewPath, outputFileName)

	cmd := []string{"-y", "-i", inputFile, "-preset", encodingPreset, "-crf", videoQuality, "-movflags", flagForOptimizeInBrowser, "-vf", scale, outputFile}

	return &process{coder: &coder, output: movie.NewPath, filename: outputFileName, binaryExec: binaryExec, cmd: cmd}
}

func (p *process) Run() {
	utils.DeepFolderCreate(p.output)

	cmd := exec.Command(p.binaryExec, p.cmd...)

	fmt.Printf("Converting movie: (%s)\n", p.filename)

	// output command output
	// fmt.Println(cmd.String())

	var stderr bytes.Buffer
	var stdout bytes.Buffer

	cmd.Stderr = &stderr
	cmd.Stdout = &stdout

	err := cmd.Run()

	if err != nil {
		fmt.Println(stderr.String())
	}

	// if err := cmd.Wait(); err != nil {
	// 	fmt.Println(err.Error())
	// }
}

// func commandBuilder(pwd string, mov media.Movie, outputScale string) (string, []string) {
// 	binaryExec := "ffmpeg"

// 	inputFile := path.Join(pwd, mov.Filename)

// 	encodingPreset := "slow"
// 	videoQuality := "22"

// 	flagForOptimizeInBrowser := "+faststart"

// 	scale := fmt.Sprintf("scale=-2:%s", outputScale)

// 	outputFileName := fmt.Sprintf("%s - [%sp].%s", mov.NewFileName, outputScale, mov.MovieExtension)

// 	outputFile := path.Join(pwd, mov.NewPath, mov.NewFileName, outputFileName)

// 	return binaryExec, []string{"-y", "-i", inputFile, "-preset", encodingPreset, "-crf", videoQuality, "-movflags", flagForOptimizeInBrowser, "-vf", scale, outputFile}
// }
