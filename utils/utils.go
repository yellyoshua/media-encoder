package utils

import (
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
)

type FilterStringFunc = func(w string, index int, prevList []string) bool

func FilterString(listWords []string, f FilterStringFunc) []string {
	var filteredWords = make([]string, 0)

	for index, w := range listWords {
		if f(w, index, listWords) {
			filteredWords = append(filteredWords, w)
		}
	}

	return filteredWords
}

func IndexOf(word string, data []string) int {
	for k, v := range data {
		if word == v {
			return k
		}
	}
	return -1
}

func GetWorkingDirectory() string {
	pwd, err := os.Getwd()

	if err != nil {
		panic(err)
	}

	return pwd
}

func ReadFile(filePath string) []byte {
	data, err := ioutil.ReadFile(filePath)

	if err != nil {
		panic(err)
	}

	return data
}

func DeepFolderCreate(folder string) error {
	newpath := filepath.Join(folder)
	err := os.MkdirAll(newpath, os.ModePerm)

	if err != nil {
		return nil
	}

	return nil
}

func ParsePathWithPWD(directory string) string {
	pwd := GetWorkingDirectory()
	return filepath.Join(pwd, path.Clean(directory))
}

func ExistFolder(folder string) bool {
	directory := ParsePathWithPWD(folder)
	_, err := os.Stat(directory)
	return err == nil
}

func WalkFilesPath(rootPath string) ([]string, error) {
	var files []string = make([]string, 0)

	if rootPath == "" {
		rootPath = "."
	}

	err := filepath.Walk(rootPath,
		func(filePath string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			files = append(files, filePath)
			return nil
		})

	return files, err
}
