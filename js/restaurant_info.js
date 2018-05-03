let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
		}
	});
}

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant)
		return;
	}
	const id = getParameterByName('id');
	if (!id) { // no id found in URL
		error = 'No restaurant id in URL'
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;
			if (!restaurant) {
				console.error(error);
				return;
			}

			fillRestaurantHTML();
			callback(null, restaurant)
		});
	}
}


/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;

	const address = document.getElementById('restaurant-address');
	address.innerHTML = restaurant.address;

	const image = document.getElementById('restaurant-img');
	image.className = 'restaurant-img';
	image.alt = 'image of ' + restaurant.name + ' restaurant';
	image.src = DBHelper.imageUrlForRestaurant(restaurant) + '.jpg';

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = restaurant.cuisine_type;

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	fillReviewsHTML();

}



/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = () => {

	var id = self.restaurant.id


	const container = document.getElementById('reviews-container');
	const title = document.createElement('h2');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	// BUTTON
	const addReviewButton = document.createElement('button')
	addReviewButton.innerHTML = 'Your opinion matters! Add your comment'
	addReviewButton.className = 'button'
	addReviewButton.id = 'add-review-button'
	addReviewButton.onclick = createForm
	container.appendChild(addReviewButton)


	// document.getElementById('add-review-button').addEventListener('click', function () {
	// 	addReview()
	// })

	// FETCH REVIEW DATA
	var reviews = DBHelper.fetchReviews(id)
		.then(createList)

	function createList(reviews) {
		const ul = document.getElementById('reviews-list');
		reviews.forEach(review => {

			// console.log('ul review name: ' + review.name);
			ul.appendChild(createReviewHTML(review));

		})
		container.appendChild(ul);
	}

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}


}

// create form input
const createForm = () => {

	// form
	const formContainer = document.getElementById('add-review');
	const form = document.createElement('form')
	var currentRestaurantID = self.restaurant.id
	var currentURL = DBHelper.DATABASE_URL + '/' + currentRestaurantID

	// form.action = currentURL

	// // restaurant input
	// const restaurant_id = document.createElement('input')
	// restaurant_id.type = 'text'
	// restaurant_id.name = 'restaurant_id'
	// restaurant_id.hidden = true
	// form.append(restaurant_id)

	// name input
	const reviewer_label = document.createElement('label')
	reviewer_label.htmlFor = 'reviewer_name'
	reviewer_label.innerHTML = 'Your name:'
	form.append(reviewer_label)

	const reviewer_name = document.createElement('input')
	reviewer_name.type = 'text'
	reviewer_name.name = 'reviewer_name'
	reviewer_name.id = 'reviewer_name_fld'
	form.append(reviewer_name)

	// rating select
	const rating_label = document.createElement('label')
	rating_label.htmlFor = 'rating'
	rating_label.innerHTML = 'Rating:'
	form.append(rating_label)

	const rating = document.createElement('select')
	rating.name = 'rating'
	rating.id = 'rating_fld'
	for (let index = 1; index < 6; index++) {

		const option = document.createElement('option');
		option.innerHTML = index;
		option.value = index;
		rating.append(option);
	}
	form.append(rating)

	// comments input
	const comment_label = document.createElement('label')
	comment_label.htmlFor = 'comment_text'
	comment_label.innerHTML = 'Comment:'
	form.append(comment_label)

	const comment_text = document.createElement('textarea')
	comment_text.type = 'text'
	comment_text.className = 'textarea'
	comment_text.name = 'comment_text'
	comment_text.id = 'comment_text_fld'
	form.append(comment_text)

	// submit review
	const submitReview = document.createElement('button')
	submitReview.className = 'button'
	submitReview.id = 'submitReview'
	submitReview.innerHTML = 'Submit Review'
	//assign function to event
	submitReview.onclick = postReview
	form.append(submitReview)

	formContainer.appendChild(form)

}



function postReview(event) {
	event.preventDefault(); //prevent redirect

	const currentRestaurantID = self.restaurant.id
	const name = document.getElementById('reviewer_name_fld').value
	const rating = document.getElementById('rating_fld').value
	const comments = document.getElementById('comment_text_fld').value
	const url = 'http://localhost:1337/reviews/'

	console.log('id=' + currentRestaurantID);

	postData(url, {
		// id: currentRestaurantID, // is not needed because it is filtered by the url above
		restaurant_id: currentRestaurantID,
		name: name,
		rating: rating,
		comments: comments
	}).then(data => {
		console.log('restaurant id ' + currentRestaurantID + ' added to db'); // JSON from `response.json()` call
		
		// fillReviewsHTML() //update content on page

	}).catch(error => {
		console.log(error);
	})

	// FETCH THE DATA FROM JSON URL
	function postData(url, data) {

		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(data), // must match 'Content-Type' header
			headers: {
				'content-type': 'application/json'
			}
		}).then(response => {
			response.json
		}).catch((error) => {
			console.log('Could not create the review, error: ' + error);

		}).then(response => console.log('Review created'));
	}
}





/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');
	for (let key in operatingHours) {
		const row = document.createElement('tr');

		const day = document.createElement('td');
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement('td');
		time.innerHTML = operatingHours[key];
		row.appendChild(time);

		hours.appendChild(row);
	}
}


/**
 * Create review HTML and add it to the webpage.
 * 
 */
const createReviewHTML = (review) => {
	const li = document.createElement('li');
	const name = document.createElement('div');
	const header = document.createElement('section');
	name.innerHTML = review.name;
	name.tabIndex = '0';

	li.appendChild(header);
	header.appendChild(name);

	const rating = document.createElement('p');
	rating.innerHTML = `Rating: ${review.rating}`;
	li.appendChild(rating);

	const comments = document.createElement('p');
	comments.innerHTML = review.comments;
	li.appendChild(comments);



	// DELETE review
	const delReview = document.createElement('button')
	delReview.className = 'button'
	delReview.id = 'delReview' + review.id
	delReview.innerHTML = 'Delete Review id:' + review.id
	//assign function to event
	delReview.onclick = deleteReview
	li.append(delReview)


	function deleteReview(event) {
		event.preventDefault()

		const url = 'http://localhost:1337/reviews/' + review.id


		return fetch(url, {
			method: 'DELETE',
		}).then(response => {
			response.json
		}).catch((error) => {
			console.log('Could not delete the review, error: ' + error);
		}).then(()=>{
			console.log('Review deleted, id: ' + review.id)
			alert('Review deleted, id: ' + review.id)
			
		});

	}

	return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');

	console.log('getParameterByName f url is: ' + url + ' name is: ' + name);

	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}