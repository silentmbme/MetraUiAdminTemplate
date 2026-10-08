(() => {
  "use strict";

  if (!window.Swal) return;

  const alert = window.Swal.mixin({
    customClass: {
      confirmButton: "btn btn-primary px-4",
      cancelButton: "btn btn-light px-4",
      denyButton: "btn btn-danger-transparent px-4",
    },
    buttonsStyling: false,
    reverseButtons: true,
  });

  const showStatus = (selector, options) => {
    document.querySelector(selector)?.addEventListener("click", () => alert.fire(options));
  };

  showStatus("#alert-success", {
    icon: "success",
    title: "Changes saved",
    text: "Your update is ready to view.",
    confirmButtonText: "Done",
  });

  showStatus("#alert-info", {
    icon: "info",
    title: "A quick update",
    text: "Your workspace is up to date.",
    confirmButtonText: "Got it",
  });

  showStatus("#alert-warning", {
    icon: "warning",
    title: "Review before continuing",
    text: "Some details may need your attention.",
    confirmButtonText: "Review",
  });

  showStatus("#alert-error", {
    icon: "error",
    title: "Unable to complete this action",
    text: "Please try again in a moment.",
    confirmButtonText: "Close",
  });

  document.querySelector("#alert-confirm")?.addEventListener("click", async () => {
    const result = await alert.fire({
      icon: "warning",
      title: "Delete this record?",
      text: "This preview does not remove any saved data.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep record",
      customClass: { popup: "project-swal", confirmButton: "btn btn-danger px-4", cancelButton: "btn btn-light px-4" },
    });

    if (result.isConfirmed) {
      await alert.fire({ icon: "success", title: "Confirmed", text: "You confirmed the example. Your data is unchanged." });
    }
  });

  document.querySelector("#alert-changes")?.addEventListener("click", async () => {
    const result = await alert.fire({
      icon: "question",
      title: "You have unsaved changes",
      text: "Would you like to save your work before leaving?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save changes",
      denyButtonText: "Discard",
      cancelButtonText: "Keep editing",
    });

    if (result.isConfirmed) {
      await alert.fire({ icon: "success", title: "Changes saved", timer: 1600, showConfirmButton: false });
    } else if (result.isDenied) {
      await alert.fire({ icon: "info", title: "Changes discarded", timer: 1600, showConfirmButton: false });
    }
  });

  const toast = window.Swal.mixin({
    toast: true,
    customClass: {popup: "project-swal"},
    position: "top-end",
    showConfirmButton: false,
    timer: 2800,
    timerProgressBar: true,
  });

  document.querySelector("#alert-toast")?.addEventListener("click", () => {
    toast.fire({ icon: "success", title: "Your changes have been saved" });
  });

  document.querySelector("#alert-timer")?.addEventListener("click", () => {
    let remaining = 3;
    let timerInterval;
    alert.fire({
      icon: "info",
      title: "Short break",
      html: `This message will close in <strong>${remaining}</strong> seconds.`,
      timer: 3000,
      timerProgressBar: true,
      didOpen: () => {
        const counter = window.Swal.getHtmlContainer()?.querySelector("strong");
        timerInterval = window.setInterval(() => {
          remaining = Math.max(0, Math.ceil(window.Swal.getTimerLeft() / 1000));
          if (counter) counter.textContent = String(remaining);
        }, 200);
        window.Swal.getPopup()?.addEventListener("mouseenter", () => window.Swal.stopTimer(), { once: true });
        window.Swal.getPopup()?.addEventListener("mouseleave", () => window.Swal.resumeTimer(), { once: true });
      },
      willClose: () => window.clearInterval(timerInterval),
    });
  });

  document.querySelector("#alert-input")?.addEventListener("click", async () => {
    const result = await alert.fire({
      title: "What should we call you?",
      input: "text",
      inputPlaceholder: "Enter your name",
      inputAttributes: { maxlength: 40, "aria-label": "Your name" },
      showCancelButton: true,
      confirmButtonText: "Continue",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value.trim()) return "Please enter a name to continue.";
      },
    });

    if (result.isConfirmed) {
      await alert.fire({ icon: "success", title: `Nice to meet you, ${result.value.trim()}!`, confirmButtonText: "Thanks" });
    }
  });

  document.querySelector('#alert-cancel')?.addEventListener('click', async () => {
    const result = await alert.fire({icon:'warning', title:'Remove this item?', text:'This example does not change saved data.', showCancelButton:true, confirmButtonText:'Remove', cancelButtonText:'Keep item'});
    if (result.isConfirmed) alert.fire({icon:'success',title:'Removal confirmed'});
    else if (result.dismiss === Swal.DismissReason.cancel) alert.fire({icon:'info',title:'Item kept',text:'The cancel action was selected.'});
  });
  showStatus('#alert-image',{title:'A moment of inspiration',text:'A custom image can add context to your message.',imageUrl:'../assets/images/cards/7.jpg',imageWidth:400,imageAlt:'Mountain landscape',confirmButtonText:'Looks good'});
  showStatus('#alert-html',{title:'Custom content',html:'<p class="fs-13">Use <strong>formatted text</strong> to make the message clear.</p><p class="text-muted fs-12 mb-0">Choose an action below to continue.</p>',showCancelButton:true,confirmButtonText:'Continue',cancelButtonText:'Go back'});
  showStatus('#alert-position',{position:'top-end',icon:'success',title:'Update complete',showConfirmButton:false,timer:1800});
  showStatus('#alert-custom',{title:'A little more space',text:'This dialog uses custom dimensions with the project theme.',width:'min(42rem, 95vw)',padding:'2rem',confirmButtonText:'Close'});
  document.querySelector('#alert-ajax')?.addEventListener('click', async () => {
    const result = await alert.fire({title:'Load a sample record',text:'Fetch a bundled page from this project.',showCancelButton:true,confirmButtonText:'Load record',showLoaderOnConfirm:true,allowOutsideClick:()=>!Swal.isLoading(),preConfirm:async()=>{
      try {const response=await fetch('sweet_alerts.html');if(!response.ok)throw new Error('Request failed');const content=await response.text();return content.length;}
      catch {Swal.showValidationMessage('Unable to load the sample. Open this page through the project preview server.');return false;}
    }});
    if(result.isConfirmed)alert.fire({icon:'success',title:'Request completed',text:'Loaded the local sample page ('+result.value+' characters).'});
  });

  const tableBody = document.querySelector('#alert-table-body');
  if (tableBody) {
    const rows = [...tableBody.rows];
    const search = document.querySelector('#alert-table-search');
    const category = document.querySelector('#alert-table-category');
    const size = document.querySelector('#alert-table-size');
    let page = 0, ascending = true;
    const renderTable = () => {
      const query = search.value.trim().toLowerCase();
      const matching = rows.filter(row => row.textContent.toLowerCase().includes(query) && (category.value === 'all' || row.dataset.alertCategory === category.value));
      const limit = Number(size.value); page = Math.max(0,Math.min(page,Math.ceil(matching.length / limit)-1));
      const visible = matching.slice(page*limit,(page+1)*limit);
      rows.forEach(row => row.hidden = !visible.includes(row));
      document.querySelector('#alert-table-empty').hidden = matching.length > 0;
      document.querySelector('#alert-table-count').textContent = matching.length ? 'Showing '+(page*limit+1)+' - '+(page*limit+visible.length)+' of '+matching.length+' examples' : '0 examples';
      document.querySelector('#alert-table-prev').disabled = page === 0;
      document.querySelector('#alert-table-next').disabled = (page+1)*limit >= matching.length;
    };
    [search,category,size].forEach(control => control.addEventListener(control === search ? 'input' : 'change',()=>{page=0;renderTable();}));
    document.querySelector('#alert-table-prev').addEventListener('click',()=>{page--;renderTable();});
    document.querySelector('#alert-table-next').addEventListener('click',()=>{page++;renderTable();});
    document.querySelector('#alert-table-sort').addEventListener('click',()=>{rows.sort((a,b)=>(ascending?1:-1)*a.dataset.alertName.localeCompare(b.dataset.alertName)); rows.forEach(row=>tableBody.append(row)); ascending=!ascending;page=0;renderTable();});
    renderTable();
  }
})();
