document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // submit handler
  document.querySelector('#compose-form').addEventListener('submit', send_mail_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view-details').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function email_view(id) {
  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    // Print email
    console.log(email);
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view-details').style.display = 'block';

    document.querySelector('#email-view-details').innerHTML = `
    
    <ul class="list-group">
    <li class="list-group-item has-background-black has-text-primary"><p class="has-text-warning">From:</p>${email.sender}</li>
    <li class="list-group-item has-background-black has-text-primary"><p class="has-text-warning">To:</p>${email.recipients}</li>
    <li class="list-group-item has-background-black has-text-primary"><p class="has-text-warning">Subject:</p> ${email.subject}</li>
    <li class="list-group-item has-background-black has-text-primary"><p class="has-text-warning">Timestamp:</p> ${email.timestamp}</li>
    <li class="list-group-item has-background-black has-text-link">${email.body}</li>
    </ul>
    
    `
  // change to read mode
  if(!email.read) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({read: true}),

    })
  }
  // archive email / unarchive email
  const button_arch = document.createElement('button');
  button_arch.innerHTML = !email.archived ? "Archive" : "Unarchive"
  button_arch.className = email.archived ? "button is-success" : "button is-danger";
  button_arch.addEventListener('click', function() {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
      archived: !email.archived
  })
})
        .then(() => { load_mailbox('archive') })
  });
  document.querySelector('#email-view-details').append(button_arch);

  // REPLY: BUTTON
  const reply_button = document.createElement('button');
  reply_button.innerHTML = "Reply"
  reply_button.className = "button is-info is-dark is-focused";
  reply_button.addEventListener('click', function() {
    compose_email();
    document.querySelector('#compose-recipients').value = email.sender;
    let subject_re = email.subject;
    if(subject_re.split(' ',1)[0] !== "Re:") {
      subject_re = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-subject').value = subject_re;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} Wrote: \n ${email.body}`;
  })
  document.querySelector('#email-view-details').append(reply_button);

});
}
function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view-details').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get the emails for  mailbox
  fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(email => {

  // loop through emails
  email.forEach(single_email => {

    console.log(single_email);

    // create a div
    const new_email = document.createElement('div');
    new_email.className = 'box';
    new_email.innerHTML = `
       <h6 class="title is-6 has-text-success"><strong>Sender:</strong>${single_email.sender}</h6>
       <h5 class="title is-5 has-text-success"><strong>Subject:</strong>${single_email.subject}</h5>
       <p class="subtitle is-6 has-text-link-light">${single_email.timestamp}</p>
         
    `;
    // change background color if email is read
   new_email.className = single_email.read ? 'read': 'unread';
    // add event listener to each email to view email details
    new_email.addEventListener('click', function () {
      email_view(single_email.id);
    });
  document.querySelector('#emails-view').append(new_email);
  })
});
}

// function to send email
function send_mail_email(event) {
  event.preventDefault();

  // store the values fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // send data to our backend
  fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
  })
})
.then(response => response.json())
.then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent');
});


}


