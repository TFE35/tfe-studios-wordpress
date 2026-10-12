(() => {
  'use strict';
  const form = document.querySelector('#contactForm');
  if (!form) return;
  const status = document.querySelector('#contactStatus');
  const button = form.querySelector('[type="submit"]');
  button.disabled = !window.tfeSite.enquiriesEnabled;
  const documents = form.elements['documents[]'];
  if (documents) documents.disabled = !window.tfeSite.attachmentsEnabled;
  if (!window.tfeSite.enquiriesEnabled) status.textContent = 'Website enquiries are not available yet. Please use the direct email link.';
  const fields = ['contactName', 'contactEmail', 'contactMessage', 'contactConsent'];
  form.querySelector('textarea').addEventListener('input', event => {
    event.target.style.height = 'auto';
    event.target.style.height = event.target.scrollHeight + 'px';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    let first;
    for (const id of fields) {
      const field = document.getElementById(id);
      const invalid = !field.checkValidity() || (field.type !== 'checkbox' && !field.value.trim());
      field.setAttribute('aria-invalid', String(invalid));
      document.getElementById(id + 'Error').textContent = invalid ? (field.type === 'checkbox' ? 'Please agree before sending.' : 'Please enter a valid ' + (field.type === 'email' ? 'email address.' : id === 'contactName' ? 'name.' : 'message.')) : '';
      if (invalid && !first) first = field;
    }
    if (first) { first.focus(); status.textContent = 'Check the highlighted fields.'; return; }
    const files = documents ? [...documents.files] : [];
    const fileError = files.length > 3 || files.some(file=>file.size<1 || file.size>4*1024*1024 || !/\.(pdf|docx|jpe?g|png)$/i.test(file.name)) || files.reduce((sum,file)=>sum+file.size,0)>8*1024*1024;
    if(documents){documents.setAttribute('aria-invalid',String(fileError));document.getElementById('contactDocumentsError').textContent=fileError?'Use up to three PDF, DOCX, JPG or PNG files: 4 MB each, 8 MB total.':'';}
    if(fileError){documents.focus();status.textContent='Check your attachments.';return;}
    if (button.disabled) return;
    if (!window.tfeSite.enquiriesEnabled) {
      status.textContent = 'Website enquiries are unavailable. Please use the direct email link.';
      return;
    }
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = files.length ? 'Checking your documents and sending your enquiry…' : 'Sending your enquiry…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), files.length ? 90000 : 20000);
    try {
      const token = await fetch(window.tfeSite.tokenUrl, {cache:'no-store',signal:controller.signal});
      if (!token.ok) throw new Error('Please refresh and try again, or use email.');
      const {nonce} = await token.json();
      const payload={nonce,name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),service:form.elements.service.value,message:form.elements.message.value.trim(),website:form.elements.website.value,consent:form.elements.consent.checked?'yes':'',request_id:form.dataset.requestId || (form.dataset.requestId=crypto.randomUUID())};
      let requestBody=JSON.stringify(payload),headers={'Content-Type':'application/json'};
      if(files.length){requestBody=new FormData();for(const [key,value] of Object.entries(payload))requestBody.append(key,value);for(const file of files)requestBody.append('documents[]',file);headers={};}
      const response = await fetch(window.tfeSite.enquiryUrl, {method:'POST',headers,signal:controller.signal,body:requestBody});
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Please use email to contact us.');
      status.textContent = data.message;
      form.reset();
      delete form.dataset.requestId;
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'Delivery could not be confirmed. Please use email; your message is still here.' : error.message;
    } finally {
      clearTimeout(timeout); button.disabled = false; form.removeAttribute('aria-busy');
    }
  });
})();
