package main

import (
	"context"
	"embed"

	"bei3mat6/internal"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := internal.NewApp()
	fileService := internal.NewFileService()

	err := wails.Run(&options.App{
		Title:  "bei3mat6",
		Width:  1000,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.Startup(ctx)
			fileService.Startup(ctx)
		},
		OnShutdown: func(ctx context.Context) {
		},
		DisableResize: false,
		Fullscreen:    false,
		Frameless:     false,
		MinWidth:      800,
		MinHeight:     600,
		Bind: []interface{}{
			app,
			fileService,
		},
		DragAndDrop: &options.DragAndDrop{
			EnableFileDrop: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
