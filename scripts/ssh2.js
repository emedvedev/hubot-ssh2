// Description:
//   Perform commands over SSH
//
// Commands:
//   hubot ssh <user> <host> <command> - SSH user, host and command
//
// Dependencies:
//   simple-ssh
//
// Author:
//   willgarcia <garcia.rodriguez.william@gmail.com>

const SSH = require('simple-ssh');
const fs = require('fs');
const { WebClient } = require('@slack/client');

const homedir = require('os').homedir();

module.exports = function (robot) {
  robot.respond(/ssh (.+?) (.+?) (.+)/i, (msg) => {
    let
      user = msg.match[1],
      host = msg.match[2].replace(/http:\/\//g, ''),
      command = msg.match[3].replace(/['‘“`"]+/g, ''),
      ssh = new SSH({
        user,
        host,
        key: fs.readFileSync(`${homedir}/.ssh/id_rsa`, { encoding: 'utf8' }),
      });

    ssh.on('error', (err) => {
      msg.reply(err);
      ssh.end();
    });

    let buffer = '';
    const web = new WebClient(robot.adapter.options.token);

    ssh.exec(command, {
      out(stdout) {
        buffer += stdout;
      },
      exit(code) {
        web.files.upload({
          content: buffer.trim(),
          title: 'SSH output',
          channels: msg.message.room,
        });
        msg.reply(code === 0 ? 'Success! (Exit code: 0)' : `Exit code: ${code}`);
      },
      err(stderr) {
        buffer += stderr;
      },
    }).start();
  });
};
