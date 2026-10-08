(function () {
    "use strict";

    const toolbarOptions = [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"],
    ];

    new Quill("#editor", {
        modules: { toolbar: toolbarOptions },
        theme: "snow",
    });

    new Quill("#editor1", {
        modules: { toolbar: undefined },
        theme: "bubble",
    });
})();