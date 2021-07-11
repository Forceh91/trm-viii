"use strict";

const STATE = { PENDING: 0, WORKING: 1, COMPLETE: 2 };
const TRANSITION_STAGES = {
  TRANSITION_TO_SETUP_SCREEN: {
    id: 0,
    title: "Switch OBS to setup screen",
    requiresInput: false,
  },
  UPDATE_TO_NEXT_GAME: {
    id: 1,
    title: "Update stream overlay game",
    requiresInput: false,
  },
  UPDATE_TWITCH_TITLE: {
    id: 2,
    title: "Update Twitch title/game",
    requiresInput: false,
  },
  RUN_ADVERTS: {
    id: 3,
    title: "Run Twitch adverts",
    requiresInput: false,
  },
  START_MUSIC: {
    id: 4,
    title: "Start music",
    requiresInput: false,
  },
  GAME_SCREEN_VISIBLE: {
    id: -1,
    title: "Game screen visible",
    requiresInput: true,
  },
};

module.exports = (nodecg) => {
  const transitionStateReplicant = nodecg.Replicant("transition_current_state", {
    defaultValue: {
      stage: TRANSITION_STAGES.GAME_SCREEN_VISIBLE,
      state: STATE.COMPLETE,
    },
    persistent: false,
  });

  const currentGame = nodecg.Replicant("currentGame");
  currentGame.on("change", (newVal, oldVal) => {
    if (!transitionStateReplicant || !transitionStateReplicant.value) return;
    if (
      transitionStateReplicant.value.stage.id === TRANSITION_STAGES.UPDATE_TO_NEXT_GAME.id &&
      transitionStateReplicant.value.state === STATE.WORKING
    )
      startTwitchTitleUpdate(newVal);
  });

  const twitchTitle = nodecg.Replicant("twitch_title");
  twitchTitle.on("change", () => {
    if (!transitionStateReplicant || !transitionStateReplicant.value) return;

    const currentTransitionState = transitionStateReplicant.value;
    if (
      currentTransitionState.stage.id === TRANSITION_STAGES.UPDATE_TWITCH_TITLE.id &&
      currentTransitionState.state === STATE.WORKING
    )
      startTwitchAdvertRun();
  });

  const twitchAdStatus = nodecg.Replicant("twitch_ad_status");
  twitchAdStatus.on("change", () => {
    if (!transitionStateReplicant || !transitionStateReplicant.value) return;

    const currentTransitionState = transitionStateReplicant.value;
    if (
      currentTransitionState.stage.id === TRANSITION_STAGES.RUN_ADVERTS.id &&
      currentTransitionState.state === STATE.WORKING
    )
      startFoobarMusicPlay();
  });

  nodecg.listenFor("transition:get_transition_list", (data, callback) => {
    if (typeof callback === "function")
      callback([
        TRANSITION_STAGES.GAME_SCREEN_VISIBLE,
        TRANSITION_STAGES.TRANSITION_TO_SETUP_SCREEN,
        TRANSITION_STAGES.UPDATE_TO_NEXT_GAME,
        TRANSITION_STAGES.UPDATE_TWITCH_TITLE,
        TRANSITION_STAGES.RUN_ADVERTS,
        TRANSITION_STAGES.START_MUSIC,
      ]);
  });

  nodecg.listenFor("transition:start_transmission", (data, callback) => {
    if (transitionStateReplicant.value.stage.id !== TRANSITION_STAGES.GAME_SCREEN_VISIBLE.id) return;

    const firstStage = TRANSITION_STAGES.TRANSITION_TO_SETUP_SCREEN;
    transitionStateReplicant.value = {
      stage: firstStage,
      state: firstStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    startOBSTransitionToGameChange();

    if (typeof callback === "function") callback();
  });

  function startOBSTransitionToGameChange() {
    setTimeout(() => {
      const nextStage = TRANSITION_STAGES.UPDATE_TWITCH_TITLE;
      transitionStateReplicant.value = {
        stage: nextStage,
        state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
      };

      startStreamOverlayRunUpdate();
    }, 1 * 1000);
  }

  function startStreamOverlayRunUpdate() {
    const nextStage = TRANSITION_STAGES.UPDATE_TO_NEXT_GAME;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    nodecg.sendMessage("scheduleSelectNext");
  }

  function startTwitchTitleUpdate(game) {
    if (!game) return;

    const nextStage = TRANSITION_STAGES.UPDATE_TWITCH_TITLE;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    // we may have a list of runners (ie a race)
    const runnersList = game[1].split(",");
    const runners = [];

    // go through each runner
    const regex = /(\w+)/;
    runnersList.forEach((runner) => {
      // and parse out the markdown to something readable
      let demarkdownRunner = runner.match(regex);
      if (demarkdownRunner && demarkdownRunner[0]) runners.push(demarkdownRunner[0].trim());
    });

    nodecg.sendMessage("twitch:update_title_and_game", {
      title: `${nodecg.bundleConfig.marathon_name} for ${nodecg.bundleConfig.charity_name}: ${game[0]} ${
        game[3]
      } (${runners.join(", ")})`, // title
      game: game[6] || 33214, // game
    });
  }

  function startTwitchAdvertRun() {
    const nextStage = TRANSITION_STAGES.RUN_ADVERTS;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };

    nodecg.sendMessage("twitch:run_adverts");
  }

  function startFoobarMusicPlay() {
    const nextStage = TRANSITION_STAGES.START_MUSIC;
    transitionStateReplicant.value = {
      stage: nextStage,
      state: STATE.COMPLETE, //nextStage.requiresInput ? STATE.PENDING : STATE.WORKING,
    };
  }
};
