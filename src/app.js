import '../styles/reset.css';
import '../styles/style.css';
import { throttle } from 'lodash';
window.addEventListener('load', function () {
  let search = document.getElementById('search');
  let grid = document.getElementById('main__grid');
  let pagination = document.getElementById('pagination');
  let key = 'AIzaSyDZbpcLr6N4D5LDfveaQUZt8TIZ25jAeMs';
  let resultData;
  let loadedItems = [];
  let numberOfCurrentPage;
  let nextPageToken = null;
  let searchValue;
  let itemsInPage;
  let paginationFirst = document.getElementById('first');
  let paginationPrevious = document.getElementById('previous');
  let paginationCurrent = document.getElementById('current');
  let paginationNext = document.getElementById('next');
  let form = document.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitEvent(e);
    paginate();
  })
  pagination.addEventListener('click', eventLoadPage);
  function createGridElement(item) {
    let gridElement = document.createElement('div');
    let cardElement = document.createElement('div');
    let titleElement = document.createElement('a');
    let imgElement = document.createElement('IMG');
    let authorElement = document.createElement('p');
    let dateElement = document.createElement('p');
    let descriptionElement = document.createElement('p');
    let date = new Date(item.snippet.publishedAt);
    gridElement.classList.add('main__grid__element');
    cardElement.classList.add('main__grid__element__card');
    titleElement.classList.add('main__grid__element__card__title');
    imgElement.classList.add('main__grid__element__card__img');
    authorElement.classList.add('main__grid__element__card__author');
    dateElement.classList.add('main__grid__element__card__date');
    descriptionElement.classList.add('main__grid__element__card__description');
    titleElement.innerText = item.snippet.title;
    titleElement.target = "_blank";
    titleElement.href = "https://www.youtube.com/watch?v=" + item.id.videoId;
    imgElement.src = item.snippet.thumbnails.medium.url;
    authorElement.innerText = 'Author: ' + item.snippet.channelTitle;
    dateElement.innerText = 'Published at: ' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
    descriptionElement.innerText = item.snippet.description;
    cardElement.appendChild(imgElement);
    cardElement.appendChild(titleElement);
    cardElement.appendChild(authorElement);
    cardElement.appendChild(dateElement);
    cardElement.appendChild(descriptionElement);
    gridElement.appendChild(cardElement);
    loadedItems.push(gridElement);
  }
  function eventLoadPage(e) {
    if (e.target.parentElement === pagination
      && e.target.innerText.match(/^\d+$/) !== null) {
      moveToPage(e.target.innerText);
    }
  }
  function processData(items) {
    items.forEach(element => {
      createGridElement(element);
    });
  }
  function submitEvent() {
    let options = {
      part: 'snippet',
      key: key,
      maxResults: 15,
      q: search.value,
    }
    loadedItems = [];
    var request = new XMLHttpRequest();

    pagination.style.display = 'inline-flex';
    grid.innerHTML = "";
    numberOfCurrentPage = 1;
    nextPageToken = null;
    searchValue = search.value;
    request.open('GET', 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&key=${options.key}&maxResults=${options.maxResults}&q=${options.q}`, true);

    makeRequest(request);
  }
  function infiniteLoading() {
    if (nextPageToken !== null) {
      let options = {
        part: 'snippet',
        key: key,
        maxResults: 15,
        q: search.value,
      }
      loadedItems = [];
      var request = new XMLHttpRequest();
      request.open('GET', 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&key=${options.key}&maxResults=${options.maxResults}&q=${searchValue}&pageToken=${nextPageToken}`, true);
      makeRequest(request);
    }
  }
  function makeRequest(request) {
    request.onload = function () {
      resultData = JSON.parse(request.responseText);
      nextPageToken = resultData.nextPageToken;
      loadedItems = [];
      //THIS IS DESTRUCTURING ASSIGNMENT AND IT'S TOTALLY NEEDED
      //I WOULDN'T PLACE IT HERE OTHERWISE TOTALLY
      let items;
      [...items] = resultData.items;
      processData(items);
      paginationFirst.style.display = 'unset';
      loadedItems.forEach(pageItems => {
        grid.appendChild(pageItems);
      });
      getItemsInPage();
    };
    request.onerror = function () {
    };
    request.send();
  }
  function getItemsInPage() {
    itemsInPage = 1;
    if (document.documentElement.clientWidth >= 768 && document.documentElement.clientWidth < 1400) {
      itemsInPage = 2;
    }
    else if (document.documentElement.clientWidth >= 1400 && document.documentElement.clientWidth < 1800) {
      itemsInPage = 3;
    }
    else if (document.documentElement.clientWidth >= 1800) {
      itemsInPage = 4;
    }
    return itemsInPage;
  }
  function moveToPage(num) {
    if (num !== 0) {
      numberOfCurrentPage = num;
    }

    if (num == 1) {
      grid.scroll(0, 0);
    }
    else if (num > 1 && num < grid.childNodes.length / itemsInPage) {
      grid.scroll(grid.childNodes[numberOfCurrentPage * itemsInPage - itemsInPage].offsetLeft, 0);
    }
    if (grid.childNodes.length / itemsInPage - numberOfCurrentPage <= 3) {
      infiniteLoading();
    }
    paginate();
  }
  function paginate() {
    paginationFirst.innerText = 1;
    paginationPrevious.innerText = Number(numberOfCurrentPage) - 1;
    paginationCurrent.innerText = Number(numberOfCurrentPage);
    paginationNext.innerText = Number(numberOfCurrentPage) + 1;
    if (numberOfCurrentPage == 1) {
      paginationPrevious.style.display = 'none';
      paginationCurrent.style.display = 'none';
      paginationNext.style.display = 'unset';
    }
    else if (numberOfCurrentPage == 2) {
      paginationPrevious.style.display = 'none';
      paginationCurrent.style.display = 'unset';
      paginationNext.style.display = 'unset';
    }
    else {
      paginationPrevious.style.display = 'unset';
      paginationCurrent.style.display = 'unset';
      paginationNext.style.display = 'unset';
    }
  }

  function unify(e) { return e.changedTouches ? e.changedTouches[0] : e }
  grid.addEventListener('mousedown', lock, false);
  grid.addEventListener('touchstart', lock, false);
  grid.addEventListener('mouseup', move, false);
  grid.addEventListener('touchend', move, false);

  let x0 = null;
  function lock(e) {
    grid.addEventListener('mousemove', preMove, false);
    grid.addEventListener('touchmove', preMove, false);
    x0 = unify(e).clientX
  }
  function preMove(e) {
    grid.style.scrollBehavior = "initial";
    let dx = unify(e).clientX - x0;
    if (numberOfCurrentPage > 0 && numberOfCurrentPage < grid.childNodes.length) {
      grid.scroll(grid.childNodes[numberOfCurrentPage * itemsInPage - itemsInPage].offsetLeft - dx, 0);
    }
  }
  function move(e) {
    grid.removeEventListener('mousemove', preMove, false);
    grid.removeEventListener('touchmove', preMove, false);
    grid.style.scrollBehavior = "smooth";
    if (x0 || x0 === 0) {
      let dx = unify(e).clientX - x0;
      if (dx < -innerWidth / 4) {
        // grid.scrollBy(innerWidth, 0);
        moveToPage(Number(numberOfCurrentPage) + 1);
      }
      else if (dx > innerWidth / 4) {
        moveToPage(Number(numberOfCurrentPage) - 1);
      }
      else {
        moveToPage(Number(numberOfCurrentPage));
      }
      x0 = null;
      grid.style.scrollBehavior = "initial";
    }
  }
  window.addEventListener('resize', resizeEvent)
  function resizeEvent() {
    let focusedElementPage = itemsInPage * numberOfCurrentPage - itemsInPage + 1;
    if (itemsInPage !== getItemsInPage()) {
      focusedElementPage = Math.ceil(focusedElementPage / itemsInPage);
      moveToPage(focusedElementPage);
    }
    else {
      moveToPage(numberOfCurrentPage);
    }
  }
})
//js rendering
window.addEventListener('DOMContentLoaded', eventRendering);
function eventRendering() {
  //create header
  let header = document.createElement('header');
  header.classList.add('header');
  //header__h1
  let h1 = document.createElement('h1');
  h1.classList.add('header__h1');
  h1.innerText = "Youtube Search";
  //header__form
  let headerForm = document.createElement('form');
  headerForm.classList.add('header__form');
  headerForm.id = 'form';
  //header__form__search-query
  let searchQuery = document.createElement('input');
  searchQuery.classList.add('header__form__search-query');
  searchQuery.name = 'search_query';
  searchQuery.type = 'text';
  searchQuery.maxLength = '128';
  searchQuery.id = 'search';
  //header__form__submit
  let submit = document.createElement('input');
  submit.type = 'submit';
  submit.value = 'Search';
  submit.classList.add('header__form__submit');
  submit.id = 'submit';
  //assemble header
  headerForm.appendChild(searchQuery);
  headerForm.appendChild(submit);
  header.appendChild(h1);
  header.appendChild(headerForm);
  //main
  let main = document.createElement('main');
  main.classList.add('main');
  //grid
  let grid = document.createElement('div');
  grid.classList.add('main__grid');
  grid.id = 'main__grid';
  //pagination
  let pagination = document.createElement('div');
  pagination.classList.add('main__pagination');
  pagination.id = "pagination";
  //first
  let first = document.createElement('p');
  first.classList.add('main__pagination__element');
  first.id = 'first';
  first.innerText = 1;
  //previous
  let previous = document.createElement('p');
  previous.classList.add('main__pagination__element');
  previous.id = 'previous';
  //current
  let current = document.createElement('p');
  current.classList.add('main__pagination__element');
  current.id = 'current';
  //next
  let next = document.createElement('p');
  next.classList.add('main__pagination__element');
  next.id = 'next';
  next.innerText = 2;
  //assemble pagination
  pagination.appendChild(first);
  pagination.appendChild(previous);
  pagination.appendChild(current);
  pagination.appendChild(next);
  //assemble main
  main.appendChild(grid);
  main.appendChild(pagination);
  //assemble body
  document.body.appendChild(header);
  document.body.appendChild(main);
}
