package main

import "github.com/yellyoshua/media-encoder/cmd"

func main() {
	if err := cmd.Init(); err != nil {
		panic(err)
	}
}
