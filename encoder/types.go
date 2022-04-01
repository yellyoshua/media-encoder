package encoder

type VideoFile struct {
	Filename       string `json:"filename"`
	NewPath        string `json:"newPath"`
	NewFileName    string `json:"newFileName"`
	MovieExtension string `json:"movieExtension"`
	CurrentQuality string `json:"currentQuality"`
	Quality        string `json:"quality"`
}
