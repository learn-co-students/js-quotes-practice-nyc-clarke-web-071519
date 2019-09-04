// It might be a good idea to add event listener to make sure this file 
// only runs after the DOM has finshed loading. 

const ulQuoteList = document.querySelector('ul#quote-list')
const newQuoteForm = document.getElementById('new-quote-form')
const editFormSubmitButton = document.querySelector('div.modal-footer>button.btn-primary')

// Sample structure of a quote card <li>
{/* <li class='quote-card'>
  <blockquote class="blockquote">
    <p class="mb-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
    <footer class="blockquote-footer">Someone famous</footer>
    <br>
    <button class='btn-success'>Likes: <span>0</span></button>
    <button class='btn-danger'>Delete</button>
  </blockquote>
</li> */}

function displayquote(quoteObject) {
    
    const liQuoteCard = document.createElement('li');
    liQuoteCard.className = 'quote-card';
    liQuoteCard.dataset.quoteId = quoteObject.id

    const blockQuote = document.createElement('blockquote');
    blockQuote.className = 'blockquote';

    const pQuote = document.createElement('p');
    pQuote.className = "mb-0";
    pQuote.textContent = quoteObject.quote;

    const authorFooter = document.createElement('footer');
    authorFooter.className = "blockquote-footer";
    authorFooter.textContent = quoteObject.author;

    const br = document.createElement('br');

    const likeButton = document.createElement('BUTTON');
    likeButton.className = 'btn-success';
    likeButton.textContent = "Likes: ";
    likeButton.dataset.quoteId = quoteObject.id

    const likeSpan = document.createElement('span');
    if (quoteObject.likes) {
        likeSpan.textContent = quoteObject.likes.length;
    } else {
        likeSpan.textContent = "0"
    }
    likeButton.appendChild(likeSpan);

    const deleteButton = document.createElement('BUTTON');
    deleteButton.textContent = "Delete";
    deleteButton.className = 'btn-danger';
    deleteButton.dataset.quoteId = quoteObject.id;

    const editButton = document.createElement('BUTTON');
    editButton.textContent = "Edit Quote";
    editButton.className = 'btn-primary';
    editButton.dataset.toggle = "modal";
    editButton.dataset.target = "#edit-form-container";
    editButton.dataset.quoteId = quoteObject.id;

    blockQuote.appendChild(pQuote);
    blockQuote.appendChild(authorFooter);
    blockQuote.appendChild(br);
    blockQuote.appendChild(likeButton);
    blockQuote.appendChild(deleteButton);
    blockQuote.appendChild(editButton);

    liQuoteCard.appendChild(blockQuote);

    ulQuoteList.appendChild(liQuoteCard);
}

document.addEventListener('DOMContentLoaded',function() {
    fetch('http://localhost:3000/quotes?_embed=likes')
        .then(response => response.json() )
        .then(quoteListArray => {
            let sortedQuotesListArray = quoteListArray.sort((a, b) => (a.id > b.id) ? 1 : -1);
            
            sortedQuotesListArray.forEach(quoteObject => displayquote(quoteObject) )
        });
})

newQuoteForm.addEventListener('submit', function() {
    event.preventDefault();        
    fetch('http://localhost:3000/quotes', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quote: event.target[0].value,
            author: event.target[1].value
        })
    })
        .then(response => response.json() )
        .then(quoteObject => displayquote(quoteObject))
})

ulQuoteList.addEventListener('click', function() {
    if (event.target.tagName === "BUTTON" && event.target.className === "btn-danger") {
        const liQuoteCard = event.target.parentNode.parentNode;
        
        fetch(`http://localhost:3000/quotes/${event.target.dataset.quoteId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: event.target.dataset.quoteId
            })
        })
        .then(response => response.json() )
        .then(ulQuoteList.removeChild(liQuoteCard))
    }
})

ulQuoteList.addEventListener('click', function() {
    if (event.target.tagName === "BUTTON" && event.target.className === "btn-success") {
        const likeButton = event.target

        fetch('http://localhost:3000/likes', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quoteId: parseInt(event.target.dataset.quoteId),
                createdAt: Date.now()
            })
        })
        .then(response => response.json())
        .then(object => {
            console.log(object)
            let currentLikes = parseInt(likeButton.children[0].textContent);
            currentLikes += 1;
            likeButton.children[0].textContent = currentLikes;
        })
    }
})

ulQuoteList.addEventListener('click', function() {
    if (event.target.tagName === "BUTTON" && event.target.className === "btn-primary") {
        
        const editFormQuoteInput = document.getElementById('edit-form-quote');
        editFormQuoteInput.value = event.target.parentNode.children[0].textContent;

        const editFormAuthorInput = document.getElementById('edit-form-author');
        editFormAuthorInput.value = event.target.parentNode.children[1].textContent;

        editFormSubmitButton.dataset.quoteId = event.target.dataset.quoteId

    }
})

editFormSubmitButton.addEventListener('click', function() {
    const editForm = document.getElementById('edit-form');
    
    fetch(`http://localhost:3000/quotes/${event.target.dataset.quoteId}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quote: editForm[0].value,
                author: editForm[1].value
            })
        })
        .then(response => response.json() )
        .then(object => {
            const editLi = document.querySelector(`[data-quote-id='${object.id}']`);
            editLi.children[0].children[0].textContent = object.quote
            editLi.children[0].children[1].textContent = object.author
        })

})

