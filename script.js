// Base URLs for APIs
const FINNKINO_THEATERS_URL = 'http://www.finnkino.fi/xml/TheatreAreas/';
const FINNKINO_SCHEDULE_URL = 'http://www.finnkino.fi/xml/Schedule/?area=';
const OMDB_API_KEY = '68f0df2e';
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

// Elements
const theaterSelect = document.getElementById('theaterSelect');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const moviesContainer = document.getElementById('moviesContainer');

// Fetch theater data from Finnkino and populate the select dropdown
function loadTheaters() {
    fetch(FINNKINO_THEATERS_URL)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const theaters = xml.getElementsByTagName('TheatreArea');

            for (let theater of theaters) {
                const id = theater.getElementsByTagName('ID')[0].textContent;
                const name = theater.getElementsByTagName('Name')[0].textContent;

                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                theaterSelect.appendChild(option);
            }
        })
        .catch(error => console.error("Error loading theaters:", error));

}


// Fetch and display movies for the selected theater
function loadMovies() {

    const theaterId = theaterSelect.value;
    const titleQuery = searchInput.value;
    
    fetch(`${FINNKINO_SCHEDULE_URL}${theaterId}`)
        .then(response => response.text())
        .then(data => {
            moviesContainer.innerHTML = ""; // Clear previous movies

            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "application/xml");
            const shows = xml.getElementsByTagName('Show');

            

            Array.from(shows).forEach(show => {
                const title = show.getElementsByTagName('Title')[0].textContent;
                const showtime = show.getElementsByTagName('dttmShowStart')[0].textContent;
                const eventId = show.getElementsByTagName('EventID')[0].textContent;
                const movie_genre = show.getElementsByTagName('Genres')[0].textContent;
                const age_rating = show.getElementsByTagName('Rating')[0].textContent;
                const theatre_and_auditorium = show.getElementsByTagName('TheatreAndAuditorium')[0].textContent;
                const movie_poster = show.getElementsByTagName('EventSmallImagePortrait')[0].textContent;

                

                if (titleQuery && !title.toLowerCase().includes(titleQuery.toLowerCase())) {
                    return; // Skip if the title doesn't match the search
                }
                

                // Fetch additional movie info from OMDB
                fetch(`${OMDB_BASE_URL}?t=${title}&apikey=${OMDB_API_KEY}`)
                    .then(response => response.json())
                    .then(movieData => {
                        displayMovie({
                            title,
                            showtime,
                            eventId,
                            movie_poster,
                            movie_genre,
                            age_rating,
                            theatre_and_auditorium,
                            poster: movieData.Poster,
                            genre: movieData.Genre,
                        });
                    })
                    .catch(error => console.error("Error fetching OMDB data:", error));
            });
        })
        .catch(error => console.error("Error loading movies:", error));
}



// Display a movie card in the UI
function displayMovie({ title, showtime, movie_poster, theatre_and_auditorium, poster, genre, movie_genre, age_rating }) {
    
    const imageUrl = poster || movie_poster
    const movieCard = document.createElement('div');


    movieCard.classList.add('movie-card');

    movieCard.innerHTML = `
        <img src="${imageUrl} alt="${title}">
        <h3>${title}</h3>
        <p><strong>Showtime:</strong> ${new Date(showtime).toLocaleString()}</p>
        <p><strong>Location: ${theatre_and_auditorium} </p>
        <p><strong>Genre:</strong> ${movie_genre || genre}</p>
        <p><strong>Age Rating:</strong> ${age_rating}</p>
    `;
    
    moviesContainer.appendChild(movieCard);
}

// Event listeners
theaterSelect.addEventListener('change', loadMovies);
searchButton.addEventListener('click', loadMovies);


// Initial load
loadTheaters();
