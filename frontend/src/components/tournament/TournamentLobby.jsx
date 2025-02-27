import { h, defineComponent } from "../../../lib/index.js";
import { BACKEND_URL } from "../../utils/apiRequest.js";
export const TournamentLobby = defineComponent({
  props: {
    participants: {
      type: Array,
      required: true, // Ensure participants are passed as a prop
    },
    maxSlots: {
      type: Number,
      required: true, // Maximum allowed slots
    },
    onStart: {
      type: Function,
      required: true, // Callback to start the tournament
    },
  },
  methods: {
    handleStart() {
      const { participants, maxSlots } = this.props;

      // Check if all slots are filled
      if (participants.length < maxSlots) {
        alert(
          `Cannot start tournament! Only ${participants.length} out of ${maxSlots} slots are filled.`
        );
      } else {
        // console.log("Tournament starting...");
        this.props.onStart(); // Call the start callback if slots are full
      }
    },
  },
  render() {
    return h("div", { className: "tournament-lobby p-4" }, [
      h(
        "div",
        { className: "participants-list d-flex flex-wrap gap-3" },
        this.props.participants.length > 0
          ? this.props.participants.map((participant) => {
              // console.log('Participant User Object:', participant.user);
  
              return h("div", { className: "participant-card text-center" }, [
                h("img", {
                  src: `${BACKEND_URL}/auth${participant.user.avatar || "/media/default-avatar.png"}`,
                  alt: "Avatar",
                  className: "participant-avatar rounded-circle",
                }),
                h("p", { className: "mt-2" }, participant.user.display_name || "Unknown Player"),
              ]);
            })
          : h("p", {}, "No participants have joined yet.")
      ),
      h(
        "button",
        {
          className: "btn c-btn-start mt-4",
          "on:click": () => this.handleStart(),
          disabled: this.props.participants.length < this.props.maxSlots,
        },
        "Start Tournament"
      ),
    ]);
  }
  
  
});
