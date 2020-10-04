import { beforeNextRender } from "../../../../node_modules/@polymer/polymer/lib/utils/render-status.js";
import { PolymerElement } from "../../../../node_modules/@polymer/polymer/polymer-element.js";
import { html } from "../../../../node_modules/@polymer/polymer/lib/utils/html-tag.js";

const foobarNowPlaying = nodecg.Replicant("foobarNowPlaying");
const tl = new TimelineLite();

class TRMNowPlaying extends PolymerElement {
	static get template() {
		return html`
			<link rel="stylesheet" href="../shared/fonts/fontawesome/font-awesome.min.css" />
			<link rel="stylesheet" href="../shared/fonts/exo2/exo2.css" />

			<style>
				#body {
					align-items: center;
					color: #fff;
					display: flex;
					font-size: 20px;
					height: 100%;
					justify-content: center;
					overflow: hidden;
					width: 100%;
					white-space: nowrap;
				}

				#body:not(.has-background) span {
					text-shadow: 2px 1px #000;
				}

				#body.has-background {
					text-transform: uppercase;
					font-size: 1rem;
				}

				#track_container {
					display: flex;
					justify-content: center;
				}

				#track_container div:first-child {
					background: black;
					z-index: 2;
				}

				.fa.fa-music {
					margin-right: 5px;
				}

				#body.overflowing {
					display: block;
				}

				#body.overflowing #track_container {
					justify-content: initial;
				}

				#body.overflowing #track_container div {
					display: inline-block;
				}
			</style>

			<div id="body">
				<div id="track_container">
					<div><span class="fa fa-music"></span>&nbsp;</div>
					<div id="track_artist"><span id="artist"></span>&nbsp;-&nbsp;<span id="track"></span></div>
				</div>
			</div>
		`;
	}

	static get is() {
		return "trm-now-playing";
	}

	static get properties() {
		return {
			hasBackground: Boolean,
		};
	}

	ready() {
		super.ready();

		const replicants = [foobarNowPlaying];
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
		foobarNowPlaying.on("change", (newVal) => {
			if (!foobarNowPlaying.value || (foobarNowPlaying.value.artist === "" && foobarNowPlaying.value.track === "")) {
				this.$.body.style.display = "none";
			} else {
				if (this.$.body.style.display === "none") {
					this.$.body.style.display = "";
				}
			}

			this.$.artist.textContent = newVal.artist;
			this.$.track.textContent = newVal.track;

			// clear current timeline
			tl.clear();
			this.resetOverflowingTrackName(tl);

			// see if the track is too long and take measures to fit it
			if (this.$.track_container.clientWidth > this.$.body.clientWidth) {
				this.$.body.classList.add("overflowing");
				this.handleOverflowingTrackName();
			} else {
				this.$.body.classList.remove("overflowing");
			}
		});

		if (this.hasBackground) {
			this.$.body.classList.add("has-background");
		}
	}

	handleOverflowingTrackName() {
		const overflowAmount = this.$.track_artist.clientWidth - this.$.body.clientWidth + 50;

		tl.to(
			this.$.track_artist,
			overflowAmount * 0.015,
			{
				marginLeft: `-${overflowAmount}px`,
				ease: Power0.easeOut,
				onComplete: () => this.resetOverflowingTrackName(tl, true),
			},
			`+=5`
		);
	}

	resetOverflowingTrackName(tl, shouldContinue) {
		// reset the margin
		tl.to(
			this.$.track_artist,
			0,
			{
				marginLeft: 0,
				ease: Power0.easeOut,
			},
			shouldContinue ? `+=5` : ``
		);

		// and do it all again
		if (shouldContinue) this.handleOverflowingTrackName();
	}
}

customElements.define(TRMNowPlaying.is, TRMNowPlaying);
