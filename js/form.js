import {resetScale } from './scale.js';
import {resetEffects } from './effects.js';
import { showMessageError, showMessageSuccess } from './message.js';
import { sendDate } from './api.js';

const MAX_HASHTAG_COUNT = 5;
const MAX_COMMENT_LENGTH = 140;
const INVALID_HASHTAG = 'Неверный формат хэштэгов';
const INVALID_MAX_COMMENT_LENGTH = 'длина комментария не может быть больше 140 символов';
const TAG_PATTERN = /^#[a-za-яё0-9]{1,19}$/i;

const form = document.querySelector('.img-upload__form');
const overlay = document.querySelector('.img-upload__overlay');
const cancelButton = document.querySelector('.img-upload__cancel');
const fileField = document.querySelector('.img-upload__input');
const hashtagField = document.querySelector('.text__hashtags');
const commentField = document.querySelector('.text__description');
const submitButton = form.querySelector('.img-upload__submit');

const SubmitButtonText = {
  IDLE: 'Опубликовать',
  SENDING: 'Публикую...'
};

const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextClass: 'img-upload__field-wrapper__error',
});

const showForm = () => {
  overlay.classList.remove('hidden');
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onDocumentKeydown);
};

export const hideForm = () => {
  form.reset();
  resetScale();
  resetEffects();
  pristine.reset();
  overlay.classList.add('hidden');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onDocumentKeydown);
};

const isTextFieldFocused = () =>
  document.activeElement === hashtagField ||
  document.activeElement === commentField;

const normalizeTags = (tagString) => tagString
  .trim()
  .split(' ')
  .filter((tag) => Boolean(tag.length));

const isCommentValid = (value) => value.length <= MAX_COMMENT_LENGTH;

const isTagsCountValid = (tags) => tags.length <= MAX_HASHTAG_COUNT;

const isTagsUnique = (tags) => {
  const lowerCaseTags = tags.map((tag) => tag.toLowerCase());

  return lowerCaseTags.length === new Set(lowerCaseTags).size;
};

const isTagsValid = (tags) => tags.every((tag) => TAG_PATTERN.test(tag));

const validateHashTags = (value) => {
  const tags = normalizeTags(value);

  return isTagsCountValid(tags) && isTagsUnique(tags) && isTagsValid(tags);
};

function onDocumentKeydown(evt) {
  if (evt.key === 'Escape' && !isTextFieldFocused()) {
    evt.preventDefault();
    hideForm();
  }
}

const onCancelButtonClick = () => {
  hideForm();
};

const onFileInputChange = () => {
  showForm();
};

const blockSubmitButton = () => {
  submitButton.disabled = true;
  submitButton.textContent = SubmitButtonText.SENDING;
};

const unblockSubmitButton = () => {
  submitButton.disabled = false;
  submitButton.textContent = SubmitButtonText.IDLE;
};

export const onFormSubmit = (onSuccess) => {
  form.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const isValid = pristine.validate();

    if (isValid) {
      blockSubmitButton();
      sendDate(new FormData(evt.target))
        .then(onSuccess)
        .then(showMessageSuccess)
        .catch(
          (err) => {
            showMessageError(err.message);
          }
        )
        .finally(unblockSubmitButton);
    }
  });
};

pristine.addValidator(hashtagField, validateHashTags, INVALID_HASHTAG);
pristine.addValidator(commentField, isCommentValid, INVALID_MAX_COMMENT_LENGTH);

fileField.addEventListener('change', onFileInputChange);
cancelButton.addEventListener('click', onCancelButtonClick);


