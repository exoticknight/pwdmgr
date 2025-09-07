package internal

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// FileFilter represents a file filter for dialogs
type FileFilter struct {
	DisplayName string `json:"displayName"`
	Pattern     string `json:"pattern"`
}

// OpenDialogOptions represents options for open file dialog
type OpenDialogOptions struct {
	Title                      string       `json:"title"`
	Filters                    []FileFilter `json:"filters"`
	DefaultDirectory           string       `json:"defaultDirectory"`
	DefaultFilename            string       `json:"defaultFilename"`
	CanCreateDirectories       bool         `json:"canCreateDirectories"`
	ResolvesAliases            bool         `json:"resolvesAliases"`
	TreatPackagesAsDirectories bool         `json:"treatPackagesAsDirectories"`
}

// SaveDialogOptions represents options for save file dialog
type SaveDialogOptions struct {
	Title                      string       `json:"title"`
	Filters                    []FileFilter `json:"filters"`
	DefaultDirectory           string       `json:"defaultDirectory"`
	DefaultFilename            string       `json:"defaultFilename"`
	CanCreateDirectories       bool         `json:"canCreateDirectories"`
	ShowHiddenFiles            bool         `json:"showHiddenFiles"`
	TreatPackagesAsDirectories bool         `json:"treatPackagesAsDirectories"`
}

// FileService handles file operations and dialogs as an independent service
type FileService struct {
	ctx context.Context
}

// NewFileService creates a new FileService instance
func NewFileService() *FileService {
	return &FileService{}
}

// Startup is called when the app starts, context is saved for runtime methods
func (fs *FileService) Startup(ctx context.Context) {
	fs.ctx = ctx
}

// OpenFileDialog opens a file dialog with custom options
func (fs *FileService) OpenFileDialog(options OpenDialogOptions) (string, error) {
	runtimeFilters := make([]runtime.FileFilter, len(options.Filters))
	for i, filter := range options.Filters {
		runtimeFilters[i] = runtime.FileFilter{
			DisplayName: filter.DisplayName,
			Pattern:     filter.Pattern,
		}
	}

	filePath, err := runtime.OpenFileDialog(fs.ctx, runtime.OpenDialogOptions{
		Title:                      options.Title,
		Filters:                    runtimeFilters,
		DefaultDirectory:           options.DefaultDirectory,
		DefaultFilename:            options.DefaultFilename,
		CanCreateDirectories:       options.CanCreateDirectories,
		ResolvesAliases:            options.ResolvesAliases,
		TreatPackagesAsDirectories: options.TreatPackagesAsDirectories,
	})
	if err != nil {
		return "", fmt.Errorf("failed to open file dialog: %w", err)
	}
	return filePath, nil
}

// OpenMultipleFilesDialog opens a dialog to select multiple files
func (fs *FileService) OpenMultipleFilesDialog(options OpenDialogOptions) ([]string, error) {
	runtimeFilters := make([]runtime.FileFilter, len(options.Filters))
	for i, filter := range options.Filters {
		runtimeFilters[i] = runtime.FileFilter{
			DisplayName: filter.DisplayName,
			Pattern:     filter.Pattern,
		}
	}

	filePaths, err := runtime.OpenMultipleFilesDialog(fs.ctx, runtime.OpenDialogOptions{
		Title:                      options.Title,
		Filters:                    runtimeFilters,
		DefaultDirectory:           options.DefaultDirectory,
		DefaultFilename:            options.DefaultFilename,
		CanCreateDirectories:       options.CanCreateDirectories,
		ResolvesAliases:            options.ResolvesAliases,
		TreatPackagesAsDirectories: options.TreatPackagesAsDirectories,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to open multiple files dialog: %w", err)
	}
	return filePaths, nil
}

// SaveFileDialog opens a save file dialog with custom options
func (fs *FileService) SaveFileDialog(options SaveDialogOptions) (string, error) {
	runtimeFilters := make([]runtime.FileFilter, len(options.Filters))
	for i, filter := range options.Filters {
		runtimeFilters[i] = runtime.FileFilter{
			DisplayName: filter.DisplayName,
			Pattern:     filter.Pattern,
		}
	}

	filePath, err := runtime.SaveFileDialog(fs.ctx, runtime.SaveDialogOptions{
		Title:                      options.Title,
		Filters:                    runtimeFilters,
		DefaultDirectory:           options.DefaultDirectory,
		DefaultFilename:            options.DefaultFilename,
		CanCreateDirectories:       options.CanCreateDirectories,
		ShowHiddenFiles:            options.ShowHiddenFiles,
		TreatPackagesAsDirectories: options.TreatPackagesAsDirectories,
	})
	if err != nil {
		return "", fmt.Errorf("failed to open save dialog: %w", err)
	}
	return filePath, nil
}

// ReadFile reads data from a file
func (fs *FileService) ReadFile(filePath string) ([]int, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Convert []byte to []int for JavaScript compatibility
	result := make([]int, len(data))
	for i, b := range data {
		result[i] = int(b)
	}

	return result, nil
}

// SaveFile saves data to a file
func (fs *FileService) SaveFile(filePath string, data []int) error {
	// Convert []int to []byte
	byteData := make([]byte, len(data))
	for i, val := range data {
		byteData[i] = byte(val)
	}

	// Ensure the directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Write the file
	if err := os.WriteFile(filePath, byteData, 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

// FileExists checks if a file exists
func (fs *FileService) FileExists(filePath string) bool {
	_, err := os.Stat(filePath)
	return err == nil
}

// DeleteFile deletes a file
func (fs *FileService) DeleteFile(filePath string) error {
	if err := os.Remove(filePath); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

// GetFileInfo returns file information
func (fs *FileService) GetFileInfo(filePath string) (map[string]interface{}, error) {
	info, err := os.Stat(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	return map[string]interface{}{
		"name":    info.Name(),
		"size":    info.Size(),
		"modTime": info.ModTime().Unix(),
		"isDir":   info.IsDir(),
	}, nil
}
