package exceptions

import (
	"fmt"
)

func MovieAlreadyExistException(outputMovie string) error {
	return fmt.Errorf("movie with the name \"%s\" already created", outputMovie)
}

func NonExistFolderException(folder string) error {
	return fmt.Errorf("folder not exist %s", folder)
}
