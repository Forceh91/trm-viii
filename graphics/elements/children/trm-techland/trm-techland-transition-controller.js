import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";

const transitionCurrentState = nodecg.Replicant("transition_current_state");

class TRMTechLandTransitionController extends PolymerElement {
  static get template() {
    return html`
      <link
        rel="stylesheet"
        href="../shared/fonts/fontawesome/font-awesome.min.css"
      />

      <style>
        :host {
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          height: 100%;
          width: 100%;
        }

        #transition_container {
        }

        #current_state {
          color: var(--marathon-col);
        }

        .info-title {
          color: #cacaca;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
          width: 100%;
        }

        .info-text {
          font-size: 18px;
          font-weight: normal;
          width: 100%;
        }

        #transition_stages_container {
          margin-top: 20px;
        }

        #transition_stages {
          list-style: none;
          margin-top: 20px;
        }

        #transition_stages i {
          display: none;
          margin-right: 10px;
        }

        #transition_stages .pending .fa-circle-notch {
          display: initial;
        }

        #transition_stages .working .fa-spinner {
          display: inline-block;
        }

        #transition_stages .complete {
          opacity: 0.6;
        }

        #transition_stages .complete .fa-check {
          color: forestgreen;
          display: initial;
        }
      </style>

      <div id="transition_container">
        <div class="info-title">Current Stage</div>
        <div class="info-text"><span id="current_state"></span></div>

        <div id="transition_stages_container">
          <div class="info-title">Transition Stages</div>
          <ul class="info-text" id="transition_stages"></ul>
        </div>

        <div id="button_container">
          <button id="begin_transmission" type="button" class="btn btn-warning">
            <span>Begin Transmission</span>
          </button>
        </div>
      </div>
    `;
  }

  static get is() {
    return "trm-techland-transition-controller";
  }

  static get properties() {
    return {};
  }

  ready() {
    super.ready();

    transitionCurrentState.on("change", (newVal) => {
      this.updateCurrentTransitionState(newVal);

      nodecg.sendMessage("transition:get_transition_list", {}, (stages) => {
        this.$.transition_stages.innerHTML = "";

        stages.forEach((stage) => {
          let classString =
            newVal.stage.id === stage.id
              ? this.getClassForTransitionState(
                  transitionCurrentState.value.state
                )
              : "pending";
          if (newVal.stage.id > stage.id)
            classString = this.getClassForTransitionState(2);
          this.$.transition_stages.innerHTML += `<li class="${classString}"><i class="fa fa-circle-notch"></i><i class="fa fa-spinner fa-spin"></i><i class="fa fa-check"></i><span>${stage.title}</span></li>`;
        });
      });

      this.$.begin_transmission.addEventListener(
        "click",
        this.beginTransmission.bind(this)
      );
    });
  }

  updateCurrentTransitionState(transitionState) {
    this.$.current_state.textContent = transitionState.stage.title;
  }

  getClassForTransitionState(state) {
    switch (state) {
      case 0: // pending
        return "attention";
      case 1: // working
        return "working";
      case 2: // finished
        return "complete";
    }
  }

  beginTransmission() {
    const self = this;
    nodecg.sendMessage("transition:start_transmission", null, () => {
      self.$.begin_transmission.setAttribute("disabled", true);
      self.$.begin_transmission.textContent = "Transitioning...";
    });
  }
}

customElements.define(
  TRMTechLandTransitionController.is,
  TRMTechLandTransitionController
);
