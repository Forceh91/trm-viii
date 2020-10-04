import { PolymerElement } from "../../node_modules/@polymer/polymer/polymer-element.js";

const foobarNowPlaying = nodecg.Replicant("foobarNowPlaying");

class DashboardNowPlaying extends PolymerElement {
	static get is() {
		return "dashboard-now-playing";
	}

	ready() {
		super.ready();

		foobarNowPlaying.on("change", (newVal) => {
			this.$.artist.textContent = newVal.artist;
			this.$.track.textContent = newVal.track;
		});
	}
}

customElements.define(DashboardNowPlaying.is, DashboardNowPlaying);
