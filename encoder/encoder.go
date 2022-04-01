package encoder

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"os/exec"
	"sync"

	"github.com/yellyoshua/media-encoder/exceptions"
	"github.com/yellyoshua/media-encoder/utils"
)

type EncodeScale string

const HD EncodeScale = "1080"
const STANDARD EncodeScale = "720"
const MEDIA EncodeScale = "480"

type EncodePreset string

const SLOW EncodePreset = "slow"
const FAST EncodePreset = "fast"

type VideoPreset struct {
	encodePreset EncodePreset
	scale        EncodeScale
	quality      int
}

type Encoder interface {
	AddMovie(inputMovie string, outputMovie string, extension string) Process
}

type Process interface {
	Encode(preset VideoPreset, wg *sync.WaitGroup, t <-chan int, r chan<- error)
}

type process struct {
	inputMovie  string
	outputMovie string
	extension   string
}

type encoder struct{}

func New() Encoder {
	return &encoder{}
}

func (e *encoder) AddMovie(inputMovie string, outputMovie string, extension string) Process {
	return &process{inputMovie, outputMovie, extension}
}

func (p *process) Encode(preset VideoPreset, wg *sync.WaitGroup, t <-chan int, r chan<- error) {
	defer wg.Done()

	if err := utils.DeepFolderCreate(p.outputMovie); err != nil {
		<-t
		r <- err
		return
	}

	ffmpeg, err := configureFFMPEG(preset, p.inputMovie, p.outputMovie)
	if err != nil {
		<-t
		r <- err
		return
	}

	// output command output
	// fmt.Println(cmd.String())

	var stderr bytes.Buffer
	var stdout bytes.Buffer

	ffmpeg.Stderr = &stderr
	ffmpeg.Stdout = &stdout

	if err := ffmpeg.Run(); err != nil {
		fmt.Println(stderr.String())
		<-t
		r <- err
		return
	}

	<-t
	r <- nil
}

func configureFFMPEG(preset VideoPreset, inputMovie string, outputMovie string) (*exec.Cmd, error) {
	var err error
	var movie []byte
	var inputFile string
	var encodingPreset string
	var videoQuality string
	var flags string
	var scale string
	var outputFile string

	if _, err = ioutil.ReadFile(inputMovie); err != nil {
		return nil, err
	}

	movie, err = ioutil.ReadFile(outputMovie)
	if err != nil {
		return nil, err
	}

	if len(movie) > 0 {
		return nil, exceptions.MovieAlreadyExistException(outputMovie)
	}

	inputFile = inputMovie
	encodingPreset = fmt.Sprintf("-preset %v", preset.encodePreset)
	videoQuality = fmt.Sprintf("-crf %v", preset.quality)
	flags = fmt.Sprintf("-movflags %v", "+faststart")
	scale = fmt.Sprintf("-vf scale=-2:%v", preset.scale)
	outputFile = outputMovie

	return exec.Command(
		"ffmpeg",
		inputFile,
		encodingPreset,
		videoQuality,
		flags,
		scale,
		outputFile,
	), nil
}

// func (e *encoder) Command(coder Coder, movie media.Movie) Process {
// 	e.coder = &coder

// 	binaryExec := "ffmpeg"

// 	inputFile := movie.Filename

// 	encodingPreset := loadEncoderPreset(coder)
// 	videoQuality := loadQuality(coder)
// 	resolution := loadResolution(coder)

// 	flagForOptimizeInBrowser := "+faststart"

// 	scale := parseResolutionFlag(resolution)

// 	outputFileName := parseMovieFileName(movie, resolution)

// 	outputFile := parseMovieFullPath(movie.NewPath, outputFileName)

// 	cmd := []string{"-y", "-i", inputFile, "-preset", encodingPreset, "-crf", videoQuality, "-movflags", flagForOptimizeInBrowser, "-vf", scale, outputFile}

// 	return &process{coder: &coder, output: movie.NewPath, filename: outputFileName, binaryExec: binaryExec, cmd: cmd}
// }

// func (p *process) Run() {
// 	utils.DeepFolderCreate(p.output)

// 	cmd := exec.Command(p.binaryExec, p.cmd...)

// 	fmt.Printf("Converting movie: (%s)\n", p.filename)

// 	// output command output
// 	// fmt.Println(cmd.String())

// 	var stderr bytes.Buffer
// 	var stdout bytes.Buffer

// 	cmd.Stderr = &stderr
// 	cmd.Stdout = &stdout

// 	err := cmd.Run()

// 	if err != nil {
// 		fmt.Println(stderr.String())
// 	}
// }
