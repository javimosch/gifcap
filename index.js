#!/usr/bin/env node

const yargs = require("yargs");
const execa = require("execa");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

let finalResults = {
  success: true,
  command: process.argv.slice(2).join(' '),
  output: null,
  error: null
};

function exitWithResult(data = {}, success = true) {
  finalResults = { ...finalResults, ...data, success };
  if (argv.json) {
    console.log(JSON.stringify(finalResults, null, 2));
  } else if (!success && finalResults.error) {
    console.error(`\x1b[31mError: ${finalResults.error}\x1b[0m`);
  }
  process.exit(success ? 0 : 1);
}

function showBanner() {
  if (argv.json || argv.quiet) return;
  console.log(`
\x1b[35m╔══════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m║\x1b[36m   🎬 GifCap - Screen Recording to GIF Tool\x1b[35m                    ║\x1b[0m
\x1b[35m║\x1b[33m   Created by \x1b[1m@notraces\x1b[0m\x1b[33m to document his website better\x1b[35m        ║\x1b[0m
\x1b[35m║\x1b[33m   over the coming months                                     \x1b[35m║\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m║\x1b[32m   🚀 Check out \x1b[1mhttps://microsaastemplate.com\x1b[0m\x1b[32m - the perfect\x1b[35m  ║\x1b[0m
\x1b[35m║\x1b[32m   starting point for your next micro-SaaS project!\x1b[35m         ║\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m╚══════════════════════════════════════════════════════════════╝\x1b[0m

\x1b[36m💡 Tip: Press CTRL+C to stop recording when you're done!\x1b[0m
`);
}

// Create readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for yes/no questions
async function promptYesNo(question) {
  if (argv.yes) return true;
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

// Check if a command is available
async function isCommandAvailable(command) {
  try {
    await execa('which', [command]);
    return true;
  } catch (error) {
    return false;
  }
}

// Check and install missing dependencies
async function checkAndInstallDependencies(dependencies) {
  const missingDeps = [];
  
  // Check which dependencies are missing
  for (const dep of dependencies) {
    if (!(await isCommandAvailable(dep))) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length === 0) {
    return true; // All dependencies are available
  }
  
  // Ask user for permission to install
  if (!argv.quiet) console.log(`\nMissing optimization dependencies: ${missingDeps.join(', ')}`);
  const shouldInstall = await promptYesNo(
    `Would you like to install these dependencies for better GIF optimization?`
  );
  
  if (!shouldInstall) {
    if (!argv.quiet) console.log('Continuing without installing dependencies. Some optimization features will be limited.');
    return false;
  }
  
  // Check if we can use apt-get
  if (!(await isCommandAvailable('apt-get'))) {
    if (!argv.quiet) {
      console.log('\nAutomatic installation requires apt-get, which was not found.');
      console.log(`Please install these dependencies manually: ${missingDeps.join(', ')}`);
    }
    return false;
  }
  
  // Install dependencies
  try {
    if (!argv.quiet) console.log(`\nInstalling: ${missingDeps.join(', ')}...`);
    await execa('sudo', ['apt-get', 'update']);
    await execa('sudo', ['apt-get', 'install', '-y', ...missingDeps]);
    if (!argv.quiet) console.log('Dependencies installed successfully!');
    return true;
  } catch (error) {
    if (!argv.quiet) {
      console.error('Failed to install dependencies:', error.message);
      console.log(`Please install these dependencies manually: ${missingDeps.join(', ')}`);
    }
    return false;
  }
}

const argv = yargs(process.argv.slice(2))
  .usage(
    `
\x1b[35m╔══════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m║\x1b[36m   🎬 GifCap Usage\x1b[35m                                          ║\x1b[0m
\x1b[35m║\x1b[37m   Record your screen and convert to optimized GIFs\x1b[35m      ║\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m║\x1b[37m   Usage: gifcap [command] [options]\x1b[35m                       ║\x1b[0m
\x1b[35m║\x1b[37m   Commands: record, cut, optimize\x1b[35m                          ║\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m╚══════════════════════════════════════════════════════════════╝\x1b[0m
  `,
  )
  .command("record", "Record screen and create GIF", (yargs) => {
    yargs.option("duration", {
      type: "number",
      description: "Recording duration in seconds (for non-interactive use)",
    });
  })
  .command("cut <input>", "Cut seconds from start of existing GIF", (yargs) => {
    yargs.positional("input", {
      describe: "Input GIF file to cut",
      type: "string",
    });
  })
  .command("optimize <input>", "Optimize GIF file size", (yargs) => {
    yargs.positional("input", {
      describe: "Input GIF file to optimize",
      type: "string",
    })
  })
  .command("convert <input>", "Convert MP4 to GIF", (yargs) => {
    yargs.positional("input", {
      describe: "Input MP4 file to convert",
      type: "string",
    })
    .option("fps", {
      type: "number",
      description: "Target frames per second (lower values reduce file size)",
      default: 15
    })
    .option("colors", {
      type: "number",
      description: "Maximum number of colors (2-256, lower values reduce file size)",
      default: 256
    })
    .option("dither", {
      type: "string",
      description: "Dithering method (none, bayer, floyd_steinberg, sierra2_4a)",
      default: "sierra2_4a"
    })
    .option("lossy", {
      type: "number",
      description: "Lossy compression level (0-200, higher values reduce file size)",
      default: 0
    })
    .option('min-resolution', {
      alias: 'g',
      describe: 'Minimum resolution (480p/720p/1080p/custom) to prevent scaling below this threshold',
      default: '1024x1024',
      type: 'string'
    });
  })
  .option("top", {
    alias: "t",
    type: "number",
    description: "Pixels to crop from the top",
    default: 0,
  })
  .option("bottom", {
    alias: "b",
    type: "number",
    description: "Pixels to crop from the bottom",
    default: 0,
  })
  .option("left", {
    alias: "l",
    type: "number",
    description: "Pixels to crop from the left",
    default: 0,
  })
  .option("right", {
    alias: "r",
    type: "number",
    description: "Pixels to crop from the right",
    default: 0,
  })
  .option("end", {
    alias: "e",
    type: "number",
    description: "Seconds to cut from the end",
    default: 0,
  })
  .option("start", {
    alias: "s",
    type: "number",
    description: "Seconds to cut from the start",
    default: 0,
  })
  .option("speed", {
    type: "number",
    description: "Speed up the GIF",
    default: 1.0,
  })
  // Removed global gif option to avoid conflict with command-specific min-resolution option
  .option("gifcompression", {
    alias: "c",
    type: "number",
    description: "GIF compression (0-100)",
    default: 50,
  })
  .option("keep-aspect-ratio", {
    alias: "a",
    type: "boolean",
    description: "Keep aspect ratio",
    default: true,
  })
  .option("output", {
    alias: "o",
    type: "string",
    description: "Output file name",
    default: `output-${Date.now()}.gif`,
  })
  .option("mp4", {
    type: "boolean",
    description: "Output an MP4 file instead of a GIF",
    default: false,
  })
  .option("target-size", {
    alias: "ts",
    type: "number",
    description: "Target file size in MB for optimization (default: 1)",
    default: 1,
  })
  .option("yes", {
    type: "boolean",
    description: "Skip confirmation prompts",
    default: false,
  })
  .option("json", {
    type: "boolean",
    description: "Output results as JSON",
    default: false,
  })
  .option("quiet", {
    type: "boolean",
    description: "Suppress non-essential output",
    default: false,
  })
  .help("help")
  .alias("help", "h").epilogue(`
\x1b[35m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m║\x1b[36m   📖 Example Command Breakdown\x1b[35m                                             ║\x1b[0m
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m║\x1b[33m   gifcap record -t 100 -l 55 -s 1 -e 2 -c 0 --speed=2.0 -g 720p -o tutorial.gif\x1b[35m ║\x1b[0m
\x1b[35m║\x1b[33m   gifcap cut demo.gif -s 1s -o cut-demo.gif\x1b[35m                                ║\x1b[0m
\x1b[35m║\x1b[33m   gifcap optimize large.gif --target-size=2 --fps=10 --colors=128 -o small.gif\x1b[35m  ║\x1b[0m
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m║\x1b[32m   What this does:\x1b[35m                                                         ║\x1b[0m
\x1b[35m║\x1b[37m   • -t 100: Crop 100px from top (remove header/bars)\x1b[35m                   ║\x1b[0m
\x1b[35m║\x1b[37m   • -l 55: Crop 55px from left (remove sidebar)\x1b[35m                       ║\x1b[0m
\x1b[35m║\x1b[37m   • -s 1: Skip first 1 second (remove setup time)\x1b[35m                      ║\x1b[0m
\x1b[35m║\x1b[37m   • -e 2: Cut last 2 seconds (remove ending pause)\x1b[35m                     ║\x1b[0m
\x1b[35m║\x1b[37m   • -c 0: No compression (maximum quality)\x1b[35m                            ║\x1b[0m
\x1b[35m║\x1b[37m   • --speed=2.0: 2x speed (slightly faster, more engaging)\x1b[35m            ║\x1b[0m
\x1b[35m║\x1b[37m   • -g 720p: 1280x720 HD resolution\x1b[35m                                 ║\x1b[0m
\x1b[35m║\x1b[37m   • -o tutorial.gif: Save as 'tutorial.gif'\x1b[35m                          ║\x1b[0m
\x1b[35m║\x1b[37m   • --target-size=2: Optimize to below 2MB\x1b[35m                           ║\x1b[0m
\x1b[35m║\x1b[37m   • --fps=10: Reduce frames per second to 10\x1b[35m                          ║\x1b[0m
\x1b[35m║\x1b[37m   • --colors=128: Limit color palette to 128 colors\x1b[35m                   ║\x1b[0m
\x1b[35m║\x1b[37m   • --dither=bayer: Use bayer dithering method\x1b[35m                       ║\x1b[0m
\x1b[35m║\x1b[37m   • --lossy=30: Apply light lossy compression\x1b[35m                         ║\x1b[0m
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m║\x1b[36m   💡 Pro tip: Use 480p for quick demos, 720p for tutorials!\x1b[35m            ║\x1b[0m
\x1b[35m║\x1b[36m   💡 Optimization tip: Try --fps=10 --colors=128 for smaller files!\x1b[35m    ║\x1b[0m
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m║\x1b[36m   Available Resolutions:\x1b[35m                                                  ║\x1b[0m
\x1b[35m║\x1b[37m   480p: 854x480\x1b[35m                                                          ║\x1b[0m
\x1b[35m║\x1b[37m   720p: 1280x720\x1b[35m                                                         ║\x1b[0m
\x1b[35m║\x1b[37m   1080p: 1920x1080\x1b[35m                                                       ║\x1b[0m
\x1b[35m║\x1b[37m   1440p: 2560x1440\x1b[35m                                                       ║\x1b[0m
\x1b[35m║\x1b[37m   4k: 3840x2160\x1b[35m                                                          ║\x1b[0m
\x1b[35m║\x1b[37m   vga: 640x480\x1b[35m                                                           ║\x1b[0m
\x1b[35m║\x1b[37m   svga: 800x600\x1b[35m                                                          ║\x1b[0m
\x1b[35m║\x1b[37m   xga: 1024x768\x1b[35m                                                          ║\x1b[0m
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m
  `).argv;

if (argv.json) {
  argv.quiet = true;
}

showBanner();


function getLastArg(arg) {
  if (Array.isArray(arg)) {
    return arg[arg.length - 1];
  }
  return arg;
}

const resolutions = {
  "480p": "854x480",
  "720p": "1280x720",
  "1080p": "1920x1080",
  "1440p": "2560x1440",
  "4k": "3840x2160",
  vga: "640x480",
  svga: "800x600",
  xga: "1024x768",
};

async function optimizeGif(argv) {
  const input = argv.input;
  const output = getLastArg(argv.output);
  const targetSizeMB = getLastArg(argv.targetSize) || 1;
  const targetSizeBytes = targetSizeMB * 1024 * 1024;
  const fps = argv.fps || 15;
  const colors = argv.colors || 256;
  const dither = argv.dither || 'floyd_steinberg';
  let lossy = argv.lossy || 0;

  if (!fs.existsSync(input)) {
    exitWithResult({ error: `Input file ${input} does not exist` }, false);
  }

  // Check for required dependencies
  if (!argv.quiet) console.log('Checking for required dependencies...');
  const requiredDeps = ['ffmpeg', 'ffprobe'];
  const optionalDeps = ['gifsicle']; // Optional but recommended
  
  // Always check for required dependencies
  const hasRequiredDeps = await checkAndInstallDependencies(requiredDeps);
  if (!hasRequiredDeps) {
    exitWithResult({ error: 'Required dependencies are missing. Cannot continue.' }, false);
  }
  
  // Check for optional dependencies
  const hasGifsicle = await isCommandAvailable('gifsicle');
  if (!hasGifsicle) {
    if (!argv.quiet) console.log('\nGifsicle is not installed. This tool can provide additional optimization.');
    await checkAndInstallDependencies(optionalDeps);
  }
  
  // Check if input file is already below target size
  const stats = fs.statSync(input);
  if (stats.size <= targetSizeBytes) {
    if (!argv.quiet) console.log(
      `Input file is already below ${targetSizeMB}MB (${(stats.size / (1024 * 1024)).toFixed(2)}MB)`
    );
    if (input !== output) {
      fs.copyFileSync(input, output);
      if (!argv.quiet) console.log(`File copied to ${output}`);
    }
    exitWithResult({ output: output, size: stats.size, optimized: false });
  }

  if (!argv.quiet) {
  if (!argv.quiet) {
    console.log(`Optimizing ${input} to below ${targetSizeMB}MB...`);
    console.log(`Using: FPS=${fps}, Colors=${colors}, Dither=${dither}, Lossy=${lossy}`);
  }

  }

  // Create a temporary file for optimization
  const tempFile = `temp-optimize-${Date.now()}-${path.basename(output)}`;
  
  // Create a temp directory for intermediate files
  const tempDir = `temp-gifcap-${Date.now()}`;
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  // Function to install newer FFmpeg version
  async function installNewerFFmpeg() {
    if (!argv.quiet) console.log('\nAttempting to install FFmpeg 5.0+ for lossy compression support...');
    
    try {
      // Check if we're on Ubuntu/Debian
      const { stdout: lsbOutput } = await execa('lsb_release', ['-is']);
      const isUbuntuDebian = lsbOutput.toLowerCase().includes('ubuntu') || lsbOutput.toLowerCase().includes('debian');
      
      if (isUbuntuDebian) {
        // Add FFmpeg 5.0+ repository
        if (!argv.quiet) console.log('Adding FFmpeg repository...');
        await execa('sudo', ['add-apt-repository', '-y', 'ppa:savoury1/ffmpeg5']);
        await execa('sudo', ['apt-get', 'update']);
        
        // Install FFmpeg 5.0+
        if (!argv.quiet) console.log('Installing FFmpeg 5.0+...');
        await execa('sudo', ['apt-get', 'install', '-y', 'ffmpeg']);
        
        if (!argv.quiet) console.log('FFmpeg 5.0+ installed successfully!');
        return true;
      } else {
        if (!argv.quiet) {
          console.log('Automatic FFmpeg upgrade is only supported on Ubuntu/Debian systems.');
          console.log('Please upgrade FFmpeg manually to version 5.0+ for lossy compression support.');
        }
        return false;
      }
    } catch (error) {
      if (!argv.quiet) console.error('Error installing FFmpeg:', error.message);
      return false;
    }
  }
  
  // Check FFmpeg version to determine if lossy parameter is supported
  let ffmpegSupportsLossy = false;
  try {
    const { stdout } = await execa('ffmpeg', ['-version']);
    const versionMatch = stdout.match(/ffmpeg version (\d+)\.(\d+)/);
    if (versionMatch) {
      const majorVersion = parseInt(versionMatch[1]);
      const minorVersion = parseInt(versionMatch[2]);
      // FFmpeg supports lossy parameter in paletteuse filter from version 5.0
      ffmpegSupportsLossy = (majorVersion >= 5);
      
      if (!ffmpegSupportsLossy && lossy > 0) {
        if (!argv.quiet) {
          console.log('\nWarning: Your FFmpeg version does not support the lossy parameter.');
          console.log('Lossy compression will be disabled unless you upgrade FFmpeg to version 5.0+.');
        }
        
        // Offer to upgrade FFmpeg
        const upgradeFFmpeg = await promptYesNo('Would you like to upgrade FFmpeg to enable lossy compression? (y/n)');
        if (upgradeFFmpeg) {
          const upgraded = await installNewerFFmpeg();
          if (upgraded) {
            // Re-check FFmpeg version after upgrade
            try {
              const { stdout: newVersion } = await execa('ffmpeg', ['-version']);
              const newVersionMatch = newVersion.match(/ffmpeg version (\d+)\.(\d+)/);
              if (newVersionMatch) {
                const newMajorVersion = parseInt(newVersionMatch[1]);
                ffmpegSupportsLossy = (newMajorVersion >= 5);
                if (ffmpegSupportsLossy) {
                  if (!argv.quiet) console.log('FFmpeg upgrade successful! Lossy compression is now available.');
                } else {
                  if (!argv.quiet) console.log('FFmpeg was upgraded but still does not support lossy compression.');
                  lossy = 0;
                }
              }
            } catch (error) {
              if (!argv.quiet) console.log('Could not verify new FFmpeg version. Disabling lossy compression.');
              lossy = 0;
            }
          } else {
            if (!argv.quiet) console.log('FFmpeg upgrade failed. Disabling lossy compression.');
            lossy = 0;
          }
        } else {
          if (!argv.quiet) console.log('FFmpeg upgrade declined. Disabling lossy compression.');
          lossy = 0;
        }
      }
    }
  } catch (error) {
    if (!argv.quiet) console.log('Could not determine FFmpeg version. Disabling lossy compression.');
    lossy = 0;
  }

  try {
    // Get original dimensions and frame count
    const dimensionsOutput = await execa("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,nb_frames",
      "-of",
      "json",
      input,
    ]);
    
    const probeData = JSON.parse(dimensionsOutput.stdout);
    const originalWidth = probeData.streams[0].width;
    const originalHeight = probeData.streams[0].height;
    const originalFrames = probeData.streams[0].nb_frames || 0;
    
    // Get original FPS
    const fpsOutput = await execa("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=r_frame_rate",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      input,
    ]);
    
    // Parse frame rate (could be a fraction like "30/1")
    const fpsStr = fpsOutput.stdout.trim();
    let originalFps = 0;
    if (fpsStr.includes('/')) {
      const [num, denom] = fpsStr.split('/').map(Number);
      originalFps = num / denom;
    } else {
      originalFps = parseFloat(fpsStr);
    }
    
    if (!argv.quiet) console.log(`Original: ${originalWidth}x${originalHeight}, ${originalFps.toFixed(2)} FPS, ${originalFrames} frames`);

    // Estimate initial scale based on file size ratio
    // The relationship between scale and file size is roughly quadratic (area-based)
    // We use a square root to approximate the initial scale
    const initialSize = stats.size;
    const sizeRatio = Math.sqrt(targetSizeBytes / initialSize);
    
    // Adjust size ratio based on FPS reduction if applicable
    let fpsRatio = 1.0;
    if (fps < originalFps) {
      fpsRatio = fps / originalFps;
      if (!argv.quiet) console.log(`FPS reduction factor: ${fpsRatio.toFixed(2)} (${originalFps.toFixed(1)} → ${fps} FPS)`);
    }
    
    // Adjust size ratio based on color reduction if applicable
    let colorRatio = 1.0;
    if (colors < 256) {
      colorRatio = 0.8 + (0.2 * (colors / 256)); // Rough approximation of color impact
      if (!argv.quiet) console.log(`Color reduction factor: ${colorRatio.toFixed(2)} (256 → ${colors} colors)`);
    }
    
    // Combine all factors for final scale estimation
    const combinedRatio = sizeRatio / (fpsRatio * colorRatio);
    
    // Start with an estimated scale, but cap it between 0.3 and 1.0
    let scale = Math.max(0.3, Math.min(1.0, combinedRatio));
    
    // Round to nearest 0.05 for cleaner values
    scale = Math.round(scale * 20) / 20;
    
    if (!argv.quiet) {
      console.log(`Initial size: ${(initialSize / (1024 * 1024)).toFixed(2)}MB, Target: ${targetSizeMB}MB`);
      console.log(`Estimated starting scale: ${(scale * 100).toFixed(0)}%`);
    }
    
    // Binary search approach for optimization
    let binarySearchMinScale = 0.3;  // Minimum acceptable scale
    let binarySearchMaxScale = 1.0;  // Maximum scale
    let bestScale = null;
    let bestSize = null;
    let bestParams = null;
    
    // Define optimization strategies to try
    const strategies = [
      { name: "Standard", lossy: lossy, colors: colors },
      { name: "Reduced colors", lossy: lossy, colors: Math.max(64, Math.floor(colors * 0.75)) },
    ];
    
    // Only add lossy options if user didn't specify a lossy value AND FFmpeg supports lossy
    if (lossy === 0 && ffmpegSupportsLossy) {
      strategies.push({ name: "Light lossy", lossy: 30, colors: colors });
      strategies.push({ name: "Medium lossy", lossy: 80, colors: colors });
    }
    
    // Parse minimum resolution if specified
  const minWidth = argv['min-resolution'] ? (() => {
    const resolution = argv['min-resolution'].toLowerCase();
    if (resolution === '480p') return 854;
    if (resolution === '720p') return 1280;
    if (resolution === '1080p') return 1920;
    if (resolution.includes('x')) {
      const [width] = resolution.split('x').map(Number);
      return !isNaN(width) ? width : 0;
    }
    return 0;
  })() : 0;
  
  const minHeight = argv['min-resolution'] ? (() => {
    const resolution = argv['min-resolution'].toLowerCase();
    if (resolution === '480p') return 480;
    if (resolution === '720p') return 720;
    if (resolution === '1080p') return 1080;
    if (resolution.includes('x')) {
      const [, height] = resolution.split('x').map(Number);
      return !isNaN(height) ? height : 0;
    }
    return 0;
  })() : 0;
  
  // Calculate minimum scale based on minimum resolution
  const minScale = (() => {
    const defaultMinScale = 0.3; // Default minimum scale
    
    if (minWidth > 0 && minHeight > 0) {
      const widthScale = minWidth / originalWidth;
      const heightScale = minHeight / originalHeight;
      // Use the larger scale to ensure both dimensions meet minimum requirements
      const resolutionScale = Math.max(widthScale, heightScale);
      if (!argv.quiet) {
        console.log(`Minimum resolution set to: ${minWidth}x${minHeight}`);
        console.log(`Minimum scale set to: ${(resolutionScale * 100).toFixed(0)}% based on minimum resolution`);
      }
      return Math.max(defaultMinScale, resolutionScale);
    }

    return defaultMinScale;
  })();


  // Initial scale estimate based on target size
  const initialScale = (() => {
    if (targetSizeBytes < initialSize) {
      // Estimate scale based on target size
      // Size is roughly proportional to area (width * height)
      // So scale is roughly proportional to sqrt(targetSize / originalSize)
      let scaleValue = Math.sqrt(targetSizeBytes / initialSize);
      
      // Round to nearest 5% for cleaner values
      scaleValue = Math.round(scaleValue * 20) / 20;
      
      // Ensure scale is at least the minimum scale
      return Math.max(minScale, scaleValue);
    }
    return 1.0;
  })();
  
  // Function to estimate scale based on target size and current result
  function estimateNewScale(currentScale, currentSize, targetSize) {
    // If we're already at the minimum scale and still too large, we need to inform the user
    if (currentScale <= minScale && currentSize > targetSize) {
      if (!argv.quiet) console.log(`Cannot reduce further due to minimum resolution constraint (${minScale * 100}%)`);          
      // Return the same scale to avoid endless loops
      return currentScale;
    }

    // Calculate a new scale based on the ratio of target size to current size
    // Use square root to account for the fact that size scales roughly with area (width*height)
    const sizeRatio = Math.sqrt(targetSize / currentSize);
    let newScale = currentScale * sizeRatio;
    
    // Round to nearest 5% for cleaner values
    newScale = Math.round(newScale * 20) / 20;
    
    // Ensure scale stays within reasonable bounds and respects minimum scale
    const constrainedScale = Math.max(minScale, Math.min(1.0, newScale));
    
    // If the minimum scale constraint changed our calculated scale, log this information
    if (constrainedScale > newScale) {
      if (!argv.quiet) console.log(`Scale constrained by minimum resolution (wanted: ${(newScale * 100).toFixed(0)}%, using: ${(constrainedScale * 100).toFixed(0)}%)`);          
    }
    
    return constrainedScale;
  }
  
    
    // Try different optimization strategies
    for (const strategy of strategies) {
      if (!argv.quiet) console.log(`\nTrying strategy: ${strategy.name}`);
      
      // Start with initial scale estimate
      let currentScale = initialScale;
      
      // Maximum of 3 attempts per strategy to find optimal scale
      for (let attempt = 0; attempt < 3; attempt++) {
        // Calculate new dimensions
        const newWidth = Math.floor(originalWidth * currentScale);
        const newHeight = Math.floor(originalHeight * currentScale);

        // Ensure dimensions are even (required by some codecs)
        const evenWidth = newWidth % 2 === 0 ? newWidth : newWidth - 1;
        const evenHeight = newHeight % 2 === 0 ? newHeight : newHeight - 1;
        
        // Skip this attempt if dimensions are too small
        if (evenWidth < 100 || evenHeight < 100) {
          if (!argv.quiet) console.log(`Dimensions too small (${evenWidth}x${evenHeight}), skipping this attempt`);
          continue;
        }
        
        // Log the current dimensions for better user feedback
        if (!argv.quiet) console.log(`Current dimensions: ${evenWidth}x${evenHeight}`);
        
        // Generate palette with specified number of colors
        const paletteFile = `${tempDir}/palette-${strategy.colors}.png`;
        const palettegenArgs = [
          "-i",
          input,
          "-vf",
          `fps=${fps},scale=${evenWidth}:${evenHeight}:flags=lanczos,palettegen=max_colors=${strategy.colors}:stats_mode=diff`,
          "-y",
          paletteFile,
        ];

        try {
          await execa("ffmpeg", palettegenArgs);
        } catch (error) {
          if (!argv.quiet) console.error("Error generating palette:", error.message);
          continue; // Try next attempt
        }

        // Create optimized GIF
        const currentTempFile = `${tempDir}/temp-${Date.now()}.gif`;
        
        // Build filter complex based on parameters
        let filterComplex = `[0:v]fps=${fps},scale=${evenWidth}:${evenHeight}:flags=lanczos[scaled];`;
        filterComplex += `[scaled][1:v]paletteuse=dither=${dither}:diff_mode=rectangle`;
        
        // Add lossy compression if specified and supported
        if (strategy.lossy > 0 && ffmpegSupportsLossy) {
          filterComplex += `:lossy=${strategy.lossy}`;
        }
        
        const gifArgs = [
          "-i",
          input,
          "-i",
          paletteFile,
          "-filter_complex",
          filterComplex,
          "-y",
          currentTempFile,
        ];

        try {
          await execa("ffmpeg", gifArgs);
        } catch (error) {
          if (!argv.quiet) console.error("Error creating optimized GIF:", error.message);
          continue; // Try next attempt
        }

        // Check file size
        const tempStats = fs.statSync(currentTempFile);
        const currentSizeBytes = tempStats.size;
        
        if (!argv.quiet) console.log(`Try: Scale=${(currentScale * 100).toFixed(0)}%, FPS=${fps}, Colors=${strategy.colors}, Lossy=${strategy.lossy}, Size=${(currentSizeBytes / (1024 * 1024)).toFixed(2)}MB`);
        
        // Re-estimate scale based on current result
        const newScale = estimateNewScale(currentScale, currentSizeBytes, targetSizeBytes);
        
        // If we're at minimum scale and still too large, provide clearer feedback
        if (newScale === currentScale && newScale <= minScale && currentSizeBytes > targetSizeBytes) {
          if (!argv.quiet) {
            console.log(`Cannot reduce below minimum resolution of ${minWidth}x${minHeight} while meeting target size of ${targetSizeMB}MB`);
            console.log(`Consider using a smaller minimum resolution or increasing the target size`);
          }
          
          // Save the best result so far even if we hit the minimum resolution constraint
          if (bestSize === null || currentSizeBytes < bestSize) {
            bestSize = currentSizeBytes;
            bestScale = currentScale;
            bestParams = { scale: currentScale, fps, colors: strategy.colors, lossy: strategy.lossy };
            fs.copyFileSync(currentTempFile, output);
          }
          
          break; // Exit this strategy since we can't go below minimum resolution
        } else {
          if (!argv.quiet) console.log(`Re-estimating scale: ${(currentScale * 100).toFixed(0)}% → ${(newScale * 100).toFixed(0)}% based on current result`);
        }
        
        currentScale = newScale;

        // Update best result if this is better than previous attempts
        if (currentSizeBytes <= targetSizeBytes) {
          // We found a result that meets the target size
          if (bestSize === null || currentSizeBytes > bestSize) {
            bestSize = currentSizeBytes;
            bestScale = currentScale;
            bestParams = { scale: currentScale, fps, colors: strategy.colors, lossy: strategy.lossy };
            fs.copyFileSync(currentTempFile, output);
          }
          break; // No need to try smaller scales
        } else if (bestSize === null || currentSizeBytes < bestSize) {
          // This is better than previous attempts but still above target
          bestSize = currentSizeBytes;
          bestScale = currentScale;
          bestParams = { scale: currentScale, fps, colors: strategy.colors, lossy: strategy.lossy };
          
          try {
            fs.unlinkSync(currentTempFile);
          } catch (e) {
            // Ignore file deletion errors
          }
        }

        // Binary search adjustment
        if (currentSizeBytes <= targetSizeBytes) {
          // File is small enough, try a larger scale
          binarySearchMinScale = scale;
          scale = Math.min(1.0, Math.round((scale + binarySearchMaxScale) / 2 * 20) / 20);
          
          // If we're already at max scale or very close to target size, we're done with this strategy
          if (scale >= 0.95 || (targetSizeBytes - currentSizeBytes) / targetSizeBytes < 0.05) {
            if (!argv.quiet) console.log(`Found good parameters for ${strategy.name}: Scale=${(scale * 100).toFixed(0)}%`);
            break;
          }
        } else {
          // File is too large, try a smaller scale
          binarySearchMaxScale = scale;
          scale = Math.max(minScale, Math.round((scale + binarySearchMinScale) / 2 * 20) / 20);
        }
        
        // If we've converged to a single scale value, we're done with this strategy
        if (Math.abs(binarySearchMaxScale - binarySearchMinScale) < 0.05) {
          break;
        }
      }
      
      // Reset scale for next strategy
      scale = Math.max(minScale, Math.min(1.0, sizeRatio / (fpsRatio * colorRatio)));
      scale = Math.round(scale * 20) / 20;
      binarySearchMinScale = minScale;
      binarySearchMaxScale = 1.0;
    }
    
    // Try gifsicle optimization as a final step if we have a result
    if (bestSize !== null && fs.existsSync(output)) {
      if (!argv.quiet) console.log("\nApplying final optimization with gifsicle...");
      
      // Use our isCommandAvailable function instead of execa which
      const hasGifsicle = await isCommandAvailable('gifsicle');
      
      if (hasGifsicle) {
        try {
          const gifsicleArgs = [
            "-O3",  // Highest optimization level
            "-o", tempFile,
            output
          ];
          
          await execa("gifsicle", gifsicleArgs);
          
          const finalStats = fs.statSync(tempFile);
          const finalSize = finalStats.size;
          
          if (!argv.quiet) console.log(`After gifsicle: ${(finalSize / (1024 * 1024)).toFixed(2)}MB (${((1 - finalSize/bestSize) * 100).toFixed(1)}% reduction)`);
          
          if (finalSize < bestSize) {
            fs.copyFileSync(tempFile, output);
            bestSize = finalSize;
          }
        } catch (error) {
          if (!argv.quiet) console.log("Gifsicle optimization failed: " + error.message);
        }
      } else {
        if (!argv.quiet) console.log("Gifsicle not available, skipping additional optimization.");
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      try {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          try {
            fs.unlinkSync(`${tempDir}/${file}`);
          } catch (err) {
            // Ignore individual file deletion errors
          }
        }
        fs.rmdirSync(tempDir);
      } catch (e) {
        console.error("Error cleaning up temp directory:", e.message);
      }
    }
    
    // Ensure we're not leaving any ffmpeg processes hanging
    try {
      await execa('pkill', ['-f', 'ffmpeg']);
    } catch (e) {
      // Ignore errors if no ffmpeg processes were running
    }
    
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore file deletion errors
      }
    }

    if (bestSize <= targetSizeBytes) {
      if (!argv.quiet) {
        console.log(
          `\nOptimized GIF saved as ${output} (${(bestSize / (1024 * 1024)).toFixed(2)}MB)`,
        );
        if (bestParams) {
          console.log(`Best parameters: Scale=${(bestParams.scale * 100).toFixed(0)}%, ` +
                    `FPS=${bestParams.fps}, Colors=${bestParams.colors}, Lossy=${bestParams.lossy}`);
        }
      }
      exitWithResult({ output: output, size: bestSize, optimized: true, params: bestParams });
    } else if (bestSize !== null) {
      if (!argv.quiet) {
        console.log(
          `\nBest attempt saved as ${output} (${(bestSize / (1024 * 1024)).toFixed(2)}MB)`,
        );
        console.error(
          `Could not reduce file size below ${targetSizeMB}MB while maintaining acceptable quality`,
        );
      }
      exitWithResult({ output: output, size: bestSize, optimized: true, targetSizeExceeded: true, params: bestParams });
    } else {
      exitWithResult({ error: "Could not generate an optimized GIF. No output file was created." }, false);
    }
  } catch (error) {
    if (!argv.quiet) console.error("Error optimizing GIF:", error.message);

    // Clean up temp files
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      try {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          try {
            fs.unlinkSync(`${tempDir}/${file}`);
          } catch (err) {
            // Ignore individual file deletion errors
          }
        }
        fs.rmdirSync(tempDir);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    process.exit(1);
  }
}

async function getScreenResolution() {
  try {
    const { stdout } = await execa("xdpyinfo");
    const match = /dimensions:\s+(\d+x\d+)/.exec(stdout);
    if (match) {
      return match[1];
    }
    throw new Error("Could not find screen resolution.");
  } catch (error) {
    exitWithResult({ error: "Error getting screen resolution. Please make sure xdpyinfo is installed and you are in a graphical environment." }, false);
  }
}

async function main() {
  // Handle the cut command
  if (argv._[0] === "cut") {
    await cutGif(argv);
    return;
  }

  // Handle the optimize command
  if (argv._[0] === "optimize") {
    await optimizeGif(argv);
    return;
  }

  if (argv._[0] === "convert") {
    await convertMp4ToGif(argv);
    return;
  }

  // Default to record command
  await recordScreen(argv);
}

async function convertMp4ToGif(argv) {
  const input = argv.input;
  if (!fs.existsSync(input)) {
    exitWithResult({ error: `Input file ${input} does not exist` }, false);
  }

  if (!argv.quiet) console.log(`Converting ${input} to GIF...`);

  const output = getLastArg(argv.output);

  try {
    const palettegenArgs = [
      "-i",
      input,
      "-vf",
      `palettegen`,
      "-y",
      "palette.png",
    ];

    await execa("ffmpeg", palettegenArgs);

    const gifArgs = [
      "-i",
      input,
      "-i",
      "palette.png",
      "-filter_complex",
      `[0:v]paletteuse`,
      "-y",
      output,
    ];

    await execa("ffmpeg", gifArgs);

    fs.unlinkSync("palette.png");

    if (!argv.quiet) console.log(`GIF saved as ${output}`);
    exitWithResult({ output: output, format: 'gif' });
  } catch (error) {
    exitWithResult({ error: `Conversion failed: ${error.message}` }, false);
  }
}

async function cutGif(argv) {
  // For cut command, the input is parsed as a named argument
  const input = argv.input; // This is how yargs provides the positional argument
  let start = getLastArg(argv.start);
  const end = getLastArg(argv.end);
  const output = getLastArg(argv.output);

  // Parse start time (remove 's' suffix if present)
  if (typeof start === "string" && start.endsWith("s")) {
    start = parseFloat(start.slice(0, -1));
  } else if (typeof start === "string") {
    start = parseFloat(start);
  } else if (typeof start === "number" && isNaN(start)) {
    start = 0; // Default to 0 if NaN
  }

  if (!input) {
    exitWithResult({ error: "Please provide an input GIF file to cut" }, false);
  }

  if (!fs.existsSync(input)) {
    exitWithResult({ error: `Input file ${input} does not exist` }, false);
  }

  if (!argv.quiet) console.log(`Cutting ${input}...`);

  // Get the duration of the input GIF
  try {
    const durationOutput = await execa("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      input,
    ]);
    const duration = parseFloat(durationOutput.stdout);

    if (start >= duration) {
      exitWithResult({ error: `--start value (${start}s) is greater than or equal to the GIF duration (${duration}s).` }, false);
    }

    if (start + end >= duration) {
      exitWithResult({ error: `The sum of --start (${start}s) and --end (${end}s) is greater than or equal to the GIF duration (${duration}s).` }, false);
    }

    const cutDuration = duration - end;

    // Handle in-place editing by using a temporary file
    let actualOutput = output;
    let tempFile = null;
    if (input === output) {
      tempFile = `temp-${Date.now()}-${path.basename(output)}`;
      actualOutput = tempFile;
    }

    // Process the GIF cut
    const cutArgs = [
      "-i",
      input,
      "-ss",
      start.toString(),
      "-to",
      cutDuration.toString(),
      "-y",
      actualOutput,
    ];

    await execa("ffmpeg", cutArgs);

    // If we used a temporary file, move it to the original location
    if (tempFile) {
      fs.renameSync(tempFile, output);
    }

    if (!argv.quiet) console.log(`Cut GIF saved as ${output}`);
    exitWithResult({ output: output, format: 'gif', duration: cutDuration - start });
  } catch (error) {
    exitWithResult({ error: `Cut failed: ${error.message}` }, false);
  }
}

async function recordScreen(argv) {
  const top = getLastArg(argv.top);
  const bottom = getLastArg(argv.bottom);
  const left = getLastArg(argv.left);
  const right = getLastArg(argv.right);
  const end = getLastArg(argv.end);
  const start = getLastArg(argv.start);
  const speed = getLastArg(argv.speed);
  const gifArg = getLastArg(argv.gif);
  const gifcompression = getLastArg(argv.gifcompression);
  const keepAspectRatio = getLastArg(argv.keepAspectRatio);
  const output = getLastArg(argv.output);
  const mp4 = getLastArg(argv.mp4);
  const duration_limit = getLastArg(argv.duration);

  const resolution = resolutions[gifArg] || gifArg || "1280x720";
  const [gifWidth, gifHeight] = resolution.split("x").map(Number);
  const tempMp4 = `temp-${Date.now()}.mp4`;

  let outputFilename = output;
  if (mp4 && !output.endsWith(".mp4")) {
    outputFilename = `${output}.mp4`;
  }

  const screenResolution = await getScreenResolution();

  if (!argv.quiet) console.log("Starting screen recording... Press CTRL+C to stop.");
  if (duration_limit && !argv.quiet) console.log(`Recording will automatically stop after ${duration_limit} seconds.`);

  const recordingProcess = execa(
    "ffmpeg",
    [
      "-video_size",
      screenResolution,
      "-framerate",
      "30",
      "-f",
      "x11grab",
      "-i",
      ":0.0",
      "-c:v",
      "libx264",
      "-qp",
      "0",
      tempMp4,
    ],
    { stdio: "pipe", reject: false },
  );

  let isStopping = false;
  async function stopAndProcess() {
    if (isStopping) return;
    isStopping = true;

    if (!argv.quiet) console.log("\nStopping recording...");
    recordingProcess.stdin.write("q");
    await recordingProcess;

    if (!argv.quiet) console.log("Processing video...");

    try {
      const durationOutput = await execa("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        tempMp4,
      ]);
      const duration = parseFloat(durationOutput.stdout);

      if (start >= duration) {
        exitWithResult({ error: `--start value (${start}s) is greater than or equal to the video duration (${duration}s).` }, false);
      }

      if (start + end >= duration) {
        exitWithResult({ error: `The sum of --start (${start}s) and --end (${end}s) is greater than or equal to the video duration (${duration}s).` }, false);
      }

      const cutDuration = duration - end;

      let scaleFilter;
      if (keepAspectRatio) {
        scaleFilter = `scale=${gifWidth}:-1:flags=lanczos`;
      } else {
        scaleFilter = `scale=${gifWidth}:${gifHeight}:flags=lanczos`;
      }

      if (mp4) {
        const mp4Args = [
          "-i",
          tempMp4,
          "-vf",
          `crop=iw-${left}-${right}:ih-${top}-${bottom}:${left}:${top},setpts=${1 / speed}*PTS,${scaleFilter}`,
          "-ss",
          start.toString(),
          "-to",
          cutDuration.toString(),
          "-y",
          outputFilename,
        ];

        await execa("ffmpeg", mp4Args);
        if (!argv.quiet) console.log(`MP4 saved as ${outputFilename}`);
        exitWithResult({ output: outputFilename, format: 'mp4', duration: duration });
      } else {
        if (!argv.quiet) console.log("Converting to GIF...");
        const palettegenArgs = [
          "-i",
          tempMp4,
          "-vf",
          `palettegen`,
          "-y",
          "palette.png",
        ];

        await execa("ffmpeg", palettegenArgs);

        const gifArgs = [
          "-i",
          tempMp4,
          "-i",
          "palette.png",
          "-filter_complex",
          `[0:v]crop=iw-${left}-${right}:ih-${top}-${bottom}:${left}:${top},setpts=${1 / speed}*PTS,${scaleFilter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
          "-ss",
          start.toString(),
          "-to",
          cutDuration.toString(),
          "-y",
          outputFilename,
        ];

        await execa("ffmpeg", gifArgs);
        if (!argv.quiet) console.log(`GIF saved as ${outputFilename}`);
        fs.unlinkSync("palette.png");
        
        // Cleanup temp file
        if (fs.existsSync(tempMp4)) {
          fs.unlinkSync(tempMp4);
        }
        
        exitWithResult({ output: outputFilename, format: 'gif', duration: duration });
      }
    } catch (error) {
      exitWithResult({ error: `Processing failed: ${error.message}` }, false);
    }
  }

  process.on("SIGINT", stopAndProcess);

  if (duration_limit) {
    setTimeout(stopAndProcess, duration_limit * 1000);
  }
}

main();
