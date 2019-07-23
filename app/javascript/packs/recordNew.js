/* global SimpleMDE */
import Router from "../router";

const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
const $form = document.querySelector("form");
const $caption = document.querySelector("#caption");
const $body = document.querySelector("#body");
const $image = document.querySelector("#image");
const $errors = document.querySelector(".errors");
const $buttonCancel = document.querySelector("#cancel");
const fileSelector = document.createElement("input");
fileSelector.setAttribute("type", "file");
fileSelector.setAttribute("accept", "image/*");

function disableEditor() {
  document.querySelector("textarea").disabled = true;
}

function enableEditor() {
  document.querySelector("textarea").disabled = false;
}

function uploadImage(editor) {
  disableEditor();
  fileSelector.click();
}

fileSelector.addEventListener("change", function(event) {
  const fileList = this.files;
  if (fileList.length > 0) {
    let url = "/api/images";
    let params = new FormData();
    params.append("image", fileList[0]);
    fetch(url, {
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
        var doc = simplemde.codemirror.getDoc();
        var cursor = doc.getCursor();
        doc.replaceRange(`![${fileList[0].name}](${data.url})`, cursor);
        enableEditor();
      })
      .catch(error => {
        error.json().then(data => console.error(data));
        enableEditor();
      });
  } else {
    enableEditor();
  }
});

const simplemde = new SimpleMDE({
  toolbar: [
    "bold",
    "italic",
    "heading",
    "|",
    "quote",
    "code",
    "unordered-list",
    "ordered-list",
    "|",
    "link",
    {
      name: "upload-image",
      action: uploadImage,
      className: "fa fa-picture-o",
      title: "Upload image"
    },
    "|",
    "preview",
    "side-by-side",
    "fullscreen",
    "|",
    "guide"
  ]
});

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
