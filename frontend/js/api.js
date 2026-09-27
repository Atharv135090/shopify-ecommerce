const BASE_URL="http://localhost:8080"

/* Escapes a value so it can be safely embedded inside a
   single-quoted argument in an inline onclick handler. */
function escapeForHandler(value)
{
    return String(value)
        .replace(/\\/g,"\\\\")
        .replace(/'/g,"\\'");
}

function productCard(product)
{
    const price=Number(product.price).toLocaleString("en-IN");
    return `
            <div class="col-lg-4 col-md-6">
                <div class="card h-100">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${escapeForHandler(product.name)}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="price"><strong>&#8377;${price}</strong></p>
                        <button class="btn btn-primary mt-auto"
                        onclick="addToCart(${product.id}, '${escapeForHandler(product.name)}',${product.price},'${escapeForHandler(product.imageUrl)}')">
                        Add to Cart
                        </button>
                    </div>
                </div>
            </div>
    `;
}

async function loadProducts()
{
    try{
        const response = await fetch(`${BASE_URL}/products`);
        const products= await response.json();
        console.log(products);
        
        let trendingList=document.getElementById("trending-products");
        let clothingList=document.getElementById("clothing-products");
        let electronicsList=document.getElementById("electronics-products");

        trendingList.innerHTML="";
        clothingList.innerHTML="";
        electronicsList.innerHTML="";

        products.forEach((product) => {
            const card=productCard(product);

            if(product.category==="Clothing")
            {
                clothingList.innerHTML+= card;
            }
            else if(product.category==="Electronics")
            {
                electronicsList.innerHTML+= card;
            }
            else{
                trendingList.innerHTML+= card;
            }
        });

        /* Featured strip: every product belongs to a category, so the
           Trending section would otherwise always stay empty. */
        if(products.length>0 && trendingList.innerHTML==="")
        {
            products.slice(0,3).forEach((product) => {
                trendingList.innerHTML+=productCard(product);
            });
        }

    }
    catch(error)
    {
        console.log("Erorr fetching products:",error);
        
    }
   
}
