const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const USERS_PER_PAGE = 21

const user = []
let filterUser = []
const usersRemoved = JSON.parse(localStorage.getItem('RemovedUsers'))

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const likeBtn = document.querySelector('.btn-like')

function renderUserList(data) {
  let htmlContent = ''
  
  data.forEach((item) => {
    htmlContent += `
      <div class="col-md-6 col-lg-4">
        <div>
          <div class="card">
            <img src="${item.avatar}" class="card-img-top" alt="user image" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
            <div class="card-body">
              <h5 class="card-title">${item.name}</h5>
              <h6>Age: ${item.age}</h6>
            </div>
            <div class="card-footer">
              <button data-id="${item.id}" class="btn btn-outline-secondary btn-remove">✖️</button> 
              <button data-id="${item.id}" class="btn btn-outline-warning btn-like">❤️</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = htmlContent
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ``

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getUsersByPage(page) {
  const data = filterUser.length ? filterUser : user
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}


function showUserDetail(id) {
  const userFirstname = document.querySelector('#user-modal-firstname')
  const userSurname = document.querySelector('#user-modal-surname')
  const userEmail = document.querySelector('#user-modal-email')
  const userGender = document.querySelector('#user-modal-gender')
  const userRegion = document.querySelector('#user-modal-region')
  const userBirthday = document.querySelector('#user-modal-birthday')
  const userImg = document.querySelector('#user-modal-image')
  
  const url = INDEX_URL + id
  
  axios.get(url).then((response) => {
    const data = response.data
    userFirstname.innerText = `Firstname: ${data.name}`
    userSurname.innerText = `Surname: ${data.surname}`
    userEmail.innerText = `Email: ${data.email}`
    userGender.innerText = `Gender: ${data.gender}`
    userRegion.innerText = `Region: ${data.region}`
    userBirthday.innerText = `Birthday: ${data.birthday}`
    userImg.innerHTML = `
      <img src="${data.avatar}" alt="user-poster" class="img-fluid">
    `
  })
}

function removeThisUser(id) {
  const usersIndex = user.findIndex((person) => person.id === id)
  user.splice(usersIndex, 1)
  
  localStorage.setItem('RemovedUsers', JSON.stringify(user))
  renderUserList(user)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.card-img-top')) {
    showUserDetail(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove')) {
    removeThisUser(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-like')) {
    let target = event.target
    target.classList.remove('btn-outline-warning')
    target.classList.add('btn-warning')
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)

  renderUserList(getUsersByPage(page))
})


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  
  filterUser = user.filter(item => 
    item.name.toLowerCase().includes(keyword)
  )

  if (filterUser.length === 0 || searchInput.value.match(/^[ \s]/)) {
    return alert('cannot find users with keyword: ' + keyword)
  }

  renderUserList(getUsersByPage(1))
  renderPaginator(filterUser.length)
  searchInput.value = ''
  
})

axios.get(INDEX_URL).then((response) => {
  user.push(...response.data.results)
  
  renderPaginator(user.length)
  renderUserList(getUsersByPage(1))
})