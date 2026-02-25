// Checkout page - order summary, validation, and confirmation
const user = JSON.parse(localStorage.getItem('logged-in-user'))

if(!user){
  window.location.href = 'index.html'
}

function getProducts(){
  const key = 'products-data'
  const saved = localStorage.getItem(key)
  if(saved) return JSON.parse(saved)
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

// Render checkout summary
function renderCheckoutSummary(){
  const cart = getCart()
  const products = getProducts()
  const empty = document.getElementById('checkout-empty')
  const content = document.getElementById('checkout-content')
  const itemsList = document.getElementById('checkout-items-list')
  
  if(cart.length === 0){
    empty.style.display = 'block'
    content.style.display = 'none'
    return
  }
  
  empty.style.display = 'none'
  content.style.display = 'block'
  itemsList.innerHTML = ''
  
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
      <td>${cartItem.quantity}</td>
      <td>$${itemTotal.toFixed(2)}</td>
    `
    itemsList.appendChild(row)
  })
  
  document.getElementById('checkout-subtotal').textContent = subtotal.toFixed(2)
  document.getElementById('checkout-total').textContent = subtotal.toFixed(2)
}

// Validate and confirm checkout
function confirmCheckout(){
  const confirmBtn = document.getElementById('confirm-btn')
  const cart = getCart()
  const products = getProducts()
  const msgDiv = document.getElementById('checkout-message')
  
  // Disable button and show processing state
  confirmBtn.disabled = true
  const originalText = confirmBtn.textContent
  confirmBtn.textContent = 'Processing...'
  
  // Validate stock
  for(const cartItem of cart){
    const product = products.find(p => p.id === cartItem.productId)
    if(!product){
      msgDiv.textContent = `Product not found`
      msgDiv.classList.remove('success')
      msgDiv.classList.add('error')
      // Re-enable on error
      confirmBtn.disabled = false
      confirmBtn.textContent = originalText
      return false
    }
    if(product.stock < cartItem.quantity){
      msgDiv.textContent = `Not enough stock for ${product.name}. Available: ${product.stock}`
      msgDiv.classList.remove('success')
      msgDiv.classList.add('error')
      // Re-enable on error
      confirmBtn.disabled = false
      confirmBtn.textContent = originalText
      return false
    }
  }
  
  // Reduce stock
  for(const cartItem of cart){
    const product = products.find(p => p.id === cartItem.productId)
    product.stock -= cartItem.quantity
  }
  saveProducts(products)
  
  // Clear cart
  clearCart()
  
  // Show success
  msgDiv.textContent = 'Order confirmed! Redirecting...'
  msgDiv.classList.remove('error')
  msgDiv.classList.add('success')
  
  setTimeout(() => {
    window.location.href = 'product.html'
  }, 2000)
  
  return true
}

// Event handlers
document.getElementById('confirm-btn').addEventListener('click', e => {
  confirmCheckout()
})

document.getElementById('edit-btn').addEventListener('click', () => {
  window.location.href = 'cart.html'
})

document.getElementById('empty-back-btn').addEventListener('click', () => {
  window.location.href = 'product.html'
})

// Initial render
renderCheckoutSummary()
