package media

func fileExtensionFilter(extension string) bool {
	switch extension {
	case "mkv":
		return true
	case ".mkv":
		return true
	case ".mp4":
		return true
	case "mp4":
		return true
	default:
		return false
	}
}

func movieResolutionsFilter(resolution string) []string {
	switch resolution {
	case "1080":
		return []string{"1080", "720"}
	case "720":
		return []string{"720", "480"}
	case "480":
		return []string{"480"}
	default:
		return []string{"720", "480"}
	}
}
