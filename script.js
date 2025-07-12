// Add click event listener to search button to trigger fetchData function
document.querySelector('#searchButton').addEventListener('click', fetchData);

// Add change event listener to user select dropdown to re-render watchlist when user changes
document.querySelector('#userSelect').addEventListener('change', renderWatchlist);

// Function to get the currently selected user from dropdown
function getCurrentUser() {
  return document.querySelector('#userSelect').value;
}

// Function to generate a unique localStorage key for each user's watchlist
function getWatchlistKey() {
  return `watchlist_${getCurrentUser()}`;
}

// Main function to fetch movie data from OMDB API
function fetchData() {
  const input = document.querySelector('#searchInput').value;

  // Remove any existing error messages
  const oldError = document.querySelector('.error-message');
  if (oldError) oldError.remove();

  // Create and display loading message
  const loadingMessage = document.createElement('p');
  loadingMessage.innerText = 'Loading...';
  loadingMessage.id = 'loadingMessage';
  document.querySelector('header').appendChild(loadingMessage);

  // Fetch data from OMDB API
 fetch(`https://www.omdbapi.com/?apikey=2b4f5112&s=${encodeURIComponent(input)}`)

    .then(res => res.json())
    .then(data => {
      loadingMessage.remove(); // Remove loading message

      // Handle case where no movies are found
      if (!data.Search || data.Search.length === 0) {
        alert('No movies found!');
        return;
      }

      // Clear previous results
      const resultsContainer = document.querySelector('#resultsContainer');
      resultsContainer.innerHTML = '';

      // Create a card for each movie in the results
      data.Search.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
          <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}" alt="${movie.Title}">
          <h3>${movie.Title}</h3>
          <p>Type: ${movie.Type}</p>
          <p>Year: ${movie.Year}</p>
          <button class="add-to-watchlist">★ Add to Watchlist</button>
        `;

        // Add click handler for the "Add to Watchlist" button
        movieCard.querySelector('.add-to-watchlist').addEventListener('click', () => {
          addToWatchlist(movie);
        });

        resultsContainer.appendChild(movieCard);
      });
    })
    .catch(err => {
      loadingMessage.remove(); // Remove loading message on error

      // Display error message
      const errorEl = document.createElement('p');
      errorEl.innerText = 'Error fetching data.';
      errorEl.classList.add('error-message');
      errorEl.style.color = 'red';
      document.querySelector('header').appendChild(errorEl);
    });
}

// Function to add a movie to the current user's watchlist
function addToWatchlist(movie) {
  // Get current watchlist from localStorage or initialize empty array
  let watchlist = JSON.parse(localStorage.getItem(getWatchlistKey())) || [];

  // Check if movie is already in watchlist
  if (watchlist.some(item => item.imdbID === movie.imdbID)) {
    alert('Already in watchlist!');
    return;
  }

  // Add movie to watchlist and save to localStorage
  watchlist.push(movie);
  localStorage.setItem(getWatchlistKey(), JSON.stringify(watchlist));
  
  // Update the displayed watchlist
  renderWatchlist();
}

// Function to render the current user's watchlist
function renderWatchlist() {
  const watchlistContainer = document.querySelector('#watchlistContainer');
  watchlistContainer.innerHTML = ''; // Clear current watchlist display

  // Get watchlist from localStorage or initialize empty array
  const watchlist = JSON.parse(localStorage.getItem(getWatchlistKey())) || [];

  // Create a card for each movie in the watchlist
  watchlist.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}" alt="${movie.Title}">
      <h3>${movie.Title}</h3>
      <p>Type: ${movie.Type}</p>
      <p>Year: ${movie.Year}</p>
      <button class="remove-from-watchlist">✖ Remove</button>
    `;

    // Add click handler for the "Remove" button
    movieCard.querySelector('.remove-from-watchlist').addEventListener('click', () => {
      removeFromWatchlist(movie.imdbID);
    });

    watchlistContainer.appendChild(movieCard);
  });
}

// Function to remove a movie from the watchlist by its IMDB ID
function removeFromWatchlist(imdbID) {
  // Get current watchlist, filter out the movie to remove, and save back to localStorage
  let watchlist = JSON.parse(localStorage.getItem(getWatchlistKey())) || [];
  watchlist = watchlist.filter(movie => movie.imdbID !== imdbID);
  localStorage.setItem(getWatchlistKey(), JSON.stringify(watchlist));
  
  // Update the displayed watchlist
  renderWatchlist();
}

// Initialize the page by rendering the watchlist for the default user
renderWatchlist();