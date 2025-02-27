import { h, defineComponent } from "../../../lib/index.js";
import { BASE_API_URL_2 } from "../../utils/constants.js";
import { myFetch, BACKEND_URL } from "../../utils/apiRequest.js";
import { notify, updateStore } from "../../../lib/store.js";
import { Store } from "../../../lib/store.js";
import { i18n } from "../../utils/i18n.js";
export const SettingImg = defineComponent({
  state() {
    return {
      imgUrl: "",
    };
  },
  render() {
    return (
      <div className="position-relative  c-settings-image ">
        <img src={this.state.imgUrl} className=" w-100 h-100  rounded-circle" />
        <button
          className="position-absolute position-absolute bottom-0 end-0 
        rounded-circle d-flex justify-content-center align-items-center  c-edit-icon border-0"
          on:click={() => {
            document.getElementById("upload-pic")?.click();
          }}
        >
          <input
            id="upload-pic"
            type="file"
            accept="image/*"
            className="d-none"
            on:change={(e) => this.changeImg(e.target)}
          />
          <i class="fa-regular fa-pen-to-square m-0 fs-5"></i>
        </button>
      </div>
    );
  },
  methods: {
    async changeImg(input) {
      const img = input.files[0];
      if (!img) {
        console.warn(i18n.t('settings.settingImg.noFile'));
      }
      const data = new FormData();
      data.append("avatar", img);
      const response = await myFetch(`${BACKEND_URL}/manage/change_avatar/`, {
        method: "POST",
        body: data,
      });
      if (response.ok) {
        const imgUrl = URL.createObjectURL(img);
        this.$updateState({ imgUrl});
        updateStore({ image_changed: imgUrl });
        notify("success", i18n.t('settings.settingImg.updateSuccess'));
      } else {
        notify("error", i18n.t('settings.settingImg.updateError'));
      }
    },
  },
  onMounted() {
    this.$updateState({ imgUrl: this.props.imgUrl });
  }
});
