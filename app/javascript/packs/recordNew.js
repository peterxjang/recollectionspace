/* global SimpleMDE */
import Router from "../router";

const simplemde = new SimpleMDE();
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
const $form = document.querySelector("form");
const $caption = document.querySelector("#caption");
const $body = document.querySelector("#body");
const $image = document.querySelector("#image");
const $errors = document.querySelector(".errors");
const $buttonCancel = document.querySelector("#cancel");

Router.matchUrl("/:username/:collection_name/new", routeParams => {
  $form.addEventListener("submit", event => {
    event.preventDefault();
    let params = new FormData();
    params.append("user_collection_id", $form.dataset.collectionId);
    if ($image && $image.files && $image.files[0]) {
      params.append("image", $image.files[0]);
    }
    params.append("name", $caption.value);
    params.append("description", $body.value);
    fetch("/api/user_records", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      redirect: "follow",
      referrer: "no-referrer",
      body: params,
      headers: { "X-CSRF-Token": csrfToken }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
        window.location.href = `/${$form.dataset.username}/${
          $form.dataset.collectionName
        }/${data.id}`;
      })
      .catch(error => {
        error.json().then(data => {
          if (data.errors && data.errors.length === 0) {
            data.errors = ["Unknown error"];
          }
          $errors.innerHTML = data.errors
            .map(error => `<li>${error}</li>`)
            .join("");
        });
      });
  });
});

Router.matchUrl("/:username/:collection_name/:id/edit", routeParams => {
  $form.addEventListener("submit", event => {
    event.preventDefault();
    let params = new FormData();
    params.append("user_collection_id", $form.dataset.collectionId);
    if ($image && $image.files && $image.files[0]) {
      params.append("image", $image.files[0]);
    }
    params.append("name", $caption.value);
    params.append("description", $body.value);
    fetch(`/api/user_records/${$form.dataset.recordId}`, {
      method: "PATCH",
      mode: "cors",
      cache: "no-cache",
      redirect: "follow",
      referrer: "no-referrer",
      body: params,
      headers: { "X-CSRF-Token": csrfToken }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
        window.location.href = `/${$form.dataset.username}/${
          $form.dataset.collectionName
        }/${data.id}`;
      })
      .catch(error => {
        error.json().then(data => {
          if (data.errors && data.errors.length === 0) {
            data.errors = ["Unknown error"];
          }
          $errors.innerHTML = data.errors
            .map(error => `<li>${error}</li>`)
            .join("");
        });
      });
  });
});

$buttonCancel.onclick = event => {
  window.location.href = `/${$form.dataset.username}/${
    $form.dataset.collectionName
  }`;
};
