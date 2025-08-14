#!/usr/bin/env node
const yargs = require('yargs');
const execa = require('execa');
const fs = require('fs');
const path = require('path');

const argv = yargs(process.argv.slice(2))
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
    description: 'GIF resolution (e.g., 1024x1024)',
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
  .help()
  .alias('help', 'h')
  .argv;

function getLastArg(arg) {
  if (Array.isArray(arg)) {
    return arg[arg.length - 1];
  }
  return arg;
}

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
  const gif = getLastArg(argv.gif);
  const gifcompression = getLastArg(argv.gifcompression);
  const keepAspectRatio = getLastArg(argv.keepAspectRatio);
  const output = getLastArg(argv.output);

  const [gifWidth, gifHeight] = gif.split('x').map(Number);
  const outputGif = output;
  const tempMp4 = `temp-${Date.now()}.mp4`;

  const screenResolution = await getScreenResolution();

  console.log('Starting screen recording... Press CTRL+C to stop.');

  const recordingProcess = execa('ffmpeg', [
    '-video_size', screenResolution,
    '-framerate', '30',
    '-f', 'x11grab',
    '-i', ':0.0',
    '-c:v', 'libx264',
    '-qp', '0',
    tempMp4
  ], { stdio: 'pipe', reject: false });

  process.on('SIGINT', async () => {
    console.log('\nStopping recording...');
    recordingProcess.stdin.write('q');
    await recordingProcess;

    console.log('Processing video and converting to GIF...');

    const palettegenArgs = [
        '-i', tempMp4,
        '-vf', `palettegen`,
        '-y',
        'palette.png'
    ];

    await execa('ffmpeg', palettegenArgs);

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

    const gifArgs = [
        '-i', tempMp4,
        '-i', 'palette.png',
        '-filter_complex', `[0:v]crop=iw-${left}-${right}:ih-${top}-${bottom}:${left}:${top},setpts=${1/speed}*PTS,${scaleFilter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
        '-ss', start.toString(),
        '-to', cutDuration.toString(),
        '-y',
        outputGif
    ];
    
    await execa('ffmpeg', gifArgs);


    console.log(`GIF saved as ${outputGif}`);

    // Cleanup
    fs.unlinkSync(tempMp4);
    fs.unlinkSync('palette.png');

    process.exit(0);
  });
}

main();