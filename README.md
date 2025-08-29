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
```

## 📖 Command Options

| Option | Alias | Description | Example |
|--------|-------|-------------|---------|
| `record` | | Record screen and create GIF/MP4 | `gifcap record -t 100 -l 55` |
| `cut` | | Cut seconds from existing GIF | `gifcap cut -s 1 demo.gif` |
| `--top` | `-t` | Crop pixels from top | `-t 100` |
| `--left` | `-l` | Crop pixels from left | `-l 55` |
| `--bottom` | `-b` | Crop pixels from bottom | `-b 50` |
| `--right` | `-r` | Crop pixels from right | `-r 50` |
| `--start` | `-s` | Skip seconds from start | `-s 2` |
| `--end` | `-e` | Cut seconds from end | `-e 5` |
| `--speed` | | Speed multiplier | `--speed=2.0` |
| `--gif` | `-g` | Resolution (480p/720p/1080p/custom) | `-g 720p` |
| `--gifcompression` | `-c` | Compression level 0-100 | `-c 0` |
| `--keep-aspect-ratio` | `-a` | Maintain aspect ratio | `--keep-aspect-ratio` |
| `--output` | `-o` | Output filename | `-o demo.gif` |

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
- 🎥 FFmpeg installed
- 📦 Node.js 14+

### Installing FFmpeg
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows (with chocolatey)
choco install ffmpeg
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
