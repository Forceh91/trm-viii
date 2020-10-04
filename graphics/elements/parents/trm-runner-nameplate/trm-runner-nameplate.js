import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";

// replicants
const runnerTimers = nodecg.Replicant("runnerTimers");

class TRMRunnerNameplate extends PolymerElement {
	static get template() {
		return html`
			<style>
				* {
					box-sizing: border-box;
				}

				:host {
					border: 0;
					color: #fff;
					display: block;
					overflow: hidden;
					width: auto;
				}

				#body {
					color: #fff;
					display: flex;
					font-weight: bold;
					text-transform: uppercase;
				}

				#name {
					background: var(--marathon-alt-col);
					float: left;
					padding: 15px;
				}

				#time {
					display: flex;
				}

				#position {
					background: #111;
					float: left;
					padding: 15px;
					text-align: center;
				}

				#finalTime {
					background: #151515;
					float: left;
					padding: 15px;
					text-align: right;
				}

				#time.hidden {
					display: none;
				}
			</style>

			<div id="body">
				<div id="name"></div>
				<div id="time">
					<div id="position"></div>
					<div id="finalTime"></div>
				</div>
			</div>
		`;
	}

	static get is() {
		return "trm-runner-nameplate";
	}

	static get properties() {
		return {
			runnerid: Number,
		};
	}

	ready() {
		super.ready();

		// list of replicants we need
		const replicants = [runnerTimers];

		let numDeclared = 0;
		replicants.forEach((replicant) => {
			replicant.once("change", () => {
				numDeclared++;

				if (numDeclared == replicants.length) {
					beforeNextRender(this, this.run);
				}
			});
		});
	}

	run() {
		runnerTimers.on("change", (newVal) => {
			this.drawNameplate(newVal);
		});
	}

	drawNameplate(value) {
		const nameplate = value && value.find((timer) => timer.id === parseInt(this.runnerid));
		if (!nameplate) return;

		this.$.name.innerText = nameplate.runner || "Unknown";
		if (nameplate.state !== 3) this.$.time.classList.add("hidden");
		else {
			this.$.time.classList.remove("hidden");
			this.$.position.innerText = nameplate.position;
			this.$.finalTime.innerText = nameplate.formattedTime;
		}
	}
}

customElements.define(TRMRunnerNameplate.is, TRMRunnerNameplate);
