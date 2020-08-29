document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';


  //Pre-fill information
  if (email) {
    if (email.subject.substring(0, 3) == 'Re:') {
      document.querySelector('#compose-subject').value = email.subject;
    }
    else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-body').value = `\n\nOn ${email.timestamp} ${email.sender} wrote: \n${email.body}`;

  } 
  else {
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  }
  post();
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
          
          const container = document.createElement('div')
          container.classList.add('mail-container');
          
          if (email.read) {
            container.classList.add('read');
          }

          if (mailbox === 'inbox' || mailbox === 'archive') {
            const sender = document.createElement('p');
            sender.classList.add('sender');
            sender.innerHTML = email.sender;
            container.append(sender);

            const archive_btn = document.createElement('button')
            archive_btn.classList.add('btn', 'btn-sm', 'btn-info', 'archive');

            if (mailbox === 'inbox') {
              
              archive_btn.innerHTML ='Archive';
              archive_btn.addEventListener('click', function() {
                archive(email);
              });
              if (email.read) {
                const unread_btn = document.createElement('button')
                unread_btn.classList.add('btn', 'btn-sm', 'btn-secondary', 'unread');
                unread_btn.innerHTML ='Mark as Unread';
                document.querySelector('#emails-view').append(unread_btn);
                unread_btn.addEventListener('click', function() {
                  unread(email);
                });
              }
            }
            else {
              archive_btn.innerHTML ='Unarchive'; 
              archive_btn.addEventListener('click', function() {
                unarchive(email);
              });   
            }
            document.querySelector('#emails-view').append(archive_btn);
          }
          else {
            const recipients = document.createElement('p');
            recipients.classList.add('sender');
            recipients.innerHTML = email.recipients;
            container.append(recipients);
          }
          
          const subject = document.createElement('p');
          subject.classList.add('subject');
          subject.innerHTML = email.subject;
          container.append(subject);

          const timestamp = document.createElement('p');
          timestamp.classList.add('timestamp');
          timestamp.innerHTML = email.timestamp;
          container.append(timestamp);
          document.querySelector('#emails-view').append(container);

          container.addEventListener('click', function() {
            read_email(email);
          });    
      });
    });
  }


function post() {
  document.querySelector('form').onsubmit = function() {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
  }
  setTimeout(() => {load_mailbox('sent')}, 100);
}

function read_email(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';
  
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  document.querySelector('#email').innerHTML = ''

  const sender = document.createElement('p');
  sender.style.marginBottom = '0'
  sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
  document.querySelector('#email').append(sender);  

  const recipients = document.createElement('p');
  recipients.style.marginBottom = '0'
  recipients.innerHTML = `<strong>To:</strong> ${email.recipients}`;
  document.querySelector('#email').append(recipients); 

  const subject = document.createElement('p');
  subject.style.marginBottom = '0'
  subject.innerHTML = `<strong>Subject:</strong> ${email.subject}`;
  document.querySelector('#email').append(subject); 

  const timestamp = document.createElement('p');
  timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
  document.querySelector('#email').append(timestamp); 

  const btn = document.createElement('button')
  btn.innerHTML ='Replay';
  btn.classList.add('btn', 'btn-sm', 'btn-primary', 'replay');
  document.querySelector('#email').append(btn); 

  btn.addEventListener('click', function() {
    compose_email(email);
  });

  if (email.sender != document.querySelector('#sender').innerHTML) {
    
    if (email.archived) {
      const archive_btn = document.createElement('button')
      archive_btn.innerHTML ='Unarchive';
      archive_btn.classList.add('btn', 'btn-sm', 'btn-info', 'arch');
      document.querySelector('#email').append(archive_btn); 

      archive_btn.addEventListener('click', function() {
        unarchive(email);
      });
    }
    else {
      const archive_btn = document.createElement('button')
      archive_btn.innerHTML ='Archive';
      archive_btn.classList.add('btn', 'btn-sm', 'btn-info', 'arch');
      document.querySelector('#email').append(archive_btn); 

      archive_btn.addEventListener('click', function() {
        archive(email);
      });
    }
}
  

  const hr = document.createElement('hr')
  document.querySelector('#email').append(hr); 

  const body = document.createElement('p');
  body.innerHTML =email.body;
  document.querySelector('#email').append(body); 
}

function archive(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  setTimeout(() => {load_mailbox('inbox')}, 100);
}

function unarchive(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  setTimeout(() => {load_mailbox('inbox')}, 100);
}

function unread(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: false
    })
  })
  setTimeout(() => {load_mailbox('inbox')}, 100);
}
