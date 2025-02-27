import { h, defineComponent } from "../../../../lib/index.js";

export const AboutUser = defineComponent({
  render() {
    return (
      <div className="my-3  c-about-card p-3 glass-effect">
        <div className="ps-2 text-center text-lg-start">
          <p className=""><i class="fa-solid fa-hashtag pe-1"></i>About Me</p>
        </div>
        <div className="text-center text-lg-start">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    );
  },
});
