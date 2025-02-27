import { h, defineComponent, Fragment } from "../../../lib/index.js";
import { SearchInput } from "./SearchInput.js";
import { BASE_API_URL } from "../../utils/constants.js";
import { debounce } from "../../utils/debounse.js";
import { i18n } from "../../utils/i18n.js";
import { SearchResult } from "./SearchResult.js";
import { BACKEND_URL, myFetch } from "../../utils/apiRequest.js";

export const SearchBar = defineComponent({
  state() {
    return {
      result: [],
      suggestion: [],
      input: "",
      focus: false,
      error: false,
      debounceSearchUser: null,
      isLoading: false,
    };
  },
  render() {
    return (
      <div className={joinClasses(this, "position-relative")}>
        <SearchInput
          id={this.props.id}
          placeholder={i18n.t("navBar.searchuser")}
          on:input={(input) => {
            this.$updateState({ input: input.value });
            if (input.value.length > 1) this.state.debounceSearchUser();
          }}
          on:changeFocus={({ focus }) => {
            setTimeout(() => {
              this.$updateState({ focus });
            }
            , 150);
            // this.$updateState({ focus });
          }}
        />
        {this.state.input.length > 1 &&
        this.state.focus && 
        !this.state.isLoading ? (
          <SearchResult
            resultUsrs={this.state.result}
            error={this.state.error}
          />
        ) : (
          <></>
        )}
      </div>
    );
  },
  methods: {
    async searchUsers() {
      this.$updateState({ isLoading: true, error: false });
      const response = await myFetch(
        `${BACKEND_URL}/manage/search-users/?search=${this.state.input}`
      ).catch((error) => {
        return this.$updateState({ error: true, isLoading: false });
      });
      if (!response.ok)
        return this.$updateState({ error: true, isLoading: false });
      let result = await response.json();
      // console.log("searchUsers -> result", result);
      this.$updateState({ result, isLoading: false });
    },
  },
  onMounted() {
    this.$updateState({
      debounceSearchUser: debounce(this.searchUsers.bind(this), 200),
    });
  },
});

function joinClasses(comp, classes) {
  return `${comp?.props?.className ?? comp?.props?.class ?? ""} ${classes}`;
}
