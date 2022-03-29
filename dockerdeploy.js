const { exec } = require("child_process");

const args = process.argv;

const dockerUser = args[2];
const dockerPassword = args[3];
const dockerImagePath = args[4];
const dockerImageName = args[5];
const dockerPortRange = args[6];

(async () => {
    await run("docker ps");

    await run("docker login -u " + dockerUser + " -p " + dockerPassword);

    await run("docker pull " + dockerImagePath);

    await removeOldImage();

    await run("docker run -d -p " + dockerPortRange + " --name " + dockerImageName + " " + dockerImagePath);

    await run("docker ps");

    await run("docker logout");

  })();

/**
 * Determines if the image/container needs to be stopped, removed, or both.
 */
async function removeOldImage(){
    const result = await command("docker ps");
    console.log(`${result.stdout}`);

    if (result.stdout.indexOf(dockerImageName) > -1) {

        console.log("stopping container " + dockerImageName);
        run("docker stop " + dockerImageName);

        await sleep(2000);
    }

    const resultAll = await command("docker ps -a");
    console.log(`${resultAll.stdout}`);

    if (resultAll.stdout.indexOf(dockerImageName) > -1) {

        console.log("removing container " + dockerImageName);
        run("docker rm " + dockerImageName);

        await sleep(2000);
    }
}

/**
 * Wraps the command text and execution writing the results to the console.
 * @param {string} commandText 
 * @returns 
 */
async function run(commandText){
    const result = await command(commandText);

    if (result.error) {
        console.log(`${result.error.message}`);
        return;
    }
    if (result.stderr) {
        console.log(`${result.stderr}`);
        return;
    }

    console.log(`${result.stdout}`);
}

/**
 * Wrapping the exec command in a promise to make it awaitable.
 * @param {string} text 
 * @returns 
 */
function command(text) {
    return new Promise(resolve => {
        exec(text, (error, stdout, stderr) => {resolve({error, stdout, stderr})});
      });
}

/**
 * Pauses thread for a allott amount of time. In milliseconds
 * @param {int} time 
 * @returns 
 */
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
