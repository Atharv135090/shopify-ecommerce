let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* Re-reads the cart from localStorage and keeps the in-memory copy in sync. */
function getCart()
{
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart;
}

/* Persists the cart and refreshes the navbar badge. */
function saveCart()
{
    localStorage.setItem("cart",JSON.stringify(cart));
    updateCartCounter();
}

function cartTotal()
{
    return getCart().reduce((sum,item)=>sum + item.price * item.quantity,0);
}

function loadCart()
{
    let cartItems = document.getElementById("cart-items");
    let totalElement = document.getElementById("total-amount");

    /* This script is also loaded on index.html, which has no cart table. */
    if(!cartItems || !totalElement) return;

    let totalAmount=0;
    cartItems.innerHTML="";

    getCart().forEach((item,index) => {
        let itemTotal=item.price * item.quantity;
        totalAmount+=itemTotal;

        cartItems.innerHTML +=`

            <tr>
                <td><img src="${item.imageUrl}" width="50"></td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index},-1)">-</button>
                    ${item.quantity}
                    <button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index},1)">+</button>
                </td>
                <td>₹ ${itemTotal}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">X</button></td>
            </tr>
        `;
    });

    if(cart.length===0)
    {
        cartItems.innerHTML=`
            <tr>
                <td colspan="6" class="text-center py-4">
                    Your cart is empty. <a href="index.html">Continue shopping</a>
                </td>
            </tr>
        `;
    }

    document.getElementById("total-amount").innerText=totalAmount;
    updateCartCounter();
}
function addToCart(id,name,price,imageUrl)
{
    console.log("Adding product to cart:",id,name,price,imageUrl);

    price=parseFloat(price);
    getCart();
    let itemIndex=cart.findIndex((item) => item.id===id)
    if(itemIndex!==-1)
    {
        cart[itemIndex].quantity+=1;
    }
    else{
        cart.push({
            id:id,  // for easy tracking
            name: name,
            price: price,
            imageUrl:imageUrl,
            quantity:1
        });      
    }
    saveCart();
    
}


function updateCartCounter()
{
    /* The cart page has no badge element, so only update when present. */
    let badge=document.querySelector(".cart-badge");
    if(badge)
    {
        let totalQty=getCart().reduce((sum,item)=>sum + item.quantity,0);
        badge.innerText=totalQty;
    }
}


function changeQuantity(index,change)
{
    getCart();
    if(!cart[index]) return;
    cart[index].quantity+=change;
    if(cart[index].quantity<=0) cart.splice(index,1);
    saveCart();
    loadCart();
}

function removeFromCart(index)
{
    getCart();
    if(!cart[index]) return;
    cart.splice(index,1);
    saveCart();
    loadCart();
}


/* =======================
     Demo / Mock Checkout
   ======================= */

/* Generates a demo order reference, e.g. SHP-7K2QW4 */
function generateOrderId()
{
    const chars="ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    let id="";
    for(let i=0;i<6;i++)
    {
        id+=chars[Math.floor(Math.random()*chars.length)];
    }
    return "SHP-"+id;
}

/* Shows a modal, deferring the call if Bootstrap is still running a
   transition. Without this, show() is silently ignored and the button
   appears to do nothing. */
function openModal(modalId)
{
    let el=document.getElementById(modalId);
    if(!el || !window.bootstrap) return;

    let modal=bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);

    const show=() => {
        if(!el.classList.contains("show")) modal.show();
    };

    /* Wait for any in-flight transition to finish before showing,
       otherwise Bootstrap drops the call silently. */
    const busy=modal._isTransitioning ||
               el.classList.contains("show") ||
               el.classList.contains("collapsing");

    if(busy)
    {
        el.addEventListener("hidden.bs.modal",show,{ once:true });
        setTimeout(show,500); /* fallback if no hidden event arrives */
        return;
    }
    show();
}

/* Opens the order summary popup. Demo only: nothing is charged. */
function checkout()
{
    getCart();
    if(cart.length===0)
    {
        document.getElementById("total-amount").innerText=0;
        alert("Your cart is empty. Add some products before checking out.");
        return;
    }

    const itemCount=cart.reduce((sum,item)=>sum + item.quantity,0);
    document.getElementById("checkout-item-count").innerText=itemCount;
    document.getElementById("checkout-total").innerText="₹"+cartTotal().toLocaleString("en-IN");

    openModal("checkoutModal");
}

/* Confirms the mock payment, clears the cart and shows the success popup. */
function confirmPayment()
{
    document.getElementById("order-id").innerText=generateOrderId();

    cart=[];
    localStorage.removeItem("cart");

    loadCart();

    let checkoutEl=document.getElementById("checkoutModal");
    if(!checkoutEl) { openModal("successModal"); return; }

    /* Show the success popup only once the checkout modal has fully
       closed, so the two Bootstrap transitions do not collide. */
    checkoutEl.addEventListener("hidden.bs.modal",() => openModal("successModal"), { once:true });
    bootstrap.Modal.getInstance(checkoutEl).hide();
}


document.addEventListener("DOMContentLoaded",function () {
    loadCart();

    let confirmBtn=document.getElementById("confirm-payment-btn");
    if(confirmBtn) confirmBtn.addEventListener("click",confirmPayment);
});
