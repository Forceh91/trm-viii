("use strict");

module.exports = function (nodecg) {
  const TwitchHelixAPI = require("node-twitch").default;
  const Passport = require("passport");
  const TwitchPassport = require("passport-twitch-new").Strategy;

  let broadcasterID = "";
  const twitchTitleReplicant = nodecg.Replicant("twitch_title", {
    defaultValue: "",
  });

  const twitch = new TwitchHelixAPI({
    client_id: nodecg.bundleConfig.twitch_client_id,
    client_secret: nodecg.bundleConfig.twitch_client_secret,
    scopes: [
      "channel:edit:commercial",
      "channel:manage:broadcast",
      "user:edit:broadcast",
    ],
  });

  console.warn("*** WAITING FOR TWITCH AUTHORIZATION ***");
  console.error("*** AUTOMATIC TRANSITIONS WILL NOT WORK WITHOUT THIS ***");

  const passport = Passport.use(
    new TwitchPassport(
      {
        clientID: nodecg.bundleConfig.twitch_client_id,
        clientSecret: nodecg.bundleConfig.twitch_client_secret,
        callbackURL: "http://localhost:9090/trm-viii/auth/twitch/callback",
        scope:
          "channel:edit:commercial channel:manage:broadcast user:edit:broadcast",
      },
      function (accessToken, refreshToken, profile, done) {
        if (!profile || !accessToken || !refreshToken) return;

        broadcasterID = profile.id;
        twitch.access_token = accessToken;
        twitch.refresh_token = refreshToken;

        console.log("*** TWITCH CONNECTED SUCCESSFULLY ****");
        console.log("*** AUTOMATIC TRANSITIONS ARE NOW ENABLED ****");

        completeTwitchSetup();
        done();
      }
    )
  );

  //   window.open("http://localhost:9090/trm-viii/authenticatenodecgtwitch");

  const router = nodecg.Router();
  router.get(
    "/authenticatenodecgtwitch",
    passport.authenticate("twitch", { forceVerify: true })
  );
  router.get(
    "/auth/twitch/callback",
    passport.authenticate("twitch", { failureRedirect: "/dashboard" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("http://localhost:9090/dashboard");
    }
  );

  nodecg.mount("/trm-viii", router);

  function completeTwitchSetup() {
    twitch
      .getChannelInformation({ broadcaster_id: broadcasterID })
      .then((resp) => {
        if (!resp.data || !resp.data.length) return;

        const channelInfo = resp.data[0] || {};
        twitchTitleReplicant.value = channelInfo.title;
      });
  }
};
