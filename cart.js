// Cart page - manage cart items and checkout
const user = JSON.parse(localStorage.getItem('logged-in-user'))

if(!user){
  window.location.href = 'index.html'
}

// Get products array (load stock from localStorage)
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

function saveProducts(products){
  localStorage.setItem('products-data', JSON.stringify(products))
}

function getCartKey(){
  return `cart-${user.email}`
}

function getCart(){
  const key = getCartKey()
  return JSON.parse(localStorage.getItem(key) || '[]')
}

function clearCart(){
  const key = getCartKey()
  localStorage.setItem(key, JSON.stringify([]))
}

function removeCartItem(productId){
  const key = getCartKey()
  let cart = getCart()
  cart = cart.filter(item => item.productId !== productId)
  localStorage.setItem(key, JSON.stringify(cart))
}

function updateQuantity(productId, quantity){
  const key = getCartKey()
  let cart = getCart()
  const item = cart.find(i => i.productId === productId)
  if(item) item.quantity = Math.max(1, quantity)
  localStorage.setItem(key, JSON.stringify(cart))
}

// Render cart
function renderCart(){
  const cart = getCart()
  const products = getProducts()
  const empty = document.getElementById('cart-empty')
  const content = document.getElementById('cart-content')
  const itemsBody = document.getElementById('cart-items')
  
  if(cart.length === 0){
    empty.style.display = 'block'
    content.style.display = 'none'
    return
  }
  
  empty.style.display = 'none'
  content.style.display = 'block'
  itemsBody.innerHTML = ''
  
  let subtotal = 0
  cart.forEach(cartItem => {
    const product = products.find(p => p.id === cartItem.productId)
    if(!product) return
    
    const itemTotal = product.price * cartItem.quantity
    subtotal += itemTotal
    
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${product.name}</td>
      <td>$${product.price.toFixed(2)}</td>
      <td><input type="number" min="1" value="${cartItem.quantity}" class="qty-input" data-product-id="${product.id}"></td>
      <td>$${itemTotal.toFixed(2)}</td>
      <td><button class="remove-btn" data-product-id="${product.id}">Remove</button></td>
    `
    itemsBody.appendChild(row)
    
    // Quantity change handler
    row.querySelector('.qty-input').addEventListener('change', e => {
      const qty = parseInt(e.target.value) || 1
      updateQuantity(product.id, qty)
      renderCart()
    })
    
    // Remove handler
    row.querySelector('.remove-btn').addEventListener('click', () => {
      removeCartItem(product.id)
      renderCart()
    })
  })
  
  document.getElementById('subtotal').textContent = subtotal.toFixed(2)
  document.getElementById('total').textContent = subtotal.toFixed(2)
}

// Event handlers
document.getElementById('checkout-btn').addEventListener('click', () => {
  window.location.href = 'checkout.html'
})

document.getElementById('back-btn').addEventListener('click', () => {
  window.location.href = 'product.html'
})

document.getElementById('empty-back-btn').addEventListener('click', () => {
  window.location.href = 'product.html'
})

// Initial render
renderCart()
