//Suppression des barres de scroll
document.body.style.overflow = "hidden";

// ******** Définition des variables importantes ********

// -> colorChoice est la div contenant la palette de couleurs
const colorChoice = document.querySelector('#Colors_choice');

const cursor = document.querySelector("#cursor");

// -> game correspond au canvas
const game = document.querySelector('#game');
const context = game.getContext('2d'); // Pour les pixels 
const grid_context = game.getContext('2d'); // Pour la grille
game.width = 1500; //1200 600
game.height = 750;


const size_cell = 10; // Taille d'un côté d'une case
const colors_list = ["#4f0011", "#880029", "#b73300", "#b97a00", "#b99b28", "#b7b280", "#01784c", "#019458", "#5bad3f", "#02554f", "#00737b", "#01958d", "#1a3a77", "#2868aa", "#2868aa", "#3aa7b0", "#352a8d", "#4e43b9", "#6980b8", "#5e1676", "#83368b", "#a57bb8", "#a00c5c", "#b8295e", "#b96f7b", "#4e3422", "#724d1c", "#b98352", "#000", "#3b3c3c", "#636567", "#FFF"]; // Toutes les couleurs disponibles
let current_color_choice = "#FFF"; // Code de la couleur sélectionnée



// ******** Création des div pour couleurs palettte ********
colors_list.forEach(color=>{
    const colorItem = document.createElement('div');
    colorItem.addEventListener('click', function(){
        // 1 : on retire le "check" de la couleur précédente:
        let list_of_children = document.querySelector( "#Colors_choice" ).children;
        Array.prototype.forEach.call(list_of_children, element => {
            element.innerHTML = '';
        });

        // 2 : Mise à jour de la nouvelle couleur + ajout du check
        current_color_choice = color;
        colorItem.innerHTML = '<i class="fa-solid fa-check"></i>';
    });
    colorItem.style.backgroundColor = color;
    colorChoice.appendChild(colorItem);
});



// ******** Tracé du cadrillage ********
function draw_grid(ctx, width, height, cell_size){
    ctx.beginPath();
    ctx.strokeStyle = "#ccc";
    for(let i = 0; i<width; i++){
        ctx.moveTo(i*cell_size, 0);
        ctx.lineTo(i*cell_size, height);
        ctx.moveTo(0, i*cell_size);
        ctx.lineTo(width, i*cell_size);
    }
    ctx.stroke();
}
draw_grid(grid_context, game.width, game.height, size_cell);









// ******** Pose un pixel sur action "click" ********
function add_Pixel(){
    //Coordonnées de la souris
    x = cursor.offsetLeft - game.offsetLeft;
    y = cursor.offsetTop - game.offsetTop;

    context.beginPath()
    context.fillStyle = current_color_choice;
    context.fillRect(x,y,size_cell,size_cell);

    // Ajout du pixel dans la base de données
    const pixel = {
        x,
        y,
        color: current_color_choice
    }
    const pixelRef = db.collection('pixels').doc(`${pixel.x}-${pixel.y}`);
    pixelRef.set(pixel, {merge:true});
}


cursor.addEventListener('click', function(){
    add_Pixel();
});
game.addEventListener('click', function(){
    add_Pixel();
})




// ******** Cellule encadrée quand on passe dessus ********
game.addEventListener('mousemove', function(event){
    const cursorLeft = event.clientX - (cursor.offsetWidth/2);
    const cursorTop = event.clientY - (cursor.offsetHeight/2);

    cursor.style.left = Math.floor(cursorLeft/size_cell) * size_cell + "px";
    cursor.style.top = Math.floor(cursorTop/size_cell) * size_cell + "px";
});




// ******** Gestion du zoom - dézoom *******
//up = -1 et down = 1
game.addEventListener("wheel", function(event){
    //on cherche si c'est un scroll up ou scroll down
    const delta = Math.sign(event.deltaY);
    console.log(game.offsetTop);

    if(delta<0){
        console.log("zoom");
    }
    else{
        console.log("Dézoom");
        //context.scale(10, 10);
    }
});










// Pour faire le lien avec firebase :
const firebaseConfig = {
    apiKey: "AIzaSyBsCYcCuouWZ5K_b9UGY5novrqqY-m-LcY",
    authDomain: "pixel-art-rem.firebaseapp.com",
    projectId: "pixel-art-rem",
    storageBucket: "pixel-art-rem.appspot.com",
    messagingSenderId: "932436848760",
    appId: "1:932436848760:web:b4705272bbd53aab31bd8d"
  };
firebase.initializeApp(firebaseConfig);

// Pour faire le lien avec firestore = base de données pour stocker les pixels
const db = firebase.firestore();





// ******** Mise à jour des pixels placés par les autres joueurs ********
db.collection('pixels').onSnapshot(function(querySnapshot){
    querySnapshot.docChanges().forEach(function(change){
        console.log(change.doc.data());
        const{x,y,color} = change.doc.data();
        context.beginPath();
        context.fillStyle = color;
        context.fillRect(x, y, size_cell, size_cell);
    })
})
