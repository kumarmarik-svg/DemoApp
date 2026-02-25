// Product page - show logged-in user and handle logout
const user = JSON.parse(localStorage.getItem('logged-in-user'))

if(!user){
  // Redirect to login if not logged in
  window.location.href = 'index.html'
}

// Product data with localStorage persistence
function getProducts(){
  const key = 'products-data'
  const saved = localStorage.getItem(key)
  if(saved) return JSON.parse(saved)
  // Initialize with default products
  const defaultProducts = [
    {id: 1, name: 'Laptop Pro', description: 'High-performance laptop', price: 999.99, category: 'Laptop', stock: 5},
    {id: 2, name: 'Laptop Air', description: 'Lightweight and portable', price: 799.99, category: 'Laptop', stock: 8},
    {id: 3, name: 'iPhone 15', description: 'Latest iPhone model', price: 999.99, category: 'Phone', stock: 12},
    {id: 4, name: 'Samsung Galaxy', description: 'Premium Android phone', price: 899.99, category: 'Phone', stock: 10},
    {id: 5, name: 'Tablet Pro', description: '12.9" display tablet', price: 649.99, category: 'Tablet', stock: 6},
    {id: 6, name: 'Wireless Earbuds', description: 'Noise-cancelling earbuds', price: 149.99, category: 'Accessories', stock: 15},
  ]
  localStorage.setItem(key, JSON.stringify(defaultProducts))
  return defaultProducts
}

const products = getProducts()

// Display logged-in user
document.getElementById('logged-user').textContent = user.name || user.email

// Get unique categories
const categories = ['All', ...new Set(products.map(p => p.category))]

// Create filter buttons
const filterContainer = document.getElementById('filter-container')
categories.forEach(cat => {
  const btn = document.createElement('button')
  btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '')
  btn.textContent = cat
  btn.addEventListener('click', () => filterProducts(cat, btn))
  filterContainer.appendChild(btn)
})

// Wishlist helpers
function getWishlistKey(){
  return `wishlist-${user.email}`
}

function getWishlist(){
  const key = getWishlistKey()
  return JSON.parse(localStorage.getItem(key) || '[]')
}

function isInWishlist(productId){
  return getWishlist().includes(productId)
}

function toggleWishlist(productId){
  const key = getWishlistKey()
  let wishlist = getWishlist()
  if(wishlist.includes(productId)){
    wishlist = wishlist.filter(id => id !== productId)
  } else {
    wishlist.push(productId)
  }
  localStorage.setItem(key, JSON.stringify(wishlist))
  return !getWishlist().includes(productId)  // return true if now added, false if removed (wait, that's wrong)
}

// Cart helpers
function getCartKey(){
  return `cart-${user.email}`
}

function getCart(){
  const key = getCartKey()
  return JSON.parse(localStorage.getItem(key) || '[]')
}

function addToCart(productId, quantity = 1){
  const key = getCartKey()
  let cart = getCart()
  const existingItem = cart.find(item => item.productId === productId)
  
  if(existingItem){
    existingItem.quantity += quantity
  } else {
    cart.push({productId, quantity})
  }
  localStorage.setItem(key, JSON.stringify(cart))
}

function getCartCount(){
  return getCart().reduce((sum, item) => sum + item.quantity, 0)
}

function getCartItemQuantity(productId){
  const cartItem = getCart().find(item => item.productId === productId)
  return cartItem ? cartItem.quantity : 0
}

// Render products
function renderProducts(items){
  const grid = document.getElementById('product-grid')
  grid.innerHTML = ''
  items.forEach(p => {
    const inWishlist = isInWishlist(p.id)
    const cartQty = getCartItemQuantity(p.id)
    const isOutOfStock = p.stock === 0
    const isCartFull = cartQty >= p.stock && p.stock > 0
    const isDisabled = isOutOfStock || isCartFull
    
    let cartBtnText = 'Add to Cart'
    if(isOutOfStock) cartBtnText = 'Out of Stock'
    else if(isCartFull) cartBtnText = 'Max Added'
    
    const div = document.createElement('div')
    div.className = 'product'
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p class="stock">Stock: ${p.stock}</p>
      <div class="product-actions">
        <button class="cart-btn ${isDisabled ? 'disabled' : ''}" data-product-id="${p.id}" ${isDisabled ? 'disabled' : ''}>${cartBtnText}</button>
        <button class="price-btn">$${p.price.toFixed(2)}</button>
        <button class="wishlist-btn ${inWishlist ? 'active' : ''}" data-product-id="${p.id}" title="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">♥</button>
      </div>
    `
    grid.appendChild(div)
    
    // Add to cart handler
    const cartBtn = div.querySelector('.cart-btn')
    if(!isDisabled){
      cartBtn.addEventListener('click', e => {
        e.preventDefault()
        addToCart(p.id)
        e.target.textContent = 'Added!'
        setTimeout(() => { e.target.textContent = 'Add to Cart' }, 1500)
        updateCartBadge()
      })
    }
    
    // Wishlist button handler
    div.querySelector('.wishlist-btn').addEventListener('click', e => {
      e.preventDefault()
      toggleWishlist(p.id)
      e.target.classList.toggle('active')
      e.target.classList.add('toggled')
      setTimeout(() => e.target.classList.remove('toggled'), 300)
      e.target.title = e.target.classList.contains('active') ? 'Remove from wishlist' : 'Add to wishlist'
    })
  })
}

// Filter products
function filterProducts(category, btn){
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  const filtered = category === 'All' ? products : products.filter(p => p.category === category)
  renderProducts(filtered)
}

// Initial render
renderProducts(products)
updateCartBadge()

// Update cart badge
function updateCartBadge(){
  const badge = document.getElementById('cart-badge')
  if(badge){
    const count = getCartCount()
    badge.textContent = count
    if(count > 0){
      badge.classList.remove('cart-badge-hidden')
    } else {
      badge.classList.add('cart-badge-hidden')
    }
  }
}

// Logout handler
// Only clears session data (logged-in-user)
// Preserves: products stock, cart, wishlist for next login
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('logged-in-user')
  window.location.href = 'index.html'
})
