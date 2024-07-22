import './form.js';
import {getData} from './api.js';
import {initGallery} from'./gallery.js';
import {showAlert} from './dialogs.js';


getData()
  .then((pictureList) => {
    initGallery(pictureList);
  })
  .catch(
    (err) => {
      showAlert(err.message);
    }
  );

