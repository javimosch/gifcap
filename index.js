#!/usr/bin/env node

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
const yargs = require('yargs');
const execa = require('execa');
const fs = require('fs');
const path = require('path');

const argv = yargs(process.argv.slice(2))
  .usage(`
\x1b[35m╔══════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m║\x1b[36m   🎬 GifCap Usage\x1b[35m                                          ║\x1b[0m
\x1b[35m║\x1b[37m   Record your screen and convert to optimized GIFs\x1b[35m      ║\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m║\x1b[37m   Usage: gifcap [options]\x1b[35m                              ║\x1b[0m
\x1b[35m║                                                              ║\x1b[0m
\x1b[35m╚══════════════════════════════════════════════════════════════╝\x1b[0m
  `)
  .option('top', {
    alias: 't',
    type: 'number',
    description: 'Pixels to crop from the top',
    default: 0,
  })
  .option('bottom', {
    alias: 'b',
    type: 'number',
    description: 'Pixels to crop from the bottom',
    default: 0,
  })
  .option('left', {
    alias: 'l',
    type: 'number',
    description: 'Pixels to crop from the left',
    default: 0,
  })
  .option('right', {
    alias: 'r',
    type: 'number',
    description: 'Pixels to crop from the right',
    default: 0,
  })
  .option('end', {
    alias: 'e',
    type: 'number',
    description: 'Seconds to cut from the end',
    default: 0,
  })
  .option('start', {
    alias: 's',
    type: 'number',
    description: 'Seconds to cut from the start',
    default: 0,
  })
  .option('speed', {
    type: 'number',
    description: 'Speed up the GIF',
    default: 1.0,
  })
  .option('gif', {
    alias: 'g',
    type: 'string',
    description: 'GIF resolution (e.g., 1024x1024 or 720p)',
    default: '1024x1024',
  })
  .option('gifcompression', {
    alias: 'c',
    type: 'number',
    description: 'GIF compression (0-100)',
    default: 50,
  })
  .option('keep-aspect-ratio', {
    alias: 'a',
    type: 'boolean',
    description: 'Keep aspect ratio',
    default: true,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output file name',
    default: `output-${Date.now()}.gif`,
  })
  .option('mp4', {
    type: 'boolean',
    description: 'Output an MP4 file instead of a GIF',
    default: false,
  })
  .help('help')
  .alias('help', 'h')
  .epilogue(`
\x1b[35m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m║\x1b[36m   📖 Example Command Breakdown\x1b[35m                                             ║\x1b[0m
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m║\x1b[33m   gifcap -t 100 -l 55 -s 1 -e 2 -c 0 --speed=2.0 -g 720p -o tutorial.gif\x1b[35m ║\x1b[0m
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
\x1b[35m║                                                                              ║\x1b[0m
\x1b[35m║\x1b[36m   💡 Pro tip: Use 480p for quick demos, 720p for tutorials!\x1b[35m            ║\x1b[0m
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
  `)
  .argv;

function getLastArg(arg) {
  if (Array.isArray(arg)) {
    return arg[arg.length - 1];
  }
  return arg;
}

const resolutions = {
  '480p': '854x480',
  '720p': '1280x720',
  '1080p': '1920x1080',
  '1440p': '2560x1440',
  '4k': '3840x2160',
  'vga': '640x480',
  'svga': '800x600',
  'xga': '1024x768',
};

async function getScreenResolution() {
    try {
        const { stdout } = await execa('xdpyinfo');
        const match = /dimensions:\s+(\d+x\d+)/.exec(stdout);
        if (match) {
            return match[1];
        }
        throw new Error('Could not find screen resolution.');
    } catch (error) {
        console.error('Error getting screen resolution. Please make sure xdpyinfo is installed and you are in a graphical environment.', error);
        process.exit(1);
    }
}


async function main() {
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

  const resolution = resolutions[gifArg] || gifArg;
  const [gifWidth, gifHeight] = resolution.split('x').map(Number);
  const tempMp4 = `temp-${Date.now()}.mp4`;

  let outputFilename = output;
  if (mp4 && !output.endsWith('.mp4')) {
    outputFilename = `${output}.mp4`;
  }


  const screenResolution = await getScreenResolution();

  console.log('Starting screen recording... Press CTRL+C to stop.');

  const recordingProcess = execa('ffmpeg', [
    '-video_size',
    screenResolution,
    '-framerate',
    '30',
    '-f',
    'x11grab',
    '-i',
    ':0.0',
    '-c:v',
    'libx264',
    '-qp',
    '0',
    tempMp4
  ], { stdio: 'pipe', reject: false });

  process.on('SIGINT', async () => {
    console.log('\nStopping recording...');
    recordingProcess.stdin.write('q');
    await recordingProcess;

    console.log('Processing video...');

    const durationOutput = await execa('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', tempMp4]);
    const duration = parseFloat(durationOutput.stdout);

    if (start >= duration) {
        console.error(`Error: --start value (${start}s) is greater than or equal to the video duration (${duration}s).`);
        process.exit(1);
    }

    if (start + end >= duration) {
        console.error(`Error: The sum of --start (${start}s) and --end (${end}s) is greater than or equal to the video duration (${duration}s).`);
        process.exit(1);
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
        '-i',
        tempMp4,
        '-vf',
        `crop=iw-${left}-${right}:ih-${top}-${bottom}:${left}:${top},setpts=${1/speed}*PTS,${scaleFilter}`,
        '-ss',
        start.toString(),
        '-to',
        cutDuration.toString(),
        '-y',
        outputFilename
      ];

      await execa('ffmpeg', mp4Args);
      console.log(`MP4 saved as ${outputFilename}`);
    } else {
      console.log('Converting to GIF...');
      const palettegenArgs = [
          '-i',
          tempMp4,
          '-vf',
          `palettegen`,
          '-y',
          'palette.png'
      ];

      await execa('ffmpeg', palettegenArgs);

      const gifArgs = [
          '-i',
          tempMp4,
          '-i',
          'palette.png',
          '-filter_complex',
          `[0:v]crop=iw-${left}-${right}:ih-${top}-${bottom}:${left}:${top},setpts=${1/speed}*PTS,${scaleFilter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
          '-ss',
          start.toString(),
          '-to',
          cutDuration.toString(),
          '-y',
          outputFilename
      ];
      
      await execa('ffmpeg', gifArgs);
      console.log(`GIF saved as ${outputFilename}`);
      fs.unlinkSync('palette.png');
    }


    // Cleanup
    fs.unlinkSync(tempMp4);

    process.exit(0);
  });
}

main();
