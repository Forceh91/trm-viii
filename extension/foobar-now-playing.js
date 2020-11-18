"use strict";

const io = require("socket.io").listen(20000);

// note - deaths are only counted for the first 5 tomb raider games
module.exports = function(nodecg) {
  const foobarNowPlaying = nodecg.Replicant("foobarNowPlaying", {
    defaultValue: {
      artist: "",
      track: "",
      album: ""
    }
  });

  nodecg.log.info("[FOOBAR] Foobar2000 NP module loaded, waiting for input...");

  io.on("connection", function(socket) {
    nodecg.log.info("[FOOBAR] Connected to a Foobar2000 instance");

    socket.on("disconnect", function() {
      nodecg.log.info("[FOOBAR] Disconnected from the Foobar2000 instance");
    });

    socket.on("foo_artist", function(data) {
      nodecg.log.info("[FOOBAR] New artist received: " + data);
      foobarNowPlaying.value.artist = data;
    });

    socket.on("foo_title", function(data) {
      nodecg.log.info("[FOOBAR] New title received: " + data);
      foobarNowPlaying.value.track = data;
    });

    socket.on("foo_album", data => {
      nodecg.log.info("[FOOBAR] New album received: ", data);
      foobarNowPlaying.value.album = data;
    })
  });
};
