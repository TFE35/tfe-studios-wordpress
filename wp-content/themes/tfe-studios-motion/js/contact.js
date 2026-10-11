(() => {
  'use strict';
  const form = document.querySelector('#contactForm');
  if (!form) return;
  const status = document.querySelector('#contactStatus');
  const button = form.querySelector('[type="submit"]');
  button.disabled = false;
  if (!window.tfeSite.enquiriesEnabled) button.firstChild.textContent = 'PREPARE EMAIL ';
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
    if (button.disabled) return;
    if (!window.tfeSite.enquiriesEnabled) {
      const subject = 'TFE Studios project enquiry — ' + form.elements.service.value;
      const body = form.elements.message.value.trim() + '\n\nName: ' + form.elements.name.value.trim() + '\nReply to: ' + form.elements.email.value.trim() + '\nProject area: ' + form.elements.service.value;
      status.textContent = 'Your email app will open a draft. Send it there to contact us.';
      window.location.href = 'mailto:' + encodeURIComponent(window.tfeSite.email || 'info@tfestudios.com') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      return;
    }
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your enquiry…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const token = await fetch(window.tfeSite.tokenUrl, {cache:'no-store',signal:controller.signal});
      if (!token.ok) throw new Error('Please refresh and try again, or use email.');
      const {nonce} = await token.json();
      const response = await fetch(window.tfeSite.enquiryUrl, {
        method:'POST', headers:{'Content-Type':'application/json'},signal:controller.signal,
        body:JSON.stringify({nonce,name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),service:form.elements.service.value,message:form.elements.message.value.trim(),website:form.elements.website.value,consent:form.elements.consent.checked?'yes':'',request_id:form.dataset.requestId || (form.dataset.requestId=crypto.randomUUID())})
      });
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
