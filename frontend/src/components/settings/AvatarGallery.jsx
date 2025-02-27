import { h, defineComponent } from "../../../lib/index.js";

const AvatarCard = defineComponent({
  render() {
    return (
      <div className="col-6 col-md-4 col-lg-3 col-xl-2  mb-2 mx-2">
        <img src={this.props.imgPath} className="c-imag-gallery rounded " />
      </div>
    );
  },
});

export const AvatarGallery = defineComponent({
  render() {
    let avatars = [];
    for (let i = 1; i <= 10; i++) {
      avatars.push(`avatar-${i}`);
    }
    return (
      <div className="p-3 h-100 overflow-hidden">
        Avatar Gallery
        <div className=" h-100 overflow-auto hidden-scrollbar">
          <div className="row d-flex justify-content-center">
            {avatars.map(e => <AvatarCard imgPath={`./img/Avatar/${e}.jpg`} /> )}
           
            
          </div>
        </div>
      </div>
    );
  },
});
