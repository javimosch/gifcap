# 🎬 GifCap

> **Record your screen. Create perfect GIFs. Share everywhere.** ✨

[![npm version](https://badge.fury.io/js/gifcap.svg)](https://badge.fury.io/js/gifcap)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)

Created by [@notraces](https://github.com/notraces) to document his website better over the coming months. Check out [🚀 microsaastemplate.com](https://microsaastemplate.com) - the perfect starting point for your next micro-SaaS project!

## ✨ Features

- 🖥️ **Screen recording** - Capture any part of your screen
- 🎯 **Smart cropping** - Remove unwanted areas (headers, sidebars, etc.)
- ⚡ **Speed control** - Speed up or slow down your GIFs
- 🎨 **Quality settings** - From quick demos to high-quality tutorials
- 📐 **Aspect ratio preservation** - Keep your content looking natural
- 🎪 **Multiple resolutions** - 480p, 720p, 1080p, or custom sizes
- ⚡ **Fast processing** - Optimized for quick GIF creation

## 🚀 Quick Start

```bash
# Install globally
npm install -g gifcap

# Start recording (press CTRL+C to stop)
gifcap record

# Create a tutorial with specific settings
gifcap record -t 100 -l 55 -s 1 -e 2 -c 0 --speed=2.0 -g 720p -o tutorial.gif

# Cut the first 1 second from an existing GIF
gifcap cut demo.gif -s 1s -o cut-demo.gif

# Optimize a GIF to reduce file size
gifcap optimize large.gif --target-size=2 --fps=10 --colors=128 -o small.gif

# Convert an MP4 to a GIF
gifcap convert video.mp4 -o animation.gif
```

## 📖 Command Options

| Option | Alias | Description | Example |
|--------|-------|-------------|---------|
| `record` | | Record screen and create GIF/MP4 | `gifcap record -t 100 -l 55` |
| `cut` | | Cut seconds from existing GIF | `gifcap cut -s 1 demo.gif` |
| `optimize` | | Optimize GIF file size | `gifcap optimize large.gif --target-size=2` |
| `convert` | | Convert MP4 to GIF | `gifcap convert video.mp4 -o animation.gif` |
| `--top` | `-t` | Crop pixels from top | `-t 100` |
| `--left` | `-l` | Crop pixels from left | `-l 55` |
| `--bottom` | `-b` | Crop pixels from bottom | `-b 50` |
| `--right` | `-r` | Crop pixels from right | `-r 50` |
| `--start` | `-s` | Skip seconds from start | `-s 2` |
| `--end` | `-e` | Cut seconds from end | `-e 5` |
| `--speed` | | Speed multiplier | `--speed=2.0` |
| `--gifcompression` | `-c` | Compression level 0-100 | `-c 0` |
| `--keep-aspect-ratio` | `-a` | Maintain aspect ratio | `--keep-aspect-ratio` |
| `--output` | `-o` | Output filename | `-o demo.gif` |
| `--target-size` | `-ts` | Target file size in MB | `--target-size=2` |
| `--fps` | | Target frames per second | `--fps=10` |
| `--colors` | | Maximum number of colors (2-256) | `--colors=128` |
| `--dither` | | Dithering method | `--dither=bayer` |
| `--lossy` | | Lossy compression level (0-200) (requires FFmpeg 5.0+) | `--lossy=30` |
| `--min-resolution` | `-g` | Minimum resolution (480p/720p/1080p/custom) | `-g 480p` |

## 🎯 Perfect Examples

### 📱 Quick Demo (Fast & Small)
```bash
gifcap record -g 480p --speed=1.5 -o quick-demo.gif
```

### 🎓 Tutorial (HD Quality)
```bash
gifcap record -t 80 -l 40 -s 1 -e 3 -c 0 --speed=1.2 -g 720p -o tutorial.gif
```

### 🎬 Feature Showcase (Cinematic)
```bash
gifcap record -t 120 -r 100 -s 2 -e 5 -c 0 --speed=1.0 -g 1080p -o showcase.gif
```

### ✂️ Cut Existing GIF
```bash
gifcap cut demo.gif -s 1s -o cut-demo.gif
```

### 🔄 Optimize GIF Size
```bash
# Basic optimization to target size
gifcap optimize large.gif --target-size=2 -o small.gif

# Advanced optimization with custom parameters
gifcap optimize large.gif --target-size=1 --fps=10 --colors=128 --dither=bayer --lossy=30 -o optimized.gif
```

### Dynamic Scale Re-estimation

The optimizer now dynamically re-estimates the scaling factor after each optimization attempt based on the actual output file size. This allows for more efficient convergence to the target file size while maintaining maximum quality. The scale is recalculated using the square root of the ratio between target size and current size, rounded to the nearest 5%.

### Minimum Resolution Support

You can now specify a minimum resolution threshold using the `-g` or `--min-resolution` option to prevent scaling below a set resolution. This is useful when you want to ensure your GIF maintains a certain quality level regardless of the target file size.

Supported formats:
- Standard resolutions: `480p`, `720p`, `1080p`
- Custom resolution: `640x360` (width x height)

Example:
```bash
gifcap optimize input.gif -o output.gif --target-size=2 -g 720p
```

This ensures that even when trying to meet the target file size, the GIF will never be scaled below 720p resolution.

## 🌈 Beautiful CLI Experience

GifCap provides a colorful, engaging command-line experience:

```bash
$ gifcap --help

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🎬 GifCap Usage                                          ║
║   Record your screen and convert to optimized GIFs      ║
║                                                              ║
║   Usage: gifcap [command] [options]                     ║
║   Commands: record, cut                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## 🛠️ Installation Options

### 📦 NPM (Recommended)
```bash
npm install -g gifcap
```

### 🏗️ From Source
```bash
git clone https://github.com/notraces/gifcap.git
cd gifcap
npm install
npm link
```

### 🐳 Docker
```bash
docker run -it --rm -v $(pwd):/output gifcap [options]
```

## 🔧 Requirements

- 🐧 Linux (X11 display server)
- 🎥 FFmpeg installed (required)
- 🔄 Gifsicle (optional, for better optimization)
- 📦 Node.js 14+

### Dependencies Auto-Installation

GifCap can automatically detect missing dependencies and offer to install them:

- When using the `optimize` command, it will check for required tools (FFmpeg, FFprobe)
- If Gifsicle is not found, it will offer to install it for better optimization results
- Requires `apt-get` for automatic installation (Ubuntu/Debian)

### FFmpeg Version Compatibility

- Basic optimization works with all FFmpeg versions
- Advanced lossy compression (`--lossy` parameter) requires FFmpeg 5.0+
- The tool automatically detects your FFmpeg version and offers to upgrade if needed
- Auto-upgrade to FFmpeg 5.0+ is supported on Ubuntu/Debian systems

### Manual Installation
```bash
# Ubuntu/Debian
sudo apt install ffmpeg gifsicle

# macOS
brew install ffmpeg gifsicle

# Windows (with chocolatey)
choco install ffmpeg gifsicle
```

## 🎪 Creative Use Cases

- 📚 **Documentation** - Create GIF tutorials for your README
- 🐛 **Bug Reports** - Record issues with precise reproduction steps  
- 🎓 **Teaching** - Make engaging coding tutorials
- 💼 **Portfolio** - Showcase your apps in action
- 📱 **Social Media** - Create shareable content for Twitter/LinkedIn
- 🎯 **Product Demos** - Show off features to potential users

## 🌟 Pro Tips

- 🚀 **Speed up processing**: Use smaller resolutions (480p) for quick tests
- 🎯 **Perfect loops**: Use `--start` and `--end` to trim precisely
- 📐 **Clean captures**: Crop toolbars and sidebars for focused content
- ⚡ **Engaging content**: Slightly increase speed (1.2x-1.5x) for better pacing
- 💾 **File size**: Balance quality vs size with compression settings

## 📝 License

MIT © [@notraces](https://github.com/notraces)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/notraces">@notraces</a> to document <a href="https://microsaastemplate.com">microsaastemplate.com</a>
</p>

<p align="center">
  <a href="https://microsaastemplate.com">
    <img src="https://img.shields.io/badge/🚀%20Built%20with%20MicroSaaS%20Template-purple?style=for-the-badge" alt="MicroSaaS Template">
  </a>
</p>
