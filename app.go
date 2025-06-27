package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

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

// OpenFileDialogWithOptions opens a file dialog with custom options
func (a *App) OpenFileDialogWithOptions(options OpenDialogOptions) (string, error) {
	runtimeFilters := make([]runtime.FileFilter, len(options.Filters))
	for i, filter := range options.Filters {
		runtimeFilters[i] = runtime.FileFilter{
			DisplayName: filter.DisplayName,
			Pattern:     filter.Pattern,
		}
	}

	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
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
func (a *App) OpenMultipleFilesDialog(options OpenDialogOptions) ([]string, error) {
	runtimeFilters := make([]runtime.FileFilter, len(options.Filters))
	for i, filter := range options.Filters {
		runtimeFilters[i] = runtime.FileFilter{
			DisplayName: filter.DisplayName,
			Pattern:     filter.Pattern,
		}
	}

	filePaths, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
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

// SaveFileDialogWithOptions opens a save file dialog with custom options
func (a *App) SaveFileDialogWithOptions(options SaveDialogOptions) (string, error) {
	runtimeFilters := make([]runtime.FileFilter, len(options.Filters))
	for i, filter := range options.Filters {
		runtimeFilters[i] = runtime.FileFilter{
			DisplayName: filter.DisplayName,
			Pattern:     filter.Pattern,
		}
	}

	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
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

// OpenFileDialog opens a file dialog to select a password file
func (a *App) OpenFileDialog() (string, error) {
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Password File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Password Files (*.pwd)",
				Pattern:     "*.pwd",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	})
	if err != nil {
		return "", fmt.Errorf("failed to open file dialog: %w", err)
	}
	return filePath, nil
}

// SaveFileDialog opens a save file dialog
func (a *App) SaveFileDialog(defaultFilename string) (string, error) {
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Password File",
		DefaultFilename: defaultFilename,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Password Files (*.pwd)",
				Pattern:     "*.pwd",
			},
		},
	})
	if err != nil {
		return "", fmt.Errorf("failed to open save dialog: %w", err)
	}
	return filePath, nil
}

// ReadFile reads data from a file
func (a *App) ReadFile(filePath string) ([]byte, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}
	return data, nil
}

// SaveFile saves data to a file
func (a *App) SaveFile(filePath string, data []byte) error {
	// Ensure the directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Write the file
	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}
